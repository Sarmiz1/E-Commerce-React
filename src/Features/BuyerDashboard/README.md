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

The RPC functions call `private.assert_customer_session()`, so admin-only
sessions cannot use buyer activity endpoints.

## Functional Tabs

- **Dashboard:** "Picked For You" recommendations add sellable variants through
  the shared cart mutation layer. When personalized rows are empty, the section
  falls back to current sellable catalog products. Smart insights fall back to
  real account activity. Empty sources render `No available data`.
- **Orders:** Orders are loaded ten at a time. Buy-again uses snapshotted order
  items. Receipt downloads are available only when the backend reports a paid
  order.
- **Notifications:** Read, mark-all-read, and dismiss actions persist to
  Supabase.
- **Wishlist:** Cards link to product detail pages, add available products to
  cart, save price-drop alerts, and save back-in-stock alerts.
- **Spending:** Category and monthly charts are calculated from paid,
  non-cancelled orders.

## Failure Handling

The dashboard has route, provider, and panel error boundaries. Missing RPC
fields are normalized to empty collections or zero values. Query failures leave
the dashboard shell usable and expose retry actions.
