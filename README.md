# CardioCheck-prototype
A working example of the CardioCheck module - Full stack website including: Database, User Auth, Admin and User modes, Basic frontend (including a couple of design options), File upload and admin panel

## Structure
- `supabase/`: local Supabase CLI project (migrations/config)
- `web/`: Next.js app

## Database (Supabase/Postgres)
The schema is in `database` and is also packaged as a Supabase migration in `supabase/migrations/20260223180000_initial_schema.sql`.

### Apply in Supabase (cloud)
1. Supabase Dashboard -> **SQL Editor**
2. Paste the contents of `supabase/migrations/20260223180000_initial_schema.sql`
3. Run the script (it creates tables, RLS policies, and the signup trigger)

### Local dev (Supabase CLI)
Prereqs: Supabase CLI + Docker Desktop.

1. Start local stack: `supabase start`
2. Apply migrations (recreates the local DB): `supabase db reset`
3. View local URLs/keys: `supabase status`

Note: this repo sets the local Postgres port to `54325` in `supabase/config.toml` to avoid conflicts with other local stacks.

## Web app (Next.js)
From the repo root:
1. Install deps: `cd web && npm install`
2. Start dev server: `npm run dev`

For Supabase env vars, use the values from `supabase status` and create `web/.env.local` (see `web/.env.local.example`).

Troubleshooting:
- If PowerShell says `supabase` is not recognized after installing, restart your terminal (VS Code: restart the integrated terminal / window), or run:
  - `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`
- If VS Code can run `docker` but not `supabase`, VS Code likely started before Scoop updated your User `PATH`. Restart VS Code, or run:
  - `$env:Path += ';' + $env:USERPROFILE + '\\scoop\\shims'`
- If `supabase start` errors about `dockerDesktopLinuxEngine` / a missing pipe, Docker Desktop isn't running or you're on Windows containers. Fix:
  - Start Docker Desktop, then run `docker info` (it should succeed)
  - Ensure Docker is set to **Linux containers** (Docker Desktop tray menu -> "Switch to Linux containers...")
