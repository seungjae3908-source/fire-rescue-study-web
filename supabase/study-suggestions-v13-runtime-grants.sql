-- 119 STUDY suggestions permissions hardening
-- Idempotent runtime grants for tables that already have RLS policies.
-- Apply to the Study Supabase project before Production verification.

grant usage on schema public to authenticated;

grant select on table public.study_admins to authenticated;

grant select, insert, update, delete
on table public.study_suggestions
to authenticated;

revoke all on table public.study_admins from anon;
revoke all on table public.study_suggestions from anon;

-- RLS remains the authority:
--  * members can select/insert/delete their own suggestions
--  * only study_admins can update status/admin_reply
-- This file only fixes SQL privilege errors such as:
--   permission denied for table study_suggestions
