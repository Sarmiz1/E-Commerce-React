-- Improve admin inventory, user, seller, and analytics workflows.

begin;

create index if not exists idx_events_event_type_metadata_path
  on public.events(event_type, (metadata ->> 'path'))
  where nullif(metadata ->> 'path', '') is not null;

create or replace function public.get_admin_products()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'content_mod']);

  return (
    select coalesce(jsonb_agg(to_jsonb(row_data) order by row_data.created_at desc), '[]'::jsonb)
    from (
      select p.id, p.name, p.price_minor, p.is_active, p.created_at, p.updated_at,
        coalesce(c.name, 'Uncategorized') category,
        coalesce(sp.store_name, 'Unassigned') seller,
        coalesce(inventory.sellable_stock, 0) stock,
        coalesce(pm.view_count, 0) views,
        case
          when coalesce(inventory.sellable_stock, 0) = 0 then 'out_of_stock'
          when not p.is_active then 'inactive'
          else 'active'
        end status
      from public.products p
      left join public.categories c on c.id = p.category_id
      left join public.seller_profiles sp on sp.user_id = p.seller_id
      left join public.product_metrics pm on pm.product_id = p.id
      left join lateral (
        select coalesce(sum(pv.stock_quantity), 0) sellable_stock
        from public.product_variants pv
        where pv.product_id = p.id
          and pv.is_active = true
      ) inventory on true
    ) row_data
  );
end;
$$;

create or replace function public.get_admin_buyers()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'support_lead']);

  return (
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
        and not exists (
          select 1
          from public.admin_users admin_user
          where admin_user.id = p.id
        )
      group by p.id, p.full_name, u.email, p.created_at
    ) row_data
  );
end;
$$;

create or replace function public.get_admin_page_activity()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  return (
    with page_views as (
      select e.metadata ->> 'path' path, count(*) visits
      from public.events e
      where e.event_type = 'page_view'
        and nullif(e.metadata ->> 'path', '') is not null
      group by e.metadata ->> 'path'
    ),
    page_activity as (
      select e.metadata ->> 'path' path, count(*) events
      from public.events e
      where nullif(e.metadata ->> 'path', '') is not null
      group by e.metadata ->> 'path'
    )
    select jsonb_build_object(
      'mostVisitedPage', (
        select jsonb_build_object('path', page_views.path, 'visits', page_views.visits)
        from page_views
        order by page_views.visits desc, page_views.path
        limit 1
      ),
      'highestActivityPage', (
        select jsonb_build_object('path', page_activity.path, 'events', page_activity.events)
        from page_activity
        order by page_activity.events desc, page_activity.path
        limit 1
      ),
      'lowestActivityPage', (
        select jsonb_build_object('path', page_activity.path, 'events', page_activity.events)
        from page_activity
        order by page_activity.events, page_activity.path
        limit 1
      )
    )
  );
end;
$$;

create or replace function public.get_admin_user_growth(chart_range text default 'months')
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
  label_format text;
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  case chart_range
    when 'days' then
      bucket_count := 14;
      bucket_interval := interval '1 day';
      bucket_unit := 'day';
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
      raise exception 'Unsupported user-growth chart range'
        using errcode = '22023';
  end case;

  chart_end := date_trunc(bucket_unit, current_date::timestamp)::date;
  chart_start := chart_end - ((bucket_count - 1) * bucket_interval);

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'date', bucket::date,
      'label', to_char(bucket, label_format),
      'buyers', coalesce(summary.buyers, 0),
      'sellers', coalesce(summary.sellers, 0)
    ) order by bucket), '[]'::jsonb)
    from generate_series(
      chart_start::timestamp,
      chart_end::timestamp,
      bucket_interval
    ) bucket
    left join lateral (
      select
        count(*) filter (where p.role = 'buyer') buyers,
        count(*) filter (where p.role = 'seller') sellers
      from public.profiles p
      where p.created_at >= bucket
        and p.created_at < bucket + bucket_interval
        and not exists (
          select 1
          from public.admin_users admin_user
          where admin_user.id = p.id
        )
    ) summary on true
  );
end;
$$;

create or replace function public.admin_set_seller_status(seller_id uuid, next_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if next_status is null or next_status not in ('pending', 'active', 'suspended') then
    raise exception 'Unsupported seller status'
      using errcode = '22023';
  end if;

  if next_status = 'suspended' then
    perform private.assert_admin_role(array['super_admin']);
  else
    perform private.assert_admin_role(array['super_admin', 'content_mod']);
  end if;

  update public.seller_profiles
  set status = next_status,
    is_verified_store = (next_status = 'active'),
    updated_at = timezone('utc'::text, now())
  where user_id = seller_id;

  if not found then
    raise exception 'Seller was not found'
      using errcode = 'P0002';
  end if;

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'seller_status',
    'Seller status updated',
    jsonb_build_object('sellerId', seller_id, 'status', next_status)
  );
end;
$$;

revoke all on function public.get_admin_products() from public;
grant execute on function public.get_admin_products() to authenticated;

revoke all on function public.get_admin_buyers() from public;
grant execute on function public.get_admin_buyers() to authenticated;

revoke all on function public.get_admin_page_activity() from public;
grant execute on function public.get_admin_page_activity() to authenticated;

revoke all on function public.get_admin_user_growth(text) from public;
grant execute on function public.get_admin_user_growth(text) to authenticated;

revoke all on function public.admin_set_seller_status(uuid, text) from public;
grant execute on function public.admin_set_seller_status(uuid, text) to authenticated;

commit;
