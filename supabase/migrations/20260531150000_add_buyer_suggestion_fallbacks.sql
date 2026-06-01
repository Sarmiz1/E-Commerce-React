-- Build buyer suggestions from live sellable products when persisted AI rows
-- are empty or a previously purchased product is no longer sellable.
-- Every fallback is ranked from real catalog and paid-order activity.

create index if not exists orders_buyer_paid_created_at_idx
  on public.orders(user_id, created_at desc)
  where payment_status = 'paid' and status <> 'cancelled';

create index if not exists order_items_order_product_idx
  on public.order_items(order_id, product_id);

create index if not exists product_variants_sellable_product_stock_idx
  on public.product_variants(product_id, stock_quantity desc, created_at, id)
  where is_active = true and stock_quantity > 0;

create index if not exists buyer_recommendations_user_product_created_at_idx
  on public.buyer_recommendations(user_id, product_id, created_at desc);

create index if not exists products_active_category_rating_idx
  on public.products(category_id, rating_stars desc, rating_count desc, created_at desc)
  where is_active = true;

create or replace function private.get_buyer_sellable_recommendations(
  p_buyer_id uuid,
  p_limit integer default 5
)
returns table (
  sort_order bigint,
  id uuid,
  product_id uuid,
  name text,
  reason text,
  budget_fit boolean,
  price integer,
  price_minor integer,
  variant_id uuid,
  products jsonb,
  variant jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  with buyer_category_activity as (
    select purchased_product.category_id,
      sum(order_item.quantity)::bigint purchase_quantity,
      max(customer_order.created_at) last_purchased_at
    from public.orders customer_order
    join public.order_items order_item on order_item.order_id = customer_order.id
    join public.products purchased_product on purchased_product.id = order_item.product_id
    where customer_order.user_id = p_buyer_id
      and customer_order.payment_status = 'paid'
      and customer_order.status <> 'cancelled'
      and purchased_product.category_id is not null
    group by purchased_product.category_id
  ),
  buyer_budget as (
    select avg(order_item.price_minor)::numeric average_item_price_minor
    from public.orders customer_order
    join public.order_items order_item on order_item.order_id = customer_order.id
    where customer_order.user_id = p_buyer_id
      and customer_order.payment_status = 'paid'
      and customer_order.status <> 'cancelled'
  ),
  candidates as (
    select
      coalesce(saved_recommendation.id, product.id) id,
      product.id product_id,
      product.name,
      coalesce(
        nullif(saved_recommendation.reason, ''),
        case
          when category_activity.category_id is not null
            then 'Recommended from categories in your paid order history.'
          else 'Popular product available from the live catalog.'
        end
      ) reason,
      coalesce(
        saved_recommendation.budget_fit,
        pricing.effective_price_minor <= buyer_budget.average_item_price_minor,
        false
      ) budget_fit,
      pricing.effective_price_minor price,
      pricing.effective_price_minor price_minor,
      sellable_variant.id variant_id,
      to_jsonb(product) products,
      to_jsonb(sellable_variant) variant,
      case when saved_recommendation.id is not null then 0
        when category_activity.category_id is not null then 1
        else 2
      end source_priority,
      coalesce(category_activity.purchase_quantity, 0) category_purchase_quantity,
      category_activity.last_purchased_at,
      product.rating_stars,
      product.rating_count,
      product.created_at
    from public.products product
    join lateral (
      select product_variant.*
      from public.product_variants product_variant
      where product_variant.product_id = product.id
        and product_variant.is_active = true
        and product_variant.stock_quantity > 0
      order by product_variant.stock_quantity desc,
        product_variant.created_at,
        product_variant.id
      limit 1
    ) sellable_variant on true
    cross join lateral (
      select private.get_sellable_price_minor(
        product.price_minor,
        product.sale_price_minor,
        product.sale_starts_at,
        product.sale_ends_at,
        sellable_variant.price_minor
      ) effective_price_minor
    ) pricing
    cross join buyer_budget
    left join buyer_category_activity category_activity
      on category_activity.category_id = product.category_id
    left join lateral (
      select recommendation.id,
        recommendation.reason,
        recommendation.budget_fit
      from public.buyer_recommendations recommendation
      where recommendation.user_id = p_buyer_id
        and recommendation.product_id = product.id
      order by recommendation.created_at desc, recommendation.id
      limit 1
    ) saved_recommendation on true
    where product.is_active = true
  ),
  ranked as (
    select row_number() over (
        order by source_priority,
          category_purchase_quantity desc,
          last_purchased_at desc nulls last,
          rating_stars desc nulls last,
          rating_count desc nulls last,
          created_at desc,
          product_id
      ) sort_order,
      candidates.*
    from candidates
  )
  select ranked.sort_order,
    ranked.id,
    ranked.product_id,
    ranked.name,
    ranked.reason,
    ranked.budget_fit,
    ranked.price,
    ranked.price_minor,
    ranked.variant_id,
    ranked.products,
    ranked.variant
  from ranked
  where ranked.sort_order <= least(greatest(coalesce(p_limit, 5), 1), 20)
  order by ranked.sort_order;
$$;

revoke all on function private.get_buyer_sellable_recommendations(uuid, integer)
  from public, anon, authenticated;

create or replace function private.get_buyer_reorder_suggestion_rows(
  p_buyer_id uuid,
  p_limit integer default 3
)
returns table (
  sort_order bigint,
  id uuid,
  product_id uuid,
  name text,
  price integer,
  price_minor integer,
  reason text,
  variant_id uuid,
  products jsonb,
  variant jsonb,
  last_ordered_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with purchased_products as (
    select purchased_product.id product_id,
      purchased_product.category_id,
      sum(order_item.quantity)::bigint purchase_quantity,
      max(customer_order.created_at) last_ordered_at
    from public.orders customer_order
    join public.order_items order_item on order_item.order_id = customer_order.id
    join public.products purchased_product on purchased_product.id = order_item.product_id
    where customer_order.user_id = p_buyer_id
      and customer_order.payment_status = 'paid'
      and customer_order.status <> 'cancelled'
    group by purchased_product.id, purchased_product.category_id
  ),
  purchased_categories as (
    select purchased_products.category_id,
      sum(purchased_products.purchase_quantity)::bigint purchase_quantity,
      max(purchased_products.last_ordered_at) last_ordered_at
    from purchased_products
    where purchased_products.category_id is not null
    group by purchased_products.category_id
  ),
  candidates as (
    select product.id,
      product.id product_id,
      product.name,
      pricing.effective_price_minor price,
      pricing.effective_price_minor price_minor,
      case
        when exact_purchase.product_id is not null
          then 'Purchased before. Add it again in one tap.'
        else 'A sellable alternative from a category you purchased before.'
      end reason,
      sellable_variant.id variant_id,
      to_jsonb(product) products,
      to_jsonb(sellable_variant) variant,
      exact_purchase.product_id is not null exact_repeat,
      coalesce(exact_purchase.purchase_quantity, category_purchase.purchase_quantity, 0)
        purchase_quantity,
      coalesce(exact_purchase.last_ordered_at, category_purchase.last_ordered_at)
        last_ordered_at,
      product.rating_stars,
      product.rating_count,
      product.created_at
    from public.products product
    join lateral (
      select product_variant.*
      from public.product_variants product_variant
      where product_variant.product_id = product.id
        and product_variant.is_active = true
        and product_variant.stock_quantity > 0
      order by product_variant.stock_quantity desc,
        product_variant.created_at,
        product_variant.id
      limit 1
    ) sellable_variant on true
    cross join lateral (
      select private.get_sellable_price_minor(
        product.price_minor,
        product.sale_price_minor,
        product.sale_starts_at,
        product.sale_ends_at,
        sellable_variant.price_minor
      ) effective_price_minor
    ) pricing
    left join purchased_products exact_purchase
      on exact_purchase.product_id = product.id
    left join purchased_categories category_purchase
      on category_purchase.category_id = product.category_id
    where product.is_active = true
      and (
        exact_purchase.product_id is not null
        or category_purchase.category_id is not null
      )
  ),
  ranked as (
    select row_number() over (
        order by exact_repeat desc,
          last_ordered_at desc,
          purchase_quantity desc,
          rating_stars desc nulls last,
          rating_count desc nulls last,
          created_at desc,
          product_id
      ) sort_order,
      candidates.*
    from candidates
  )
  select ranked.sort_order,
    ranked.id,
    ranked.product_id,
    ranked.name,
    ranked.price,
    ranked.price_minor,
    ranked.reason,
    ranked.variant_id,
    ranked.products,
    ranked.variant,
    ranked.last_ordered_at
  from ranked
  where ranked.sort_order <= least(greatest(coalesce(p_limit, 3), 1), 10)
  order by ranked.sort_order;
$$;

revoke all on function private.get_buyer_reorder_suggestion_rows(uuid, integer)
  from public, anon, authenticated;

create or replace function public.get_buyer_dashboard()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  dashboard_data jsonb;
begin
  perform private.assert_customer_session();

  dashboard_data := coalesce(
    public.get_buyer_dashboard_customer_unchecked()::jsonb,
    '{}'::jsonb
  );

  return jsonb_set(
    dashboard_data,
    '{recommendations}',
    coalesce((
      select jsonb_agg(
        to_jsonb(recommendation) - 'sort_order'
        order by recommendation.sort_order
      )
      from private.get_buyer_sellable_recommendations(buyer_id, 5) recommendation
    ), '[]'::jsonb)
  )::json;
end;
$$;

revoke all on function public.get_buyer_dashboard() from public;
grant execute on function public.get_buyer_dashboard() to authenticated;

create or replace function public.get_buyer_reorder_suggestions(p_limit integer default 3)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_customer_session();

  return coalesce((
    select jsonb_agg(
      to_jsonb(suggestion) - 'sort_order'
      order by suggestion.sort_order
    )
    from private.get_buyer_reorder_suggestion_rows(buyer_id, p_limit) suggestion
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_buyer_reorder_suggestions(integer) from public;
grant execute on function public.get_buyer_reorder_suggestions(integer) to authenticated;
