# Careers

The Careers feature exposes current WooSho vacancies at `/careers` and a
reusable application form at `/careers/apply`. Editorial copy remains in the
frontend data file. Operational hiring data comes from Supabase and is managed
from the admin Hiring module.

## Frontend Structure

| File | Responsibility |
| --- | --- |
| `CareersPage.jsx` | Small page composer for SEO, navigation, and Careers sections. |
| `ApplicationForm.jsx` | Application route shell and vacancy loading. |
| `components/CareersSections.jsx` | Responsive landing-page micro components. |
| `components/CareerApplicationForm.jsx` | Reusable RHF/Zod application form, backend-defined questions, custom dropdowns, and document submission. |
| `data/careersData.js` | Stable editorial copy, SEO metadata, navigation, and display labels. |
| `data/careerApplicationData.js` | Lightweight country/city options and immediate baseline questions for resilient rendering. |
| `api/careersApi.js` | Public Careers RPC calls and Cloudinary Edge upload request. |
| `hooks/useCareersQueries.js` | TanStack Query adapters for vacancies, question definitions, and submission. |
| `schema/careerApplicationSchema.js` | Zod schema factory that includes backend-defined question validation. |
| `utils/careerSecurity.js` | Browser-side safe HTTPS URL rules and document constraints. |

The shared `src/Components/Ui/FileUpload.jsx` component uses `react-dropzone`.
It supports accepted MIME types and extensions, maximum file size, single or
multiple selection, configurable file limits, selection errors, replacement,
removal, disabled state, and upload progress.

## Backend Setup

Apply:

```powershell
npx supabase db push
npx supabase functions deploy careers-application --no-verify-jwt
```

The migration `supabase/migrations/20260602000000_complete_careers_backend.sql`
extends the existing admin hiring pipeline with:

- Public read-only RPCs for open vacancies and active application questions.
- Vacancy summaries, descriptions, responsibilities, requirements, and
  technical-role flags.
- Shared, talent-pool, and per-role configurable questions.
- Applicant answers and restricted Cloudinary document metadata.
- Admin RPCs for vacancy editing and role-question management.
- An extended admin Hiring payload for application review.

The Edge Function uses the existing server-only Cloudinary secrets:

```powershell
npx supabase secrets set CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=...
```

## Document Security

CV and cover-letter files are uploaded as restricted Cloudinary `raw/private`
assets under `woosho/careers`. The browser never receives Cloudinary signing
credentials. Only an authenticated active `super_admin` can request a
five-minute Cloudinary download link from the Edge Function.

The browser and Edge Function both enforce PDF, DOC, or DOCX type rules and a
5MB limit. The Edge Function also checks the initial file signature, sanitizes
filenames, validates required questions, rejects suspicious URL schemes,
credentials, localhost names, and private IPv4 addresses, and rate-limits
duplicate applications for the same email and role to one per 24 hours.

These checks reduce obvious abuse but do not replace malware scanning. Add a
dedicated scanning service before presenting documents as trusted content in a
high-volume production environment.

## Admin Workflow

The existing admin Hiring module now supports:

- Creating and editing vacancy details.
- Opening, closing, and reopening vacancies.
- Marking technical roles so applicants must provide a safe public HTTPS
  live-project URL.
- Adding, editing, and deleting per-role questions, including dropdown options.
- Adding, editing, and deleting the dedicated talent-pool questions.
- Reviewing applicant contact details and answers.
- Opening restricted CV and cover-letter files through short-lived signed
  Cloudinary links.
- Moving candidates through the existing hiring stages.

## SEO And Responsive Layout

`CareersPage.jsx` renders the shared `src/Components/SEO.jsx` component with
collection-page and job-posting structured data. The application route is
marked `noindex`.

The landing page and application form use mobile-first spacing and responsive
grids. The former background-only team visual is now a real lazy-loaded image
with theme-aware overlays, so it remains visible in light mode.

The talent pool is a first-class application path rather than a placeholder
vacancy. It remains selectable at `/careers/apply` at all times and has focused
questions for talent position, experience level, strengths, preferred work,
working arrangement, and contact consent. Country and city use custom dropdowns,
with an `Other city` path for locations outside the curated list.

Public Careers queries do not block the initial render or retry a failed request.
The application form renders immediate baseline questions and refreshes them
from Supabase in the background. When the backend returns no open vacancies, the
Careers page and apply route render visible empty-state messages while the
talent-pool form remains available. Network failures are handled quietly instead
of exposing raw fetch errors in the page. If the vacancy service is unavailable,
the open-role section and its hero CTA are hidden until a successful refresh.
