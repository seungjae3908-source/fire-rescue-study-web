-- AI과외 v9 live-backend hardening
-- Apply AFTER v9-schema.sql and v9-owner-hardening.sql.
-- Dedicated AI과외 Supabase project only. Never apply to the investment-app backend.
--
-- Supabase new projects are fail-closed for Data API grants. RLS alone is not
-- sufficient: authenticated must receive the table privileges the browser app
-- actually uses, while anon remains unable to reach private member tables.

grant usage on schema public to authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles',
    'user_progress',
    'user_answers',
    'wrong_answers',
    'review_schedule',
    'personal_notes',
    'private_documents',
    'document_chunks',
    'study_sessions',
    'exam_history',
    'tutor_preferences'
  ] loop
    execute format('revoke all privileges on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
  end loop;
end $$;

-- Future public-schema objects remain opt-in instead of accidentally becoming
-- available through the Data API.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

-- The auth trigger needs elevated rights to create the new user's own bootstrap
-- rows, but it is not an application RPC. Keep it non-callable from client roles
-- and remove public-schema name resolution from SECURITY DEFINER execution.
alter function public.handle_new_ai_tutor_user() set search_path = '';
revoke all on function public.handle_new_ai_tutor_user() from public, anon, authenticated;

-- Defense-in-depth checks: these must already be enabled by v9-schema.sql.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles',
    'user_progress',
    'user_answers',
    'wrong_answers',
    'review_schedule',
    'personal_notes',
    'private_documents',
    'document_chunks',
    'study_sessions',
    'exam_history',
    'tutor_preferences'
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