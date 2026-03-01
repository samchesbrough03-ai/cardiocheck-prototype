-- ============================================================
-- PROJECT SCHEMA — SUPABASE / POSTGRESQL (HARDENED)
-- ============================================================

create schema if not exists extensions;
set search_path = public, extensions;

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto; -- for digest()

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'user_role'
  ) then
    create type public.user_role as enum ('user', 'admin');
  end if;
end
$$;

-- ------------------------------------------------------------
-- TABLE: users (profile)
-- email removed to avoid drift; join auth.users when needed
-- ------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  company_name  text not null,
  role          user_role not null default 'user',
  created_at    timestamptz not null default now()
);

comment on table public.users is
  'User profile data. Authentication and email are managed by Supabase Auth (auth.users).';

-- ------------------------------------------------------------
-- TABLE: pending_assessments (token HASHED)
-- ------------------------------------------------------------
create table if not exists public.pending_assessments (
  id                 uuid primary key default uuid_generate_v4(),
  session_token_hash bytea not null, -- digest(token, 'sha256')
  responses          jsonb not null,
  score              int not null check (score >= 0 and score <= 100),
  breakdown          jsonb,
  created_at         timestamptz not null default now(),
  expires_at         timestamptz not null default now() + interval '7 days',
  unique (session_token_hash)
);

comment on table public.pending_assessments is
  'Temporary storage for pre-registration assessments. Uses SHA-256 token hash (not raw token).';

-- ------------------------------------------------------------
-- TABLE: assessment_responses
-- ------------------------------------------------------------
create table if not exists public.assessment_responses (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null unique references public.users(id) on delete cascade,
  responses      jsonb not null,
  score          int not null check (score >= 0 and score <= 100),
  breakdown      jsonb,
  pdf_generated  boolean not null default false,
  pdf_path       text,
  created_at     timestamptz not null default now()
);

comment on table public.assessment_responses is
  'Assessment results per user. score is the single source of truth. pdf_path is a storage key.';

-- ------------------------------------------------------------
-- TABLE: contracts
-- ------------------------------------------------------------
create table if not exists public.contracts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  file_name       text not null,
  contract_path   text not null,
  uploaded_at     timestamptz not null default now()
);

comment on table public.contracts is
  'One row per uploaded contract file. contract_path is a storage key (signed URLs on demand).';

-- ------------------------------------------------------------
-- VIEW: user_scores (now joins auth.users for email)
-- IMPORTANT: Only grant SELECT carefully (or expose a “my_*” view)
-- ------------------------------------------------------------
create or replace view public.user_scores as
select
  u.id,
  au.email,
  u.company_name,
  u.role,
  ar.score,
  ar.created_at as assessment_date
from public.users u
join auth.users au on au.id = u.id
left join public.assessment_responses ar on ar.user_id = u.id;

comment on view public.user_scores is
  'Convenience view joining profile with auth email and assessment score.';

-- ------------------------------------------------------------
-- TRIGGER: create profile row on signup
-- ------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, company_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'company_name', ''))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.users enable row level security;
alter table public.pending_assessments enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.contracts enable row level security;

-- Helper: is_admin() hardened search_path
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- USERS policies (consolidated)
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Admins can view all users" on public.users;

create policy "Users can view own profile or admin"
  on public.users for select
  using (auth.uid() = id or public.is_admin());

-- Update: restrict to own row; WITH CHECK prevents changing ownership via update tricks
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ASSESSMENT RESPONSES policies (add WITH CHECK on update)
drop policy if exists "Users can view their own assessment" on public.assessment_responses;
drop policy if exists "Users can insert their own assessment" on public.assessment_responses;
drop policy if exists "Users can update their own assessment" on public.assessment_responses;

create policy "Users can view own assessment or admin"
  on public.assessment_responses for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own assessment"
  on public.assessment_responses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own assessment"
  on public.assessment_responses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- CONTRACTS policies
drop policy if exists "Users can view their own contracts" on public.contracts;
drop policy if exists "Users can upload their own contracts" on public.contracts;
drop policy if exists "Users can delete their own contracts" on public.contracts;

create policy "Users can view own contracts or admin"
  on public.contracts for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own contracts"
  on public.contracts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own contracts"
  on public.contracts for delete
  using (auth.uid() = user_id);

-- PENDING ASSESSMENTS: block end-user access
drop policy if exists "No direct user access to pending assessments" on public.pending_assessments;

create policy "No direct access to pending assessments"
  on public.pending_assessments for all
  using (false);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
create index if not exists idx_contracts_user_id on public.contracts(user_id);
create index if not exists idx_assessment_user_id on public.assessment_responses(user_id);
create index if not exists idx_pending_token_hash on public.pending_assessments(session_token_hash);
create index if not exists idx_pending_expires on public.pending_assessments(expires_at);

-- ------------------------------------------------------------
-- OPTIONAL (RECOMMENDED): column-level update restrictions
-- In Supabase, grant only what you want clients to modify.
-- This prevents users from updating role even if they own the row.
-- ------------------------------------------------------------
-- revoke update on public.users from authenticated;
-- grant update (company_name) on public.users to authenticated;

-- ============================================================
-- Notes:
-- - When creating pending assessments, compute digest(token, 'sha256')
-- - Consider a scheduled job to delete expired pending rows
-- ============================================================
