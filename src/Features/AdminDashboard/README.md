# Admin Dashboard

This folder contains the production admin console for the ecommerce platform.
The console reads live data from Supabase, exposes role-aware operational
modules, and keeps authorization checks in PostgreSQL instead of trusting the
browser.

## Active Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/admin/login` | `AdminLoginPage.jsx` | Dedicated sign-in page for existing admin accounts. |
| `/admin` | `AdminModernDashboard/AdminModernDashboard.jsx` | Lazy-loaded production dashboard. |

Both routes are registered in `src/Router/router.jsx`. The dashboard route uses
`DashboardSkeleton` as its hydration fallback and is nested under
`src/Router/Guards/AdminRoute.jsx`.

`AdminSimpleDashboard/AdminSimpleDashboard.jsx` is an older prototype. It is
retained for reference, is not routed, and should not be extended as the
production dashboard.

## Authentication Flow

An admin is a normal Supabase Auth user with an additional active row in
`public.admin_users`. Public signup must never grant admin privileges.

When a browser visits `/admin`:

1. `AdminRoute.jsx` reads the current Supabase session from the auth store.
2. It fetches `admin_users` membership with the TanStack Query key
   `["admin-role", user.id]`.
3. An unauthenticated user is redirected to `/admin/login`.
4. A signed-in user without active admin membership is also redirected to
   `/admin/login`.
5. An active admin receives the dashboard through `<Outlet />` context.

`src/api/adminApi.js` owns the authentication-facing API:

| Method | Responsibility |
| --- | --- |
| `getCurrentAdmin(userId)` | Returns active membership for the current user. |
| `listAdmins()` | Reads registered admin accounts. |
| `signIn(email, password)` | Signs in with Supabase Auth, verifies active admin membership, and signs out rejected users. |
| `signOut()` | Ends the current Supabase session. |

## State Ownership

The dashboard follows the project state boundaries:

| State type | Owner | Examples |
| --- | --- | --- |
| Server state | TanStack Query | Dashboard payload, activity feed, mutation lifecycle, cache invalidation. |
| Shared application UI state | Zustand | Existing cross-feature auth and UI stores. |
| Dashboard-local UI state | Component or controller state | Active tab, dropdown visibility, filters, input text, temporary toast messages. |

Do not copy backend records into Zustand. Add React context only when a future
dashboard subtree needs local shared state that cannot remain in its nearest
controller.

## Frontend Structure

### Dashboard Shell

`AdminModernDashboard/AdminModernDashboard.jsx` is intentionally small. It
connects the controller to the shell:

| File | Responsibility |
| --- | --- |
| `hooks/useAdminDashboardController.js` | Owns active module state, local module transition state, local toast messages, current admin presentation, and logout navigation. |
| `components/AdminDashboardShell.jsx` | Composes the sidebar, top bar, active module area, loading transition, toast container, and mobile drawer state. |
| `components/AdminSidebar.jsx` | Renders role-aware module navigation. On mobile it becomes an off-canvas drawer with overlay, close-button, Escape-key, and module-selection dismissal. |
| `components/AdminTopBar.jsx` | Renders the active module title, module search, backend status, activity dropdown, logout action, and mobile drawer trigger. |
| `hooks/useAdminActivityFeed.js` | Reads backend activity through TanStack Query, owns dropdown visibility, and maps activity types to presentation colors. |
| `constants/adminDashboardConfig.js` | Stores dashboard colors, styles, module titles, navigation metadata, and frontend role presentation. |

The role configuration in `adminDashboardConfig.js` improves the interface.
It is not the authorization boundary. PostgreSQL independently protects data
and mutations.

### Responsive Layout

Desktop keeps the full sidebar, charts, and status controls. At tablet widths,
wide chart groups collapse to one column. At mobile widths, the sidebar becomes
a drawer, the header keeps only essential controls, stat cards use a compact
grid, tables scroll horizontally, AI input actions stack, notifications fit the
viewport, and hiring columns collapse into a readable single-column flow.

### Server Queries

`hooks/useAdminDashboardQueries.js` is the TanStack Query adapter:

| Hook | Backend action |
| --- | --- |
| `useAdminDashboard()` | Fetches the aggregate dashboard payload with key `["admin-dashboard"]`. |
| `useSetAdminOrderStatus()` | Updates an order status. |
| `useSetAdminProductActive()` | Activates or deactivates a product. |
| `useSetAdminSellerStatus()` | Updates seller approval state. |
| `useSetAdminSupportTicketStatus()` | Resolves or escalates a support ticket. |
| `useMoveAdminHiringCandidate()` | Advances a hiring candidate to another stage. |
| `useQueueAdminAiQuery()` | Adds an AI analysis request to the backend queue. |

Every successful mutation invalidates `["admin-dashboard"]`, so each module
refreshes from the backend instead of manually patching copied data.

### Dashboard Modules

`components/modules/AdminDashboardModules.jsx` contains small shared UI
building blocks and the operational modules. It renders loading, error, empty,
and access-denied states consistently.

| Module | Backend data displayed | Available actions |
| --- | --- | --- |
| Dashboard | Summary metrics, paid revenue, pending unpaid value, seven-day paid revenue, category merchandise sales, recent activity. | Read-only overview. |
| Orders | Orders and status details. | Ship or cancel an order. |
| Products | Product catalog records and active state. | Activate or deactivate a product. |
| Users | Buyer and seller records. | Switch between buyer and seller views. |
| Sellers | Seller profiles and approval state. | Activate, suspend, or reset seller state. |
| Analytics | Revenue, order, user, product, growth, and funnel metrics. | Read-only reporting. |
| Support | Admin support tickets. | Resolve or escalate a ticket. |
| AI Insights | Queue size, product search signals, recent AI requests, statuses, and responses. | Queue a new AI analysis prompt. |
| Hiring | Backend-defined hiring stages and candidates. | Move a candidate to the next stage. |
| Settings | Admin accounts, integrations, and platform settings. | Read-only until dedicated mutation RPCs are added. |

