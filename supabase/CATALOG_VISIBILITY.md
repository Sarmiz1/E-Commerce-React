# Catalog Visibility

Public catalog visibility is enforced by:

`migrations/20260530090000_enforce_sellable_product_visibility.sql`

Run that migration in the Supabase SQL Editor after the earlier timestamped
migrations. It is intentionally database-owned so storefront correctness does
not depend on a specific React page remembering to filter products.

## Rules

- A public catalog product must be active and have at least one active variant
  with `stock_quantity > 0`.
- When the final sellable variant runs out, the database marks the product
  inactive automatically.
- A direct attempt to publish a zero-stock product remains inactive.
- A product hidden automatically for inventory can return when stock is
  restored.
- A product unpublished manually stays unpublished when stock changes.
- Similar-product recommendations follow the same sellable-product rule.
- Cart inserts and quantity updates reject inactive variants, mismatched
  product/variant pairs, and quantities above current stock.

The React catalog loaders also discard unavailable products and variants as a
defense against stale query caches and incomplete backend deployments.
