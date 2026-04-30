-- Home page curations.
-- Run this in Supabase SQL editor after reviewing it.

create extension if not exists pgcrypto;

create or replace function public.set_curation_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or length(trim(new.slug)) = 0 then
    new.slug := new.name;
  end if;

  new.slug := lower(trim(new.slug));
  new.slug := regexp_replace(new.slug, '[^a-z0-9]+', '-', 'g');
  new.slug := regexp_replace(new.slug, '(^-|-$)', '', 'g');
  return new;
end;
$$;

create table if not exists public.curations (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  constraint curations_pkey primary key (id),
  constraint curations_slug_key unique (slug)
);

drop trigger if exists curations_slug_trigger on public.curations;
create trigger curations_slug_trigger
before insert or update on public.curations
for each row execute function public.set_curation_slug();

create table if not exists public.curation_products (
  id uuid not null default gen_random_uuid(),
  curation_id uuid not null references public.curations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 100,
  score numeric(12, 4) not null default 0,
  source text not null default 'manual',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint curation_products_pkey primary key (id),
  constraint curation_products_unique_product unique (curation_id, product_id)
);

create index if not exists curation_products_curation_rank_idx
  on public.curation_products (curation_id, sort_order asc, score desc);

create index if not exists curation_products_product_idx
  on public.curation_products (product_id);

insert into public.curations (name, slug, description)
values
  ('Hero Featured', 'hero-featured', 'The main product spotlight for the home hero.'),
  ('Trending Products', 'trending-products', 'Products with strong click, view, wishlist, and cart activity.'),
  ('Best Sellers', 'best-sellers', 'Products with strong purchase and review signals.'),
  ('New Arrivals', 'new-arrivals', 'Recently added active products.'),
  ('Flash Deals', 'flash-deals', 'Sale, deal, and promotional products.'),
  ('Recommended For User', 'recommended-for-user', 'Default recommendation pool before per-user ranking is added.'),
  ('Continue Shopping', 'continue-shopping', 'Default continuation pool before per-user history is applied.'),
  ('Editorial Collections', 'editorial-collections', 'Products used by editorial story cards.'),
  ('Top Sellers', 'top-sellers', 'Seller-facing curation placeholder.'),
  ('Recently Added Stores', 'recently-added-stores', 'Seller-facing curation placeholder.'),
  ('Hot Right Now', 'hot-right-now', 'Recent products with strong engagement.'),
  ('Most Loved', 'most-loved', 'Products with strong wishlist and rating signals.'),
  ('Editors Picks', 'editors-picks', 'Featured and high-quality products.'),
  ('Deal Of The Day', 'deal-of-the-day', 'Single strongest deal candidate.'),
  ('Product Scroll Strip', 'product-scroll-strip', 'General discovery rail.'),
  ('Bento Products', 'bento-products', 'Products used in the bento showcase.'),
  ('Filter Grid', 'filter-grid', 'Products used in the filterable home grid.'),
  ('Lookbook Products', 'lookbook-products', 'Products used in the lookbook.'),
  ('Based On Browsing', 'based-on-browsing', 'Default browsing-affinity pool before per-user ranking is added.')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  is_active = true;

create or replace function public.touch_curation_product()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists curation_products_touch_updated_at on public.curation_products;
create trigger curation_products_touch_updated_at
before update on public.curation_products
for each row execute function public.touch_curation_product();

