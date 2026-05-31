-- Expand the admin console with paged products, hiring jobs, settings writes,
-- page-activity detail, and super-admin account promotion.

begin;

create extension if not exists pgcrypto;

alter table public.products
  add column if not exists moderation_status text;

update public.products
set moderation_status = 'approved'
where moderation_status is null;

alter table public.products
  alter column moderation_status set default 'pending',
  alter column moderation_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_moderation_status_check'
  ) then
    alter table public.products
      add constraint products_moderation_status_check
      check (moderation_status in ('pending', 'approved', 'rejected'));
  end if;
end
$$;

create index if not exists products_admin_catalog_created_at_idx
  on public.products(created_at desc);

create index if not exists products_admin_moderation_status_idx
  on public.products(moderation_status, is_active);

drop policy if exists "Products are publicly viewable" on public.products;

create policy "Products are publicly viewable"
on public.products
for select
using (
  seller_id = (select auth.uid())
  or (
    moderation_status = 'approved'
    and is_active = true
    and public.product_has_sellable_stock(products.id)
  )
);

create or replace function public.enforce_product_moderation_visibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.moderation_status <> 'pending' then
    perform private.assert_admin_role(array['super_admin', 'content_mod']);
  elsif tg_op = 'UPDATE'
    and new.moderation_status is distinct from old.moderation_status
  then
    perform private.assert_admin_role(array['super_admin', 'content_mod']);
  end if;

  if new.moderation_status <> 'approved' then
    new.is_active = false;
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_product_moderation_visibility()
  from public, anon, authenticated;

drop trigger if exists products_enforce_moderation_visibility
  on public.products;

create trigger products_enforce_moderation_visibility
before insert or update of is_active, moderation_status on public.products
for each row execute function public.enforce_product_moderation_visibility();

create or replace function public.reject_unavailable_cart_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = new.variant_id
      and pv.product_id = new.product_id
      and pv.is_active = true
      and pv.stock_quantity >= new.quantity
      and p.is_active = true
      and p.moderation_status = 'approved'
  ) then
    raise exception 'Product variant is unavailable or does not have enough stock.';
  end if;

  return new;
end;
$$;

revoke execute on function public.reject_unavailable_cart_item()
  from public, anon, authenticated;

create or replace function public.reject_unavailable_inventory_reservation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.status, 'reserved') = 'reserved'
    and not exists (
      select 1
      from public.product_variants variant
      join public.products product on product.id = variant.product_id
      where variant.id = new.variant_id
        and variant.is_active = true
        and product.is_active = true
        and product.moderation_status = 'approved'
    )
  then
    raise exception 'Product variant is unavailable.';
  end if;

  return new;
end;
$$;

revoke execute on function public.reject_unavailable_inventory_reservation()
  from public, anon, authenticated;

drop trigger if exists inventory_reservations_reject_unavailable_product
  on public.inventory_reservations;

create trigger inventory_reservations_reject_unavailable_product
before insert or update of variant_id, status on public.inventory_reservations
for each row execute function public.reject_unavailable_inventory_reservation();

create or replace function public.get_ranked_similar_products(
  target_id uuid,
  limit_count integer default 8
)
returns table (
  id uuid,
  name text,
  slug text,
  price_minor integer,
  category_id uuid,
  rating_stars numeric,
  rating_count integer,
  image text,
  keywords text[],
  score numeric
)
language sql
security definer
set search_path = ''
as $$
  select
    p.id,
    p.name,
    p.slug,
    p.price_minor,
    p.category_id,
    p.rating_stars,
    p.rating_count::integer,
    p.image,
    p.keywords,
    (
      case when p.category_id = target.category_id then 40 else 0 end
      + (
          select count(*)
          from unnest(coalesce(p.keywords, array[]::text[])) kw
          where kw = any(coalesce(target.keywords, array[]::text[]))
        ) * 8
      + log(coalesce(p.click_score, 0) + 1) * 2
      + case
          when p.created_at > now() - interval '30 days' then 5
          when p.created_at > now() - interval '90 days' then 2
          else 0
        end
      + coalesce(p.rating_stars, 0) * 2
      + case
          when p.embedding is not null and target.embedding is not null
          then (1 - (p.embedding operator(public.<=>) target.embedding)) * 30
          else 0
        end
    )::numeric as score
  from public.products p
  join (
    select
      candidate.id,
      candidate.category_id,
      candidate.keywords,
      candidate.embedding
    from public.products candidate
    where candidate.id = target_id
  ) target on true
  where p.is_active = true
    and p.moderation_status = 'approved'
    and p.id != target_id
    and public.product_has_sellable_stock(p.id)
  order by score desc
  limit limit_count;
