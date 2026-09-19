-- AI과외 v9 Study membership bootstrap and isolation gate for shared Supabase Auth.
-- Existing investment auth trigger stays unchanged.
-- Only users created by the Study signup path (app_scope=study-v9) receive membership.

create table if not exists public.study_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  source text not null default 'study-v9' check (source = 'study-v9'),
  created_at timestamptz not null default now()
);

alter table public.study_memberships enable row level security;

revoke all privileges on table public.study_memberships from anon, authenticated;
grant select on table public.study_memberships to authenticated;

drop policy if exists membership_select_own on public.study_memberships;
create policy membership_select_own
on public.study_memberships
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.handle_new_study_v9_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data->>'app_scope', '') <> 'study-v9' then
    return new;
  end if;

  insert into public.study_memberships(user_id, source)
  values(new.id, 'study-v9')
  on conflict (user_id) do nothing;

  insert into public.study_profiles(id)
  values(new.id)
  on conflict (id) do nothing;

  insert into public.study_tutor_preferences(user_id)
  values(new.id)
  on conflict (user_id) do nothing;

  return new;
end
$$;

revoke all on function public.handle_new_study_v9_user() from public, anon, authenticated;

drop trigger if exists on_study_v9_user_created on auth.users;
create trigger on_study_v9_user_created
after insert on auth.users
for each row execute function public.handle_new_study_v9_user();

-- Defense in depth: even a valid user of the shared investment staging project
-- cannot use Study tables unless the server-created Study membership exists.
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
    execute format('drop policy if exists study_membership_gate on public.%I', t);
    execute format(
      'create policy study_membership_gate on public.%I as restrictive for all to authenticated using (exists (select 1 from public.study_memberships m where m.user_id = (select auth.uid()))) with check (exists (select 1 from public.study_memberships m where m.user_id = (select auth.uid())))',
      t
    );
  end loop;
end $$;

-- Study Storage stays owner-folder scoped and now also requires Study membership.
drop policy if exists study_v9_private_select on storage.objects;
drop policy if exists study_v9_private_insert on storage.objects;
drop policy if exists study_v9_private_update on storage.objects;
drop policy if exists study_v9_private_delete on storage.objects;

create policy study_v9_private_select on storage.objects for select to authenticated using (
  bucket_id='study-private-v9'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists (select 1 from public.study_memberships m where m.user_id=(select auth.uid()))
);
create policy study_v9_private_insert on storage.objects for insert to authenticated with check (
  bucket_id='study-private-v9'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists (select 1 from public.study_memberships m where m.user_id=(select auth.uid()))
);
create policy study_v9_private_update on storage.objects for update to authenticated using (
  bucket_id='study-private-v9'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists (select 1 from public.study_memberships m where m.user_id=(select auth.uid()))
) with check (
  bucket_id='study-private-v9'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists (select 1 from public.study_memberships m where m.user_id=(select auth.uid()))
);
create policy study_v9_private_delete on storage.objects for delete to authenticated using (
  bucket_id='study-private-v9'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists (select 1 from public.study_memberships m where m.user_id=(select auth.uid()))
);
