-- AI과외 v9 dedicated backend schema
-- IMPORTANT: run only in a NEW AI과외 Supabase project. Never run in the investment-app project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  exam_year text,
  exam_date date,
  daily_minutes integer not null default 40 check (daily_minutes between 5 and 1440),
  level text not null default '처음 시작',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
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

create table if not exists public.user_answers (
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

create table if not exists public.wrong_answers (
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

create table if not exists public.review_schedule (
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id text not null,
  due_at timestamptz not null,
  interval_days integer not null default 0,
  mastery numeric not null default 0 check (mastery between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key(user_id, concept_id)
);

create table if not exists public.personal_notes (
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

create table if not exists public.private_documents (
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

create table if not exists public.document_chunks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id text not null references public.private_documents(id) on delete cascade,
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

create table if not exists public.exam_history (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('practice','real')),
  score integer not null check (score between 0 and 100),
  fire_correct integer not null default 0,
  ems_correct integer not null default 0,
  total_answered integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  explanation_level text not null default 'adaptive',
  emphasize_dangerous_wrong boolean not null default true,
  use_private_notes boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_answers_user_concept on public.user_answers(user_id, concept_id, answered_at desc);
create index if not exists idx_wrong_answers_due on public.wrong_answers(user_id, resolved, due_at);
create index if not exists idx_review_schedule_due on public.review_schedule(user_id, due_at);
create index if not exists idx_private_documents_user on public.private_documents(user_id, created_at desc);
create index if not exists idx_document_chunks_user_doc on public.document_chunks(user_id, document_id, page_no);
create index if not exists idx_study_sessions_user on public.study_sessions(user_id, started_at desc);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_answers enable row level security;
alter table public.wrong_answers enable row level security;
alter table public.review_schedule enable row level security;
alter table public.personal_notes enable row level security;
alter table public.private_documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.study_sessions enable row level security;
alter table public.exam_history enable row level security;
alter table public.tutor_preferences enable row level security;

-- Strict owner-only policies. No public read policy is created for personal tables.
do $$
declare t text;
begin
  foreach t in array array['user_progress','user_answers','wrong_answers','review_schedule','personal_notes','private_documents','document_chunks','study_sessions','exam_history'] loop
    execute format('drop policy if exists owner_select on public.%I',t);
    execute format('drop policy if exists owner_insert on public.%I',t);
    execute format('drop policy if exists owner_update on public.%I',t);
    execute format('drop policy if exists owner_delete on public.%I',t);
    execute format('create policy owner_select on public.%I for select using (auth.uid() = user_id)',t);
    execute format('create policy owner_insert on public.%I for insert with check (auth.uid() = user_id)',t);
    execute format('create policy owner_update on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',t);
    execute format('create policy owner_delete on public.%I for delete using (auth.uid() = user_id)',t);
  end loop;
end $$;

drop policy if exists profile_select on public.profiles;
drop policy if exists profile_insert on public.profiles;
drop policy if exists profile_update on public.profiles;
drop policy if exists profile_delete on public.profiles;
create policy profile_select on public.profiles for select using (auth.uid() = id);
create policy profile_insert on public.profiles for insert with check (auth.uid() = id);
create policy profile_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy profile_delete on public.profiles for delete using (auth.uid() = id);

drop policy if exists tutor_select on public.tutor_preferences;
drop policy if exists tutor_insert on public.tutor_preferences;
drop policy if exists tutor_update on public.tutor_preferences;
drop policy if exists tutor_delete on public.tutor_preferences;
create policy tutor_select on public.tutor_preferences for select using (auth.uid() = user_id);
create policy tutor_insert on public.tutor_preferences for insert with check (auth.uid() = user_id);
create policy tutor_update on public.tutor_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy tutor_delete on public.tutor_preferences for delete using (auth.uid() = user_id);

-- Private object storage. Objects live under /<user_uuid>/... and are never public.
insert into storage.buckets(id,name,public,file_size_limit)
values('private-study','private-study',false,52428800)
on conflict(id) do update set public=false;

drop policy if exists private_study_select on storage.objects;
drop policy if exists private_study_insert on storage.objects;
drop policy if exists private_study_update on storage.objects;
drop policy if exists private_study_delete on storage.objects;
create policy private_study_select on storage.objects for select using (
  bucket_id='private-study' and (storage.foldername(name))[1]=auth.uid()::text
);
create policy private_study_insert on storage.objects for insert with check (
  bucket_id='private-study' and (storage.foldername(name))[1]=auth.uid()::text
);
create policy private_study_update on storage.objects for update using (
  bucket_id='private-study' and (storage.foldername(name))[1]=auth.uid()::text
) with check (
  bucket_id='private-study' and (storage.foldername(name))[1]=auth.uid()::text
);
create policy private_study_delete on storage.objects for delete using (
  bucket_id='private-study' and (storage.foldername(name))[1]=auth.uid()::text
);

-- Optional profile bootstrap. It writes only the newly created user's own row.
create or replace function public.handle_new_ai_tutor_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id) values(new.id) on conflict do nothing;
  insert into public.tutor_preferences(user_id) values(new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_ai_tutor_user_created on auth.users;
create trigger on_ai_tutor_user_created after insert on auth.users
for each row execute procedure public.handle_new_ai_tutor_user();