create or replace function public.refresh_product_curations(target_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_product_id is null then
    return;
  end if;

  delete from public.curation_products
  where product_id = target_product_id
    and source = 'auto';

  with base as (
    select
      p.id as product_id,
      p.created_at,
      p.price_cents,
      coalesce(p.rating_stars, 0) as rating_stars,
      coalesce(p.rating_count, 0) as rating_count,
      coalesce(p.is_featured, false) as is_featured,
      coalesce(p.keywords, array[]::text[]) as keywords,
      coalesce(pm.view_count, 0) as view_count,
      coalesce(pm.purchase_count, 0) as purchase_count,
      coalesce(pm.search_count, 0) as search_count,
      coalesce(pm.wishlisted_count, 0) as metric_wishlist_count,
      (
        select count(*)
        from public.events e
        where e.product_id = p.id
          and e.event_type in (
            'product_click',
            'view_product',
            'product_detail_viewed',
            'quick_view_opened',
            'add_to_cart',
            'add_to_wishlist'
          )
      ) as event_count,
      (
        select count(*)
        from public.wishlists w
        where w.product_id = p.id
      ) as wishlist_count
    from public.products p
    left join public.product_metrics pm on pm.product_id = p.id
    where p.id = target_product_id
      and p.is_active = true
  ),
  scored as (
    select
      *,
      (
        view_count * 1.0 +
        search_count * 2.0 +
        purchase_count * 14.0 +
        metric_wishlist_count * 7.0 +
        wishlist_count * 9.0 +
        event_count * 3.0 +
        rating_count * 0.4 +
        rating_stars * 4.0 +
        case when is_featured then 35 else 0 end
      )::numeric(12, 4) as engagement_score
    from base
  ),
  candidates as (
    select 'hero-featured' as slug, product_id, engagement_score + 80 as score, 1 as sort_order, 'featured' as rule
    from scored
    where is_featured

    union all
    select 'trending-products', product_id, engagement_score, 100, 'engagement'
    from scored
    where engagement_score > 0

    union all
    select 'best-sellers', product_id, purchase_count * 20 + rating_count + rating_stars * 5, 100, 'purchase_rating'
    from scored
    where purchase_count > 0 or rating_count >= 10

    union all
    select 'new-arrivals', product_id, 1000 - extract(epoch from (now() - created_at)) / 86400, 100, 'recent'
    from scored
    where created_at >= now() - interval '45 days'

    union all
    select 'flash-deals', product_id, engagement_score + 20, 100, 'deal_keyword'
    from scored
    where keywords && array['sale', 'deal', 'flash', 'discount', 'promo']::text[]

    union all
    select 'recommended-for-user', product_id, engagement_score + rating_stars * 4, 100, 'default_recommendation_pool'
    from scored
    where engagement_score > 0 or rating_count > 0

    union all
    select 'continue-shopping', product_id, engagement_score, 100, 'default_continue_pool'
    from scored
    where event_count > 0 or view_count > 0

    union all
    select 'editorial-collections', product_id, engagement_score + case when is_featured then 40 else 0 end, 100, 'editorial_pool'
    from scored
    where is_featured or rating_stars >= 4

    union all
    select 'hot-right-now', product_id, engagement_score + case when created_at >= now() - interval '14 days' then 25 else 0 end, 100, 'recent_engagement'
    from scored
    where engagement_score > 0

    union all
    select 'most-loved', product_id, wishlist_count * 15 + metric_wishlist_count * 10 + rating_count + rating_stars * 6, 100, 'wishlist_rating'
    from scored
    where wishlist_count > 0 or metric_wishlist_count > 0 or rating_count >= 5

    union all
    select 'editors-picks', product_id, engagement_score + 35, 100, 'featured_or_quality'
    from scored
    where is_featured or rating_stars >= 4.5

    union all
    select 'deal-of-the-day', product_id, engagement_score + case when keywords && array['deal', 'flash', 'sale']::text[] then 50 else 0 end, 1, 'daily_deal_candidate'
    from scored
    where is_featured or keywords && array['deal', 'flash', 'sale']::text[]

    union all
    select 'product-scroll-strip', product_id, engagement_score, 100, 'general_discovery'
    from scored

    union all
    select 'bento-products', product_id, engagement_score + case when is_featured then 20 else 0 end, 100, 'showcase'
    from scored

    union all
    select 'filter-grid', product_id, engagement_score, 100, 'browsable_grid'
    from scored

    union all
    select 'lookbook-products', product_id, engagement_score + case when is_featured then 25 else 0 end, 100, 'lookbook'
    from scored
    where is_featured or rating_stars >= 4

    union all
    select 'based-on-browsing', product_id, engagement_score, 100, 'default_browsing_pool'
    from scored
    where engagement_score > 0 or rating_count > 0
  )
  insert into public.curation_products (
    curation_id,
    product_id,
    sort_order,
    score,
    source,
    metadata
  )
  select
    c.id,
    candidates.product_id,
    candidates.sort_order,
    candidates.score,
    'auto',
    jsonb_build_object('rule', candidates.rule)
  from candidates
  join public.curations c on c.slug = candidates.slug and c.is_active = true
  on conflict (curation_id, product_id) do update
  set
    score = greatest(public.curation_products.score, excluded.score),
    sort_order = least(public.curation_products.sort_order, excluded.sort_order),
    source = excluded.source,
    metadata = public.curation_products.metadata || excluded.metadata,
    updated_at = now();
end;
$$;

create or replace function public.refresh_product_curations_from_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_product_curations(new.id);
  return new;
end;
$$;

drop trigger if exists products_refresh_curations on public.products;
create trigger products_refresh_curations
after insert or update on public.products
for each row execute function public.refresh_product_curations_from_product();

create or replace function public.refresh_product_curations_from_signal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  touched_product_id uuid;
begin
  touched_product_id := case
    when tg_op = 'DELETE' then old.product_id
    else new.product_id
  end;
  perform public.refresh_product_curations(touched_product_id);
  return case
    when tg_op = 'DELETE' then old
    else new
  end;
end;
$$;

do $$
begin
  if to_regclass('public.product_metrics') is not null then
    execute 'drop trigger if exists product_metrics_refresh_curations on public.product_metrics';
    execute 'create trigger product_metrics_refresh_curations after insert or update on public.product_metrics for each row execute function public.refresh_product_curations_from_signal()';
  end if;

  if to_regclass('public.wishlists') is not null then
    execute 'drop trigger if exists wishlists_refresh_curations on public.wishlists';
    execute 'create trigger wishlists_refresh_curations after insert or delete on public.wishlists for each row execute function public.refresh_product_curations_from_signal()';
  end if;

  if to_regclass('public.events') is not null then
    execute 'drop trigger if exists events_refresh_curations on public.events';
    execute 'create trigger events_refresh_curations after insert on public.events for each row execute function public.refresh_product_curations_from_signal()';
  end if;
end;
$$;

alter table public.curations enable row level security;
alter table public.curation_products enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'curations'
      and policyname = 'Public can read active curations'
  ) then
    execute 'create policy "Public can read active curations" on public.curations for select using (is_active = true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'curation_products'
      and policyname = 'Public can read active curation products'
  ) then
    execute 'create policy "Public can read active curation products" on public.curation_products for select using (exists (select 1 from public.curations c where c.id = curation_id and c.is_active = true))';
  end if;
end;
$$;

grant select on public.curations to anon, authenticated;
grant select on public.curation_products to anon, authenticated;

-- Bootstrap existing active products into auto curations.
select public.refresh_product_curations(id)
from public.products
where is_active = true;
