# VitalSigns (Phase 1) — Approach, Methodology, Security Notes

This document describes the implemented Phase 1 architecture in this repo (`CardioCheck-prototype`).

## Goals (Phase 1)

Phase 1 is complete when a user can:
- View the marketing landing page
- Complete a 15-question assessment
- Register or sign in before viewing any score
- See saved score + full breakdown on dashboard
- Upload a PDF contract to a private document vault
- Allow admins to view uploaded files

## Stack + conventions

- **Next.js 16** (App Router, TypeScript)
  - Uses `web/proxy.ts` for route protection.
- **Tailwind + shadcn/ui** for application UI.
- **Supabase**
  - Auth (email/password + Google OAuth)
  - Postgres with RLS
  - Storage for private documents

## Key design decision: same-browser pending token pre-auth

We intentionally keep pending assessments same-browser-only until account claim to avoid shareable bearer-style result URLs.

## Database + data model

Using existing schema:
- `public.users`
- `public.pending_assessments`
- `public.assessment_responses`
- `public.contracts`

### RLS strategy

- `pending_assessments` is blocked from end-user access via RLS.
- Users can access only their own `assessment_responses` and `contracts`.
- Admin checks use `public.is_admin()` (backed by `public.users.role`).

## Assessment flow (implemented)

### 1) User completes assessment

- Client submits responses to `POST /api/assessment/pending`.
- Server validates answers and calculates score server-side.
- Server stores pending row and sets HttpOnly cookie `vs_pending_assessment`.
- Client redirects to register flow; score is not shown pre-auth.

### 2) User authenticates

- Register/login supports `next` redirect semantics.
- `GET /auth/callback` exchanges auth code and runs pending claim helper.
- Login/register still perform best-effort claim calls for immediate session paths.

### 3) Claiming to user account

- Shared helper: `web/lib/vitalsigns/claim-pending.ts`
  - Reads pending cookie.
  - Loads pending row by hashed token.
  - Upserts into `assessment_responses` on `user_id`.
  - Clears cookie and deletes pending row (best effort).
- API endpoint: `POST /api/assessment/claim` delegates to same helper.

### 4) Results access policy

- Canonical score UI is dashboard (`/dashboard`) only.
- Legacy `/results` route:
  - Redirects authenticated users to `/dashboard`.
  - Redirects unauthenticated users to `/login?next=/dashboard&fresh=1`.

## Document upload flow

From `/dashboard/documents`:
- Upload to private Storage bucket `contracts` at user-scoped key.
- Insert metadata into `public.contracts`.
- Read/download via signed URLs.

## Route protection

`web/proxy.ts` enforces:
- `/dashboard/:path*` requires auth.
- `/admin/:path*` requires auth + admin role.

## Service role usage (security-critical)

Server-only `SUPABASE_SERVICE_ROLE_KEY` is used for:
- Reading/writing `pending_assessments`.
- Claiming pending assessments into `assessment_responses`.

Rules:
- Never expose service role key to browser.
- Never import admin client from `"use client"` modules.
- Store key only in local secret env and production server secrets.

## Operational notes

- Pending assessments expire by `expires_at` (7 days).
- Unclaimed sessions may accumulate; cron cleanup can be added later.
- Common failures:
  - Missing `SUPABASE_SERVICE_ROLE_KEY` -> pending save/claim fails.
  - Missing storage bucket/policies -> upload and access failures.

## Security checklist

- [ ] `contracts` bucket is private
- [ ] Storage policies enforce per-user access + admin override
- [ ] Signed URLs are time-limited
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-only
- [ ] `/admin/*` routes enforce admin role
- [ ] Pre-auth assessment data is same-browser cookie bound
