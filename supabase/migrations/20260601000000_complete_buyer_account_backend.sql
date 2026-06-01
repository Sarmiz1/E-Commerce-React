-- Complete buyer-account backend flows and keep dashboard reads responsive.
-- Payment methods store masked metadata only. Raw card details stay with the
-- payment provider and must never be persisted in this database.

create index if not exists orders_buyer_paid_created_at_idx
  on public.orders(user_id, created_at desc)
  where payment_status = 'paid' and status <> 'cancelled';

create index if not exists order_items_order_product_idx
  on public.order_items(order_id, product_id);

create index if not exists product_variants_sellable_product_stock_idx
  on public.product_variants(product_id, stock_quantity desc, created_at, id)
  where is_active = true and stock_quantity > 0;

create index if not exists buyer_recommendations_user_product_created_at_idx
  on public.buyer_recommendations(user_id, product_id, created_at desc);

create index if not exists products_active_category_rating_idx
  on public.products(category_id, rating_stars desc, rating_count desc, created_at desc)
  where is_active = true;

create index if not exists product_reviews_user_product_created_at_idx
  on public.product_reviews(user_id, product_id, created_at desc);

create or replace function public.recompute_product_rating()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_id uuid;
begin
  if tg_op = 'DELETE' then
    target_id := old.product_id;
  else
    target_id := new.product_id;
  end if;

  update public.products product
  set rating_stars = coalesce((
      select round(avg(review.rating)::numeric, 1)
      from public.product_reviews review
      where review.product_id = target_id
    ), 0),
    rating_count = (
      select count(*)
      from public.product_reviews review
      where review.product_id = target_id
    )
  where product.id = target_id;

  return null;
end;
$$;

alter table public.addresses
  add column if not exists address_type text default 'Address';

create table if not exists public.buyer_phone_numbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone_number text not null unique,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buyer_phone_numbers_phone_number_format
    check (phone_number ~ '^\+?[0-9]{7,15}$')
);

create index if not exists buyer_phone_numbers_user_default_created_at_idx
  on public.buyer_phone_numbers(user_id, is_default desc, created_at, id);

alter table public.buyer_phone_numbers enable row level security;
revoke all on table public.buyer_phone_numbers from anon, authenticated;
grant all on table public.buyer_phone_numbers to service_role;

create or replace function private.normalize_buyer_phone_number(p_phone_number text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized_phone text;
begin
  normalized_phone := regexp_replace(trim(coalesce(p_phone_number, '')), '[^0-9+]', '', 'g');

  if normalized_phone like '00%' then
    normalized_phone := '+' || substr(normalized_phone, 3);
  end if;

  if normalized_phone !~ '^\+?[0-9]{7,15}$' then
    raise exception 'Enter a valid phone number.';
  end if;

  return normalized_phone;
end;
$$;

revoke all on function private.normalize_buyer_phone_number(text) from public;

create or replace function private.assert_recent_customer_session(
  p_max_age_seconds integer default 300
)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  issued_at bigint := coalesce((auth.jwt() ->> 'iat')::bigint, 0);
begin
  perform private.assert_customer_session();

  if issued_at < extract(epoch from now())::bigint - greatest(coalesce(p_max_age_seconds, 300), 1) then
    raise exception 'Re-enter your password to continue.'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function private.assert_recent_customer_session(integer)
  from public, anon, authenticated;

create or replace function private.enforce_buyer_phone_number_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.buyer_phone_numbers phone
    where phone.user_id = new.user_id
      and phone.id <> new.id
  ) >= 2 then
    raise exception 'You can save at most two phone numbers.';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_buyer_phone_number_limit() from public;

