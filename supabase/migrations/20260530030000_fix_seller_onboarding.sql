-- Keep seller identity consistent from onboarding through product ownership and orders.

begin;

alter table public.seller_profiles
  add column if not exists onboarding_data jsonb not null default '{}'::jsonb;

create or replace function public.complete_seller_onboarding(seller_onboarding_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  seller_user_id uuid := (select auth.uid());
  store_name_value text := nullif(btrim(seller_onboarding_data #>> '{s1,storeName}'), '');
  store_slug_value text;
  base_slug text;
begin
  if seller_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if store_name_value is null then
    raise exception 'Store name is required'
      using errcode = '22023';
  end if;

  select store_slug
  into store_slug_value
  from public.seller_profiles
  where user_id = seller_user_id;

  if store_slug_value is null then
    base_slug := nullif(
      trim(both '-' from regexp_replace(lower(store_name_value), '[^a-z0-9]+', '-', 'g')),
      ''
    );
    base_slug := coalesce(base_slug, 'store-' || left(replace(seller_user_id::text, '-', ''), 8));
    store_slug_value := base_slug;

    if exists (
      select 1
      from public.seller_profiles
      where store_slug = store_slug_value
        and user_id <> seller_user_id
    ) then
      store_slug_value := base_slug || '-' || replace(seller_user_id::text, '-', '');
    end if;
  end if;

  insert into public.seller_profiles (
    user_id,
    store_name,
    store_slug,
    description,
    store_description,
    store_logo,
    store_banner,
    business_email,
    business_phone,
    onboarding_data
  )
  values (
    seller_user_id,
    store_name_value,
    store_slug_value,
    nullif(btrim(seller_onboarding_data #>> '{s1,description}'), ''),
    nullif(btrim(seller_onboarding_data #>> '{s1,description}'), ''),
    nullif(btrim(seller_onboarding_data #>> '{s3,logoUrl}'), ''),
    nullif(btrim(seller_onboarding_data #>> '{s3,bannerUrl}'), ''),
    nullif(btrim(seller_onboarding_data #>> '{s2,businessEmail}'), ''),
    nullif(btrim(seller_onboarding_data #>> '{s2,phone}'), ''),
    seller_onboarding_data
  )
  on conflict (user_id) do update
  set store_name = excluded.store_name,
      store_slug = coalesce(public.seller_profiles.store_slug, excluded.store_slug),
      description = excluded.description,
      store_description = excluded.store_description,
      store_logo = excluded.store_logo,
      store_banner = excluded.store_banner,
      business_email = excluded.business_email,
      business_phone = excluded.business_phone,
      onboarding_data = excluded.onboarding_data,
      updated_at = timezone('utc'::text, now())
  returning store_slug into store_slug_value;

  return jsonb_build_object(
    'userId', seller_user_id,
    'storeName', store_name_value,
    'storeSlug', store_slug_value
  );
end;
$$;

revoke all on function public.complete_seller_onboarding(jsonb) from public;
grant execute on function public.complete_seller_onboarding(jsonb) to authenticated;

with missing_sellers as (
  select
    p.id user_id,
    coalesce(nullif(btrim(p.full_name), ''), nullif(btrim(p.username), '')) store_name
  from public.profiles p
  where p.role = 'seller'
    and exists (
      select 1
      from public.products product
      where product.seller_id = p.id
    )
    and not exists (
      select 1
      from public.seller_profiles seller
      where seller.user_id = p.id
    )
)
insert into public.seller_profiles (user_id, store_name, store_slug)
select
  user_id,
  store_name,
  coalesce(
    nullif(trim(both '-' from regexp_replace(lower(store_name), '[^a-z0-9]+', '-', 'g')), ''),
    'store'
  ) || '-' || replace(user_id::text, '-', '')
from missing_sellers
where store_name is not null
on conflict (user_id) do nothing;

create or replace function public.ensure_product_seller_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.seller_id is not null
    and not exists (
      select 1
      from public.seller_profiles
      where user_id = new.seller_id
    )
  then
    raise exception 'Seller onboarding must be completed before publishing products'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_product_seller_profile on public.products;
create trigger ensure_product_seller_profile
before insert or update of seller_id on public.products
for each row
execute function public.ensure_product_seller_profile();

commit;
