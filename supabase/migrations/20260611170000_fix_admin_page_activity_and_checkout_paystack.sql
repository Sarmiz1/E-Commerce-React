-- Analytics: admin pages are operational screens, not marketplace traffic.
create or replace function public.get_admin_page_activity()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  return (
    with normalized_events as (
      select
        nullif(e.metadata ->> 'path', '') path,
        nullif(e.session_id, '') session_id,
        e.event_type
      from public.events e
      where nullif(e.metadata ->> 'path', '') is not null
        and e.metadata ->> 'path' not like '/admin%'
    ),
    page_views as (
      select
        path,
        count(distinct coalesce(session_id, path || ':' || event_type)) visits
      from normalized_events
      where event_type = 'page_view'
      group by path
    ),
    page_activity as (
      select path, count(*) events
      from normalized_events
      group by path
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

grant execute on function public.get_admin_page_activity() to authenticated;

-- Defensive repair for environments that applied checkout before the variant table.
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text,
  name text,
  option_name text,
  option_value text,
  price_minor integer,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists product_variants_product_id_idx
  on public.product_variants(product_id);

create index if not exists product_variants_sellable_product_stock_idx
  on public.product_variants(product_id, stock_quantity desc, created_at, id)
  where is_active = true;

alter table public.product_variants enable row level security;

drop policy if exists "Product variants are publicly viewable" on public.product_variants;
create policy "Product variants are publicly viewable"
on public.product_variants
for select
using (is_active = true);

create table if not exists public.delivery_fee_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  locations text[] not null default '{}'::text[],
  standardfee_minor integer not null check (standardfee_minor >= 0),
  express_fee_minor integer not null check (express_fee_minor >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.delivery_fee_zones (
  name,
  description,
  locations,
  standardfee_minor,
  express_fee_minor,
  sort_order
)
values
  ('Same city', 'Same state with woosho warehouse', array['Ipaja'], 20000, 40000, 10),
  ('Same State', 'Same state with woosho warehouse', array['Lagos'], 40000, 60000, 20),
  ('zone a', 'South West', array['Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'], 60000, 90000, 30),
  ('zone b', 'South South', array['Rivers', 'Bayelsa', 'Akwa Ibom', 'Cross River', 'Delta', 'Edo'], 120000, 150000, 40),
  ('zone c', 'South East', array['Anambra', 'Enugu', 'Imo', 'Abia', 'Ebonyi'], 100000, 130000, 50),
  ('zone d', 'North Central', array['FCT', 'Kwara', 'Kogi', 'Benue', 'Nasarawa', 'Niger', 'Plateau'], 150000, 180000, 60),
  ('zone e', 'North East', array['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'], 155000, 190000, 70),
  ('zone f', 'North West', array['Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Jigawa', 'Sokoto', 'Zamfara'], 160000, 20000, 80)
on conflict (name)
do update
set description = excluded.description,
    locations = excluded.locations,
    standardfee_minor = excluded.standardfee_minor,
    express_fee_minor = excluded.express_fee_minor,
    sort_order = excluded.sort_order,
    updated_at = timezone('utc'::text, now());

alter table public.delivery_fee_zones enable row level security;

drop policy if exists "Delivery fee zones are publicly viewable" on public.delivery_fee_zones;
create policy "Delivery fee zones are publicly viewable"
on public.delivery_fee_zones
for select
using (is_active = true);

create or replace function public.get_delivery_fee_options(
  p_country text default 'Nigeria',
  p_state text default null,
  p_city text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  selected_zone public.delivery_fee_zones%rowtype;
  normalized_country text := lower(trim(coalesce(p_country, 'Nigeria')));
  normalized_state text := lower(trim(coalesce(p_state, '')));
  normalized_city text := lower(trim(coalesce(p_city, '')));
begin
  if normalized_country <> 'nigeria' then
    raise exception 'Delivery fee is currently available for Nigeria only.';
  end if;

  select *
  into selected_zone
  from public.delivery_fee_zones zone
  where zone.is_active = true
    and (
      lower(zone.name) = 'same city'
      and exists (
        select 1 from unnest(zone.locations) location
        where lower(location) = normalized_city
      )
    )
  order by zone.sort_order
  limit 1;

  if not found then
    select *
    into selected_zone
    from public.delivery_fee_zones zone
    where zone.is_active = true
      and exists (
        select 1 from unnest(zone.locations) location
        where lower(location) = normalized_state
      )
    order by zone.sort_order
    limit 1;
  end if;

  if not found then
    raise exception 'Delivery is not available for the selected location yet.';
  end if;

  return jsonb_build_object(
    'zone', jsonb_build_object(
      'id', selected_zone.id,
      'name', selected_zone.name,
      'description', selected_zone.description,
      'locations', selected_zone.locations
    ),
    'options', jsonb_build_array(
      jsonb_build_object(
        'id', 'standard',
        'label', 'Standard delivery',
        'price', selected_zone.standardfee_minor,
        'description', selected_zone.description
      ),
      jsonb_build_object(
        'id', 'express',
        'label', 'Express delivery',
        'price', selected_zone.express_fee_minor,
        'description', selected_zone.description
      )
    )
  );
end;
$$;

revoke all on function public.get_delivery_fee_options(text, text, text) from public;
grant execute on function public.get_delivery_fee_options(text, text, text) to anon, authenticated;

create or replace function public.apply_order_delivery_fee(
  p_order_id uuid,
  p_country text,
  p_state text,
  p_city text,
  p_shipping_tier text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  fee_options jsonb;
  selected_option jsonb;
  fee_minor integer;
begin
  fee_options := public.get_delivery_fee_options(p_country, p_state, p_city);

  select option
  into selected_option
  from jsonb_array_elements(fee_options -> 'options') option
  where option ->> 'id' = p_shipping_tier
  limit 1;

  if selected_option is null then
    raise exception 'Invalid delivery option.';
  end if;

  fee_minor := (selected_option ->> 'price')::integer;

  update public.orders
  set shipping_minor = fee_minor,
      total_minor = greatest(coalesce(subtotal_minor, 0) - coalesce(discount_minor, 0), 0)
        + fee_minor
        + coalesce(tax_minor, 0)
  where id = p_order_id;

  if not found then
    raise exception 'Order not found.';
  end if;

  return jsonb_build_object(
    'shippingMinor', fee_minor,
    'options', fee_options -> 'options',
    'zone', fee_options -> 'zone'
  );
end;
$$;

revoke all on function public.apply_order_delivery_fee(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.apply_order_delivery_fee(uuid, text, text, text, text)
  to service_role;

-- Paystack payment sessions map provider references back to pending checkout orders.
create table if not exists public.checkout_payment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'paystack',
  provider_reference text not null unique,
  authorization_url text,
  amount_minor integer not null check (amount_minor >= 0),
  currency text not null default 'NGN',
  status text not null default 'initialized'
    check (status in ('initialized', 'paid', 'failed', 'abandoned')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists checkout_payment_sessions_user_idx
  on public.checkout_payment_sessions(user_id, created_at desc);

alter table public.checkout_payment_sessions enable row level security;
revoke all on table public.checkout_payment_sessions from anon, authenticated;
grant all on table public.checkout_payment_sessions to service_role;

alter table public.payment_methods
  add column if not exists cardholder_name text,
  add column if not exists provider text,
  add column if not exists provider_customer_code text,
  add column if not exists provider_authorization_code text,
  add column if not exists reusable boolean not null default false;

create unique index if not exists payment_methods_provider_authorization_unique
  on public.payment_methods(user_id, provider, provider_authorization_code)
  where provider is not null and provider_authorization_code is not null;

create or replace function public.confirm_paystack_payment(
  p_reference text,
  p_provider_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  session_row public.checkout_payment_sessions%rowtype;
  should_save_method boolean;
  auth_payload jsonb;
  card_brand text;
  card_last4 text;
  card_expiry text;
  cardholder_name text;
  make_default boolean;
begin
  select *
  into session_row
  from public.checkout_payment_sessions
  where provider_reference = p_reference
  for update;

  if not found then
    raise exception 'Payment session not found.';
  end if;

  if session_row.status = 'paid' then
    return jsonb_build_object('success', true, 'orderId', session_row.order_id);
  end if;

  update public.orders
  set payment_status = 'paid',
      status = 'processing'
  where id = session_row.order_id;

  update public.product_variants variant
  set stock_quantity = greatest(variant.stock_quantity - order_item.quantity, 0),
      updated_at = timezone('utc'::text, now())
  from public.order_items order_item
  where order_item.order_id = session_row.order_id
    and order_item.variant_id = variant.id;

  insert into public.payments (
    order_id,
    provider,
    provider_reference,
    status,
    amount_cents,
    paid_at
  )
  values (
    session_row.order_id,
    'paystack',
    p_reference,
    'success',
    session_row.amount_minor,
    timezone('utc'::text, now())
  );

  update public.checkout_payment_sessions
  set status = 'paid',
      metadata = coalesce(metadata, '{}'::jsonb) || p_provider_payload,
      updated_at = timezone('utc'::text, now())
  where id = session_row.id;

  should_save_method := coalesce((session_row.metadata ->> 'savePaymentMethod')::boolean, false);
  auth_payload := coalesce(p_provider_payload -> 'authorization', '{}'::jsonb);

  if should_save_method
    and coalesce((auth_payload ->> 'reusable')::boolean, false)
    and nullif(auth_payload ->> 'authorization_code', '') is not null then

    card_brand := coalesce(nullif(auth_payload ->> 'brand', ''), nullif(auth_payload ->> 'card_type', ''), 'Card');
    card_last4 := nullif(auth_payload ->> 'last4', '');
    card_expiry := lpad(coalesce(auth_payload ->> 'exp_month', ''), 2, '0')
      || '/'
      || right(coalesce(auth_payload ->> 'exp_year', ''), 2);
    cardholder_name := coalesce(
      nullif(session_row.metadata #>> '{delivery,name}', ''),
      'Paystack customer'
    );

    if card_last4 is not null and card_expiry ~ '^(0[1-9]|1[0-2])/[0-9]{2}$' then
      make_default := not exists (
        select 1
        from public.payment_methods method
        where method.user_id = session_row.user_id
      );

      if make_default then
        update public.payment_methods
        set is_default = false
        where user_id = session_row.user_id;
      end if;

      insert into public.payment_methods (
        user_id,
        type,
        cardholder_name,
        brand,
        last4,
        expiry,
        is_default,
        provider,
        provider_customer_code,
        provider_authorization_code,
        reusable
      )
      values (
        session_row.user_id,
        'card',
        cardholder_name,
        card_brand,
        card_last4,
        card_expiry,
        make_default,
        'paystack',
        nullif(p_provider_payload #>> '{customer,customer_code}', ''),
        auth_payload ->> 'authorization_code',
        true
      )
      on conflict (user_id, provider, provider_authorization_code)
      where provider is not null and provider_authorization_code is not null
      do update
      set cardholder_name = excluded.cardholder_name,
          brand = excluded.brand,
          last4 = excluded.last4,
          expiry = excluded.expiry,
          reusable = true;
    end if;
  end if;

  return jsonb_build_object('success', true, 'orderId', session_row.order_id);
end;
$$;

revoke all on function public.confirm_paystack_payment(text, jsonb) from public, anon, authenticated;
grant execute on function public.confirm_paystack_payment(text, jsonb) to service_role;