create or replace function private.sync_buyer_primary_phone_number(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  primary_phone text;
begin
  select phone.phone_number
  into primary_phone
  from public.buyer_phone_numbers phone
  where phone.user_id = p_user_id
  order by phone.is_default desc, phone.created_at, phone.id
  limit 1;

  insert into public.buyer_profiles (user_id, phone)
  values (p_user_id, primary_phone)
  on conflict (user_id) do update
  set phone = excluded.phone;
end;
$$;

revoke all on function private.sync_buyer_primary_phone_number(uuid) from public;

drop trigger if exists buyer_phone_numbers_enforce_limit
  on public.buyer_phone_numbers;
create trigger buyer_phone_numbers_enforce_limit
before insert or update of user_id on public.buyer_phone_numbers
for each row execute function private.enforce_buyer_phone_number_limit();

with raw_phone_numbers as (
  select buyer_profile.user_id,
    buyer_profile.phone phone_number,
    1 source_priority
  from public.buyer_profiles buyer_profile
  where nullif(trim(buyer_profile.phone), '') is not null
  union all
  select auth_user.id,
    auth_user.phone,
    2
  from auth.users auth_user
  where nullif(trim(auth_user.phone), '') is not null
  union all
  select address.user_id,
    address.phone,
    3
  from public.addresses address
  where nullif(trim(address.phone), '') is not null
),
normalized_phone_numbers as (
  select raw_phone_numbers.user_id,
    case
      when regexp_replace(trim(raw_phone_numbers.phone_number), '[^0-9+]', '', 'g') like '00%'
        then '+' || substr(regexp_replace(trim(raw_phone_numbers.phone_number), '[^0-9+]', '', 'g'), 3)
      else regexp_replace(trim(raw_phone_numbers.phone_number), '[^0-9+]', '', 'g')
    end phone_number,
    raw_phone_numbers.source_priority
  from raw_phone_numbers
),
valid_phone_numbers as (
  select normalized_phone_numbers.*,
    row_number() over (
      partition by normalized_phone_numbers.phone_number
      order by normalized_phone_numbers.source_priority, normalized_phone_numbers.user_id
    ) global_phone_position
  from normalized_phone_numbers
  where normalized_phone_numbers.phone_number ~ '^\+?[0-9]{7,15}$'
),
new_phone_numbers as (
  select valid_phone_numbers.*,
    row_number() over (
      partition by valid_phone_numbers.user_id
      order by valid_phone_numbers.source_priority, valid_phone_numbers.phone_number
    ) new_phone_position
  from valid_phone_numbers
  where valid_phone_numbers.global_phone_position = 1
    and not exists (
      select 1
      from public.buyer_phone_numbers existing_phone
      where existing_phone.phone_number = valid_phone_numbers.phone_number
    )
)
insert into public.buyer_phone_numbers (user_id, phone_number, is_default)
select new_phone_numbers.user_id,
  new_phone_numbers.phone_number,
  not exists (
    select 1
    from public.buyer_phone_numbers default_phone
    where default_phone.user_id = new_phone_numbers.user_id
      and default_phone.is_default = true
  ) and new_phone_numbers.new_phone_position = 1
from new_phone_numbers
where new_phone_numbers.new_phone_position <= greatest(
  2 - (
    select count(*)
    from public.buyer_phone_numbers existing_phone
    where existing_phone.user_id = new_phone_numbers.user_id
  ),
  0
)
on conflict (phone_number) do nothing;

update public.buyer_phone_numbers phone
set is_default = true,
  updated_at = now()
where phone.id = (
  select first_phone.id
  from public.buyer_phone_numbers first_phone
  where first_phone.user_id = phone.user_id
  order by first_phone.created_at, first_phone.id
  limit 1
)
and not exists (
  select 1
  from public.buyer_phone_numbers default_phone
  where default_phone.user_id = phone.user_id
    and default_phone.is_default = true
);

create or replace function public.get_buyer_spending()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  latest_paid_order_at timestamptz;
  chart_anchor timestamptz;
begin
  perform private.assert_customer_session();

  select max(customer_order.created_at)
  into latest_paid_order_at
  from public.orders customer_order
  where customer_order.user_id = buyer_id
    and customer_order.payment_status = 'paid'
    and customer_order.status <> 'cancelled';

  chart_anchor := coalesce(latest_paid_order_at, now());

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
          date_trunc('day', chart_anchor) - interval '6 days',
          date_trunc('day', chart_anchor),
          interval '1 day'
        ) period(period_start)
        left join (
          select date_trunc('day', customer_order.created_at) period_start,
            sum(customer_order.total_minor) spend
          from public.orders customer_order
          where customer_order.user_id = buyer_id
            and customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
            and customer_order.created_at >= date_trunc('day', chart_anchor) - interval '6 days'
            and customer_order.created_at < date_trunc('day', chart_anchor) + interval '1 day'
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
          date_trunc('week', chart_anchor) - interval '7 weeks',
          date_trunc('week', chart_anchor),
          interval '1 week'
        ) period(period_start)
        left join (
          select date_trunc('week', customer_order.created_at) period_start,
            sum(customer_order.total_minor) spend
          from public.orders customer_order
          where customer_order.user_id = buyer_id
            and customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
            and customer_order.created_at >= date_trunc('week', chart_anchor) - interval '7 weeks'
            and customer_order.created_at < date_trunc('week', chart_anchor) + interval '1 week'
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
          date_trunc('month', chart_anchor) - interval '11 months',
          date_trunc('month', chart_anchor),
          interval '1 month'
        ) period(period_start)
        left join (
          select date_trunc('month', customer_order.created_at) period_start,
            sum(customer_order.total_minor) spend
          from public.orders customer_order
          where customer_order.user_id = buyer_id
            and customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
            and customer_order.created_at >= date_trunc('month', chart_anchor) - interval '11 months'
            and customer_order.created_at < date_trunc('month', chart_anchor) + interval '1 month'
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
          date_trunc('year', chart_anchor) - interval '4 years',
          date_trunc('year', chart_anchor),
          interval '1 year'
        ) period(period_start)
        left join (
          select date_trunc('year', customer_order.created_at) period_start,
            sum(customer_order.total_minor) spend
          from public.orders customer_order
          where customer_order.user_id = buyer_id
            and customer_order.payment_status = 'paid'
            and customer_order.status <> 'cancelled'
            and customer_order.created_at >= date_trunc('year', chart_anchor) - interval '4 years'
            and customer_order.created_at < date_trunc('year', chart_anchor) + interval '1 year'
          group by date_trunc('year', customer_order.created_at)
        ) period_total on period_total.period_start = period.period_start
      ), '[]'::jsonb)
    )
  );
