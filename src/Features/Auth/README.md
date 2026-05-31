# Auth Page

This folder owns WooSho's guest authentication experience, OAuth callback, and
the account-role handoff into onboarding.

## Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/auth` | `AuthPage.jsx` | Default guest sign-in entry point. |
| `/login` | `AuthPage.jsx` | Explicit sign-in route. |
| `/signup` | `AuthPage.jsx` | Explicit account-registration route. |
| `/auth/callback` | `AuthCallBack.jsx` | Completes Google OAuth and routes the user onward. |

The form routes are nested under `GuestRoute` in `src/Router/router.jsx`.

## Registration Flow

Registration collects only:

- The selected account path: `buyer` or `seller`.
- Email address.
- Password.
- Password confirmation.
- Terms acceptance.

Buyer and seller profile details are collected later by `/onboarding`. Changing
the role selector does not remount or clear the shared credential fields.

Email registration stores the choice as Supabase user metadata under
`requested_account_role`. Google registration stores the same choice in
session storage before OAuth redirect. The onboarding page resolves that
preference through the secured `set_public_account_role` RPC and opens the
matching buyer or seller steps. Onboarding drafts are stored per user so one
account cannot inherit another account's saved progress.

## AI Widget

The global WooSho AI widget is hidden on `/auth`, `/login`, `/signup`, and
`/auth/callback`. The route exclusions live in
`src/Features/AiAssistant/WooshoAi.jsx`.

## Structure

| File | Responsibility |
| --- | --- |
| `AuthPage.jsx` | Owns the responsive auth shell and theme toggle. |
| `AuthFormComponent/AuthForm.jsx` | Coordinates mode, role selection, form submission, and post-auth navigation. |
| `AuthFormComponent/RegisterForm.jsx` | Renders the stable shared registration fields. |
| `AuthFormComponent/RoleSelector.jsx` | Selects the onboarding path without replacing the credential form. |
| `Hooks/useAuthForm.js` | Connects React Hook Form to the active Zod schema. |
| `Hooks/useAuthMutation.js` | Runs password auth, reset requests, and Google OAuth setup. |
| `Schema/userSchema.js` | Validates account credentials for registration plus login and reset inputs. |
| `utils/authRedirect.js` | Safely persists internal return paths and OAuth role preferences. |
| `../Onboarding/hooks/useOnboarding.js` | Stores onboarding drafts under a user-scoped browser key. |

## Maintenance Notes

- Keep profile, storefront, address, and payout collection inside onboarding.
- Add new public account roles to both the schema and the secured backend RPC.
- Keep OAuth return paths internal-only.
- Update `WooshoAi.jsx` if another auth-adjacent route should suppress the
  floating assistant.
