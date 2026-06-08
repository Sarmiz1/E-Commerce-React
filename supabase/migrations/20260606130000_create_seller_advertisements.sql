create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(user_id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  title text not null,
  subtitle text,
  creative_type text not null default 'product' check (creative_type in ('product', 'store', 'banner', 'collection')),
  placement text not null check (placement in (
    'homepage_hero',
    'category_banner',
    'search_sponsored',
    'product_sponsored',
    'curation_slot',
    'store_spotlight'
  )),
  destination_url text,
  image_url text,
  package_id text not null default 'starter',
  required_seller_plan text not null default 'starter',
  eligible_plan_ids text[] not null default array['starter']::text[],
  budget_minor integer not null default 0 check (budget_minor >= 0),
  bid_type text not null default 'cpc' check (bid_type in ('cpc', 'cpm', 'flat')),
  bid_minor integer not null default 0 check (bid_minor >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_reference text,
  approval_status text not null default 'draft' check (approval_status in ('draft', 'pending_review', 'approved', 'rejected', 'paused', 'completed')),
  admin_status_note text,
  admin_approved_by uuid,
  admin_approved_at timestamptz,
  priority integer not null default 100,
  weight integer not null default 1,
  targeting_rules jsonb not null default '{}'::jsonb,
  creative_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint advertisements_schedule_check check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.advertisement_events (
  id bigserial primary key,
  advertisement_id uuid not null references public.advertisements(id) on delete cascade,
  event_type text not null check (event_type in ('impression', 'click', 'conversion')),
  event_value_minor integer not null default 0 check (event_value_minor >= 0),
  product_id uuid,
  order_id uuid,
  session_id text,
  placement text,
  surface text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);

create index if not exists advertisements_seller_status_idx
  on public.advertisements(seller_id, approval_status, created_at desc);
create index if not exists advertisements_public_lookup_idx
  on public.advertisements(placement, approval_status, payment_status, starts_at, ends_at, priority, weight);
create index if not exists advertisement_events_ad_time_idx
  on public.advertisement_events(advertisement_id, occurred_at desc);

create or replace function public.touch_advertisements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists touch_advertisements_updated_at on public.advertisements;
create trigger touch_advertisements_updated_at
before update on public.advertisements
for each row execute function public.touch_advertisements_updated_at();

alter table public.advertisements enable row level security;
alter table public.advertisement_events enable row level security;

grant select on table public.advertisements to anon, authenticated;
grant insert, update on table public.advertisements to authenticated;
grant select, insert on table public.advertisement_events to anon, authenticated;
grant all on table public.advertisements to service_role;
grant all on table public.advertisement_events to service_role;

drop policy if exists "Approved paid advertisements are public" on public.advertisements;
create policy "Approved paid advertisements are public"
on public.advertisements
for select
to anon, authenticated
using (
  approval_status = 'approved'
  and payment_status = 'paid'
  and (starts_at is null or starts_at <= timezone('utc', now()))
  and (ends_at is null or ends_at >= timezone('utc', now()))
);

drop policy if exists "Sellers can read own advertisements" on public.advertisements;
create policy "Sellers can read own advertisements"
on public.advertisements
for select
to authenticated
using (seller_id = auth.uid());

drop policy if exists "Sellers can create own advertisements" on public.advertisements;
create policy "Sellers can create own advertisements"
on public.advertisements
for insert
to authenticated
with check (seller_id = auth.uid());

drop policy if exists "Sellers can update draft advertisements" on public.advertisements;
create policy "Sellers can update draft advertisements"
on public.advertisements
for update
to authenticated
using (seller_id = auth.uid() and approval_status in ('draft', 'pending_review', 'paused'))
with check (seller_id = auth.uid());

drop policy if exists "Content admins can manage advertisements" on public.advertisements;
create policy "Content admins can manage advertisements"
on public.advertisements
for all
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])))
with check ((select private.has_admin_role(array['super_admin', 'content_mod'])));

drop policy if exists "Public can record advertisement events" on public.advertisement_events;
create policy "Public can record advertisement events"
on public.advertisement_events
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.advertisements advertisement
    where advertisement.id = advertisement_id
      and advertisement.approval_status = 'approved'
      and advertisement.payment_status = 'paid'
  )
);

drop policy if exists "Sellers can read own advertisement events" on public.advertisement_events;
create policy "Sellers can read own advertisement events"
on public.advertisement_events
for select
to authenticated
using (
  exists (
    select 1
    from public.advertisements advertisement
    where advertisement.id = advertisement_id
      and advertisement.seller_id = auth.uid()
  )
);

drop policy if exists "Content admins can read advertisement events" on public.advertisement_events;
create policy "Content admins can read advertisement events"
on public.advertisement_events
for select
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])));
