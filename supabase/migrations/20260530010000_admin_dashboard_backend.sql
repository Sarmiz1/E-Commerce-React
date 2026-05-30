-- Backend-owned data and secured RPCs for the admin dashboard.

begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where id = (select auth.uid())
      and is_active = true
  );
$$;

revoke all on function private.is_active_admin() from public;
grant execute on function private.is_active_admin() to authenticated;

create or replace function private.assert_active_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select private.is_active_admin()) then
    raise exception 'Active admin access is required' using errcode = '42501';
  end if;
end;
$$;

revoke all on function private.assert_active_admin() from public;
grant execute on function private.assert_active_admin() to authenticated;

create or replace function private.has_admin_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where id = (select auth.uid())
      and is_active = true
      and role::text = any(allowed_roles)
  );
$$;

revoke all on function private.has_admin_role(text[]) from public;
grant execute on function private.has_admin_role(text[]) to authenticated;

create or replace function private.assert_admin_role(allowed_roles text[])
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select private.has_admin_role(allowed_roles)) then
    raise exception 'Your admin role does not permit this operation' using errcode = '42501';
  end if;
end;
$$;

revoke all on function private.assert_admin_role(text[]) from public;
grant execute on function private.assert_admin_role(text[]) to authenticated;

alter table public.seller_profiles
  add column if not exists status text default 'pending' not null
  check (status in ('pending', 'active', 'suspended'));

update public.seller_profiles
set status = 'active'
where is_verified_store = true
  and status = 'pending';

create table if not exists public.admin_support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null default (
    'TKT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  user_id uuid references public.profiles(id) on delete set null,
  subject text not null,
  category text,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'open'
    check (status in ('open', 'pending', 'resolved')),
  is_escalated boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  resolved_at timestamptz
);

