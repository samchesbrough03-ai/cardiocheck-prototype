-- Lock down which columns authenticated clients can update on profiles.
-- This prevents self-promotion to admin by updating public.users.role.

revoke update on table public.users from authenticated;
revoke update on table public.users from anon;
grant update (company_name) on table public.users to authenticated;
