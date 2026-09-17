-- AI과외 v9 live-backend hardening for a shared Supabase project
-- Apply AFTER v9-schema.sql and v9-owner-hardening.sql.
-- Only Study-prefixed tables are changed. Existing investment-app tables, functions,
-- triggers, and default privileges are intentionally left untouched.

-- Explicit Data API grants for Study member tables. RLS remains the row-level boundary.
do $$
declare t text;
begin
  foreach t in array array[
    'study_profiles',
    'study_user_progress',
    'study_user_answers',
    'study_wrong_answers',
    'study_review_schedule',
    'study_personal_notes',
    'study_private_documents',
    'study_document_chunks',
    'study_sessions',
    'study_exam_history',
    'study_tutor_preferences'
  ] loop
    execute format('revoke all privileges on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
  end loop;
end $$;

-- Defense-in-depth checks: every Study table must have RLS enabled.
do $$
declare t text;
begin
  foreach t in array array[
    'study_profiles',
    'study_user_progress',
    'study_user_answers',
    'study_wrong_answers',
    'study_review_schedule',
    'study_personal_notes',
    'study_private_documents',
    'study_document_chunks',
    'study_sessions',
    'study_exam_history',
    'study_tutor_preferences'
  ] loop
    if not exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = t
        and c.relrowsecurity
    ) then
      raise exception 'RLS is not enabled on public.%', t;
    end if;
  end loop;
end $$;

-- Shared-project invariants:
-- 1) no ALTER DEFAULT PRIVILEGES here;
-- 2) no auth.users trigger here;
-- 3) no existing investment-app object is revoked, granted, dropped, altered, or replaced.
