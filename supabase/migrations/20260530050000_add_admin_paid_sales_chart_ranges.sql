-- Add server-aggregated admin paid-sales chart ranges.

begin;

create index if not exists idx_payments_order_paid_at
  on public.payments(order_id, paid_at)
  where paid_at is not null;

drop function if exists public.get_admin_paid_sales_chart();

create or replace function public.get_admin_paid_sales_chart(chart_range text default 'days')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  bucket_count integer;
  bucket_interval interval;
  bucket_unit text;
  chart_end date;
  chart_start date;
  current_bucket date;
  legacy_fallback_orders bigint;
  latest_paid_bucket date;
  label_format text;
begin
  perform private.assert_active_admin();

  case chart_range
    when 'days' then
      bucket_count := 7;
      bucket_interval := interval '1 day';
      bucket_unit := 'day';
      label_format := 'Mon DD';
    when 'weeks' then
      bucket_count := 12;
      bucket_interval := interval '1 week';
      bucket_unit := 'week';
      label_format := 'Mon DD';
    when 'months' then
      bucket_count := 12;
      bucket_interval := interval '1 month';
      bucket_unit := 'month';
      label_format := 'Mon YY';
    when 'years' then
      bucket_count := 5;
      bucket_interval := interval '1 year';
      bucket_unit := 'year';
      label_format := 'YYYY';
    else
      raise exception 'Unsupported paid-sales chart range'
        using errcode = '22023';
  end case;

  current_bucket := date_trunc(bucket_unit, current_date::timestamp)::date;

  select
    max(date_trunc(bucket_unit, timezone('utc'::text, paid_order.revenue_at))::date),
    count(*) filter (where paid_order.uses_legacy_order_date)
  into latest_paid_bucket, legacy_fallback_orders
  from (
    select
      o.id,
      coalesce((
        select min(p.paid_at)
        from public.payments p
        where p.order_id = o.id
          and p.paid_at is not null
      ), o.created_at) revenue_at,
      not exists (
        select 1
        from public.payments p
        where p.order_id = o.id
          and p.paid_at is not null
      ) uses_legacy_order_date
    from public.orders o
    where o.payment_status = 'paid'
      and o.status <> 'cancelled'
  ) paid_order;

  chart_end := case
    when latest_paid_bucket >= current_bucket - ((bucket_count - 1) * bucket_interval)
      then current_bucket
    else coalesce(latest_paid_bucket, current_bucket)
  end;
  chart_start := chart_end - ((bucket_count - 1) * bucket_interval);

  return jsonb_build_object(
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'date', bucket::date,
        'label', to_char(bucket, label_format),
        'revenueMinor', coalesce(s.revenue_minor, 0),
        'orders', coalesce(s.order_count, 0)
      ) order by bucket), '[]'::jsonb)
      from generate_series(
        chart_start::timestamp,
        chart_end::timestamp,
        bucket_interval
      ) bucket
      left join lateral (
        select coalesce(sum(paid_order.total_minor), 0) revenue_minor, count(*) order_count
        from (
          select
            o.total_minor,
            coalesce((
              select min(p.paid_at)
              from public.payments p
              where p.order_id = o.id
                and p.paid_at is not null
            ), o.created_at) revenue_at
          from public.orders o
          where o.payment_status = 'paid'
            and o.status <> 'cancelled'
        ) paid_order
        where timezone('utc'::text, paid_order.revenue_at) >= bucket
          and timezone('utc'::text, paid_order.revenue_at) < bucket + bucket_interval
      ) s on true
    ),
    'meta', jsonb_build_object(
      'bucket', bucket_unit,
      'bucketCount', bucket_count,
      'endDate', chart_end,
      'isHistorical', chart_end < current_bucket,
      'legacyFallbackOrders', coalesce(legacy_fallback_orders, 0),
      'range', chart_range,
      'startDate', chart_start
    )
  );
end;
$$;

revoke all on function public.get_admin_paid_sales_chart(text) from public;
grant execute on function public.get_admin_paid_sales_chart(text) to authenticated;

commit;
