-- Merchandising metadata for reusable showcase surfaces.

begin;

alter table public.curations
  add column if not exists showcase_tag text,
  add column if not exists showcase_tag_color text,
  add column if not exists showcase_sort_order integer;

alter table public.products
  add column if not exists showcase_badge text;

create index if not exists curations_showcase_sort_order_idx
  on public.curations(showcase_sort_order nulls last, created_at);

create or replace function public.get_public_product_sales_stats(p_product_ids uuid[])
returns table (
  product_id uuid,
  quantity_sold bigint,
  sales_minor bigint,
  recent_quantity_sold bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    order_item.product_id,
    coalesce(sum(order_item.quantity), 0)::bigint quantity_sold,
    coalesce(sum(coalesce(order_item.total_minor, order_item.price_minor * order_item.quantity)), 0)::bigint sales_minor,
    coalesce(sum(order_item.quantity) filter (
      where customer_order.created_at >= timezone('utc'::text, now()) - interval '7 days'
    ), 0)::bigint recent_quantity_sold
  from public.order_items order_item
  join public.orders customer_order on customer_order.id = order_item.order_id
  where order_item.product_id = any(p_product_ids)
    and customer_order.payment_status = 'paid'
    and customer_order.status <> 'cancelled'
  group by order_item.product_id;
$$;

revoke all on function public.get_public_product_sales_stats(uuid[]) from public;
grant execute on function public.get_public_product_sales_stats(uuid[]) to anon, authenticated;

commit;
