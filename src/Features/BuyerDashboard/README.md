# Buyer Dashboard

The buyer dashboard lives at `/account` for authenticated buyer accounts. It uses
TanStack Query for server data, Zustand for dashboard navigation state, and the
shared cart context for cart mutations.

## Backend Setup

Apply `supabase/migrations/20260530160000_complete_buyer_dashboard.sql` after the
earlier migrations. It adds:

- Customer-scoped `wishlist_alerts`.
- Price-drop and back-in-stock notification triggers.
- Paginated `get_buyer_orders`.
- Paid-only `get_paid_order_receipt`.
- `get_buyer_spending` for paid, non-cancelled orders.
- `get_buyer_reorder_suggestions` from previous paid orders.

Then apply
`supabase/migrations/20260531120000_fix_buyer_dashboard_recommendation_prices.sql`
and
`supabase/migrations/20260531130000_fix_active_sale_cart_checkout_and_variant_inheritance.sql`.
They keep Picked For You, AI reorder suggestions, cart totals, and checkout on
one pricing rule: active product sale, explicit variant override, then product
base price. Variants without an override inherit later base-price edits.

Then apply
`supabase/migrations/20260531140000_expand_buyer_spending_ranges.sql`.
It adds an order-backed lifetime total and complete daily, weekly, monthly, and
yearly spending series for paid, non-cancelled orders.

Then apply
`supabase/migrations/20260531150000_add_buyer_suggestion_fallbacks.sql`.
It ranks Picked For You cards from saved recommendations, paid-order category
activity, and the live sellable catalog. Reorder suggestions prefer exact
repeat purchases and use sellable alternatives from previously purchased
categories when an older product is no longer available.

The RPC functions call `private.assert_customer_session()`, so admin-only
sessions cannot use buyer activity endpoints.

## Functional Tabs

- **Dashboard:** "Picked For You" recommendations add sellable variants through
  the shared cart mutation layer. When personalized rows are empty, the section
  falls back to current sellable catalog products. Smart insights fall back to
  real account activity. Empty sources render `No available data`.
- **Orders:** Orders are loaded ten at a time. AI reorder suggestions use paid
  orders and currently sellable products, including category-related
  alternatives when an older purchase is unavailable. Explicit loading,
  failure, and empty states keep the panel usable. Buy-again uses snapshotted
  order items. Receipt downloads are available only when the backend reports a
  paid order.
- **Notifications:** Read, mark-all-read, and dismiss actions persist to
  Supabase.
- **Wishlist:** Cards link to product detail pages, add available products to
  cart, save price-drop alerts, save back-in-stock alerts, and expose loading,
  failure, and empty states for reorder suggestions.
- **Spending:** Category totals and selectable daily, weekly, monthly, and
  yearly charts are calculated from paid, non-cancelled orders. Empty and
  failed sources render visible fallback cards.

## Failure Handling

The dashboard has route, provider, and panel error boundaries. Missing RPC
fields are normalized to empty collections or zero values. Query failures leave
the dashboard shell usable and expose retry actions.
