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

create table if not exists public.tax_rules (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  country_name text not null,
  region text not null default 'national',
  tax_type text not null,
  display_name text not null,
  description text not null default '',
  old_tax_rate numeric(8,4) not null default 0 check (old_tax_rate >= 0),
  current_tax_rate numeric(8,4) not null default 0 check (current_tax_rate >= 0),
  applies_to text not null default 'order_subtotal'
    check (applies_to in ('order_subtotal', 'shipping', 'order_total')),
  calculation_method text not null default 'percentage'
    check (calculation_method in ('percentage', 'fixed')),
  fixed_amount_minor integer not null default 0 check (fixed_amount_minor >= 0),
  currency text not null default 'NGN',
  priority integer not null default 100,
  is_active boolean not null default true,
  effective_from timestamptz not null default timezone('utc'::text, now()),
  effective_to timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique(country_code, tax_type, region)
);

insert into public.tax_rules (
  country_code,
  country_name,
  region,
  tax_type,
  display_name,
  description,
  old_tax_rate,
  current_tax_rate,
  applies_to,
  calculation_method,
  fixed_amount_minor,
  currency,
  priority,
  metadata
)
values (
  'NG',
  'Nigeria',
  'national',
  'vat',
  'V.A.T',
  'Nigeria Value Added Tax. Active checkout tax rule.',
  0.0750,
  0.0750,
  'order_subtotal',
  'percentage',
  0,
  'NGN',
  10,
  jsonb_build_object('source', 'Federal Inland Revenue Service', 'adminControlled', true)
)
on conflict (country_code, tax_type, region)
do update
set country_name = excluded.country_name,
    display_name = excluded.display_name,
    description = excluded.description,
    old_tax_rate = excluded.old_tax_rate,
    current_tax_rate = excluded.current_tax_rate,
    applies_to = excluded.applies_to,
    calculation_method = excluded.calculation_method,
    fixed_amount_minor = excluded.fixed_amount_minor,
    currency = excluded.currency,
    priority = excluded.priority,
    metadata = excluded.metadata,
    is_active = true,
    updated_at = timezone('utc'::text, now());

alter table public.tax_rules enable row level security;

drop policy if exists "Tax rules are publicly viewable" on public.tax_rules;
create policy "Tax rules are publicly viewable"
on public.tax_rules
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

create or replace function public.get_checkout_tax_options(
  p_country text default 'Nigeria'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_country text := lower(trim(coalesce(p_country, 'Nigeria')));
  normalized_country_code text;
begin
  normalized_country_code := case normalized_country
    when 'nigeria' then 'NG'
    when 'ng' then 'NG'
    else upper(normalized_country)
  end;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', rule.id,
        'countryCode', rule.country_code,
        'countryName', rule.country_name,
        'taxType', rule.tax_type,
        'displayName', rule.display_name,
        'description', rule.description,
        'oldTaxRate', rule.old_tax_rate,
        'currentTaxRate', rule.current_tax_rate,
        'appliesTo', rule.applies_to,
        'calculationMethod', rule.calculation_method,
        'fixedAmountMinor', rule.fixed_amount_minor,
        'currency', rule.currency
      )
      order by rule.priority, rule.display_name
    )
    from public.tax_rules rule
    where rule.is_active = true
      and rule.country_code = normalized_country_code
      and rule.effective_from <= timezone('utc'::text, now())
      and (rule.effective_to is null or rule.effective_to > timezone('utc'::text, now()))
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_checkout_tax_options(text) from public;
grant execute on function public.get_checkout_tax_options(text) to anon, authenticated;

