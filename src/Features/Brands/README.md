# Brands Pages

This folder owns WooSho's public brand directory and editorial brand detail
pages. The directory keeps its full-bleed dark design, adds smooth animated
category filtering, and exposes a broader label catalog. Each detail page
introduces the selected label and links into the dedicated shop-by-brand flow.

## Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/brands` | `BrandsPage.jsx` | Public filterable brand directory. |
| `/brands/:brandId` | `BrandDetail.jsx` | Public editorial profile for one directory brand. |

The routes are registered separately in `src/Router/router.jsx`, lazy-loaded
under `MarkettingLayout`, and use `GenericPageSkeleton` while loading.

## Data Boundary

Editorial directory content lives in `data/brandsData.js`. This includes brand
names, aliases, categories, images, descriptions, filters, navigation links,
SEO copy, and curated `relatedBrandIds`.

Brand detail pages intentionally do not render product cards, quick view, or
cart actions. Their `Shop {brand}` action links to
`/products/curations/shop-by-brands/:brandId` so commerce remains in the
shop-by-brand marketplace flow.

## SEO

Both pages render the shared `src/Components/SEO.jsx` component.

- `/brands` publishes directory metadata, a canonical URL, and `CollectionPage`
  JSON-LD containing the editorial directory.
- `/brands/:brandId` publishes brand-specific metadata, a canonical URL, and
  `Brand` JSON-LD.
- Unknown brand IDs publish `noindex,nofollow`.

## Structure

| File | Responsibility |
| --- | --- |
| `BrandsPage.jsx` | Composes the editorial directory, featured label section, sticky filters, and animated card layout. |
| `BrandDetail.jsx` | Renders an editorial profile, related labels, and the dedicated shop-by-brand action. |
| `data/brandsData.js` | Stores editorial catalog data, filters, navigation, and directory SEO copy. |
| `utils/brandUtils.js` | Builds links, resolves brands, filters categories, and matches live products by normalized aliases. |
| `utils/_Test_/brandUtils.test.js` | Verifies links, expanded directory filtering, and product alias matching. |

## Maintenance Notes

- Add or update editorial brands only in `data/brandsData.js`.
- Add aliases when marketplace product records use multiple spellings for the
  same brand.
- Use `relatedBrandIds` to curate the labels shown in each profile's `Related labels`
  section. Same-category labels are used only as a fallback.
- Keep route construction inside `utils/brandUtils.js`.
- Keep product cards, quick view, and cart controls in `/products` shop flows
  rather than brand profile pages.
