-- Keep public account roles separate from privileged admin membership.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'admin_role'
  ) then
    create type public.admin_role as enum (
      'super_admin',
      'support_lead',
      'finance_manager',
      'content_mod'
    );
  end if;
end
$$;

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.admin_role not null,
  is_active boolean default true not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon;
revoke all on table public.admin_users from public;
grant select, insert, update, delete on table public.admin_users to authenticated;
grant all on table public.admin_users to service_role;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_super_admin()
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
      and role = 'super_admin'
      and is_active = true
  );
$$;

revoke all on function private.is_super_admin() from public;
grant execute on function private.is_super_admin() to authenticated;

drop policy if exists "Admin users are viewable by everyone" on public.admin_users;
drop policy if exists "Admins can view own profile" on public.admin_users;
drop policy if exists "Super admins can view all" on public.admin_users;
drop policy if exists "Super admins can insert" on public.admin_users;
drop policy if exists "Super admins can update" on public.admin_users;
drop policy if exists "Super admins can delete" on public.admin_users;

create policy "Admins can view own profile"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id);

create policy "Super admins can view all"
on public.admin_users
for select
to authenticated
using ((select private.is_super_admin()));

create policy "Super admins can insert"
on public.admin_users
for insert
to authenticated
with check ((select private.is_super_admin()));

create policy "Super admins can update"
on public.admin_users
for update
to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

create policy "Super admins can delete"
on public.admin_users
for delete
to authenticated
using ((select private.is_super_admin()));

create or replace function public.enforce_public_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is null or new.role not in ('buyer', 'seller') then
    if tg_op = 'INSERT' then
      new.role := 'buyer';
    else
      raise exception 'profiles.role must be buyer or seller'
        using errcode = '22023';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_public_profile_role on public.profiles;
create trigger enforce_public_profile_role
before insert or update of role on public.profiles
for each row
execute function public.enforce_public_profile_role();

create or replace function public.set_public_account_role(requested_role text)
returns text
language plpgsql
set search_path = ''
as $$
declare
  account_role text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if requested_role is null or requested_role not in ('buyer', 'seller') then
    raise exception 'Unsupported public account role'
      using errcode = '22023';
  end if;

  insert into public.profiles (id, role)
  values ((select auth.uid()), requested_role)
  on conflict (id) do update
  set role = excluded.role
  returning role into account_role;

  return account_role;
end;
$$;

revoke all on function public.set_public_account_role(text) from public;
grant execute on function public.set_public_account_role(text) to authenticated;

commit;
