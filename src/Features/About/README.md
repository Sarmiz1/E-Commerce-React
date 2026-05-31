# About Page

This folder owns WooSho's public About page. It explains the marketplace
problem, the AI-assisted shopping approach, the buying flow, the platform
differences, the long-term vision, and the trust model.

## Route

| Route | Component | Purpose |
| --- | --- | --- |
| `/about` | `AboutPage.jsx` | Public company and platform overview. |

The route is registered in `src/Router/router.jsx`, lazy-loaded under
`DefaultLayout`, and uses `GenericPageSkeleton` while loading.

## SEO

`AboutPage.jsx` renders the shared `src/Components/SEO.jsx` component. Static
copy lives in `utils/data.js` under `ABOUT_SEO`.

The page publishes:

- A page title, meta description, and keyword list.
- A canonical `/about` URL based on the active site origin.
- Open Graph and Twitter metadata through the shared SEO component.
- `AboutPage` JSON-LD with WooSho as the main `Organization`.

Keep the visible hero copy and `ABOUT_SEO.description` aligned when the page
positioning changes.

## Structure

| File | Responsibility |
| --- | --- |
| `AboutPage.jsx` | Composes metadata, navigation, sections, theme styles, and reveal animations. |
| `Components/AboutHero.jsx` | Introduces the platform and primary buyer and seller actions. |
| `Components/ProblemsSection.jsx` | Frames the shopping problems WooSho addresses. |
| `Components/SolutionSection.jsx` | Explains the AI-assisted commerce approach. |
| `Components/HowItWorksSection.jsx` | Shows the three-step shopping flow. |
| `Components/DifferencesSection.jsx` | Lists the platform's differentiators. |
| `Components/VisionSection.jsx` | States the Nigeria-first, global-commerce vision. |
| `Components/TrustSection.jsx` | Presents payment, seller, logistics, and transaction trust pillars. |
| `Components/AboutCtaSection.jsx` | Closes with shopping, seller, and infrastructure actions. |
| `Hooks/useAboutRevealAnimations.js` | Applies scoped GSAP reveal animations and cleans them up on unmount. |
| `Hooks/useSellerCtaHref.js` | Routes signed-in users to `/account` and guests to `/signup`. |
| `utils/data.js` | Stores navigation links, SEO copy, steps, differentiators, and trust content. |
| `utils/STYLES.js` | Maps the active application theme to About-specific CSS variables. |

## Styling And Animation

The page uses Tailwind classes plus CSS variables returned by
`useAboutStyles()`. Light and dark mode values come from the shared Zustand
theme store.

Sections animated on scroll use `.reveal-up` or `.stagger-grid`.
`useAboutRevealAnimations()` scopes GSAP selectors to the page root and reverts
the animation context when the page unmounts.

## Maintenance Notes

- Add reusable About copy and card data to `utils/data.js`.
- Keep buyer actions pointed at `/products` or `/ai-shop`.
- Use `useSellerCtaHref()` for seller actions so signed-in and guest flows stay
  consistent.
- Preserve the scoped GSAP cleanup when adding animated sections.

