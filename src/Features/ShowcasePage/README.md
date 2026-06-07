# ShowcasePage

Reusable merchandising surfaces for WooSho product discovery.

The folder owns two UI surfaces:

- `ShowcaseIndexPage.jsx`: a rail-based discovery index with hero slides, sticky section nav, quick add, wishlist, quick view, and `View All` links.
- `ShowcasePage.jsx`: a reusable product-list page with hero, breadcrumbs, filters, product grid, quick view, SEO, loading, error, and empty states.

## Routes

Current product routes using this feature:

- `/products/curations` renders `ShowcaseCurationIndexPage`.
- `/products/curations/:showcaseSlug` renders `ShowcaseCurationPage`.
- `/products/categories` renders `ShowcaseCategoryIndexPage`.
- `/products/categories/:categorySlug` renders `ShowcaseCategoryPage`.

The old singular `/products/curation` route was only used while testing this reusable showcase surface.

## Structure

- `Components/` contains Showcase-named UI pieces only:
  - `ShowcaseHeroBanner`
  - `ShowcaseTopbar`
  - `ShowcaseSection`
  - `ShowcaseRail`
  - `ShowcaseProductCard`
  - `ShowcaseDealSection`
  - `ShowcaseHero`
  - `ShowcaseProductGrid`
  - `ShowcaseStates`
- `Hooks/` contains local helpers for fonts, filtering, intersection visibility, and product cache seeding.
- `utils/showcaseAdapters.js` turns backend curation/category data into index sections.
- `utils/showcaseProduct.js` normalizes product image, price, discount, variant, and route behavior.
- `data.js` keeps the default static Showcase data.

## Data Flow

Route containers fetch data and pass plain props into reusable Showcase renderers:

- Curations use the existing backend curation feed APIs.
- Categories use the global product catalog and derive category groups from product category metadata.
- The index renderer receives `sections`, `heroSlides`, `topbarLabels`, `products`, and a `basePath`.
- The detail renderer receives `title`, `description`, `products`, loading/error flags, SEO path, breadcrumb labels, and copy.

`View All` links are generated from `section.path` first, then fall back to:

```txt
{basePath}/{section.id}
```

## Product Behavior

Showcase cards use global shopping behavior:

- `useAddToCart`
- `WishlistHeart`
- `QuickView`
- product-detail links to `/products/:productSlug`

Products should provide the normal global product fields where possible:

- `id`
- `slug`
- `image` or `product_images`
- `price_minor`
- `compare_at_price_minor` or `original_price_minor`
- `variant_id` or `product_variants`

Static `data.js` records are normalized into this shape so the same components can render static,
curation-backed, or category-backed products.
