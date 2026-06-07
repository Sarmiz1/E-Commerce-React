-- Add Shop by Brands as a first-class showcase curation section.

begin;

insert into public.curations (
  name,
  slug,
  description,
  is_active,
  showcase_tag,
  showcase_tag_color,
  showcase_sort_order
)
values (
  'Shop by Brands',
  'shop-by-brands',
  'Browse active WooSho brands with live marketplace listings.',
  true,
  'BRAND DIRECTORY',
  '#1A73C9',
  80
)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  showcase_tag = excluded.showcase_tag,
  showcase_tag_color = excluded.showcase_tag_color,
  showcase_sort_order = coalesce(public.curations.showcase_sort_order, excluded.showcase_sort_order);

commit;
