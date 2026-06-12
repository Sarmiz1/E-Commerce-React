# Brands And Shop-By-Brand Pages

This folder owns WooSho's public brand marketing pages. Those pages are static,
editorial, filterable, theme-aware, and animated without forcing a dark theme.

Marketplace shop-by-brand data is separate from this marketing directory. It is
backed by `shop_by_brands`, generated from seller-entered `products.brand`, and
uses normalized `brand_slug` values for exact product matching.

## Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/brands` | `BrandsPage.jsx` | Public filterable brand directory. |
| `/brands/:brandId` | `BrandDetail.jsx` | Public live listings for one directory brand. |
| `/products/shop-by-brands` | Showcase/collection route | Marketplace brand discovery from `shop_by_brands`. |
| `/products/shop-by-brands/:brand` | Showcase/collection route | Marketplace products for one normalized brand slug. |

The routes are registered separately in `src/Router/router.jsx`, lazy-loaded
under `MarkettingLayout`, and use `GenericPageSkeleton` while loading.

## Data Boundary

Editorial directory content lives in `data/brandsData.js`. This includes brand
names, aliases, categories, images, descriptions, filters, navigation links,
and SEO copy.

Brand detail product cards are not hardcoded. `BrandDetail.jsx` reads the
existing `ProductsAPI.getAll()` query through `useAllProducts()`, then
`utils/brandUtils.js` matches active sellable listings against the selected
brand aliases.

Shop-by-brand commerce data does not use `data/brandsData.js`. The database
owns that surface:

- `products.brand` is seller-entered during product creation.
- `products.brand_slug` stores the normalized, indexed lookup key.
- `shop_by_brands.brand_slug` is unique, so the same brand cannot be inserted
  multiple times under the same normalized spelling.
- `get_shop_brand_products(brand_slug, limit, offset)` returns only active
  products whose `brand_slug` exactly matches the requested brand.

This prevents `/products/shop-by-brands/{brand}` from showing unrelated
products and avoids fetching the full catalog on the frontend.

## Image Logic

Marketing brand images in `data/brandsData.js` are curated editorial images.
They are not the source of truth for marketplace brand assets.

For marketplace shop-by-brand cards, `shop_by_brands.sample_image` is populated
from an active product image for that brand. That is an acceptable marketplace
fallback because it reflects real sellable inventory. The industry-standard
model is:

- prefer admin-approved or seller-provided official brand logos/assets;
- fall back to a representative active product image;
- never infer official brand artwork from random external images;
- keep editorial marketing imagery separate from commerce data.

## SEO

Both pages render the shared `src/Components/SEO.jsx` component.

- `/brands` publishes directory metadata, a canonical URL, and `CollectionPage`
  JSON-LD containing the editorial directory.
- `/brands/:brandId` publishes brand-specific metadata, a canonical URL, and
  `CollectionPage` JSON-LD containing live matching products.
- Unknown brand IDs publish `noindex,nofollow`.

## Structure

| File | Responsibility |
| --- | --- |
| `BrandsPage.jsx` | Composes the compact filterable directory and animated card layout. |
| `BrandDetail.jsx` | Renders a brand overview, live product cards, error states, empty states, and quick view. |
| `data/brandsData.js` | Stores editorial catalog data, filters, navigation, and directory SEO copy. |
| `utils/brandUtils.js` | Builds links, resolves brands, filters categories, and matches live products by normalized aliases. |
| `utils/_Test_/brandUtils.test.js` | Verifies links, expanded directory filtering, and product alias matching. |

## Maintenance Notes

- Add or update editorial brands only in `data/brandsData.js`.
- Add aliases when marketplace product records use multiple spellings for the
  same brand.
- Keep route construction inside `utils/brandUtils.js`.
- Do not add placeholder products to brand details. Empty live catalogs should
  keep the explicit empty state.
- Do not wire the marketing `/brands` pages directly to `shop_by_brands`.
  Marketplace shop-by-brand belongs under `/products/shop-by-brands`.
