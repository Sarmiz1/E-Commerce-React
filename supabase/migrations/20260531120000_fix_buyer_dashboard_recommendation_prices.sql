-- Keep every buyer-dashboard recommendation aligned with storefront pricing:
-- active product sale, explicit variant override, then product base price.

create or replace function private.get_sellable_price_minor(
  p_product_price_minor integer,
  p_sale_price_minor integer,
  p_sale_starts_at timestamptz,
  p_sale_ends_at timestamptz,
  p_variant_price_minor integer default null
)
returns integer
language sql
stable
set search_path = ''
as $$
  select case
    when p_sale_price_minor is not null
      and p_sale_price_minor > 0
      and p_sale_price_minor < p_product_price_minor
      and (p_sale_starts_at is null or p_sale_starts_at <= now())
      and (p_sale_ends_at is null or p_sale_ends_at >= now())
      then p_sale_price_minor
    else coalesce(p_variant_price_minor, p_product_price_minor, 0)
  end;
$$;

revoke all on function private.get_sellable_price_minor(integer, integer, timestamptz, timestamptz, integer)
  from public;
grant execute on function private.get_sellable_price_minor(integer, integer, timestamptz, timestamptz, integer)
  to authenticated;

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
        jsonb_build_object(
          'id', recommendation.id,
          'product_id', product.id,
          'name', product.name,
          'reason', recommendation.reason,
          'budget_fit', recommendation.budget_fit,
          'price', private.get_sellable_price_minor(
            product.price_minor,
            product.sale_price_minor,
            product.sale_starts_at,
            product.sale_ends_at,
            variant.price_minor
          ),
          'price_minor', private.get_sellable_price_minor(
            product.price_minor,
            product.sale_price_minor,
            product.sale_starts_at,
            product.sale_ends_at,
            variant.price_minor
          ),
          'variant_id', variant.id,
          'products', to_jsonb(product),
          'variant', to_jsonb(variant)
        )
        order by recommendation.created_at desc
      )
      from public.buyer_recommendations recommendation
      join public.products product on product.id = recommendation.product_id
      join lateral (
        select product_variant.*
        from public.product_variants product_variant
        where product_variant.product_id = product.id
          and product_variant.is_active = true
          and product_variant.stock_quantity > 0
        order by product_variant.stock_quantity desc, product_variant.created_at, product_variant.id
        limit 1
      ) variant on true
      where recommendation.user_id = buyer_id
        and product.is_active = true
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
    select jsonb_agg(to_jsonb(suggestion) order by suggestion.last_ordered_at desc)
    from (
      select product.id,
        product.name,
        private.get_sellable_price_minor(
          product.price_minor,
          product.sale_price_minor,
          product.sale_starts_at,
          product.sale_ends_at,
          variant.price_minor
        ) price,
        'Purchased before. Add it again in one tap.' reason,
        variant.id variant_id,
        to_jsonb(product) products,
        to_jsonb(variant) variant,
        max(customer_order.created_at) last_ordered_at
      from public.orders customer_order
      join public.order_items order_item on order_item.order_id = customer_order.id
      join public.products product on product.id = order_item.product_id
      join lateral (
        select product_variant.*
        from public.product_variants product_variant
        where product_variant.product_id = product.id
          and product_variant.is_active = true
          and product_variant.stock_quantity > 0
        order by product_variant.stock_quantity desc, product_variant.created_at, product_variant.id
        limit 1
      ) variant on true
      where customer_order.user_id = buyer_id
        and customer_order.payment_status = 'paid'
        and customer_order.status <> 'cancelled'
        and product.is_active = true
      group by product.id, variant.id
      order by max(customer_order.created_at) desc
      limit least(greatest(coalesce(p_limit, 3), 1), 10)
    ) suggestion
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_buyer_reorder_suggestions(integer) from public;
grant execute on function public.get_buyer_reorder_suggestions(integer) to authenticated;
