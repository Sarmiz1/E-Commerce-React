# ShowcasePage

Reusable merchandising showcase for curated product rails, hero slides, quick add,
wishlist, quick view, and product-detail navigation.

## Structure

- `ShowcaseIndexPage.jsx` composes the page and exports `ShowcasePage` for reuse.
- `data.js` owns the hero slides, section data, topbar labels, and normalized product records.
- `Components/` contains the hero, topbar, section, scroller, product card, deal-of-day, countdown, and star UI pieces.
- `Hooks/` contains local page helpers for fonts, intersection visibility, and seeding static Showcase products into the global React Query product cache.

## Product Behavior

Each item in `data.js` is normalized into the global product shape with:

- `id`
- `slug`
- `image` and `images`
- `price_minor`, `compare_at_price_minor`, and `original_price_minor`
- `variant_id`
- `product_variants` and `variants`

Cards use the shared `WishlistHeart`, `QuickView`, and `useAddToCart` hook. Product images,
names, deal tiles, and featured deal content link to `/products/:productSlug`.

## Reuse

Import the reusable page when another Showcase surface needs the same layout with different data:

```jsx
import { ShowcasePage } from "./ShowcaseIndexPage";

<ShowcasePage
  heroSlides={heroSlides}
  sections={sections}
  topbarLabels={labels}
  products={products}
  topbarOffset={0}
/>
```

When replacing the static Showcase records with backend products, keep the normalized fields above
or pass records that already match the global product shape.