$$;

grant execute on function public.get_ranked_similar_products(uuid, integer)
  to anon, authenticated;

create or replace function public.get_admin_products_page(
  product_filter text default 'all',
  search_term text default '',
  page_offset integer default 0,
  page_limit integer default 75
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_search text := lower(trim(coalesce(search_term, '')));
begin
  perform private.assert_admin_role(array['super_admin', 'content_mod']);

  if product_filter not in (
    'all', 'active', 'pending', 'rejected', 'inactive',
    'out_of_stock', 'no_views', 'has_views'
  ) then
    raise exception 'Unsupported product filter'
      using errcode = '22023';
  end if;

  if page_offset < 0 or page_limit < 1 or page_limit > 200 then
    raise exception 'Invalid product page'
      using errcode = '22023';
  end if;

  return (
    with inventory as (
      select pv.product_id, coalesce(sum(pv.stock_quantity), 0) sellable_stock
      from public.product_variants pv
      where pv.is_active = true
      group by pv.product_id
    ),
    product_rows as materialized (
      select p.id, p.name, p.price_minor, p.is_active, p.moderation_status,
        p.created_at, p.updated_at,
        coalesce(c.name, 'Uncategorized') category,
        coalesce(sp.store_name, 'Unassigned') seller,
        coalesce(inventory.sellable_stock, 0) stock,
        coalesce(pm.view_count, 0) views,
        case
          when p.moderation_status = 'pending' then 'pending'
          when p.moderation_status = 'rejected' then 'rejected'
          when coalesce(inventory.sellable_stock, 0) = 0 then 'out_of_stock'
          when not p.is_active then 'inactive'
          else 'active'
        end status
      from public.products p
      left join public.categories c on c.id = p.category_id
      left join public.seller_profiles sp on sp.user_id = p.seller_id
      left join public.product_metrics pm on pm.product_id = p.id
      left join inventory on inventory.product_id = p.id
    ),
    filtered_rows as (
      select *
      from product_rows product
      where (
        normalized_search = ''
        or lower(product.name) like '%' || normalized_search || '%'
        or lower(product.category) like '%' || normalized_search || '%'
        or lower(product.seller) like '%' || normalized_search || '%'
      )
      and (
        product_filter = 'all'
        or product_filter = 'no_views' and product.views = 0
        or product_filter = 'has_views' and product.views > 0
        or product_filter = 'pending' and product.moderation_status = 'pending'
        or product_filter = 'rejected' and product.moderation_status = 'rejected'
        or product.status = product_filter
      )
    )
    select jsonb_build_object(
      'items', (
        select coalesce(jsonb_agg(to_jsonb(page_rows) order by page_rows.created_at desc), '[]'::jsonb)
        from (
          select *
          from filtered_rows
          order by created_at desc
          offset page_offset
          limit page_limit
        ) page_rows
      ),
      'summary', (
        select jsonb_build_object(
          'all', count(*),
          'active', count(*) filter (where status = 'active'),
          'pending', count(*) filter (where moderation_status = 'pending'),
          'rejected', count(*) filter (where moderation_status = 'rejected'),
          'out_of_stock', count(*) filter (where status = 'out_of_stock'),
          'inactive', count(*) filter (where status = 'inactive')
        )
        from product_rows
      ),
      'total', (select count(*) from filtered_rows)
    )
  );
end;
$$;

create or replace function public.admin_set_product_moderation_status(
  product_id uuid,
  next_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'content_mod']);

  if next_status is null or next_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Unsupported product moderation status'
      using errcode = '22023';
  end if;

  update public.products
  set moderation_status = next_status,
    is_active = case when next_status <> 'approved' then false else is_active end,
    updated_at = timezone('utc'::text, now())
  where id = product_id;

  if not found then
    raise exception 'Product was not found'
      using errcode = 'P0002';
  end if;

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'product_moderation',
    'Product moderation status updated',
    jsonb_build_object('productId', product_id, 'status', next_status)
  );
end;
$$;