create table if not exists public.admin_hiring_candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text not null,
  experience_summary text,
  score integer check (score between 0 and 100),
  stage text not null default 'applied'
    check (stage in ('applied', 'screening', 'interview', 'offer', 'hired')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.admin_platform_integrations (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  service text not null,
  environment text,
  status text not null default 'inactive'
    check (status in ('active', 'inactive', 'pending')),
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.admin_platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_users(id) on delete set null,
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.admin_ai_queries (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_users(id) on delete set null,
  prompt text not null,
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'failed')),
  response text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.admin_support_tickets enable row level security;
alter table public.admin_hiring_candidates enable row level security;
alter table public.admin_platform_integrations enable row level security;
alter table public.admin_platform_settings enable row level security;
alter table public.admin_activity_log enable row level security;
alter table public.admin_ai_queries enable row level security;

revoke all on table public.admin_support_tickets from anon, public;
revoke all on table public.admin_hiring_candidates from anon, public;
revoke all on table public.admin_platform_integrations from anon, public;
revoke all on table public.admin_platform_settings from anon, public;
revoke all on table public.admin_activity_log from anon, public;
revoke all on table public.admin_ai_queries from anon, public;

grant select on table public.admin_support_tickets to authenticated;
grant select on table public.admin_hiring_candidates to authenticated;
grant select on table public.admin_platform_integrations to authenticated;
grant select on table public.admin_platform_settings to authenticated;
grant select on table public.admin_activity_log to authenticated;
grant select on table public.admin_ai_queries to authenticated;

drop policy if exists "Admins can read support tickets" on public.admin_support_tickets;
create policy "Admins can read support tickets"
on public.admin_support_tickets for select to authenticated
using ((select private.has_admin_role(array['super_admin', 'support_lead'])));

drop policy if exists "Admins can read hiring candidates" on public.admin_hiring_candidates;
create policy "Admins can read hiring candidates"
on public.admin_hiring_candidates for select to authenticated
using ((select private.has_admin_role(array['super_admin'])));

drop policy if exists "Admins can read integrations" on public.admin_platform_integrations;
create policy "Admins can read integrations"
on public.admin_platform_integrations for select to authenticated
using ((select private.has_admin_role(array['super_admin', 'finance_manager'])));

drop policy if exists "Admins can read platform settings" on public.admin_platform_settings;
create policy "Admins can read platform settings"
on public.admin_platform_settings for select to authenticated
using ((select private.has_admin_role(array['super_admin', 'finance_manager'])));

drop policy if exists "Admins can read activity" on public.admin_activity_log;
create policy "Admins can read activity"
on public.admin_activity_log for select to authenticated
using ((select private.is_active_admin()));

drop policy if exists "Admins can read AI queries" on public.admin_ai_queries;
create policy "Admins can read AI queries"
on public.admin_ai_queries for select to authenticated
using ((select private.has_admin_role(array['super_admin'])));

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

create or replace function public.admin_set_order_status(order_id uuid, next_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_admin_role(array['super_admin', 'support_lead', 'finance_manager']);
  if next_status not in ('pending', 'processing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Unsupported order status' using errcode = '22023';
  end if;
  update public.orders set status = next_status, updated_at = timezone('utc'::text, now()) where id = order_id;
  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values ((select auth.uid()), 'order_status', 'Order status updated', jsonb_build_object('orderId', order_id, 'status', next_status));
end;
$$;

create or replace function public.admin_set_product_active(product_id uuid, active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_admin_role(array['super_admin', 'content_mod']);
  update public.products set is_active = active, updated_at = timezone('utc'::text, now()) where id = product_id;
  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values ((select auth.uid()), 'product_status', 'Product visibility updated', jsonb_build_object('productId', product_id, 'isActive', active));
end;
$$;

create or replace function public.admin_set_seller_status(seller_id uuid, next_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if next_status = 'suspended' then
    perform private.assert_admin_role(array['super_admin']);
  else
    perform private.assert_admin_role(array['super_admin', 'content_mod']);
  end if;
  if next_status not in ('pending', 'active', 'suspended') then
    raise exception 'Unsupported seller status' using errcode = '22023';
  end if;
  update public.seller_profiles
  set status = next_status, is_verified_store = (next_status = 'active')
  where user_id = seller_id;
  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values ((select auth.uid()), 'seller_status', 'Seller status updated', jsonb_build_object('sellerId', seller_id, 'status', next_status));
end;
$$;

create or replace function public.admin_set_support_ticket_status(ticket_id uuid, next_status text, escalate boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_admin_role(array['super_admin', 'support_lead']);
  if next_status not in ('open', 'pending', 'resolved') then
    raise exception 'Unsupported ticket status' using errcode = '22023';
  end if;
  update public.admin_support_tickets
  set status = next_status,
      is_escalated = is_escalated or escalate,
      resolved_at = case when next_status = 'resolved' then timezone('utc'::text, now()) else null end,
      updated_at = timezone('utc'::text, now())
  where id = ticket_id;
end;
$$;

create or replace function public.admin_move_hiring_candidate(candidate_id uuid, next_stage text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_admin_role(array['super_admin']);
  if next_stage not in ('applied', 'screening', 'interview', 'offer', 'hired') then
    raise exception 'Unsupported hiring stage' using errcode = '22023';
  end if;
  update public.admin_hiring_candidates
  set stage = next_stage, updated_at = timezone('utc'::text, now())
  where id = candidate_id;
end;
$$;

create or replace function public.admin_queue_ai_query(query_prompt text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_admin_role(array['super_admin']);
  if nullif(trim(query_prompt), '') is null then
    raise exception 'Query prompt is required' using errcode = '22023';
  end if;
  insert into public.admin_ai_queries(admin_id, prompt)
  values ((select auth.uid()), trim(query_prompt));
end;
$$;

revoke all on function public.get_admin_dashboard() from public;
revoke all on function public.admin_set_order_status(uuid, text) from public;
revoke all on function public.admin_set_product_active(uuid, boolean) from public;
revoke all on function public.admin_set_seller_status(uuid, text) from public;
revoke all on function public.admin_set_support_ticket_status(uuid, text, boolean) from public;
revoke all on function public.admin_move_hiring_candidate(uuid, text) from public;
revoke all on function public.admin_queue_ai_query(text) from public;

grant execute on function public.get_admin_dashboard() to authenticated;
grant execute on function public.admin_set_order_status(uuid, text) to authenticated;
grant execute on function public.admin_set_product_active(uuid, boolean) to authenticated;
grant execute on function public.admin_set_seller_status(uuid, text) to authenticated;
grant execute on function public.admin_set_support_ticket_status(uuid, text, boolean) to authenticated;
grant execute on function public.admin_move_hiring_candidate(uuid, text) to authenticated;
grant execute on function public.admin_queue_ai_query(text) to authenticated;

commit;
