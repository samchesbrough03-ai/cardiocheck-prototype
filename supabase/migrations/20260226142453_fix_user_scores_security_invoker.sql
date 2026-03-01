-- Make public.user_scores an INVOKER view (avoid SECURITY DEFINER views)
drop view if exists public.user_scores;

create view public.user_scores
with (security_invoker = true)
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
