-- Materialized public brand directory sourced from seller-entered products.brand.

begin;

create table if not exists public.shop_by_brands (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  brand_slug text not null,
  product_count bigint not null default 0,
  sample_image text,
  sample_product_id uuid references public.products(id) on delete set null,
  product_ids uuid[] not null default '{}'::uuid[],
  is_active boolean not null default true,
  first_seen_at timestamptz not null default timezone('utc'::text, now()),
  last_product_at timestamptz,
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint shop_by_brands_name_not_blank check (nullif(trim(brand_name), '') is not null),
  constraint shop_by_brands_slug_not_blank check (nullif(trim(brand_slug), '') is not null),
  constraint shop_by_brands_product_count_check check (product_count >= 0)
);

create unique index if not exists shop_by_brands_slug_unique_idx
  on public.shop_by_brands (brand_slug);

create unique index if not exists shop_by_brands_name_normalized_unique_idx
  on public.shop_by_brands (lower(trim(brand_name)));

create index if not exists shop_by_brands_public_sort_idx
  on public.shop_by_brands (is_active, product_count desc, last_product_at desc);

create or replace function public.normalize_shop_brand_slug(p_brand text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    regexp_replace(lower(trim(coalesce(p_brand, ''))), '[^a-z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  );
$$;

create or replace function public.refresh_shop_by_brand(p_brand text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_name text := nullif(trim(p_brand), '');
  normalized_slug text := public.normalize_shop_brand_slug(p_brand);
  brand_summary record;
begin
  if normalized_name is null or normalized_slug is null or normalized_slug = '' then
    return;
  end if;

  select
    min(nullif(trim(p.brand), '')) as brand_name,
    count(*)::bigint as product_count,
    (array_agg(p.image order by p.created_at desc, p.id) filter (where p.image is not null))[1] as sample_image,
    (array_agg(p.id order by p.created_at desc, p.id))[1] as sample_product_id,
    coalesce((array_agg(p.id order by p.created_at desc, p.id))[1:8], '{}'::uuid[]) as product_ids,
    max(p.created_at) as last_product_at
  into brand_summary
  from public.products p
  where p.is_active = true
    and public.normalize_shop_brand_slug(p.brand) = normalized_slug;

  if coalesce(brand_summary.product_count, 0) = 0 then
    update public.shop_by_brands
    set
      product_count = 0,
      sample_image = null,
      sample_product_id = null,
      product_ids = '{}'::uuid[],
      is_active = false,
      updated_at = timezone('utc'::text, now())
    where brand_slug = normalized_slug;
    return;
  end if;

  insert into public.shop_by_brands (
    brand_name,
    brand_slug,
    product_count,
    sample_image,
    sample_product_id,
    product_ids,
    is_active,
    last_product_at,
    updated_at
  )
  values (
    brand_summary.brand_name,
    normalized_slug,
    brand_summary.product_count,
    brand_summary.sample_image,
    brand_summary.sample_product_id,
    brand_summary.product_ids,
    true,
    brand_summary.last_product_at,
    timezone('utc'::text, now())
  )
  on conflict (brand_slug) do update
  set
    brand_name = excluded.brand_name,
    product_count = excluded.product_count,
    sample_image = excluded.sample_image,
    sample_product_id = excluded.sample_product_id,
    product_ids = excluded.product_ids,
    is_active = true,
    last_product_at = excluded.last_product_at,
    updated_at = excluded.updated_at;
end;
$$;

alter table public.products
  add column if not exists brand_slug text;

update public.products
set brand_slug = nullif(public.normalize_shop_brand_slug(brand), '')
where brand_slug is distinct from nullif(public.normalize_shop_brand_slug(brand), '');

create index if not exists products_brand_slug_active_idx
  on public.products(brand_slug, is_active, created_at desc);

create or replace function public.set_product_brand_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.brand_slug := nullif(public.normalize_shop_brand_slug(new.brand), '');
  return new;
end;
$$;

drop trigger if exists set_product_brand_slug on public.products;
create trigger set_product_brand_slug
before insert or update of brand on public.products
for each row
execute function public.set_product_brand_slug();

create or replace function public.get_shop_brand_products(
  p_brand_slug text,
  p_limit integer default 120,
  p_offset integer default 0
)
returns setof public.products
language sql
stable
security definer
set search_path = ''
as $$
  select product.*
  from public.products product
  where product.is_active = true
    and product.brand_slug = public.normalize_shop_brand_slug(p_brand_slug)
  order by product.created_at desc, product.id
  limit greatest(1, least(coalesce(p_limit, 120), 240))
  offset greatest(0, coalesce(p_offset, 0));
$$;

create or replace function public.sync_shop_by_brands_from_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.refresh_shop_by_brand(new.brand);
    return new;
  elsif tg_op = 'UPDATE' then
    perform public.refresh_shop_by_brand(new.brand);
    if public.normalize_shop_brand_slug(old.brand) is distinct from public.normalize_shop_brand_slug(new.brand) then
      perform public.refresh_shop_by_brand(old.brand);
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    perform public.refresh_shop_by_brand(old.brand);
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists sync_shop_by_brands_from_product on public.products;
create trigger sync_shop_by_brands_from_product
after insert or update or delete on public.products
for each row
execute function public.sync_shop_by_brands_from_product();

insert into public.shop_by_brands (
  brand_name,
  brand_slug,
  product_count,
  sample_image,
  sample_product_id,
  product_ids,
  is_active,
  last_product_at
)
select
  summary.brand_name,
  summary.brand_slug,
  summary.product_count,
  summary.sample_image,
  summary.sample_product_id,
  summary.product_ids,
  true,
  summary.last_product_at
from (
  select
    min(nullif(trim(p.brand), '')) as brand_name,
    public.normalize_shop_brand_slug(p.brand) as brand_slug,
    count(*)::bigint as product_count,
    (array_agg(p.image order by p.created_at desc, p.id) filter (where p.image is not null))[1] as sample_image,
    (array_agg(p.id order by p.created_at desc, p.id))[1] as sample_product_id,
    coalesce((array_agg(p.id order by p.created_at desc, p.id))[1:8], '{}'::uuid[]) as product_ids,
    max(p.created_at) as last_product_at
  from public.products p
  where p.is_active = true
    and nullif(trim(p.brand), '') is not null
  group by public.normalize_shop_brand_slug(p.brand)
) summary
where summary.brand_slug <> ''
on conflict (brand_slug) do update
set
  brand_name = excluded.brand_name,
  product_count = excluded.product_count,
  sample_image = excluded.sample_image,
  sample_product_id = excluded.sample_product_id,
  product_ids = excluded.product_ids,
  is_active = true,
  last_product_at = excluded.last_product_at,
  updated_at = timezone('utc'::text, now());

alter table public.shop_by_brands enable row level security;

revoke all on table public.shop_by_brands from public;
grant select on table public.shop_by_brands to anon, authenticated;
grant all on table public.shop_by_brands to service_role;
grant execute on function public.get_shop_brand_products(text, integer, integer) to anon, authenticated, service_role;

drop policy if exists "Active shop by brands are public" on public.shop_by_brands;

create policy "Active shop by brands are public"
on public.shop_by_brands
for select
to anon, authenticated
using (is_active = true and product_count > 0);

commit;
