# Brands Pages

This folder owns WooSho's public brand directory and brand detail pages. The
directory is compact, filterable, theme-aware, and animated without forcing a
dark theme. Each detail page reads the existing sellable product catalog and
shows live listings that match the selected brand.

## Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/brands` | `BrandsPage.jsx` | Public filterable brand directory. |
| `/brands/:brandId` | `BrandDetail.jsx` | Public live listings for one directory brand. |

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
