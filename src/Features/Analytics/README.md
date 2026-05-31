# Analytics Page

This folder owns WooSho's public commerce-intelligence page. It presents a
compact marketplace snapshot, explains the discovery infrastructure already
used by the storefront, and provides a working partnership lead form.

## Route

| Route | Component | Purpose |
| --- | --- | --- |
| `/analytics` | `AnalyticsPage.jsx` | Public live marketplace snapshot and partnership entry point. |

The route is registered in `src/Router/router.jsx`, lazy-loaded under
`DefaultLayout`, and uses `GenericPageSkeleton` while loading.

## Public Data Boundary

The page intentionally avoids private business metrics. Revenue, customers,
orders, and role-specific operational analytics remain inside protected
dashboards.

`Hooks/useMarketplaceSnapshot.js` derives the public counters from existing
TanStack Query sources:

| Source | Existing API | Metrics |
| --- | --- | --- |
| Sellable product feed | `ProductsAPI.getAll()` | Live products, represented storefronts, represented categories, available variant units, product review records, and represented verified storefronts. |
| Active curation feed | `CurationsAPI.getAll()` | Active curations and curation placements. |

If a public source cannot load, its cards display `Unavailable`. The page does
not replace missing data with hardcoded estimates.

## SEO

`AnalyticsPage.jsx` renders the shared `src/Components/SEO.jsx` component.
Static metadata lives in `utils/analyticsData.js` under `ANALYTICS_SEO`.

The page publishes:

- A title, meta description, and keyword list.
- A canonical `/analytics` URL based on the active site origin.
- Open Graph and Twitter metadata through the shared SEO component.
- `WebPage` JSON-LD describing the commerce-intelligence page.

## Partnership CTA

The hero actions use explicit in-page scrolling so mobile taps stay on
`/analytics`. `Partner with WooSho` scrolls to `#partner-form`. The form reuses
`src/Features/Marketting/Components/LeadCaptureForm.jsx` with
`audience="partner"`.

Submissions are written to the local `woosho.marketing.leads` queue first, then
sent to the configured Supabase `marketing_leads` table when that table is
available. A direct `partners@woosho.com` email link remains visible beside the
form.

## Structure

| File | Responsibility |
| --- | --- |
| `AnalyticsPage.jsx` | Composes SEO, live snapshot cards, verified capability copy, compact data-flow content, and the partnership form. |
| `Hooks/useMarketplaceSnapshot.js` | Reads existing public queries and derives marketplace counters. |
| `utils/analyticsData.js` | Stores navigation, SEO copy, card configuration, and capability content. |
| `utils/_Test_/analyticsData.test.js` | Verifies snapshot aggregation and empty-feed behavior. |

## Maintenance Notes

- Add public counters only when they can be derived from public records.
- Do not expose protected dashboard RPCs from this page.
- Keep capability copy aligned with implemented search, recommendation, and
  curation behavior.
- Preserve explicit loading and unavailable states when adding data sources.
