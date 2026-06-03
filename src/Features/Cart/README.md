# Cart

The Cart page supports local guest carts and backend-backed customer carts. Authenticated customer pricing is server-authoritative: the browser renders the summary returned by Supabase and does not decide sale prices, discounts, shipping eligibility, or savings ticker text.

## Main Files

- `CartPage.jsx`: page composition and responsive layout.
- `Hooks/useCartPageController.js`: page orchestration, per-item action locks, saved items, notes, promo removal, and checkout navigation.
- `Components/CartRow.jsx`: quantity, remove, save, and mobile swipe interactions.
- `../../api/cartApi.js`: Supabase cart API and the guest compatibility path.
- `../../../supabase/migrations/20260602010000_complete_cart_backend.sql`: authenticated Cart backend upgrade.
- `../../../supabase/migrations/20260602020000_cart_savings_ticker_naira.sql`: Naira savings ticker compatibility wrapper for existing deployments.
- `../../../supabase/migrations/20260602030000_seller_coupons_admin_promos.sql`: admin promo codes and seller product coupons.

## Backend Contract

Run the Cart migrations in order before using the upgraded authenticated Cart features:

1. `20260602010000_complete_cart_backend.sql`
2. `20260602020000_cart_savings_ticker_naira.sql`
3. `20260602030000_seller_coupons_admin_promos.sql`

The migration adds:

- `get_cart_summary`: line prices, totals, persisted promo, shipping progress, savings ticker text, and order note.
- `update_cart_item_quantity`: stock-checked quantity updates.
- `update_cart_order_note`: persisted notes with a 500-character limit.
- `saved_cart_items`: customer-owned saved items with transactional save and move RPCs.
- Checkout promo handoff: checkout uses the cart promo when no explicit checkout promo is supplied.
- Order note snapshotting: a cart note is copied onto the created order.

Promo codes stay buyer-facing as "Promo Code" in the UI. The backend decides what the code means:

- Admin-created `promo_codes` apply cart-wide.
- Seller-created `coupons` apply only to the seller products attached to that coupon.
- The frontend renders only the returned summary; it does not calculate authenticated discounts, shipping eligibility, or savings ticker text.

## Interaction Rules

- Row actions are locked per item, not globally. Updating one product does not disable unrelated products.
- Swipe delete keeps the existing left-swipe behavior, but disables momentum and snaps back when the delete threshold is not reached.
- Quantity, remove, and save controls stop pointer propagation so a tap cannot accidentally begin a swipe.
- Duplicate save, move, remove, quantity, promo-remove, and undo actions are ignored while their request is active.

## Guest Cart

Guests cannot persist server cart records before authentication, so their items, saved items, and note stay in local storage. Guest totals use the storefront pricing data returned for those local items. When a buyer signs in, the existing cart merge flow moves guest items into the backend cart.

## Loading UI

Cart loaders use the shared dark hibernating-wave skeleton theme from `src/Components/Fallback/SkeletonBase.jsx`. The route fallback mirrors the Cart header, ticker, shipping bar, rows, note block, and order summary layout.
