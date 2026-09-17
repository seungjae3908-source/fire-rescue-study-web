-- AI과외 v9 shared-project-safe backend schema
-- This schema is safe to install alongside the investment-app Staging database.
-- Every AI과외 table and Storage policy is namespaced; existing investment tables are untouched.
-- IMPORTANT: do not rename these tables back to generic names such as public.profiles in a shared project.

create extension if not exists pgcrypto;

create table if not exists public.study_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  exam_year text,
  exam_date date,
  daily_minutes integer not null default 40 check (daily_minutes between 5 and 1440),
  level text not null default '처음 시작',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id text not null,
  mastery numeric not null default 0 check (mastery between 0 and 100),
  attempts integer not null default 0,
  correct_count integer not null default 0,
  dangerous_wrong integer not null default 0,
  last_study timestamptz,
  next_review timestamptz,
  updated_at timestamptz not null default now(),
  primary key(user_id, concept_id)
);

create table if not exists public.study_user_answers (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  concept_id text not null,
  scope_id text,
  subject text not null check (subject in ('fire','ems')),
  choice integer not null,
  correct boolean not null,
  confidence text not null check (confidence in ('sure','maybe','none')),
  response_ms integer,
  answered_at timestamptz not null default now()
);

create table if not exists public.study_wrong_answers (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  concept_id text not null,
  confidence text not null check (confidence in ('sure','maybe','none')),
  due_at timestamptz not null default now(),
  interval_days integer not null default 0,
  resolved boolean not null default false,
  wrong_count integer not null default 1,
  last_wrong_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.study_review_schedule (
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id text not null,
  due_at timestamptz not null,
  interval_days integer not null default 0,
  mastery numeric not null default 0 check (mastery between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key(user_id, concept_id)
);

create table if not exists public.study_personal_notes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  source_type text not null default 'manual',
  private boolean not null default true check (private = true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.study_private_documents (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_name text,
  mime_type text,
  page_count integer not null default 0,
  source_hash text,
  storage_path text,
  sync_original boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(user_id, source_hash)
);

create table if not exists public.study_document_chunks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id text not null references public.study_private_documents(id) on delete cascade,
  page_no integer,
  chunk_index integer not null default 0,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id text,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_sec integer not null default 0
);

create table if not exists public.study_exam_history (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('practice','real')),
  score integer not null check (score between 0 and 100),
  fire_correct integer not null default 0,
  ems_correct integer not null default 0,
  total_answered integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.study_tutor_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  explanation_level text not null default 'adaptive',
  emphasize_dangerous_wrong boolean not null default true,
  use_private_notes boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists idx_study_user_answers_user_concept on public.study_user_answers(user_id, concept_id, answered_at desc);
create index if not exists idx_study_wrong_answers_due on public.study_wrong_answers(user_id, resolved, due_at);
create index if not exists idx_study_review_schedule_due on public.study_review_schedule(user_id, due_at);
create index if not exists idx_study_private_documents_user on public.study_private_documents(user_id, created_at desc);
create index if not exists idx_study_document_chunks_user_doc on public.study_document_chunks(user_id, document_id, page_no);
create index if not exists idx_study_sessions_user on public.study_sessions(user_id, started_at desc);

alter table public.study_profiles enable row level security;
alter table public.study_user_progress enable row level security;
alter table public.study_user_answers enable row level security;
alter table public.study_wrong_answers enable row level security;
alter table public.study_review_schedule enable row level security;
alter table public.study_personal_notes enable row level security;
alter table public.study_private_documents enable row level security;
alter table public.study_document_chunks enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_exam_history enable row level security;
alter table public.study_tutor_preferences enable row level security;

-- Strict owner-only policies. No public read policy is created for personal tables.
do $$
declare t text;
begin
  foreach t in array array[
    'study_user_progress',
    'study_user_answers',
    'study_wrong_answers',
    'study_review_schedule',
    'study_personal_notes',
    'study_private_documents',
    'study_document_chunks',
    'study_sessions',
    'study_exam_history'
  ] loop
    execute format('drop policy if exists owner_select on public.%I',t);
    execute format('drop policy if exists owner_insert on public.%I',t);
    execute format('drop policy if exists owner_update on public.%I',t);
    execute format('drop policy if exists owner_delete on public.%I',t);
    execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid()) = user_id)',t);
    execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',t);
    execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',t);
    execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',t);
  end loop;
end $$;

drop policy if exists profile_select on public.study_profiles;
drop policy if exists profile_insert on public.study_profiles;
drop policy if exists profile_update on public.study_profiles;
drop policy if exists profile_delete on public.study_profiles;
create policy profile_select on public.study_profiles for select to authenticated using ((select auth.uid()) = id);
create policy profile_insert on public.study_profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profile_update on public.study_profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profile_delete on public.study_profiles for delete to authenticated using ((select auth.uid()) = id);

drop policy if exists tutor_select on public.study_tutor_preferences;
drop policy if exists tutor_insert on public.study_tutor_preferences;
drop policy if exists tutor_update on public.study_tutor_preferences;
drop policy if exists tutor_delete on public.study_tutor_preferences;
create policy tutor_select on public.study_tutor_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy tutor_insert on public.study_tutor_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy tutor_update on public.study_tutor_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tutor_delete on public.study_tutor_preferences for delete to authenticated using ((select auth.uid()) = user_id);

-- Private Study object storage. The original personal files are not auto-uploaded by v9,
-- but the bucket stays available for an explicit future opt-in flow.
insert into storage.buckets(id,name,public,file_size_limit)
values('study-private-v9','study-private-v9',false,52428800)
on conflict(id) do update set public=false;

drop policy if exists study_v9_private_select on storage.objects;
drop policy if exists study_v9_private_insert on storage.objects;
drop policy if exists study_v9_private_update on storage.objects;
drop policy if exists study_v9_private_delete on storage.objects;
create policy study_v9_private_select on storage.objects for select to authenticated using (
  bucket_id='study-private-v9' and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy study_v9_private_insert on storage.objects for insert to authenticated with check (
  bucket_id='study-private-v9' and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy study_v9_private_update on storage.objects for update to authenticated using (
  bucket_id='study-private-v9' and (storage.foldername(name))[1]=(select auth.uid())::text
) with check (
  bucket_id='study-private-v9' and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy study_v9_private_delete on storage.objects for delete to authenticated using (
  bucket_id='study-private-v9' and (storage.foldername(name))[1]=(select auth.uid())::text
);

-- Shared-project safety: intentionally NO auth.users trigger and NO global default-privilege changes.
-- v9 creates the member's Study profile/tutor rows through owner-scoped client upserts after sign-in.
