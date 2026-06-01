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

Then apply
`supabase/migrations/20260601000000_complete_buyer_account_backend.sql`.
It adds responsive spending indexes, latest-activity chart windows, catalog
guidance for buyers without paid-order history, backend-owned address and
masked payment-method CRUD, verified-purchase review opportunities, and
backend-owned account settings. It also separates buyer phone numbers from
addresses, enforces at most two unique numbers per buyer, and limits saved
masked cards to two per buyer.

Then apply
`supabase/migrations/20260601020000_strict_buyer_phone_numbers.sql`.
It stores buyer numbers as required `country_code` and local `phone_number`
columns, derives globally unique E.164 values such as `+2348034157476`, and
prevents buyers from deleting their final saved number. Legacy accounts
without a number must add one; the migration does not invent contact data. The
backend accepts a local leading zero, so `08034157476` is normalized and stored
as `8034157476` alongside country code `234`.

Then apply
`supabase/migrations/20260601030000_secure_buyer_account_actions.sql`.
It routes address, masked payment-method, default-phone, account-email, and
account-deletion changes through the same two-step security boundary. Direct
browser execution of the older mutation RPCs is revoked so the approval step
cannot be skipped.
Authenticated browser sessions also keep read-only table access to addresses
and masked payment methods; direct table writes are revoked.

Sensitive account requests use two steps:

1. The `buyer-phone-confirmation` Edge Function validates the buyer password,
   creates a ten-minute pending action, and sends a six-digit code with Resend
   for phone-number add, edit, and delete requests. The
   `buyer-account-confirmation` Edge Function does the same for addresses,
   masked payment methods, default-phone selection, account-email updates, and
   account deletion.
2. `approve_buyer_phone_number_action` validates the code and applies the
   pending phone-number change. `approve_buyer_sensitive_action` applies the
   remaining secured changes. Codes are hashed at rest and limited to five
   attempts.

Configure and deploy the Edge Function with:

```powershell
npx supabase secrets set RESEND_API_KEY=... RESEND_FROM_EMAIL="WooSho Security <security@your-verified-domain>"
npx supabase functions deploy buyer-phone-confirmation --no-verify-jwt
npx supabase functions deploy buyer-account-confirmation --no-verify-jwt
```

For development without a verified domain, Resend's
`WooSho Security <onboarding@resend.dev>` sender can be used temporarily. It
only sends to the email address associated with the Resend account. Configure a
verified domain sender before opening secured actions to production users.

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
  failure, and empty states keep the panel usable. Reorder cards include live
  images, descriptions, regular prices, and active sale prices. Buy-again uses
  snapshotted order items. Receipt downloads are available only when the
  backend reports a paid order.
- **Notifications:** Read, mark-all-read, and dismiss actions persist to
  Supabase.
- **Wishlist:** Cards link to product detail pages, add available products to
  cart, save price-drop alerts, save back-in-stock alerts, and expose loading,
  failure, and empty states for reorder suggestions.
- **Spending:** Category totals and selectable daily, weekly, monthly, and
  yearly charts are calculated from paid, non-cancelled orders. Empty and
  failed sources render visible fallback cards.
- **Addresses:** React Hook Form and Zod validate add and edit forms. A custom
  animated dropdown selects the delivery country and normalizes legacy country
  labels to ISO codes. Create, edit, set-default, and remove actions require a
  password first and an email confirmation code before the backend applies
  them. Phone numbers are managed separately with the same secured behavior.
- **Payment Methods:** Buyers enter cardholder name, card number, expiry, CVV,
  and account password through a React Hook Form and Zod form. Saved-card
  mutations require email-code approval and persist only cardholder name,
  brand, last four digits, and expiry. Raw card numbers and CVVs are never
  stored by the dashboard.
- **Reviews:** Paid purchases become review opportunities. Posted reviews are
  persisted by a verified-purchase RPC, and empty sources render
  `No available data`.
- **Account:** React Hook Form and Zod validate profile edits, preferences,
  optional avatar uploads, password rotations, locked-email updates, and typed
  account deletion. Profile data and preferences persist through
  customer-scoped RPCs. Email starts read-only and uses its own update form:
  password verification, a code sent to the current account email, then
  Supabase Auth confirmation from the new address. Password updates stay with
  Supabase Auth, avatar files use a per-user Supabase Storage path, and account
  deletion requires password and email-code approval.

## Failure Handling

The dashboard has route, provider, and panel error boundaries. Missing RPC
fields are normalized to empty collections or zero values. Query failures leave
the dashboard shell usable and expose retry actions.
