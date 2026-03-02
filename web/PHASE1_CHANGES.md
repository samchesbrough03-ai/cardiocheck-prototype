# Phase 1 (VitalSigns) — Implementation Notes / Change Log

This repo’s `web/` app is now aligned to “VitalSigns Phase 1” using the **existing Supabase schema** (`public.users`, `pending_assessments`, `assessment_responses`, `contracts`).

## What’s implemented

### Marketing + assessment (no account required)
- `web/app/page.tsx` + `web/components/marketing/VitalSignsLanding.tsx`: pixel-identical landing page ported from `vitalsigns-phase1.jsx` (inline styles + animations) with Next navigation.
- `web/app/assessment/page.tsx` + `web/components/assessment/AssessmentFlow.tsx`: 15-question assessment UI (ported question set from `vitalsigns-phase1.jsx` into constants + scoring).
- `web/app/results/page.tsx`: same-browser-only results page backed by `pending_assessments` (cookie + server lookup).

### Scoring + question source of truth
- `web/lib/vitalsigns/constants.ts`: `VITALS` + `QUESTIONS`.
- `web/lib/vitalsigns/scoring.ts`: `calculateScores()` and `scoreLabel()`.

### Pending assessment (same-browser-only)
- `web/lib/vitalsigns/pending-session.ts`: token creation + SHA-256 helper, cookie name/constants.
- `web/lib/supabase/admin-client.ts`: server-only Supabase client using `SUPABASE_SERVICE_ROLE_KEY`.
- `web/app/api/assessment/pending/route.ts`:
  - Validates responses server-side.
  - Calculates score server-side.
  - Inserts into `pending_assessments`.
  - Sets an HttpOnly cookie (`vs_pending_assessment`) for same-browser lookup.
- `web/app/api/assessment/claim/route.ts`:
  - For authenticated users: copies pending → `assessment_responses` (upsert on `user_id`) and clears the cookie.

### Auth pages
- `web/app/login/page.tsx` + `web/components/auth/LoginForm.tsx`: email/password login + optional Google OAuth.
- `web/app/register/page.tsx` + `web/components/auth/RegisterForm.tsx`: signup (requires company name) and sets `company_name` in user metadata (used by the DB trigger to create `public.users`).

### Dashboard + documents + admin
- `web/middleware.ts`: protects `/dashboard/*` and `/admin/*` (admin check uses `public.users.role`).
- `web/app/dashboard/layout.tsx`: dashboard shell + sidebar.
- `web/app/dashboard/page.tsx`: overview + saved score display (from `assessment_responses`) and a “claim” button.
- `web/components/dashboard/ClaimAssessmentButton.tsx`: lets users save (claim) their browser assessment after login.
- `web/app/dashboard/documents/page.tsx` + `web/components/dashboard/DocumentsClient.tsx`:
  - Uploads PDFs to Supabase Storage bucket `contracts` (private).
  - Inserts metadata into `public.contracts`.
  - Lists uploaded files and generates signed download URLs.
- `web/app/admin/page.tsx`, `web/app/admin/documents/page.tsx`, `web/components/admin/AdminDocumentsClient.tsx`:
  - Admin list of all uploaded contracts (per RLS).

## Supporting / refactor changes
- `web/app/layout.tsx`: switches to Playfair Display + DM Sans (VitalSigns-like typography).
- `web/app/globals.css`: aligns `--font-sans` / `--font-display` variables with the new font variables and shadcn theme.
- `web/proxy.ts`: updated gating logic to match `/dashboard` + `/admin` (kept for compatibility; middleware is the primary mechanism).
- `web/lib/supabase/server-client.ts`: typed/cleaned cookie bridging to avoid strict TS `implicit any` issues.

## Required environment variables

### Public (already present)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Server-only (required for pending assessments)
- `SUPABASE_SERVICE_ROLE_KEY`
  - Needed because `pending_assessments` is intentionally not accessible via RLS from client sessions.
  - Must **never** be exposed to the browser (do not prefix with `NEXT_PUBLIC_`).

## Supabase setup required (manual)

### Storage bucket
Create a private bucket:
- Bucket: `contracts`
- Access: **Private**

### Storage policies (SQL)
Add policies on `storage.objects` for bucket `contracts` so users can upload/read their own files and admins can access everything.

```sql
-- Users can upload to their own folder
create policy "Users can upload own contracts"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'contracts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read their own contracts; admins can read all
create policy "Users can read own contracts or admin"
on storage.objects for select
to authenticated
using (
  bucket_id = 'contracts'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
);

-- Users can delete their own; admins can delete all
create policy "Users can delete own contracts or admin"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'contracts'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
);
```

## Notes / known tradeoffs (Phase 1)
- Email capture in the free assessment UI is currently used for UX gating only (results display) and is not persisted pre-account in the DB (schema intentionally keeps pending assessments minimal).
- Results are **same-browser only** by design (no shareable links). Users can “save” results post-login via the claim endpoint.
