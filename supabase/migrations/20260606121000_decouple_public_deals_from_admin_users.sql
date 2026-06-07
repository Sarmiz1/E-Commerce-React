-- Keep audit UUIDs on admin deals, but do not make public reads depend on admin_users.

begin;

alter table if exists public.admin_deals_of_day
  drop constraint if exists admin_deals_of_day_created_by_fkey,
  drop constraint if exists admin_deals_of_day_updated_by_fkey;

commit;