create or replace function public.admin_set_product_active(product_id uuid, active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'content_mod']);

  if active is null then
    raise exception 'Product visibility state is required'
      using errcode = '22023';
  end if;

  if active and not exists (
    select 1
    from public.products product
    where product.id = $1
      and product.moderation_status = 'approved'
  ) then
    raise exception 'Only approved products can be activated'
      using errcode = '22023';
  end if;

  if active and not exists (
    select 1
    from public.product_variants variant
    where variant.product_id = $1
      and variant.is_active = true
      and variant.stock_quantity > 0
  ) then
    raise exception 'Product cannot be activated without sellable stock'
      using errcode = '22023';
  end if;

  update public.products
  set is_active = active,
    updated_at = timezone('utc'::text, now())
  where id = $1;

  if not found then
    raise exception 'Product was not found'
      using errcode = 'P0002';
  end if;

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'product_status',
    'Product visibility updated',
    jsonb_build_object('productId', product_id, 'isActive', active)
  );
end;
$$;

create or replace function public.get_admin_dashboard_optimized()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_active_admin();

  return jsonb_build_object(
    'stats', jsonb_build_object(
      'revenueMinor', (
        select coalesce(sum(total_minor), 0)
        from public.orders
        where payment_status = 'paid'
          and status <> 'cancelled'
      ),
      'orders', (select count(*) from public.orders),
      'users', (
        select count(*)
        from public.profiles profile
        where not exists (
          select 1 from public.admin_users admin_user where admin_user.id = profile.id
        )
      ),
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
    'categories', (
      select coalesce(jsonb_agg(to_jsonb(category_row) order by category_row.revenue_minor desc), '[]'::jsonb)
      from (
        select coalesce(category.name, 'Uncategorized') name,
          coalesce(sum(item.total_minor), 0) revenue_minor,
          round(coalesce(sum(item.total_minor), 0) * 100.0 /
            nullif(sum(coalesce(sum(item.total_minor), 0)) over (), 0), 1) share
        from public.order_items item
        join public.orders orders on orders.id = item.order_id
        join public.products product on product.id = item.product_id
        left join public.categories category on category.id = product.category_id
        where orders.payment_status = 'paid'
          and orders.status <> 'cancelled'
        group by category.name
      ) category_row
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
      select coalesce(jsonb_agg(to_jsonb(order_row) order by order_row.created_at desc), '[]'::jsonb)
      from (
        select orders.id, orders.status, orders.payment_status payment, orders.total_minor amount_minor, orders.created_at,
          coalesce(profile.full_name, auth_user.email, 'Unknown customer') customer,
          coalesce((select string_agg(distinct item.product_name, ', ') from public.order_items item where item.order_id = orders.id), '') products,
          coalesce((select string_agg(distinct seller.store_name, ', ')
            from public.order_items item
            join public.products product on product.id = item.product_id
            left join public.seller_profiles seller on seller.user_id = product.seller_id
            where item.order_id = orders.id), '') sellers
        from public.orders orders
        left join public.profiles profile on profile.id = orders.user_id
        left join auth.users auth_user on auth_user.id = orders.user_id
      ) order_row
    ) else '[]'::jsonb end,
    'sellers', case when private.has_admin_role(array['super_admin', 'support_lead', 'content_mod']) then (
      select coalesce(jsonb_agg(to_jsonb(seller_row) order by seller_row.created_at desc), '[]'::jsonb)
      from (
        select seller.user_id id, seller.store_name name, seller.status, seller.is_verified_store verified,
          seller.rating, seller.created_at,
          count(distinct product.id) products,
          count(distinct item.order_id) filter (
            where orders.payment_status = 'paid'
              and orders.status <> 'cancelled'
          ) orders,
          coalesce(sum(item.total_minor) filter (
            where orders.payment_status = 'paid'
              and orders.status <> 'cancelled'
          ), 0) revenue_minor
        from public.seller_profiles seller
        left join public.products product on product.seller_id = seller.user_id
        left join public.order_items item on item.product_id = product.id
        left join public.orders orders on orders.id = item.order_id
        group by seller.user_id, seller.store_name, seller.status, seller.is_verified_store, seller.rating, seller.created_at
      ) seller_row
    ) else '[]'::jsonb end,
    'analytics', case when private.has_admin_role(array['super_admin', 'finance_manager']) then jsonb_build_object(
      'userGrowth', (
        select coalesce(jsonb_agg(to_jsonb(growth_row) order by growth_row."month"), '[]'::jsonb)
        from (
          select date_trunc('month', profile.created_at)::date as "month",
            count(*) filter (where profile.role = 'buyer') buyers,
            count(*) filter (where profile.role = 'seller') sellers
          from public.profiles profile
          where profile.created_at >= date_trunc('month', current_date) - interval '5 months'
            and not exists (
              select 1 from public.admin_users admin_user where admin_user.id = profile.id
            )
          group by date_trunc('month', profile.created_at)
        ) growth_row
      ),
      'funnel', jsonb_build_array(
        jsonb_build_object('stage', 'Carts', 'value', (select count(*) from public.carts)),
        jsonb_build_object('stage', 'Checked Out Carts', 'value', (select count(*) from public.carts where status = 'checked_out')),
        jsonb_build_object('stage', 'Orders', 'value', (select count(*) from public.orders)),
        jsonb_build_object('stage', 'Paid Orders', 'value', (
          select count(*) from public.orders where payment_status = 'paid' and status <> 'cancelled'
        )),
        jsonb_build_object('stage', 'Delivered Orders', 'value', (select count(*) from public.orders where status = 'delivered'))
      )
    ) else '{}'::jsonb end,
    'supportTickets', case when private.has_admin_role(array['super_admin', 'support_lead']) then (
      select coalesce(jsonb_agg(to_jsonb(ticket_row) order by ticket_row.created_at desc), '[]'::jsonb)
      from (
        select ticket.*, coalesce(profile.full_name, auth_user.email, 'Unknown user') user_name
        from public.admin_support_tickets ticket
        left join public.profiles profile on profile.id = ticket.user_id
        left join auth.users auth_user on auth_user.id = ticket.user_id
      ) ticket_row
    ) else '[]'::jsonb end,
    'integrations', case when private.has_admin_role(array['super_admin', 'finance_manager']) then (
      select coalesce(jsonb_agg(to_jsonb(integration) order by integration.name), '[]'::jsonb)
      from public.admin_platform_integrations integration
    ) else '[]'::jsonb end,
    'settings', case when private.has_admin_role(array['super_admin', 'finance_manager']) then (
      select coalesce(jsonb_agg(to_jsonb(setting) order by setting.key), '[]'::jsonb)
      from public.admin_platform_settings setting
    ) else '[]'::jsonb end,
    'admins', case when private.has_admin_role(array['super_admin']) then (
      select coalesce(jsonb_agg(to_jsonb(admin_user) order by admin_user.created_at), '[]'::jsonb)
      from public.admin_users admin_user
    ) else '[]'::jsonb end,
    'ai', case when private.has_admin_role(array['super_admin']) then jsonb_build_object(
      'queryCount', (select count(*) from public.admin_ai_queries),
      'failedSearches', (select coalesce(sum(search_count), 0) from public.product_metrics),
      'queries', (
        select coalesce(jsonb_agg(to_jsonb(ai_query) order by ai_query.created_at desc), '[]'::jsonb)
        from (select * from public.admin_ai_queries order by created_at desc limit 20) ai_query
      )
    ) else '{}'::jsonb end
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
    ),
    page_rows as (
      select page_activity.path, page_activity.events, coalesce(page_views.visits, 0) visits
      from page_activity
      left join page_views on page_views.path = page_activity.path
    )
    select jsonb_build_object(
      'mostVisitedPage', (
        select jsonb_build_object('path', page_rows.path, 'visits', page_rows.visits)
        from page_rows
        order by page_rows.visits desc, page_rows.path
        limit 1
      ),
      'highestActivityPage', (
        select jsonb_build_object('path', page_rows.path, 'events', page_rows.events)
        from page_rows
        order by page_rows.events desc, page_rows.path
        limit 1
      ),
      'lowestActivityPage', (
        select jsonb_build_object('path', page_rows.path, 'events', page_rows.events)
        from page_rows
        order by page_rows.events, page_rows.path
        limit 1
      ),
      'pages', (
        select coalesce(jsonb_agg(to_jsonb(page_rows) order by page_rows.events desc, page_rows.path), '[]'::jsonb)
        from page_rows
      )
    )
  );
