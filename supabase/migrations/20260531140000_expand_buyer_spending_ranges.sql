-- Return order-backed buyer spending totals and complete chart series.
-- All values are minor currency units from paid, non-cancelled orders.

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
    'lifetimeSpend', coalesce((
      select sum(customer_order.total_minor)
      from public.orders customer_order
      where customer_order.user_id = buyer_id
        and customer_order.payment_status = 'paid'
        and customer_order.status <> 'cancelled'
    ), 0),
    'categories', coalesce((
      select jsonb_agg(to_jsonb(category_row) order by category_row.spend desc)
      from (
        select coalesce(category.name, 'Uncategorized') label,
          sum(coalesce(
            order_item.total_minor::bigint,
            order_item.price_minor::bigint * order_item.quantity
          )) spend
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
    'trends', jsonb_build_object(
      'daily', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'periodStart', period.period_start::date,
            'label', to_char(period.period_start, 'Dy'),
            'spend', coalesce(period_total.spend, 0)
          )
          order by period.period_start
        )
        from generate_series(
          date_trunc('day', now()) - interval '6 days',
          date_trunc('day', now()),
          interval '1 day'
        ) period(period_start)
        left join (
          select date_trunc('day', customer_order.created_at) period_start,
            sum(customer_order.total_minor) spend
          from public.orders customer_order
          where customer_order.user_id = buyer_id
            and customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
            and customer_order.created_at >= date_trunc('day', now()) - interval '6 days'
          group by date_trunc('day', customer_order.created_at)
        ) period_total on period_total.period_start = period.period_start
      ), '[]'::jsonb),
      'weekly', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'periodStart', period.period_start::date,
            'label', to_char(period.period_start, 'Mon DD'),
            'spend', coalesce(period_total.spend, 0)
          )
          order by period.period_start
        )
        from generate_series(
          date_trunc('week', now()) - interval '7 weeks',
          date_trunc('week', now()),
          interval '1 week'
        ) period(period_start)
        left join (
          select date_trunc('week', customer_order.created_at) period_start,
            sum(customer_order.total_minor) spend
          from public.orders customer_order
          where customer_order.user_id = buyer_id
            and customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
            and customer_order.created_at >= date_trunc('week', now()) - interval '7 weeks'
          group by date_trunc('week', customer_order.created_at)
        ) period_total on period_total.period_start = period.period_start
      ), '[]'::jsonb),
      'monthly', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'periodStart', period.period_start::date,
            'label', to_char(period.period_start, 'Mon'),
            'spend', coalesce(period_total.spend, 0)
          )
          order by period.period_start
        )
        from generate_series(
          date_trunc('month', now()) - interval '11 months',
          date_trunc('month', now()),
          interval '1 month'
        ) period(period_start)
        left join (
          select date_trunc('month', customer_order.created_at) period_start,
            sum(customer_order.total_minor) spend
          from public.orders customer_order
          where customer_order.user_id = buyer_id
            and customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
            and customer_order.created_at >= date_trunc('month', now()) - interval '11 months'
          group by date_trunc('month', customer_order.created_at)
        ) period_total on period_total.period_start = period.period_start
      ), '[]'::jsonb),
      'yearly', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'periodStart', period.period_start::date,
            'label', to_char(period.period_start, 'YYYY'),
            'spend', coalesce(period_total.spend, 0)
          )
          order by period.period_start
        )
        from generate_series(
          date_trunc('year', now()) - interval '4 years',
          date_trunc('year', now()),
          interval '1 year'
        ) period(period_start)
        left join (
          select date_trunc('year', customer_order.created_at) period_start,
            sum(customer_order.total_minor) spend
          from public.orders customer_order
          where customer_order.user_id = buyer_id
            and customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
            and customer_order.created_at >= date_trunc('year', now()) - interval '4 years'
          group by date_trunc('year', customer_order.created_at)
        ) period_total on period_total.period_start = period.period_start
      ), '[]'::jsonb)
    )
  );
end;
$$;

revoke all on function public.get_buyer_spending() from public;
grant execute on function public.get_buyer_spending() to authenticated;