Shared micro components in the module file include `Badge`, `Btn`, `Card`,
`Stat`, `Stats`, `Table`, `Td`, `PanelMessage`, `ModuleLoader`, `Toast`,
`AccessDenied`, and `Bars`.

## Backend Contract

`src/api/adminDashboardApi.js` is the only frontend API layer for dashboard
operations. It calls secured Supabase RPCs and throws backend errors for
TanStack Query to handle.

| Frontend method | PostgreSQL RPC |
| --- | --- |
| `getDashboard()` | `get_admin_dashboard` |
| `setOrderStatus(orderId, status)` | `admin_set_order_status` |
| `setProductActive(productId, active)` | `admin_set_product_active` |
| `setSellerStatus(sellerId, status)` | `admin_set_seller_status` |
| `setSupportTicketStatus(ticketId, status, escalate)` | `admin_set_support_ticket_status` |
| `moveHiringCandidate(candidateId, stage)` | `admin_move_hiring_candidate` |
| `queueAiQuery(prompt)` | `admin_queue_ai_query` |

The aggregate `get_admin_dashboard` RPC returns a role-scoped payload for the
current admin. The frontend does not fabricate records when a section is empty.
Empty backend tables produce explicit empty states.

### Revenue Semantics

Revenue reporting counts orders only when `payment_status = 'paid'` and
`status <> 'cancelled'`. Unpaid pending orders are excluded from revenue and
returned separately as `stats.pendingUnpaidValueMinor`.

Category and seller sales sum paid, non-cancelled `order_items.total_minor`.
These values represent merchandise sales. They may differ from paid revenue
because final order totals can also include shipping and tax and can subtract
order-level discounts.

The dashboard chart shows the current seven-day window when paid activity exists
within that period. If the current period is empty, `get_admin_paid_sales_chart`
anchors the chart to the latest recorded paid activity and the UI labels that
historical window explicitly.

## Backend Migration

Apply the admin migrations before using the dashboard:

| Migration | Purpose |
| --- | --- |
| `supabase/migrations/20260530000000_harden_admin_access.sql` | Adds hardened admin membership and access rules. |
| `supabase/migrations/20260530010000_admin_dashboard_backend.sql` | Adds dashboard RPCs, mutation RPCs, backend-owned operational tables, seller status, RLS, and role checks. |
| `supabase/migrations/20260530020000_align_admin_revenue_metrics.sql` | Updates dashboard reporting so revenue uses paid, non-cancelled orders and pending unpaid order value remains separate. |
| `supabase/migrations/20260530040000_fix_admin_paid_sales_chart_window.sql` | Adds a paid-sales chart RPC that falls back to the latest recorded activity window when the current seven-day window is empty. |

The dashboard backend migration adds:

| Table | Purpose |
| --- | --- |
| `admin_support_tickets` | Support work queue. |
| `admin_hiring_candidates` | Hiring pipeline records. |
| `admin_platform_integrations` | Platform integration status. |
| `admin_platform_settings` | Backend-owned platform configuration. |
| `admin_activity_log` | Operational activity feed. |
| `admin_ai_queries` | Queued AI analysis requests and responses. |

It also adds private assertion helpers that verify active membership and
required roles before privileged operations run. RLS policies and RPC checks
remain authoritative even if frontend code is modified.

## Role Presentation

The frontend currently presents these module groups:

| Role | Visible modules |
| --- | --- |
| `super_admin` | All modules, including AI Insights, Hiring, and Settings. |
| `support_lead` | Dashboard, Orders, Support, Users. |
| `finance_manager` | Dashboard, Orders, Analytics, Settings. |
| `content_mod` | Dashboard, Products, Sellers. |

Treat this as interface configuration. Update PostgreSQL authorization rules
when adding or changing privileged capabilities.

## AI Insights

The AI Insights tab is backend-driven and currently implements a queue, not an
in-browser AI client. A super admin can submit a prompt through
`admin_queue_ai_query`. A trusted server worker or Supabase Edge Function
should process pending `admin_ai_queries` rows and write the resulting status
and response back to the database.

Never place AI provider secrets or the Supabase service role key in frontend
environment variables.

## Setup

Apply the database migrations:

```powershell
npx supabase login
npx supabase link
npx supabase db push
```

Create an admin by promoting an existing Supabase Auth account from a trusted
local environment:

```powershell
npm run admin:promote -- admin@example.com "Admin Name" super_admin
```

Then sign in at `/admin/login`.

`scripts/promote-admin.mjs` requires trusted environment credentials. Never
expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code, commit it, or send it to
the browser.

## Extending The Dashboard

To add a backend-driven capability:

1. Add or update the secured SQL RPC and RLS policy in a new migration.
2. Add the RPC wrapper to `src/api/adminDashboardApi.js`.
3. Add a TanStack Query mutation hook in `useAdminDashboardQueries.js`.
4. Add the smallest useful module component or control.
5. Add navigation metadata and frontend role presentation only if needed.
6. Verify loading, error, empty, permission-denied, and successful mutation
   states.

Keep server data in TanStack Query, keep shared UI state in Zustand, and keep
module-local controls close to the module that owns them.
