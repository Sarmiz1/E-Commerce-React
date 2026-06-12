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

  return jsonb_build_object('success', true, 'orderId', session_row.order_id);
end;
$$;

revoke all on function public.confirm_paystack_payment(text, jsonb) from public, anon, authenticated;
grant execute on function public.confirm_paystack_payment(text, jsonb) to service_role;
