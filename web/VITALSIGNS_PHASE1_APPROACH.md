# VitalSigns (Phase 1) — Approach, Methodology, Security Notes

This document describes the **implemented** Phase 1 architecture in this repo (`CardioCheck-prototype`), which is acting as early VitalSigns.

## Goals (Phase 1)

Phase 1 is complete when a user can:
- View marketing landing page
- Complete a 15‑question assessment and view results **without creating an account**
- Register / sign in
- Save (“claim”) their assessment score to their account
- Access a dashboard
- Upload a PDF contract to a private document vault
- Admin can view all uploaded files

## Stack + conventions

- **Next.js 16** (App Router, TypeScript)
  - Uses Next 16 **`proxy.ts`** (not `middleware.ts`) for route protection.
- **Tailwind + shadcn/ui** for application UI consistency.
- **Supabase**
  - Auth (email/password + Google OAuth)
  - Postgres (with RLS)
  - Storage for private documents (signed URLs for download)

## Key design decision: “same browser only” pre‑auth assessment

We intentionally chose a **same‑browser-only** approach to avoid shareable bearer links and keep privacy strong by default.

### Why this is safer than “claim by URL id”

An alternative architecture (from the original brief) stores an anonymous row in `assessment_responses` and later “claims” it using `?claim=<id>` on register/login.

We did **not** choose that because:
- It pushes the system toward shareable-link semantics (bearer secrets) or requires more complex guardrails.
- It increases the risk of claim spoofing / leakage if IDs are exposed or logged.
- It often requires loosening RLS or adding additional public select policies.

Instead we implemented a cookie-token approach with a separate pending table (below).

## Database + data model (existing schema)

We keep the repo’s current hardened schema (see `database` / `supabase/migrations/...`):
- `public.users` (profile row created by trigger on signup; holds `company_name` + `role`)
- `public.pending_assessments` (pre-auth assessment store; token is hashed; includes expiry)
- `public.assessment_responses` (one per user; saved/claimed results)
- `public.contracts` (one row per uploaded file; stores storage key as `contract_path`)

### RLS strategy

- `pending_assessments` is **blocked from end-user access** via RLS.
- Users can only see/insert/update their own `assessment_responses` and `contracts`.
- Admin checks use `public.is_admin()` (backed by `public.users.role`).

## Assessment flow (implemented)

### 1) User completes assessment (no account)

- Client submits responses to `POST /api/assessment/pending`.
- Server validates all 15 answers and calculates scores server-side.
- Server creates a random browser token and sets it as **HttpOnly cookie**:
  - Cookie name: `vs_pending_assessment`
  - SameSite: `lax`
  - Secure in production
  - Max age: 7 days
- Server stores the assessment in `pending_assessments` using **SHA‑256 hash** of the token.

### 2) User views results (same browser only)

- `/results` is rendered server-side.
- It reads the HttpOnly cookie token.
- It uses a server-only admin client to look up the pending row by hashed token.

### 3) User signs up / signs in to save score

- On login, we call `POST /api/assessment/claim` (best-effort).
- If Supabase email confirmation is enabled and `signUp` does not create a session immediately:
  - The claim can’t run until after the user verifies email and signs in.
  - Dashboard includes a manual “Save my browser assessment” action to claim later.

### 4) Claiming (persist to user)

`POST /api/assessment/claim`:
- Requires an authenticated Supabase session.
- Loads the pending assessment using the cookie token hash.
- Upserts `assessment_responses` for `auth.uid()` (conflict on `user_id`).
- Deletes the pending row (best-effort) and clears the cookie.

## Document upload flow (implemented)

### Storage bucket

- Bucket name: `contracts`
- Access: **Private**

### Upload

From `/dashboard/documents`:
- Client confirms the user session.
- Generates `contractId` (UUID) and uploads to Storage:
  - `contracts/{user_id}/{contractId}/{filename}`
- Inserts a DB row into `public.contracts`:
  - `user_id`, `file_name`, `contract_path`

### Download

- Client requests a signed URL with `createSignedUrl(contract_path, 3600)` (1 hour).
- Browser opens the signed URL.

### Storage policies (required)

Storage is protected by policies on `storage.objects`, typically:
- Users can insert/select/delete where folder segment 1 equals `auth.uid()`
- Admin can select/delete across all folders using `public.is_admin()`

## Route protection (Next.js 16)

We use `web/proxy.ts` with matchers for:
- `/dashboard/:path*` → requires auth
- `/admin/:path*` → requires auth + role == admin

This is the Next.js 16 replacement for `middleware.ts`.

## Service role key usage (security critical)

We use a server-only Supabase client with `SUPABASE_SERVICE_ROLE_KEY` for:
- Writing/reading `pending_assessments` (blocked to end users by RLS)
- Server-side loading of pre-auth results (`/results`)

### Practices required for safety

- Never expose the key to the browser:
  - Do **not** prefix with `NEXT_PUBLIC_`
  - Do **not** import the admin client from any `"use client"` module
- Store it only as a secret:
  - Local: `web/.env.local` (gitignored)
  - Production: Vercel Environment Variable (server-only)
- Rotate immediately if leaked (git, logs, screenshots).
- Keep all privileged operations narrowly scoped to API routes / server components.

## Operational notes

### Pending assessment retention

`pending_assessments` includes `expires_at` (7 days). Unclaimed sessions may accumulate.
Phase 1: acceptable; cleanup can be added later via scheduled job/cron.

### Observability / troubleshooting

Common failure modes:
- Missing `SUPABASE_SERVICE_ROLE_KEY` → pending assessment cannot be saved/loaded.
- Missing bucket `contracts` → “Bucket not found”.
- Missing Storage policies → “new row violates row-level security policy”.

## Security review checklist (Phase 1)

- [ ] `contracts` bucket is private
- [ ] Storage policies enforce per-user folder access and admin overrides
- [ ] Signed URLs are time-limited (1 hour) and never stored in DB
- [ ] `SUPABASE_SERVICE_ROLE_KEY` exists only server-side and is not committed
- [ ] `/admin/*` routes require admin role
- [ ] Pre-auth results are same-browser only (HttpOnly cookie) — no URL tokens

## Suggested next hardening (still Phase 1 friendly)

- Enforce file size + MIME checks before upload and/or via Storage settings.
- Rate-limit `POST /api/assessment/pending` (basic anti-abuse).
- Add audit logging for admin downloads if needed for compliance.