end;
$$;

create table if not exists public.admin_job_openings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  location text not null,
  employment_type text not null default 'full_time'
    check (employment_type in ('full_time', 'part_time', 'contract', 'internship')),
  openings integer not null default 1 check (openings > 0),
  status text not null default 'open'
    check (status in ('draft', 'open', 'closed')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.admin_job_openings enable row level security;
revoke all on table public.admin_job_openings from anon, public;
grant select on table public.admin_job_openings to authenticated;

drop policy if exists "Admins can read job openings" on public.admin_job_openings;
create policy "Admins can read job openings"
on public.admin_job_openings for select to authenticated
using ((select private.has_admin_role(array['super_admin'])));

create or replace function public.get_admin_hiring()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin']);

  return jsonb_build_object(
    'candidates', (
      select coalesce(jsonb_agg(to_jsonb(candidate) order by candidate.created_at desc), '[]'::jsonb)
      from public.admin_hiring_candidates candidate
    ),
    'jobs', (
      select coalesce(jsonb_agg(to_jsonb(job) order by job.created_at desc), '[]'::jsonb)
      from public.admin_job_openings job
    ),
    'stages', jsonb_build_array('applied', 'screening', 'interview', 'offer', 'hired')
  );
end;
$$;

create or replace function public.admin_create_job_opening(
  job_title text,
  job_department text,
  job_location text,
  job_employment_type text,
  job_openings integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_job_id uuid;
begin
  perform private.assert_admin_role(array['super_admin']);

  if nullif(trim(job_title), '') is null
    or nullif(trim(job_department), '') is null
    or nullif(trim(job_location), '') is null
  then
    raise exception 'Job title, department, and location are required'
      using errcode = '22023';
  end if;

  if job_employment_type not in ('full_time', 'part_time', 'contract', 'internship')
    or job_openings is null
    or job_openings < 1
  then
    raise exception 'Invalid job opening details'
      using errcode = '22023';
  end if;

  insert into public.admin_job_openings(title, department, location, employment_type, openings)
  values (
    trim(job_title),
    trim(job_department),
    trim(job_location),
    job_employment_type,
    job_openings
  )
  returning id into created_job_id;

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'job_opening',
    'Job opening created',
    jsonb_build_object('jobId', created_job_id, 'title', trim(job_title))
  );

  return created_job_id;
end;
$$;

create or replace function public.admin_set_job_opening_status(job_id uuid, next_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin']);

  if next_status is null or next_status not in ('draft', 'open', 'closed') then
    raise exception 'Unsupported job status'
      using errcode = '22023';
  end if;

  update public.admin_job_openings
  set status = next_status,
    updated_at = timezone('utc'::text, now())
  where id = job_id;

  if not found then
    raise exception 'Job opening was not found'
      using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.admin_upsert_platform_integration(
  integration_id uuid,
  integration_name text,
  integration_service text,
  integration_environment text,
  integration_status text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_integration_id uuid;
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  if nullif(trim(integration_name), '') is null
    or nullif(trim(integration_service), '') is null
    or integration_status not in ('active', 'inactive', 'pending')
  then
    raise exception 'Invalid integration details'
      using errcode = '22023';
  end if;

  if integration_id is null then
    insert into public.admin_platform_integrations(name, service, environment, status)
    values (
      trim(integration_name),
      trim(integration_service),
      nullif(trim(integration_environment), ''),
      integration_status
    )
    returning id into saved_integration_id;
  else
    update public.admin_platform_integrations
    set name = trim(integration_name),
      service = trim(integration_service),
      environment = nullif(trim(integration_environment), ''),
      status = integration_status,
      updated_at = timezone('utc'::text, now())
    where id = integration_id
    returning id into saved_integration_id;

    if not found then
      raise exception 'Integration was not found'
        using errcode = 'P0002';
    end if;
  end if;

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'platform_integration',
    'Platform integration saved',
    jsonb_build_object('integrationId', saved_integration_id)
  );

  return saved_integration_id;
end;
$$;

create or replace function public.admin_delete_platform_integration(integration_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  delete from public.admin_platform_integrations
  where id = integration_id;

  if not found then
    raise exception 'Integration was not found'
      using errcode = 'P0002';
  end if;

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'platform_integration',
    'Platform integration deleted',
    jsonb_build_object('integrationId', integration_id)
  );
end;
$$;

create or replace function public.admin_upsert_platform_setting(setting_key text, setting_value jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  if nullif(trim(setting_key), '') is null or setting_value is null then
    raise exception 'Setting key and JSON value are required'
      using errcode = '22023';
  end if;

  insert into public.admin_platform_settings(key, value)
  values (trim(setting_key), setting_value)
  on conflict (key) do update
  set value = excluded.value,
    updated_at = timezone('utc'::text, now());

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'platform_setting',
    'Platform setting saved',
    jsonb_build_object('settingKey', trim(setting_key))
  );
end;
$$;

create or replace function public.admin_delete_platform_setting(setting_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  delete from public.admin_platform_settings
  where key = setting_key;

  if not found then
    raise exception 'Platform setting was not found'
      using errcode = 'P0002';
  end if;

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'platform_setting',
    'Platform setting deleted',
    jsonb_build_object('settingKey', setting_key)
  );
end;
$$;

create table if not exists private.admin_promotion_security (
  singleton boolean primary key default true check (singleton),
  passcode_hash text not null,
  updated_at timestamptz not null default timezone('utc'::text, now()),
  updated_by uuid references public.admin_users(id) on delete set null
);

create table if not exists private.admin_promotion_attempts (
  admin_id uuid primary key references public.admin_users(id) on delete cascade,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

revoke all on table private.admin_promotion_security from public;
revoke all on table private.admin_promotion_attempts from public;

create or replace function private.hash_admin_promotion_passcode(passcode text)
returns text
language sql
strict
security definer
set search_path = 'extensions', 'public', 'pg_catalog'
as $$
  select crypt(passcode, gen_salt('bf', 12));
$$;

create or replace function private.verify_admin_promotion_passcode(passcode text, passcode_hash text)
returns boolean
language sql
strict
security definer
set search_path = 'extensions', 'public', 'pg_catalog'
as $$
  select crypt(passcode, passcode_hash) = passcode_hash;
$$;

revoke all on function private.hash_admin_promotion_passcode(text) from public;
revoke all on function private.verify_admin_promotion_passcode(text, text) from public;

create or replace function private.record_admin_promotion_failure(actor_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.admin_promotion_attempts(admin_id, failed_attempts, locked_until)
  values (
    actor_id,
    1,
    null
  )
  on conflict (admin_id) do update
  set failed_attempts = case
      when private.admin_promotion_attempts.locked_until <= timezone('utc'::text, now())
        then 1
      else private.admin_promotion_attempts.failed_attempts + 1
    end,
    locked_until = case
      when (
        case
          when private.admin_promotion_attempts.locked_until <= timezone('utc'::text, now())
            then 1
          else private.admin_promotion_attempts.failed_attempts + 1
        end
      ) >= 5
        then timezone('utc'::text, now()) + interval '15 minutes'
      else null
    end,
    updated_at = timezone('utc'::text, now());
end;
$$;

revoke all on function private.record_admin_promotion_failure(uuid) from public;

create or replace function public.admin_configure_promotion_passcode(
  current_passcode text,
  new_passcode text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  locked_until timestamptz;
  saved_hash text;
begin
  perform private.assert_admin_role(array['super_admin']);

  if new_passcode is null or new_passcode !~ '^[0-9]{6}$' then
    raise exception 'The new promotion passcode must contain exactly six digits'
      using errcode = '22023';
  end if;

  select passcode_hash
  into saved_hash
  from private.admin_promotion_security
  where singleton = true;

  if found and (
    current_passcode is null
    or not private.verify_admin_promotion_passcode(current_passcode, saved_hash)
  ) then
    select attempts.locked_until
    into locked_until
    from private.admin_promotion_attempts attempts
    where attempts.admin_id = actor_id;

    if locked_until > timezone('utc'::text, now()) then
      return jsonb_build_object(
        'success', false,
        'message', 'Promotion security updates are temporarily locked. Try again later'
      );
    end if;

    perform private.record_admin_promotion_failure(actor_id);

    return jsonb_build_object(
      'success', false,
      'message', 'The current promotion passcode is incorrect'
    );
  end if;

  insert into private.admin_promotion_security(singleton, passcode_hash, updated_by)
  values (
    true,
    private.hash_admin_promotion_passcode(new_passcode),
    (select auth.uid())
  )
  on conflict (singleton) do update
  set passcode_hash = excluded.passcode_hash,
    updated_at = timezone('utc'::text, now()),
    updated_by = excluded.updated_by;

  delete from private.admin_promotion_attempts;

  insert into public.admin_activity_log(admin_id, event_type, message)
  values (
    (select auth.uid()),
    'admin_promotion_security',
    'Admin promotion passcode configured'
  );

  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.admin_promote_user(
  target_email text,
  target_name text,
  target_role text,
  promotion_passcode text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  locked_until timestamptz;
  saved_hash text;
  target_user auth.users%rowtype;
begin
  perform private.assert_admin_role(array['super_admin']);

  if nullif(trim(target_email), '') is null
    or target_role not in ('super_admin', 'support_lead', 'finance_manager', 'content_mod')
  then
    raise exception 'A valid account email and admin role are required'
      using errcode = '22023';
  end if;

  if promotion_passcode is null or promotion_passcode !~ '^[0-9]{6}$' then
    return jsonb_build_object(
      'success', false,
      'message', 'Enter the six-digit promotion passcode'
    );
  end if;

  select security.passcode_hash
  into saved_hash
  from private.admin_promotion_security security
  where security.singleton = true;

  if not found then
    return jsonb_build_object(
      'success', false,
      'message', 'Configure the promotion passcode before promoting an admin'
    );
  end if;

  select attempts.locked_until
  into locked_until
  from private.admin_promotion_attempts attempts
  where attempts.admin_id = actor_id;

  if locked_until > timezone('utc'::text, now()) then
    return jsonb_build_object(
      'success', false,
      'message', 'Promotion attempts are temporarily locked. Try again later'
    );
  end if;

  if not private.verify_admin_promotion_passcode(promotion_passcode, saved_hash) then
    perform private.record_admin_promotion_failure(actor_id);

    return jsonb_build_object(
      'success', false,
      'message', 'The promotion passcode is incorrect'
    );
  end if;

  delete from private.admin_promotion_attempts
  where admin_id = actor_id;

  select *
  into target_user
  from auth.users auth_user
  where lower(auth_user.email) = lower(trim(target_email))
  limit 1;

  if not found then
    raise exception 'No Auth account exists for this email'
      using errcode = 'P0002';
  end if;

  insert into public.admin_users(id, email, full_name, role, is_active)
  values (
    target_user.id,
    target_user.email,
    coalesce(nullif(trim(target_name), ''), target_user.raw_user_meta_data ->> 'full_name'),
    target_role::public.admin_role,
    true
  )
  on conflict (id) do update
  set email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    is_active = true,
    updated_at = timezone('utc'::text, now());

  insert into public.admin_activity_log(admin_id, event_type, message, metadata)
  values (
    (select auth.uid()),
    'admin_promotion',
    'Admin account promoted',
    jsonb_build_object('email', target_user.email, 'role', target_role)
  );

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.get_admin_products_page(text, text, integer, integer) from public;
grant execute on function public.get_admin_products_page(text, text, integer, integer) to authenticated;

revoke all on function public.get_admin_dashboard_optimized() from public;
grant execute on function public.get_admin_dashboard_optimized() to authenticated;

revoke all on function public.admin_set_product_moderation_status(uuid, text) from public;
grant execute on function public.admin_set_product_moderation_status(uuid, text) to authenticated;

revoke all on function public.admin_set_product_active(uuid, boolean) from public;
grant execute on function public.admin_set_product_active(uuid, boolean) to authenticated;

revoke all on function public.get_admin_hiring() from public;
grant execute on function public.get_admin_hiring() to authenticated;

revoke all on function public.admin_create_job_opening(text, text, text, text, integer) from public;
grant execute on function public.admin_create_job_opening(text, text, text, text, integer) to authenticated;

revoke all on function public.admin_set_job_opening_status(uuid, text) from public;
grant execute on function public.admin_set_job_opening_status(uuid, text) to authenticated;

revoke all on function public.admin_upsert_platform_integration(uuid, text, text, text, text) from public;
grant execute on function public.admin_upsert_platform_integration(uuid, text, text, text, text) to authenticated;

revoke all on function public.admin_delete_platform_integration(uuid) from public;
grant execute on function public.admin_delete_platform_integration(uuid) to authenticated;

revoke all on function public.admin_upsert_platform_setting(text, jsonb) from public;
grant execute on function public.admin_upsert_platform_setting(text, jsonb) to authenticated;

revoke all on function public.admin_delete_platform_setting(text) from public;
grant execute on function public.admin_delete_platform_setting(text) to authenticated;

revoke all on function public.admin_configure_promotion_passcode(text, text) from public;
grant execute on function public.admin_configure_promotion_passcode(text, text) to authenticated;

revoke all on function public.admin_promote_user(text, text, text, text) from public;
grant execute on function public.admin_promote_user(text, text, text, text) to authenticated;

commit;
