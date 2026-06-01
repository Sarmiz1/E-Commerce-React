-- Complete the buyer dashboard with customer-scoped alerts, paginated orders,
-- paid-only receipts, reorder suggestions, and spending analytics.

create table if not exists public.wishlist_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  alert_type text not null check (alert_type in ('price_drop', 'back_in_stock')),
  target_price_minor integer check (target_price_minor is null or target_price_minor >= 0),
  is_active boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, alert_type)
);

alter table public.wishlist_alerts enable row level security;
grant select, insert, update, delete on table public.wishlist_alerts to authenticated;

drop policy if exists "Customers can manage own wishlist alerts" on public.wishlist_alerts;
create policy "Customers can manage own wishlist alerts" on public.wishlist_alerts
  for all using (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  )
  with check (
    (select private.is_customer_session())
    and (select auth.uid()) = user_id
  );

create or replace function public.notify_wishlist_price_drop()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.price_minor is not null
    and old.price_minor is not null
    and new.price_minor < old.price_minor
  then
    insert into public.notifications (user_id, title, sub, type, unread)
    select alert.user_id,
      'Price drop: ' || new.name,
      'Your wishlist item is now available for less.',
      'deal',
      true
    from public.wishlist_alerts alert
    where alert.product_id = new.id
      and alert.alert_type = 'price_drop'
      and alert.is_active = true
      and (alert.target_price_minor is null or new.price_minor <= alert.target_price_minor);

    update public.wishlist_alerts alert
    set last_notified_at = now(), updated_at = now()
    where alert.product_id = new.id
      and alert.alert_type = 'price_drop'
      and alert.is_active = true
      and (alert.target_price_minor is null or new.price_minor <= alert.target_price_minor);
  end if;

  return new;
end;
$$;

drop trigger if exists products_notify_wishlist_price_drop on public.products;
create trigger products_notify_wishlist_price_drop
after update of price_minor on public.products
for each row execute function public.notify_wishlist_price_drop();

create or replace function public.notify_wishlist_back_in_stock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  product_name text;
begin
  if coalesce(old.stock_quantity, 0) <= 0 and coalesce(new.stock_quantity, 0) > 0 then
    select product.name into product_name
    from public.products product
    where product.id = new.product_id;

    insert into public.notifications (user_id, title, sub, type, unread)
    select alert.user_id,
      'Back in stock: ' || coalesce(product_name, 'Wishlist item'),
      'A product you were waiting for is available again.',
      'stock',
      true
    from public.wishlist_alerts alert
    where alert.product_id = new.product_id
      and alert.alert_type = 'back_in_stock'
      and alert.is_active = true;

    update public.wishlist_alerts alert
    set last_notified_at = now(), updated_at = now(), is_active = false
    where alert.product_id = new.product_id
      and alert.alert_type = 'back_in_stock'
      and alert.is_active = true;
  end if;

  return new;
end;
$$;

drop trigger if exists product_variants_notify_wishlist_back_in_stock on public.product_variants;
create trigger product_variants_notify_wishlist_back_in_stock
after update of stock_quantity on public.product_variants
for each row execute function public.notify_wishlist_back_in_stock();

