-- Admin-controlled advert placements for showcase heroes, banners, and promos.

begin;

create table if not exists public.admin_adverts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  eyebrow text,
  subtitle text,
  body text,
  placement text not null default 'showcase_hero',
  surface text not null default 'products',
  status text not null default 'draft'
    check (status in ('draft', 'active', 'paused', 'archived')),
  priority integer not null default 100,
  weight integer not null default 1 check (weight > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text not null default 'UTC',
  media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  image_url text,
  mobile_image_url text,
  video_url text,
  poster_url text,
  alt_text text,
  accent_color text,
  text_color text,
  overlay_color text,
  overlay_opacity numeric(4, 3) default 0.45
    check (overlay_opacity is null or (overlay_opacity >= 0 and overlay_opacity <= 1)),
  theme text not null default 'dark'
    check (theme in ('dark', 'light', 'custom')),
  content_position text not null default 'left'
    check (content_position in ('left', 'center', 'right')),
  cta_label text,
  cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  target_type text
    check (target_type is null or target_type in ('url', 'product', 'category', 'curation', 'collection', 'brand', 'store')),
  target_url text,
  product_id uuid references public.products(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  curation_id uuid references public.curations(id) on delete set null,
  store_id uuid references public.seller_profiles(user_id) on delete set null,
  audience_rules jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  impression_count bigint not null default 0,
  click_count bigint not null default 0,
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint admin_adverts_schedule_check
    check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint admin_adverts_media_check
    check (
      (media_type = 'image' and coalesce(image_url, mobile_image_url, poster_url) is not null)
      or
      (media_type = 'video' and video_url is not null)
    )
);

create index if not exists admin_adverts_public_lookup_idx
  on public.admin_adverts (placement, surface, status, priority, starts_at, ends_at);

create index if not exists admin_adverts_target_idx
  on public.admin_adverts (target_type, product_id, category_id, curation_id, store_id);

create index if not exists admin_adverts_created_at_idx
  on public.admin_adverts (created_at desc);

create table if not exists public.admin_advert_events (
  id uuid primary key default gen_random_uuid(),
  advert_id uuid not null references public.admin_adverts(id) on delete cascade,
  event_type text not null check (event_type in ('impression', 'click')),
  placement text,
  surface text,
  session_id text,
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists admin_advert_events_advert_created_idx
  on public.admin_advert_events (advert_id, created_at desc);

create index if not exists admin_advert_events_type_created_idx
  on public.admin_advert_events (event_type, created_at desc);

create or replace function public.touch_admin_adverts_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists touch_admin_adverts_updated_at on public.admin_adverts;
create trigger touch_admin_adverts_updated_at
before update on public.admin_adverts
for each row
execute function public.touch_admin_adverts_updated_at();

create or replace function public.record_admin_advert_event(
  p_advert_id uuid,
  p_event_type text,
  p_placement text default null,
  p_surface text default null,
  p_session_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_advert public.admin_adverts%rowtype;
begin
  if p_event_type not in ('impression', 'click') then
    raise exception 'Unsupported advert event type' using errcode = '22023';
  end if;

  select *
    into active_advert
  from public.admin_adverts
  where id = p_advert_id
    and status = 'active'
    and (starts_at is null or starts_at <= timezone('utc'::text, now()))
    and (ends_at is null or ends_at >= timezone('utc'::text, now()));

  if not found then
    return;
  end if;

  insert into public.admin_advert_events (
    advert_id,
    event_type,
    placement,
    surface,
    session_id,
    user_id,
    metadata
  )
  values (
    p_advert_id,
    p_event_type,
    coalesce(p_placement, active_advert.placement),
    coalesce(p_surface, active_advert.surface),
    p_session_id,
    auth.uid(),
    coalesce(p_metadata, '{}'::jsonb)
  );

  update public.admin_adverts
  set
    impression_count = impression_count + case when p_event_type = 'impression' then 1 else 0 end,
    click_count = click_count + case when p_event_type = 'click' then 1 else 0 end
  where id = p_advert_id;
end;
$$;

alter table public.admin_adverts enable row level security;
alter table public.admin_advert_events enable row level security;

revoke all on table public.admin_adverts from public;
revoke all on table public.admin_advert_events from public;
grant select on table public.admin_adverts to anon, authenticated;
grant insert, update, delete on table public.admin_adverts to authenticated;
grant select on table public.admin_advert_events to authenticated;
grant all on table public.admin_adverts to service_role;
grant all on table public.admin_advert_events to service_role;

revoke all on function public.record_admin_advert_event(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.record_admin_advert_event(uuid, text, text, text, text, jsonb)
  to anon, authenticated;

drop policy if exists "Active adverts are public" on public.admin_adverts;
drop policy if exists "Content admins can read adverts" on public.admin_adverts;
drop policy if exists "Content admins can insert adverts" on public.admin_adverts;
drop policy if exists "Content admins can update adverts" on public.admin_adverts;
drop policy if exists "Content admins can delete adverts" on public.admin_adverts;

create policy "Active adverts are public"
on public.admin_adverts
for select
to anon, authenticated
using (
  status = 'active'
  and (starts_at is null or starts_at <= timezone('utc'::text, now()))
  and (ends_at is null or ends_at >= timezone('utc'::text, now()))
);

create policy "Content admins can read adverts"
on public.admin_adverts
for select
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])));

create policy "Content admins can insert adverts"
on public.admin_adverts
for insert
to authenticated
with check ((select private.has_admin_role(array['super_admin', 'content_mod'])));

create policy "Content admins can update adverts"
on public.admin_adverts
for update
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])))
with check ((select private.has_admin_role(array['super_admin', 'content_mod'])));

create policy "Content admins can delete adverts"
on public.admin_adverts
for delete
to authenticated
using ((select private.has_admin_role(array['super_admin'])));

drop policy if exists "Content admins can read advert events" on public.admin_advert_events;

create policy "Content admins can read advert events"
on public.admin_advert_events
for select
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])));

commit;
