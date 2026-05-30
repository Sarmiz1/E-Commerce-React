-- Keep the admin paid-sales chart informative when the latest activity is historical.

begin;

create or replace function public.get_admin_paid_sales_chart()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  chart_end date;
begin
  perform private.assert_active_admin();

  select case
    when max(created_at)::date >= current_date - 6 then current_date
    else max(created_at)::date
  end
  into chart_end
  from public.orders
  where payment_status = 'paid'
    and status <> 'cancelled';

  chart_end := coalesce(chart_end, current_date);

  return jsonb_build_object(
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'date', day::date,
        'label', to_char(day, 'Dy'),
        'revenueMinor', coalesce(s.revenue_minor, 0),
        'orders', coalesce(s.order_count, 0)
      ) order by day), '[]'::jsonb)
      from generate_series(chart_end - 6, chart_end, interval '1 day') day
      left join lateral (
        select coalesce(sum(o.total_minor), 0) revenue_minor, count(*) order_count
        from public.orders o
        where o.created_at >= day
          and o.created_at < day + interval '1 day'
          and o.payment_status = 'paid'
          and o.status <> 'cancelled'
      ) s on true
    ),
    'meta', jsonb_build_object(
      'startDate', chart_end - 6,
      'endDate', chart_end,
      'isHistorical', chart_end < current_date - 6
    )
  );
end;
$$;

revoke all on function public.get_admin_paid_sales_chart() from public;
grant execute on function public.get_admin_paid_sales_chart() to authenticated;

commit;
