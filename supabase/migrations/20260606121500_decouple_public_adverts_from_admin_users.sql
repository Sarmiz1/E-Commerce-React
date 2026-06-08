alter table if exists public.admin_adverts
  drop constraint if exists admin_adverts_created_by_fkey,
  drop constraint if exists admin_adverts_updated_by_fkey;
