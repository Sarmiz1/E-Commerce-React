-- Keep the public catalog limited to active products with sellable inventory.
-- Products hidden automatically for inventory can return when stock is restored,
-- while products unpublished manually remain unpublished.

alter table public.products
  add column if not exists deactivated_for_inventory boolean not null default false;

create index if not exists product_variants_sellable_product_id_idx
  on public.product_variants (product_id)
  where is_active = true and stock_quantity > 0;

create or replace function public.product_has_sellable_stock(target_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.product_variants pv
    where pv.product_id = target_product_id
      and pv.is_active = true
      and pv.stock_quantity > 0
  );
$$;

revoke execute on function public.product_has_sellable_stock(uuid)
  from public;

grant execute on function public.product_has_sellable_stock(uuid)
  to anon, authenticated;

create or replace function public.enforce_product_inventory_visibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_active = true
    and not public.product_has_sellable_stock(new.id)
  then
    new.is_active = false;
    new.deactivated_for_inventory = true;
  elsif new.is_active = true then
    new.deactivated_for_inventory = false;
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_product_inventory_visibility()
  from public, anon, authenticated;

drop trigger if exists products_enforce_inventory_visibility
  on public.products;

create trigger products_enforce_inventory_visibility
before insert or update of is_active on public.products
for each row execute function public.enforce_product_inventory_visibility();

create or replace function public.reject_unavailable_cart_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = new.variant_id
      and pv.product_id = new.product_id
      and pv.is_active = true
      and pv.stock_quantity >= new.quantity
      and p.is_active = true
  ) then
    raise exception 'Product variant is unavailable or does not have enough stock.';
  end if;

  return new;
end;
$$;

revoke execute on function public.reject_unavailable_cart_item()
  from public, anon, authenticated;

drop trigger if exists cart_items_reject_unavailable_variant
  on public.cart_items;

create trigger cart_items_reject_unavailable_variant
before insert or update of product_id, variant_id, quantity on public.cart_items
for each row execute function public.reject_unavailable_cart_item();

create or replace function public.sync_product_inventory_visibility(target_product_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  has_sellable_stock boolean;
begin
  if target_product_id is null then
    return;
  end if;

  select public.product_has_sellable_stock(target_product_id)
  into has_sellable_stock;

  if has_sellable_stock then
    update public.products p
    set
      is_active = true,
      deactivated_for_inventory = false,
      updated_at = now()
    where p.id = target_product_id
      and p.deactivated_for_inventory = true;
  else
    update public.products p
    set
      is_active = false,
      deactivated_for_inventory = true,
      updated_at = now()
    where p.id = target_product_id
      and p.is_active = true;
  end if;
end;
$$;

revoke execute on function public.sync_product_inventory_visibility(uuid)
  from public, anon, authenticated;

create or replace function public.sync_product_inventory_visibility_from_variant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_product_inventory_visibility(old.product_id);
    return old;
  end if;

  perform public.sync_product_inventory_visibility(new.product_id);

  if tg_op = 'UPDATE' and new.product_id is distinct from old.product_id then
    perform public.sync_product_inventory_visibility(old.product_id);
  end if;

  return new;
end;
$$;

revoke execute on function public.sync_product_inventory_visibility_from_variant()
  from public, anon, authenticated;

drop trigger if exists product_variants_sync_inventory_visibility
  on public.product_variants;

create constraint trigger product_variants_sync_inventory_visibility
after insert or update or delete on public.product_variants
deferrable initially deferred
for each row execute function public.sync_product_inventory_visibility_from_variant();

update public.products p
set
  is_active = false,
  deactivated_for_inventory = true,
  updated_at = now()
where p.is_active = true
  and not exists (
    select 1
    from public.product_variants pv
    where pv.product_id = p.id
      and pv.is_active = true
      and pv.stock_quantity > 0
  );

drop policy if exists "Products are publicly viewable" on public.products;

create policy "Products are publicly viewable"
on public.products
for select
using (
  seller_id = (select auth.uid())
  or (
    is_active = true
    and public.product_has_sellable_stock(products.id)
  )
);

drop function if exists public.get_ranked_similar_products(uuid, integer);

create function public.get_ranked_similar_products(
  target_id uuid,
  limit_count integer default 8
)
returns table (
  id uuid,
  name text,
  slug text,
  price_minor integer,
  category_id uuid,
  rating_stars numeric,
  rating_count integer,
  image text,
  keywords text[],
  score numeric
)
language sql
security definer
set search_path = ''
as $$
  select
    p.id,
    p.name,
    p.slug,
    p.price_minor,
    p.category_id,
    p.rating_stars,
    p.rating_count::integer,
    p.image,
    p.keywords,
    (
      case when p.category_id = target.category_id then 40 else 0 end
      + (
          select count(*)
          from unnest(coalesce(p.keywords, array[]::text[])) kw
          where kw = any(coalesce(target.keywords, array[]::text[]))
        ) * 8
      + log(coalesce(p.click_score, 0) + 1) * 2
      + case
          when p.created_at > now() - interval '30 days' then 5
          when p.created_at > now() - interval '90 days' then 2
          else 0
        end
      + coalesce(p.rating_stars, 0) * 2
      + case
          when p.embedding is not null and target.embedding is not null
          then (1 - (p.embedding operator(public.<=>) target.embedding)) * 30
          else 0
        end
    )::numeric as score
  from public.products p
  join (
    select
      candidate.id,
      candidate.category_id,
      candidate.keywords,
      candidate.embedding
    from public.products candidate
    where candidate.id = target_id
  ) target on true
  where p.is_active = true
    and p.id != target_id
    and public.product_has_sellable_stock(p.id)
  order by score desc
  limit limit_count;
$$;

grant execute on function public.get_ranked_similar_products(uuid, integer)
  to anon, authenticated;