create or replace function public.get_buyer_orders(
  p_page integer default 1,
  p_page_size integer default 10,
  p_status text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  safe_page integer := greatest(coalesce(p_page, 1), 1);
  safe_page_size integer := least(greatest(coalesce(p_page_size, 10), 1), 50);
  total_rows integer;
  order_rows jsonb;
begin
  perform private.assert_customer_session();

  select count(*)
  into total_rows
  from public.orders customer_order
  where customer_order.user_id = buyer_id
    and (p_status is null or p_status = 'all' or customer_order.status = p_status);

  select coalesce(jsonb_agg(to_jsonb(order_row) order by order_row.created_at desc), '[]'::jsonb)
  into order_rows
  from (
    select customer_order.*,
      coalesce((
        select jsonb_agg(
          to_jsonb(order_item)
          || jsonb_build_object(
            'products', to_jsonb(product),
            'product_variants', to_jsonb(variant)
          )
          order by order_item.created_at
        )
        from public.order_items order_item
        left join public.products product on product.id = order_item.product_id
        left join public.product_variants variant on variant.id = order_item.variant_id
        where order_item.order_id = customer_order.id
      ), '[]'::jsonb) as order_items
    from public.orders customer_order
    where customer_order.user_id = buyer_id
      and (p_status is null or p_status = 'all' or customer_order.status = p_status)
    order by customer_order.created_at desc
    limit safe_page_size
    offset (safe_page - 1) * safe_page_size
  ) order_row;

  return jsonb_build_object(
    'items', order_rows,
    'page', safe_page,
    'pageSize', safe_page_size,
    'total', total_rows,
    'pageCount', greatest(ceil(total_rows::numeric / safe_page_size)::integer, 1)
  );
end;
$$;

revoke all on function public.get_buyer_orders(integer, integer, text) from public;
grant execute on function public.get_buyer_orders(integer, integer, text) to authenticated;

create or replace function public.get_paid_order_receipt(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  receipt jsonb;
begin
  perform private.assert_customer_session();

  select jsonb_build_object(
    'receiptNumber', 'RCT-' || customer_order.order_number,
    'orderId', customer_order.id,
    'orderNumber', customer_order.order_number,
    'paymentStatus', customer_order.payment_status,
    'currency', customer_order.currency,
    'subtotalMinor', customer_order.subtotal_minor,
    'discountMinor', customer_order.discount_minor,
    'shippingMinor', customer_order.shipping_minor,
    'totalMinor', customer_order.total_minor,
    'paidAt', customer_order.updated_at,
    'shippingAddress', customer_order.shipping_address,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', order_item.product_name,
        'variant', order_item.variant_label,
        'quantity', order_item.quantity,
        'priceMinor', order_item.price_minor,
        'totalMinor', order_item.total_minor
      ) order by order_item.created_at)
      from public.order_items order_item
      where order_item.order_id = customer_order.id
    ), '[]'::jsonb)
  )
  into receipt
  from public.orders customer_order
  where customer_order.id = p_order_id
    and customer_order.user_id = buyer_id
    and customer_order.payment_status = 'paid';

  if receipt is null then
    raise exception 'Receipt is only available for your paid orders.';
  end if;

  return receipt;
end;
$$;

revoke all on function public.get_paid_order_receipt(uuid) from public;
grant execute on function public.get_paid_order_receipt(uuid) to authenticated;

create or replace function public.get_buyer_spending()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_customer_session();

  return jsonb_build_object(
    'categories', coalesce((
      select jsonb_agg(to_jsonb(category_row) order by category_row.spend desc)
      from (
        select coalesce(category.name, 'Uncategorized') label,
          sum(order_item.total_minor)::integer spend
        from public.orders customer_order
        join public.order_items order_item on order_item.order_id = customer_order.id
        left join public.products product on product.id = order_item.product_id
        left join public.categories category on category.id = product.category_id
        where customer_order.user_id = buyer_id
          and customer_order.payment_status = 'paid'
          and customer_order.status <> 'cancelled'
        group by category.name
      ) category_row
    ), '[]'::jsonb),
    'monthly', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'monthStart', month_row.month_start,
          'month', month_row.month_label,
          'spend', month_row.spend
        )
        order by month_row.month_start
      )
      from (
        select date_trunc('month', customer_order.created_at)::date month_start,
          to_char(date_trunc('month', customer_order.created_at), 'Mon') month_label,
          sum(customer_order.total_minor)::integer spend
        from public.orders customer_order
        where customer_order.user_id = buyer_id
          and customer_order.payment_status = 'paid'
          and customer_order.status <> 'cancelled'
          and customer_order.created_at >= date_trunc('month', now()) - interval '11 months'
        group by date_trunc('month', customer_order.created_at)
      ) month_row
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_buyer_spending() from public;
grant execute on function public.get_buyer_spending() to authenticated;

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
        product.price_minor price,
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
        order by product_variant.stock_quantity desc, product_variant.created_at
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
