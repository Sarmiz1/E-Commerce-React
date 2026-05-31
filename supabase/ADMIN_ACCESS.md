# Admin Access

Admin access is separate from public buyer and seller registration. Never expose
`SUPABASE_SERVICE_ROLE_KEY` in browser code or rename it with a `VITE_` prefix.

## Promote An Existing Account

1. Create the person's Supabase Auth account through the normal signup flow or
   the Supabase dashboard.
2. Run the promotion command from a trusted local environment:

```powershell
npm run admin:promote -- admin@example.com "Admin Name" super_admin
```

3. Sign in through `/login`, then open `/admin`.

The database enum validates the admin role. Supported values are
`super_admin`, `support_lead`, `finance_manager`, and `content_mod`.

## Promote From The Admin Console

After `supabase/migrations/20260530140000_expand_admin_dashboard_operations.sql`
is applied, super admins have an **Admin Promotion** tab that is completely
hidden from other roles. The first super admin configures a six-digit promotion
passcode in that tab, then supplies it whenever an existing Auth account is
promoted.

The passcode is an additional control, not a replacement for account passwords
or MFA. PostgreSQL stores only a bcrypt hash in the private schema. Repeated
failed promotion or passcode-rotation attempts cause a temporary lockout.

## Database Protection

Apply pending migrations before promoting an account:

```powershell
npx supabase db push
```

The admin route reads membership from `public.admin_users`. Public account
metadata is treated only as an onboarding preference and is never used to grant
admin access.
