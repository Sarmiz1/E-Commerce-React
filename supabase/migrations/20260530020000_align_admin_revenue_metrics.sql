-- Align admin revenue reporting with settled, non-cancelled orders.

begin;

create or replace function public.get_admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  payload jsonb;
begin
  perform private.assert_active_admin();

  select jsonb_build_object(
    'stats', jsonb_build_object(
      'revenueMinor', (
        select coalesce(sum(total_minor), 0)
        from public.orders
        where payment_status = 'paid'
          and status <> 'cancelled'
      ),
      'orders', (select count(*) from public.orders),
      'users', (select count(*) from public.profiles),
      'pendingOrders', (select count(*) from public.orders where status = 'pending'),
      'pendingUnpaidValueMinor', (
        select coalesce(sum(total_minor), 0)
        from public.orders
        where status = 'pending'
          and payment_status = 'unpaid'
      ),
      'openTickets', (select count(*) from public.admin_support_tickets where status <> 'resolved'),
      'products', (select count(*) from public.products),
      'sellers', (select count(*) from public.seller_profiles)
    ),
    'salesChart', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'date', day::date,
        'label', to_char(day, 'Dy'),
        'revenueMinor', coalesce(s.revenue_minor, 0),
        'orders', coalesce(s.order_count, 0)
      ) order by day), '[]'::jsonb)
      from generate_series(current_date - interval '6 days', current_date, interval '1 day') day
      left join lateral (
        select coalesce(sum(o.total_minor), 0) revenue_minor, count(*) order_count
        from public.orders o
        where o.created_at >= day
          and o.created_at < day + interval '1 day'
          and o.payment_status = 'paid'
          and o.status <> 'cancelled'
      ) s on true
    ),
    'categories', (
      select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.revenue_minor desc), '[]'::jsonb)
      from (
        select coalesce(c.name, 'Uncategorized') name,
          coalesce(sum(oi.total_minor), 0) revenue_minor,
          round(coalesce(sum(oi.total_minor), 0) * 100.0 /
            nullif(sum(coalesce(sum(oi.total_minor), 0)) over (), 0), 1) share
        from public.order_items oi
        join public.orders o on o.id = oi.order_id
        join public.products p on p.id = oi.product_id
        left join public.categories c on c.id = p.category_id
        where o.payment_status = 'paid'
          and o.status <> 'cancelled'
        group by c.name
      ) row_data
    ),
    'activities', (
      select coalesce(jsonb_agg(to_jsonb(activity) order by activity.created_at desc), '[]'::jsonb)
      from (
        select id, event_type type, message, created_at
        from public.admin_activity_log
        order by created_at desc
        limit 20
      ) activity
    ),
    'orders', case when private.has_admin_role(array['super_admin', 'support_lead', 'finance_manager']) then (
      select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at desc), '[]'::jsonb)
      from (
        select o.id, o.status, o.payment_status payment, o.total_minor amount_minor, o.created_at,
          coalesce(p.full_name, u.email, 'Unknown customer') customer,
          coalesce((select string_agg(distinct oi.product_name, ', ') from public.order_items oi where oi.order_id = o.id), '') products,
          coalesce((select string_agg(distinct sp.store_name, ', ')
            from public.order_items oi
            join public.products pr on pr.id = oi.product_id
            left join public.seller_profiles sp on sp.user_id = pr.seller_id
            where oi.order_id = o.id), '') sellers
        from public.orders o
        left join public.profiles p on p.id = o.user_id
        left join auth.users u on u.id = o.user_id
      ) row_data
    ) else '[]'::jsonb end,
    'products', case when private.has_admin_role(array['super_admin', 'content_mod']) then (
      select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at desc), '[]'::jsonb)
      from (
        select p.id, p.name, p.price_minor, p.is_active, p.created_at,
          coalesce(c.name, 'Uncategorized') category,
          coalesce(sp.store_name, 'Unassigned') seller,
          coalesce((select sum(pv.stock_quantity) from public.product_variants pv where pv.product_id = p.id), 0) stock,
          coalesce(pm.view_count, 0) views
        from public.products p
        left join public.categories c on c.id = p.category_id
        left join public.seller_profiles sp on sp.user_id = p.seller_id
        left join public.product_metrics pm on pm.product_id = p.id
      ) row_data
    ) else '[]'::jsonb end,
    'buyers', case when private.has_admin_role(array['super_admin', 'support_lead']) then (
      select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at desc), '[]'::jsonb)
      from (
        select p.id, coalesce(p.full_name, u.email, 'Unknown buyer') name, u.email, p.created_at,
          count(distinct o.id) filter (
            where o.payment_status = 'paid'
              and o.status <> 'cancelled'
          ) orders,
          coalesce(sum(o.total_minor) filter (
            where o.payment_status = 'paid'
              and o.status <> 'cancelled'
          ), 0) lifetime_value_minor
        from public.profiles p
        left join auth.users u on u.id = p.id
        left join public.orders o on o.user_id = p.id
        where p.role = 'buyer'
        group by p.id, p.full_name, u.email, p.created_at
      ) row_data
    ) else '[]'::jsonb end,
    'sellers', case when private.has_admin_role(array['super_admin', 'support_lead', 'content_mod']) then (
      select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at desc), '[]'::jsonb)
      from (
        select sp.user_id id, sp.store_name name, sp.status, sp.is_verified_store verified,
          sp.rating, sp.created_at,
          count(distinct p.id) products,
          count(distinct oi.order_id) filter (
            where o.payment_status = 'paid'
              and o.status <> 'cancelled'
          ) orders,
          coalesce(sum(oi.total_minor) filter (
            where o.payment_status = 'paid'
              and o.status <> 'cancelled'
          ), 0) revenue_minor
        from public.seller_profiles sp
        left join public.products p on p.seller_id = sp.user_id
        left join public.order_items oi on oi.product_id = p.id
        left join public.orders o on o.id = oi.order_id
        group by sp.user_id, sp.store_name, sp.status, sp.is_verified_store, sp.rating, sp.created_at
      ) row_data
    ) else '[]'::jsonb end,
    'analytics', case when private.has_admin_role(array['super_admin', 'finance_manager']) then jsonb_build_object(
      'userGrowth', (
        select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data."month"), '[]'::jsonb)
        from (
          select date_trunc('month', created_at)::date as "month",
            count(*) filter (where role = 'buyer') buyers,
            count(*) filter (where role = 'seller') sellers
          from public.profiles
          where created_at >= date_trunc('month', current_date) - interval '5 months'
          group by date_trunc('month', created_at)
        ) row_data
      ),
      'funnel', jsonb_build_array(
        jsonb_build_object('stage', 'Carts', 'value', (select count(*) from public.carts)),
        jsonb_build_object('stage', 'Checked Out Carts', 'value', (select count(*) from public.carts where status = 'checked_out')),
        jsonb_build_object('stage', 'Orders', 'value', (select count(*) from public.orders)),
        jsonb_build_object('stage', 'Paid Orders', 'value', (
          select count(*)
          from public.orders
          where payment_status = 'paid'
            and status <> 'cancelled'
        )),
        jsonb_build_object('stage', 'Delivered Orders', 'value', (select count(*) from public.orders where status = 'delivered'))
      )
    ) else '{}'::jsonb end,
    'supportTickets', case when private.has_admin_role(array['super_admin', 'support_lead']) then (
      select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at desc), '[]'::jsonb)
      from (
        select t.*, coalesce(p.full_name, u.email, 'Unknown user') user_name
        from public.admin_support_tickets t
        left join public.profiles p on p.id = t.user_id
        left join auth.users u on u.id = t.user_id
      ) row_data
    ) else '[]'::jsonb end,
    'hiringCandidates', case when private.has_admin_role(array['super_admin']) then (
      select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at desc), '[]'::jsonb)
      from public.admin_hiring_candidates c
    ) else '[]'::jsonb end,
    'hiringStages', case when private.has_admin_role(array['super_admin'])
      then jsonb_build_array('applied', 'screening', 'interview', 'offer', 'hired')
      else '[]'::jsonb end,
    'integrations', case when private.has_admin_role(array['super_admin', 'finance_manager']) then (
      select coalesce(jsonb_agg(to_jsonb(i) order by i.name), '[]'::jsonb)
      from public.admin_platform_integrations i
    ) else '[]'::jsonb end,
    'settings', case when private.has_admin_role(array['super_admin', 'finance_manager']) then (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.key), '[]'::jsonb)
      from public.admin_platform_settings s
    ) else '[]'::jsonb end,
    'admins', case when private.has_admin_role(array['super_admin']) then (
      select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at), '[]'::jsonb)
      from public.admin_users a
    ) else '[]'::jsonb end,
    'ai', case when private.has_admin_role(array['super_admin']) then jsonb_build_object(
      'queryCount', (select count(*) from public.admin_ai_queries),
      'failedSearches', (select coalesce(sum(search_count), 0) from public.product_metrics),
      'queries', (
        select coalesce(jsonb_agg(to_jsonb(q) order by q.created_at desc), '[]'::jsonb)
        from (select * from public.admin_ai_queries order by created_at desc limit 20) q
      )
    ) else '{}'::jsonb end
  ) into payload;

  return payload;
end;
$$;

revoke all on function public.get_admin_dashboard() from public;
grant execute on function public.get_admin_dashboard() to authenticated;

commit;
