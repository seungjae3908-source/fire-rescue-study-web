-- 119 STUDY private suggestion board
-- Admin membership is seeded out-of-band in production so no personal email/user id is stored in the repository.

create table if not exists public.study_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.study_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default '개선' check (category in ('개선','건의','오류','콘텐츠','기타')),
  title text not null check (char_length(title) between 2 and 120),
  body text not null check (char_length(body) between 2 and 5000),
  anonymous boolean not null default true,
  status text not null default '접수' check (status in ('접수','수렴완료','개선중','개선완료','보류')),
  admin_reply text not null default '',
  admin_replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_study_suggestions_user_created
  on public.study_suggestions(user_id, created_at desc);
create index if not exists idx_study_suggestions_status_created
  on public.study_suggestions(status, created_at desc);

alter table public.study_admins enable row level security;
alter table public.study_suggestions enable row level security;

drop policy if exists study_admin_self_select on public.study_admins;
create policy study_admin_self_select
on public.study_admins for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists study_suggestions_select on public.study_suggestions;
create policy study_suggestions_select
on public.study_suggestions for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (select 1 from public.study_admins a where a.user_id = (select auth.uid()))
);

drop policy if exists study_suggestions_insert on public.study_suggestions;
create policy study_suggestions_insert
on public.study_suggestions for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists study_suggestions_admin_update on public.study_suggestions;
create policy study_suggestions_admin_update
on public.study_suggestions for update to authenticated
using (exists (select 1 from public.study_admins a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.study_admins a where a.user_id = (select auth.uid())));

drop policy if exists study_suggestions_owner_delete on public.study_suggestions;
create policy study_suggestions_owner_delete
on public.study_suggestions for delete to authenticated
using (
  user_id = (select auth.uid())
  or exists (select 1 from public.study_admins a where a.user_id = (select auth.uid()))
);
