-- Global admin-controlled Deal of the Day slots.

begin;

create table if not exists public.admin_deals_of_day (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Deal of the Day',
  eyebrow text not null default 'Today Only',
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'paused', 'archived')),
  priority integer not null default 100,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text not null default 'UTC',
  accent_color text not null default '#E8433A',
  featured_product_id uuid not null references public.products(id) on delete cascade,
  product_ids uuid[] not null default '{}'::uuid[],
  cta_label text,
  cta_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint admin_deals_of_day_schedule_check
    check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists admin_deals_of_day_public_lookup_idx
  on public.admin_deals_of_day (status, priority, starts_at, ends_at);

create index if not exists admin_deals_of_day_featured_product_idx
  on public.admin_deals_of_day (featured_product_id);

create or replace function public.touch_admin_deals_of_day_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists touch_admin_deals_of_day_updated_at on public.admin_deals_of_day;
create trigger touch_admin_deals_of_day_updated_at
before update on public.admin_deals_of_day
for each row
execute function public.touch_admin_deals_of_day_updated_at();

alter table public.admin_deals_of_day enable row level security;

revoke all on table public.admin_deals_of_day from public;
grant select on table public.admin_deals_of_day to anon, authenticated;
grant insert, update, delete on table public.admin_deals_of_day to authenticated;
grant all on table public.admin_deals_of_day to service_role;

drop policy if exists "Active deals of day are public" on public.admin_deals_of_day;
drop policy if exists "Content admins can read deals of day" on public.admin_deals_of_day;
drop policy if exists "Content admins can insert deals of day" on public.admin_deals_of_day;
drop policy if exists "Content admins can update deals of day" on public.admin_deals_of_day;
drop policy if exists "Content admins can delete deals of day" on public.admin_deals_of_day;

create policy "Active deals of day are public"
on public.admin_deals_of_day
for select
to anon, authenticated
using (
  status = 'active'
  and (starts_at is null or starts_at <= timezone('utc'::text, now()))
  and (ends_at is null or ends_at >= timezone('utc'::text, now()))
);

create policy "Content admins can read deals of day"
on public.admin_deals_of_day
for select
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])));

create policy "Content admins can insert deals of day"
on public.admin_deals_of_day
for insert
to authenticated
with check ((select private.has_admin_role(array['super_admin', 'content_mod'])));

create policy "Content admins can update deals of day"
on public.admin_deals_of_day
for update
to authenticated
using ((select private.has_admin_role(array['super_admin', 'content_mod'])))
with check ((select private.has_admin_role(array['super_admin', 'content_mod'])));

create policy "Content admins can delete deals of day"
on public.admin_deals_of_day
for delete
to authenticated
using ((select private.has_admin_role(array['super_admin'])));

commit;