end;
$$;

revoke all on function public.get_buyer_spending() from public;
grant execute on function public.get_buyer_spending() to authenticated;

create or replace function private.get_buyer_reorder_suggestion_rows(
  p_buyer_id uuid,
  p_limit integer default 3
)
returns table (
  sort_order bigint,
  id uuid,
  product_id uuid,
  name text,
  price integer,
  price_minor integer,
  reason text,
  variant_id uuid,
  products jsonb,
  variant jsonb,
  last_ordered_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with purchased_products as (
    select purchased_product.id product_id,
      purchased_product.category_id,
      sum(order_item.quantity)::bigint purchase_quantity,
      max(customer_order.created_at) last_ordered_at
    from public.orders customer_order
    join public.order_items order_item on order_item.order_id = customer_order.id
    join public.products purchased_product on purchased_product.id = order_item.product_id
    where customer_order.user_id = p_buyer_id
      and customer_order.payment_status = 'paid'
      and customer_order.status <> 'cancelled'
    group by purchased_product.id, purchased_product.category_id
  ),
  purchased_categories as (
    select purchased_products.category_id,
      sum(purchased_products.purchase_quantity)::bigint purchase_quantity,
      max(purchased_products.last_ordered_at) last_ordered_at
    from purchased_products
    where purchased_products.category_id is not null
    group by purchased_products.category_id
  ),
  candidates as (
    select product.id,
      product.id product_id,
      product.name,
      pricing.effective_price_minor price,
      pricing.effective_price_minor price_minor,
      case
        when exact_purchase.product_id is not null
          then 'Purchased before. Add it again in one tap.'
        when category_purchase.category_id is not null
          then 'A sellable alternative from a category you purchased before.'
        else 'Popular product available now. Complete a paid order to unlock personalized reorders.'
      end reason,
      sellable_variant.id variant_id,
      to_jsonb(product) products,
      to_jsonb(sellable_variant) variant,
      case when exact_purchase.product_id is not null then 0
        when category_purchase.category_id is not null then 1
        else 2
      end source_priority,
      coalesce(exact_purchase.purchase_quantity, category_purchase.purchase_quantity, 0)
        purchase_quantity,
      coalesce(exact_purchase.last_ordered_at, category_purchase.last_ordered_at)
        last_ordered_at,
      product.rating_stars,
      product.rating_count,
      product.created_at
    from public.products product
    join lateral (
      select product_variant.*
      from public.product_variants product_variant
      where product_variant.product_id = product.id
        and product_variant.is_active = true
        and product_variant.stock_quantity > 0
      order by product_variant.stock_quantity desc,
        product_variant.created_at,
        product_variant.id
      limit 1
    ) sellable_variant on true
    cross join lateral (
      select private.get_sellable_price_minor(
        product.price_minor,
        product.sale_price_minor,
        product.sale_starts_at,
        product.sale_ends_at,
        sellable_variant.price_minor
      ) effective_price_minor
    ) pricing
    left join purchased_products exact_purchase
      on exact_purchase.product_id = product.id
    left join purchased_categories category_purchase
      on category_purchase.category_id = product.category_id
    where product.is_active = true
  ),
  ranked as (
    select row_number() over (
        order by source_priority,
          last_ordered_at desc nulls last,
          purchase_quantity desc,
          rating_stars desc nulls last,
          rating_count desc nulls last,
          created_at desc,
          product_id
      ) sort_order,
      candidates.*
    from candidates
  )
  select ranked.sort_order,
    ranked.id,
    ranked.product_id,
    ranked.name,
    ranked.price,
    ranked.price_minor,
    ranked.reason,
    ranked.variant_id,
    ranked.products,
    ranked.variant,
    ranked.last_ordered_at
  from ranked
  where ranked.sort_order <= least(greatest(coalesce(p_limit, 3), 1), 10)
  order by ranked.sort_order;
$$;

revoke all on function private.get_buyer_reorder_suggestion_rows(uuid, integer)
  from public, anon, authenticated;

create or replace function public.get_buyer_addresses()
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
    select jsonb_agg(
      to_jsonb(address)
      || jsonb_build_object(
        'label', coalesce(nullif(address.address_type, ''), 'Address'),
        'name', address.full_name,
        'isDefault', address.is_default_shipping,
        'postalCode', address.postal_code
      )
      order by address.is_default_shipping desc, address.created_at desc, address.id
    )
    from public.addresses address
    where address.user_id = buyer_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_buyer_addresses() from public;
grant execute on function public.get_buyer_addresses() to authenticated;

create or replace function public.add_buyer_address(
  p_label text,
  p_full_name text,
  p_line1 text,
  p_line2 text default null,
  p_city text default null,
  p_state text default null,
  p_postal_code text default null,
  p_country text default 'NG',
  p_phone text default null,
  p_make_default boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  make_default boolean;
  created_address public.addresses%rowtype;
begin
  perform private.assert_customer_session();

  if nullif(trim(p_full_name), '') is null
    or nullif(trim(p_line1), '') is null
    or nullif(trim(p_city), '') is null then
    raise exception 'Full name, street address, and city are required.';
  end if;

  make_default := coalesce(p_make_default, false) or not exists (
    select 1 from public.addresses address where address.user_id = buyer_id
  );

  if make_default then
    update public.addresses
    set is_default_shipping = false, updated_at = now()
    where user_id = buyer_id
      and is_default_shipping = true;
  end if;

  insert into public.addresses (
    user_id,
    address_type,
    full_name,
    phone,
    line1,
    line2,
    city,
    state,
    postal_code,
    country,
    is_default_shipping
  )
  values (
    buyer_id,
    coalesce(nullif(trim(p_label), ''), 'Address'),
    trim(p_full_name),
    nullif(trim(p_phone), ''),
    trim(p_line1),
    nullif(trim(p_line2), ''),
    trim(p_city),
    nullif(trim(p_state), ''),
    nullif(trim(p_postal_code), ''),
    coalesce(nullif(upper(trim(p_country)), ''), 'NG'),
    make_default
  )
  returning * into created_address;

  return to_jsonb(created_address)
    || jsonb_build_object(
      'label', coalesce(nullif(created_address.address_type, ''), 'Address'),
      'name', created_address.full_name,
      'isDefault', created_address.is_default_shipping,
      'postalCode', created_address.postal_code
    );
end;
$$;

revoke all on function public.add_buyer_address(text, text, text, text, text, text, text, text, text, boolean)
  from public;
grant execute on function public.add_buyer_address(text, text, text, text, text, text, text, text, text, boolean)
  to authenticated;

create or replace function public.set_buyer_default_address(p_address_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_customer_session();

  if not exists (
    select 1
    from public.addresses address
    where address.id = p_address_id
      and address.user_id = buyer_id
  ) then
    raise exception 'Address not found.';
  end if;

  update public.addresses
  set is_default_shipping = (id = p_address_id), updated_at = now()
  where user_id = buyer_id;

  return public.get_buyer_addresses();
end;
$$;

revoke all on function public.set_buyer_default_address(uuid) from public;
grant execute on function public.set_buyer_default_address(uuid) to authenticated;

create or replace function public.delete_buyer_address(p_address_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  deleted_default boolean;
begin
  perform private.assert_customer_session();

  delete from public.addresses address
  where address.id = p_address_id
    and address.user_id = buyer_id
  returning address.is_default_shipping into deleted_default;

  if not found then
    raise exception 'Address not found.';
  end if;

  if coalesce(deleted_default, false) then
    update public.addresses
    set is_default_shipping = true, updated_at = now()
    where id = (
      select address.id
      from public.addresses address
      where address.user_id = buyer_id
      order by address.created_at desc, address.id
      limit 1
    );
  end if;

  return public.get_buyer_addresses();
end;
$$;

revoke all on function public.delete_buyer_address(uuid) from public;
grant execute on function public.delete_buyer_address(uuid) to authenticated;

create or replace function public.get_buyer_phone_numbers()
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
    select jsonb_agg(
      to_jsonb(phone)
      || jsonb_build_object('isDefault', phone.is_default)
      order by phone.is_default desc, phone.created_at, phone.id
    )
    from public.buyer_phone_numbers phone
    where phone.user_id = buyer_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_buyer_phone_numbers() from public;
grant execute on function public.get_buyer_phone_numbers() to authenticated;

create or replace function public.add_buyer_phone_number(
  p_phone_number text,
  p_make_default boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  normalized_phone text;
  make_default boolean;
begin
  perform private.assert_recent_customer_session();

  normalized_phone := private.normalize_buyer_phone_number(p_phone_number);
  make_default := coalesce(p_make_default, false) or not exists (
    select 1
    from public.buyer_phone_numbers phone
    where phone.user_id = buyer_id
  );

  if make_default then
    update public.buyer_phone_numbers
    set is_default = false,
      updated_at = now()
    where user_id = buyer_id
      and is_default = true;
  end if;

  begin
    insert into public.buyer_phone_numbers (user_id, phone_number, is_default)
    values (buyer_id, normalized_phone, make_default);
  exception
    when unique_violation then
      raise exception 'That phone number is already saved.';
  end;

  perform private.sync_buyer_primary_phone_number(buyer_id);
  return public.get_buyer_phone_numbers();
end;
$$;

revoke all on function public.add_buyer_phone_number(text, boolean) from public;
grant execute on function public.add_buyer_phone_number(text, boolean) to authenticated;

create or replace function public.update_buyer_phone_number(
  p_phone_id uuid,
  p_phone_number text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  normalized_phone text;
begin
  perform private.assert_recent_customer_session();
  normalized_phone := private.normalize_buyer_phone_number(p_phone_number);

  begin
    update public.buyer_phone_numbers
    set phone_number = normalized_phone,
      updated_at = now()
    where id = p_phone_id
      and user_id = buyer_id;
  exception
    when unique_violation then
      raise exception 'That phone number is already saved.';
  end;

  if not found then
    raise exception 'Phone number not found.';
  end if;

  perform private.sync_buyer_primary_phone_number(buyer_id);
  return public.get_buyer_phone_numbers();
end;
$$;

revoke all on function public.update_buyer_phone_number(uuid, text) from public;
grant execute on function public.update_buyer_phone_number(uuid, text) to authenticated;

create or replace function public.set_buyer_default_phone_number(p_phone_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_recent_customer_session();

  if not exists (
    select 1
    from public.buyer_phone_numbers phone
    where phone.id = p_phone_id
      and phone.user_id = buyer_id
  ) then
    raise exception 'Phone number not found.';
  end if;

  update public.buyer_phone_numbers
  set is_default = (id = p_phone_id),
    updated_at = now()
  where user_id = buyer_id;

  perform private.sync_buyer_primary_phone_number(buyer_id);
  return public.get_buyer_phone_numbers();
end;
$$;

revoke all on function public.set_buyer_default_phone_number(uuid) from public;
grant execute on function public.set_buyer_default_phone_number(uuid) to authenticated;

create or replace function public.delete_buyer_phone_number(p_phone_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  deleted_default boolean;
begin
  perform private.assert_recent_customer_session();

  delete from public.buyer_phone_numbers phone
  where phone.id = p_phone_id
    and phone.user_id = buyer_id
  returning phone.is_default into deleted_default;

  if not found then
    raise exception 'Phone number not found.';
  end if;

  if coalesce(deleted_default, false) then
    update public.buyer_phone_numbers
    set is_default = true,
      updated_at = now()
    where id = (
      select phone.id
      from public.buyer_phone_numbers phone
      where phone.user_id = buyer_id
      order by phone.created_at, phone.id
      limit 1
    );
  end if;

  perform private.sync_buyer_primary_phone_number(buyer_id);
  return public.get_buyer_phone_numbers();
end;
$$;

revoke all on function public.delete_buyer_phone_number(uuid) from public;
grant execute on function public.delete_buyer_phone_number(uuid) to authenticated;

alter table public.payment_methods
  add column if not exists cardholder_name text;

create or replace function private.enforce_buyer_payment_method_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.payment_methods method
    where method.user_id = new.user_id
      and method.id <> new.id
  ) >= 2 then
    raise exception 'You can save at most two payment methods.';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_buyer_payment_method_limit() from public;

drop trigger if exists payment_methods_enforce_limit
  on public.payment_methods;
create trigger payment_methods_enforce_limit
before insert or update of user_id on public.payment_methods
for each row execute function private.enforce_buyer_payment_method_limit();

create or replace function public.get_buyer_payment_methods()
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
    select jsonb_agg(
      to_jsonb(method)
      || jsonb_build_object('isDefault', method.is_default)
      order by method.is_default desc, method.created_at desc, method.id
    )
    from public.payment_methods method
    where method.user_id = buyer_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_buyer_payment_methods() from public;
grant execute on function public.get_buyer_payment_methods() to authenticated;

drop function if exists public.add_buyer_payment_method(text, text, text, text, boolean);

create or replace function public.add_buyer_payment_method(
  p_cardholder_name text,
  p_brand text,
  p_last4 text,
  p_expiry text,
  p_type text default 'card',
  p_make_default boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  make_default boolean;
  existing_method_id uuid;
  created_method public.payment_methods%rowtype;
begin
  perform private.assert_recent_customer_session();

  if nullif(trim(p_cardholder_name), '') is null
    or length(trim(p_cardholder_name)) > 120 then
    raise exception 'Cardholder name is required.';
  end if;
  if nullif(trim(p_brand), '') is null then
    raise exception 'Card brand is required.';
  end if;
  if trim(p_last4) !~ '^[0-9]{4}$' then
    raise exception 'Enter the final four card digits.';
  end if;
  if trim(p_expiry) !~ '^(0[1-9]|1[0-2])/[0-9]{2}$' then
    raise exception 'Expiry must use MM/YY.';
  end if;
  if coalesce(nullif(trim(p_type), ''), 'card') <> 'card' then
    raise exception 'Only card payment methods are supported.';
  end if;

  make_default := coalesce(p_make_default, false) or not exists (
    select 1 from public.payment_methods method where method.user_id = buyer_id
  );

  if make_default then
    update public.payment_methods
    set is_default = false
    where user_id = buyer_id
      and is_default = true;
  end if;

  select method.id
  into existing_method_id
  from public.payment_methods method
  where method.user_id = buyer_id
    and lower(method.brand) = lower(trim(p_brand))
    and method.last4 = trim(p_last4)
    and method.expiry = trim(p_expiry)
  order by method.created_at desc, method.id
  limit 1;

  if existing_method_id is not null then
    update public.payment_methods
    set cardholder_name = trim(p_cardholder_name),
      is_default = make_default or is_default
    where id = existing_method_id
    returning * into created_method;
  else
    insert into public.payment_methods (
      user_id,
      type,
      cardholder_name,
      brand,
      last4,
      expiry,
      is_default
    )
    values (
      buyer_id,
      'card',
      trim(p_cardholder_name),
      trim(p_brand),
      trim(p_last4),
      trim(p_expiry),
      make_default
    )
    returning * into created_method;
  end if;

  return to_jsonb(created_method)
    || jsonb_build_object('isDefault', created_method.is_default);
end;
$$;

revoke all on function public.add_buyer_payment_method(text, text, text, text, text, boolean)
  from public;
grant execute on function public.add_buyer_payment_method(text, text, text, text, text, boolean)
  to authenticated;

create or replace function public.set_buyer_default_payment_method(p_method_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_recent_customer_session();

  if not exists (
    select 1
    from public.payment_methods method
    where method.id = p_method_id
      and method.user_id = buyer_id
  ) then
    raise exception 'Payment method not found.';
  end if;

  update public.payment_methods
  set is_default = (id = p_method_id)
  where user_id = buyer_id;

  return public.get_buyer_payment_methods();
end;
$$;

revoke all on function public.set_buyer_default_payment_method(uuid) from public;
grant execute on function public.set_buyer_default_payment_method(uuid) to authenticated;

create or replace function public.delete_buyer_payment_method(p_method_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  deleted_default boolean;
begin
  perform private.assert_recent_customer_session();

  delete from public.payment_methods method
  where method.id = p_method_id
    and method.user_id = buyer_id
  returning method.is_default into deleted_default;

  if not found then
    raise exception 'Payment method not found.';
  end if;

  if coalesce(deleted_default, false) then
    update public.payment_methods
    set is_default = true
    where id = (
      select method.id
      from public.payment_methods method
      where method.user_id = buyer_id
      order by method.created_at desc, method.id
      limit 1
    );
  end if;

  return public.get_buyer_payment_methods();
end;
$$;

revoke all on function public.delete_buyer_payment_method(uuid) from public;
grant execute on function public.delete_buyer_payment_method(uuid) to authenticated;

create or replace function public.get_buyer_review_items()
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
    select jsonb_agg(to_jsonb(review_item) order by review_item.ordered_at desc)
    from (
      select distinct on (product.id)
        product.id,
        product.id product_id,
        product.name product,
        product.image,
        customer_order.id order_id,
        customer_order.order_number,
        customer_order.created_at ordered_at,
        review.id review_id,
        review.rating,
        review.review_text,
        review.id is not null submitted
      from public.orders customer_order
      join public.order_items order_item on order_item.order_id = customer_order.id
      join public.products product on product.id = order_item.product_id
      left join lateral (
        select product_review.*
        from public.product_reviews product_review
        where product_review.user_id = buyer_id
          and product_review.product_id = product.id
        order by product_review.created_at desc, product_review.id
        limit 1
      ) review on true
      where customer_order.user_id = buyer_id
        and customer_order.payment_status = 'paid'
        and customer_order.status <> 'cancelled'
      order by product.id, customer_order.created_at desc, customer_order.id
    ) review_item
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_buyer_review_items() from public;
grant execute on function public.get_buyer_review_items() to authenticated;

create or replace function public.submit_buyer_review(
  p_order_id uuid,
  p_product_id uuid,
  p_rating integer,
  p_review_text text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  existing_review_id uuid;
  saved_review public.product_reviews%rowtype;
begin
  perform private.assert_customer_session();

  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5.';
  end if;
  if nullif(trim(p_review_text), '') is null then
    raise exception 'Write a short review before posting.';
  end if;
  if length(trim(p_review_text)) > 2000 then
    raise exception 'Review text is too long.';
  end if;
  if not exists (
    select 1
    from public.orders customer_order
    join public.order_items order_item on order_item.order_id = customer_order.id
    where customer_order.id = p_order_id
      and customer_order.user_id = buyer_id
      and customer_order.payment_status = 'paid'
      and customer_order.status <> 'cancelled'
      and order_item.product_id = p_product_id
  ) then
    raise exception 'Only verified purchases can be reviewed.';
  end if;

  select review.id
  into existing_review_id
  from public.product_reviews review
  where review.user_id = buyer_id
    and review.product_id = p_product_id
  order by review.created_at desc, review.id
  limit 1;

  if existing_review_id is null then
    insert into public.product_reviews (
      user_id,
      product_id,
      rating,
      review_text,
      is_verified
    )
    values (
      buyer_id,
      p_product_id,
      p_rating,
      trim(p_review_text),
      true
    )
    returning * into saved_review;
  else
    update public.product_reviews
    set rating = p_rating,
      review_text = trim(p_review_text),
      is_verified = true
    where id = existing_review_id
    returning * into saved_review;
  end if;

  return to_jsonb(saved_review);
end;
$$;

revoke all on function public.submit_buyer_review(uuid, uuid, integer, text)
  from public;
grant execute on function public.submit_buyer_review(uuid, uuid, integer, text)
  to authenticated;

create table if not exists public.buyer_account_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ai_suggestions boolean not null default true,
  price_drop_alerts boolean not null default true,
  order_status_updates boolean not null default true,
  promotions_deals boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.buyer_account_preferences enable row level security;
revoke all on table public.buyer_account_preferences from anon, authenticated;
grant all on table public.buyer_account_preferences to service_role;

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Profile images are publicly viewable" on storage.objects;
create policy "Profile images are publicly viewable"
  on storage.objects
  for select
  using (bucket_id = 'profile-images');

drop policy if exists "Buyers can upload own profile images" on storage.objects;
create policy "Buyers can upload own profile images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_customer_session())
  );

drop policy if exists "Buyers can update own profile images" on storage.objects;
create policy "Buyers can update own profile images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_customer_session())
  )
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_customer_session())
  );

drop policy if exists "Buyers can delete own profile images" on storage.objects;
create policy "Buyers can delete own profile images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_customer_session())
  );

create or replace function public.get_buyer_account_settings()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_customer_session();

  return (
    select jsonb_build_object(
      'profile', jsonb_build_object(
        'full_name', coalesce(buyer_profile.full_name, profile.full_name, ''),
        'email', coalesce(auth_user.email, ''),
        'phone', coalesce((
          select phone.phone_number
          from public.buyer_phone_numbers phone
          where phone.user_id = auth_user.id
          order by phone.is_default desc, phone.created_at, phone.id
          limit 1
        ), buyer_profile.phone, auth_user.phone, ''),
        'avatar_url', coalesce(buyer_profile.avatar_url, profile.avatar_url, '')
      ),
      'preferences', jsonb_build_object(
        'ai_suggestions', coalesce(preferences.ai_suggestions, true),
        'price_drop_alerts', coalesce(preferences.price_drop_alerts, true),
        'order_status_updates', coalesce(preferences.order_status_updates, true),
        'promotions_deals', coalesce(preferences.promotions_deals, false)
      )
    )
    from auth.users auth_user
    left join public.profiles profile on profile.id = auth_user.id
    left join public.buyer_profiles buyer_profile on buyer_profile.user_id = auth_user.id
    left join public.buyer_account_preferences preferences
      on preferences.user_id = auth_user.id
    where auth_user.id = buyer_id
  );
end;
$$;

revoke all on function public.get_buyer_account_settings() from public;
grant execute on function public.get_buyer_account_settings() to authenticated;

create or replace function public.save_buyer_account_settings(
  p_full_name text,
  p_phone text default null,
  p_avatar_url text default null,
  p_ai_suggestions boolean default true,
  p_price_drop_alerts boolean default true,
  p_order_status_updates boolean default true,
  p_promotions_deals boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
  normalized_avatar_url text := nullif(trim(p_avatar_url), '');
begin
  perform private.assert_customer_session();

  if nullif(trim(p_full_name), '') is null then
    raise exception 'Full name is required.';
  end if;
  if length(trim(p_full_name)) > 120 then
    raise exception 'Full name is too long.';
  end if;
  if normalized_avatar_url is not null
    and normalized_avatar_url !~* '^https?://' then
    raise exception 'Avatar URL must use HTTP or HTTPS.';
  end if;

  update public.profiles
  set full_name = trim(p_full_name),
    avatar_url = normalized_avatar_url,
    updated_at = now()
  where id = buyer_id;

  if not found then
    raise exception 'Buyer profile not found.';
  end if;

  insert into public.buyer_profiles (user_id, full_name, avatar_url)
  values (
    buyer_id,
    trim(p_full_name),
    normalized_avatar_url
  )
  on conflict (user_id) do update
  set full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;

  insert into public.buyer_account_preferences (
    user_id,
    ai_suggestions,
    price_drop_alerts,
    order_status_updates,
    promotions_deals,
    updated_at
  )
  values (
    buyer_id,
    coalesce(p_ai_suggestions, true),
    coalesce(p_price_drop_alerts, true),
    coalesce(p_order_status_updates, true),
    coalesce(p_promotions_deals, false),
    now()
  )
  on conflict (user_id) do update
  set ai_suggestions = excluded.ai_suggestions,
    price_drop_alerts = excluded.price_drop_alerts,
    order_status_updates = excluded.order_status_updates,
    promotions_deals = excluded.promotions_deals,
    updated_at = now();

  return public.get_buyer_account_settings();
end;
$$;

revoke all on function public.save_buyer_account_settings(
  text, text, text, boolean, boolean, boolean, boolean
) from public;
grant execute on function public.save_buyer_account_settings(
  text, text, text, boolean, boolean, boolean, boolean
) to authenticated;

create or replace function public.delete_buyer_account(p_confirmation text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer_id uuid := auth.uid();
begin
  perform private.assert_recent_customer_session();

  if p_confirmation <> 'DELETE' then
    raise exception 'Type DELETE to confirm account deletion.';
  end if;

  delete from auth.users
  where id = buyer_id;

  if not found then
    raise exception 'Account not found.';
  end if;

  return jsonb_build_object('deleted', true);
end;
$$;

revoke all on function public.delete_buyer_account(text) from public;
grant execute on function public.delete_buyer_account(text) to authenticated;