create or replace function public.apply_order_checkout_charges(
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
  tax_rules jsonb;
  tax_rule jsonb;
  fee_minor integer;
  taxable_minor integer;
  v_tax_minor integer := 0;
  tax_breakdown jsonb := '[]'::jsonb;
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

  select greatest(coalesce(order_row.subtotal_minor, 0) - coalesce(order_row.discount_minor, 0), 0)
  into taxable_minor
  from public.orders order_row
  where order_row.id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  tax_rules := public.get_checkout_tax_options(p_country);

  for tax_rule in select value from jsonb_array_elements(tax_rules)
  loop
    declare
      base_minor integer := taxable_minor;
      line_tax_minor integer := 0;
    begin
      if tax_rule ->> 'appliesTo' = 'shipping' then
        base_minor := fee_minor;
      elsif tax_rule ->> 'appliesTo' = 'order_total' then
        base_minor := taxable_minor + fee_minor;
      end if;

      if tax_rule ->> 'calculationMethod' = 'fixed' then
        line_tax_minor := coalesce((tax_rule ->> 'fixedAmountMinor')::integer, 0);
      else
        line_tax_minor := round(base_minor * coalesce((tax_rule ->> 'currentTaxRate')::numeric, 0))::integer;
      end if;

      v_tax_minor := v_tax_minor + line_tax_minor;
      tax_breakdown := tax_breakdown || jsonb_build_array(
        tax_rule || jsonb_build_object('amountMinor', line_tax_minor, 'baseMinor', base_minor)
      );
    end;
  end loop;

  update public.orders
  set shipping_minor = fee_minor,
      tax_minor = v_tax_minor,
      total_minor = taxable_minor + fee_minor + v_tax_minor
  where id = p_order_id;

  return jsonb_build_object(
    'shippingMinor', fee_minor,
    'taxMinor', v_tax_minor,
    'taxBreakdown', tax_breakdown,
    'options', fee_options -> 'options',
    'zone', fee_options -> 'zone'
  );
end;
$$;

revoke all on function public.apply_order_checkout_charges(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.apply_order_checkout_charges(uuid, text, text, text, text)
  to service_role;

create or replace function public.get_admin_checkout_pricing()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  return jsonb_build_object(
    'deliveryZones', coalesce((
      select jsonb_agg(to_jsonb(zone) order by zone.sort_order, zone.name)
      from public.delivery_fee_zones zone
    ), '[]'::jsonb),
    'taxRules', coalesce((
      select jsonb_agg(to_jsonb(rule) order by rule.country_name, rule.priority, rule.display_name)
      from public.tax_rules rule
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_admin_checkout_pricing() from public, anon;
grant execute on function public.get_admin_checkout_pricing() to authenticated;

create or replace function public.admin_upsert_delivery_fee_zone(
  p_id uuid default null,
  p_name text default null,
  p_description text default '',
  p_locations text[] default '{}'::text[],
  p_standard_fee_minor integer default 0,
  p_express_fee_minor integer default 0,
  p_is_active boolean default true,
  p_sort_order integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_zone public.delivery_fee_zones%rowtype;
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  if nullif(trim(coalesce(p_name, '')), '') is null then
    raise exception 'Delivery zone name is required.';
  end if;

  insert into public.delivery_fee_zones (
    id,
    name,
    description,
    locations,
    standardfee_minor,
    express_fee_minor,
    is_active,
    sort_order,
    updated_at
  )
  values (
    coalesce(p_id, gen_random_uuid()),
    trim(p_name),
    coalesce(p_description, ''),
    coalesce(p_locations, '{}'::text[]),
    greatest(coalesce(p_standard_fee_minor, 0), 0),
    greatest(coalesce(p_express_fee_minor, 0), 0),
    coalesce(p_is_active, true),
    coalesce(p_sort_order, 0),
    timezone('utc'::text, now())
  )
  on conflict (name)
  do update
  set description = excluded.description,
      locations = excluded.locations,
      standardfee_minor = excluded.standardfee_minor,
      express_fee_minor = excluded.express_fee_minor,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order,
      updated_at = timezone('utc'::text, now())
  returning * into saved_zone;

  return to_jsonb(saved_zone);
end;
$$;

revoke all on function public.admin_upsert_delivery_fee_zone(uuid, text, text, text[], integer, integer, boolean, integer)
  from public, anon;
grant execute on function public.admin_upsert_delivery_fee_zone(uuid, text, text, text[], integer, integer, boolean, integer)
  to authenticated;

create or replace function public.admin_upsert_tax_rule(
  p_id uuid default null,
  p_country_code text default 'NG',
  p_country_name text default 'Nigeria',
  p_region text default 'national',
  p_tax_type text default 'vat',
  p_display_name text default 'V.A.T',
  p_description text default '',
  p_old_tax_rate numeric default 0,
  p_current_tax_rate numeric default 0,
  p_applies_to text default 'order_subtotal',
  p_calculation_method text default 'percentage',
  p_fixed_amount_minor integer default 0,
  p_currency text default 'NGN',
  p_priority integer default 100,
  p_is_active boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_rule public.tax_rules%rowtype;
begin
  perform private.assert_admin_role(array['super_admin', 'finance_manager']);

  if nullif(trim(coalesce(p_country_code, '')), '') is null then
    raise exception 'Country code is required.';
  end if;
  if nullif(trim(coalesce(p_tax_type, '')), '') is null then
    raise exception 'Tax type is required.';
  end if;

  insert into public.tax_rules (
    id,
    country_code,
    country_name,
    region,
    tax_type,
    display_name,
    description,
    old_tax_rate,
    current_tax_rate,
    applies_to,
    calculation_method,
    fixed_amount_minor,
    currency,
    priority,
    is_active,
    updated_at
  )
  values (
    coalesce(p_id, gen_random_uuid()),
    upper(trim(p_country_code)),
    trim(p_country_name),
    lower(trim(coalesce(p_region, 'national'))),
    lower(trim(p_tax_type)),
    trim(p_display_name),
    coalesce(p_description, ''),
    greatest(coalesce(p_old_tax_rate, 0), 0),
    greatest(coalesce(p_current_tax_rate, 0), 0),
    p_applies_to,
    p_calculation_method,
    greatest(coalesce(p_fixed_amount_minor, 0), 0),
    upper(trim(coalesce(p_currency, 'NGN'))),
    coalesce(p_priority, 100),
    coalesce(p_is_active, true),
    timezone('utc'::text, now())
  )
  on conflict (country_code, tax_type, region)
  do update
  set country_name = excluded.country_name,
      display_name = excluded.display_name,
      description = excluded.description,
      old_tax_rate = excluded.old_tax_rate,
      current_tax_rate = excluded.current_tax_rate,
      applies_to = excluded.applies_to,
      calculation_method = excluded.calculation_method,
      fixed_amount_minor = excluded.fixed_amount_minor,
      currency = excluded.currency,
      priority = excluded.priority,
      is_active = excluded.is_active,
      updated_at = timezone('utc'::text, now())
  returning * into saved_rule;

  return to_jsonb(saved_rule);
end;
$$;

revoke all on function public.admin_upsert_tax_rule(uuid, text, text, text, text, text, text, numeric, numeric, text, text, integer, text, integer, boolean)
  from public, anon;
grant execute on function public.admin_upsert_tax_rule(uuid, text, text, text, text, text, text, numeric, numeric, text, text, integer, text, integer, boolean)
  to authenticated;

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
