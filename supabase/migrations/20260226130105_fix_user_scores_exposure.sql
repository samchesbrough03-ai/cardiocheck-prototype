-- Fix: Supabase Advisor "Exposed auth users" (remove auth.users from public view)
drop view if exists public.user_scores;

create view public.user_scores
as
select
  u.id,
  u.company_name,
  u.role,
  ar.score,
  ar.created_at as assessment_date
from public.users u
left join public.assessment_responses ar on ar.user_id = u.id;

comment on view public.user_scores is
  'Convenience view joining profile with assessment score (no auth.users).';

-- Email access via SECURITY DEFINER RPC:
-- - admins: see all users
-- - non-admin: see only self (auth.uid())
-- Requires: public.is_admin() exists (defined in an earlier migration).
create or replace function public.user_scores_with_email()
returns table (
  id uuid,
  email text,
  company_name text,
  role public.user_role,
  score int,
  assessment_date timestamptz
)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if public.is_admin() then
    return query
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
  end if;

  return query
  select
    u.id,
    au.email,
    u.company_name,
    u.role,
    ar.score,
    ar.created_at as assessment_date
  from public.users u
  join auth.users au on au.id = u.id
  left join public.assessment_responses ar on ar.user_id = u.id
  where u.id = auth.uid();
end;
$$;

revoke all on function public.user_scores_with_email() from public;
revoke all on function public.user_scores_with_email() from anon;
grant execute on function public.user_scores_with_email() to authenticated;
