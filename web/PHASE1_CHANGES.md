# Phase 1 (VitalSigns) — Implementation Notes / Change Log

This repo's `web/` app is aligned to "VitalSigns Phase 1" using the existing Supabase schema (`public.users`, `pending_assessments`, `assessment_responses`, `contracts`).

## What's implemented

### Marketing + assessment (account required before score)
- `web/app/page.tsx` + `web/components/marketing/VitalSignsLanding.tsx`: marketing site with updated copy reflecting auth-required score access.
- `web/app/assessment/page.tsx` + `web/components/assessment/AssessmentFlow.tsx`: 15-question assessment that stores pending results server-side, then redirects users to register/sign in before score visibility.
- `web/app/results/page.tsx`: legacy route that redirects to `/dashboard` when authenticated, or `/login?next=/dashboard&fresh=1` when logged out.

### Scoring + question source of truth
- `web/lib/vitalsigns/constants.ts`: `VITALS` + `QUESTIONS`.
- `web/lib/vitalsigns/scoring.ts`: `calculateScores()` and `scoreLabel()`.

### Pending assessment flow (same browser token)
- `web/lib/vitalsigns/pending-session.ts`: token creation + SHA-256 helper, cookie constants.
- `web/lib/supabase/admin-client.ts`: server-only Supabase client using `SUPABASE_SERVICE_ROLE_KEY`.
- `web/app/api/assessment/pending/route.ts`:
  - Validates responses server-side.
  - Calculates score server-side.
  - Inserts into `pending_assessments`.
  - Sets HttpOnly cookie (`vs_pending_assessment`) for same-browser pending lookup.
- `web/lib/vitalsigns/claim-pending.ts`:
  - Shared server helper to claim pending assessment into `assessment_responses`.
  - Clears pending cookie and deletes pending row (best effort).
- `web/app/api/assessment/claim/route.ts`:
  - Authenticated claim endpoint delegating to shared helper.
- `web/app/auth/callback/route.ts`:
  - Runs auto-claim after successful code exchange.

### Auth pages
- `web/app/login/page.tsx` + `web/components/auth/LoginForm.tsx`:
  - Email/password login + optional Google OAuth.
  - Supports `next` redirect and optional `fresh=1` sign-out-first behavior.
- `web/app/register/page.tsx` + `web/components/auth/RegisterForm.tsx`:
  - Signup (requires company name).
  - Supports `next` redirect and assessment-origin context.

### Dashboard + documents + admin
- `web/proxy.ts`: protects `/dashboard/*` and `/admin/*` (admin check uses `public.users.role`).
- `web/app/dashboard/layout.tsx`: dashboard shell + sidebar.
- `web/app/dashboard/page.tsx`: dashboard-only score experience with overall score and full vital breakdown from `assessment_responses`.
- `web/app/dashboard/documents/page.tsx` + `web/components/dashboard/DocumentsClient.tsx`:
  - Upload PDFs to Supabase Storage bucket `contracts` (private).
  - Insert metadata into `public.contracts`.
  - List uploaded files and generate signed download URLs.
- `web/app/admin/page.tsx`, `web/app/admin/documents/page.tsx`, `web/components/admin/AdminDocumentsClient.tsx`:
  - Admin list of uploaded contracts (per RLS).

## Supporting / refactor changes
- `web/app/layout.tsx`: Playfair Display + DM Sans typography.
- `web/app/globals.css`: aligns `--font-sans` / `--font-display` with theme variables.
- `web/proxy.ts`: route gating for `/dashboard` + `/admin`.
- `web/lib/supabase/server-client.ts`: cookie bridging for SSR auth context.

## Required environment variables

### Public
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Server-only
- `SUPABASE_SERVICE_ROLE_KEY`
  - Required because `pending_assessments` is intentionally inaccessible via client RLS.
  - Must never be exposed to the browser.

## Notes / known tradeoffs (Phase 1)
- Assessment results are not visible pre-auth; users must create/sign in to access scores in dashboard.
- Pending assessments remain same-browser-only until claimed to an authenticated account.
- `/results` remains as a compatibility redirect route for old links/bookmarks.
