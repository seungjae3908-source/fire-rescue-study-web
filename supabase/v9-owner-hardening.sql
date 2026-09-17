-- AI과외 v9 member-ownership hardening for shared Supabase
-- Run AFTER v9-schema.sql. Only Study-prefixed tables are touched.
-- This file is intentionally idempotent.

-- A chunk must belong to the same user as its parent private document.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'study_private_documents_id_user_id_key'
      and conrelid = 'public.study_private_documents'::regclass
  ) then
    alter table public.study_private_documents
      add constraint study_private_documents_id_user_id_key unique (id, user_id);
  end if;
end $$;

-- Replace the single-column document FK with an owner-bound composite FK.
alter table public.study_document_chunks
  drop constraint if exists study_document_chunks_document_id_fkey;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'study_document_chunks_owner_document_fkey'
      and conrelid = 'public.study_document_chunks'::regclass
  ) then
    alter table public.study_document_chunks
      add constraint study_document_chunks_owner_document_fkey
      foreign key (document_id, user_id)
      references public.study_private_documents(id, user_id)
      on delete cascade;
  end if;
end $$;

-- Defense in depth: RLS also verifies the parent document is owned by auth.uid().
drop policy if exists owner_select on public.study_document_chunks;
drop policy if exists owner_insert on public.study_document_chunks;
drop policy if exists owner_update on public.study_document_chunks;
drop policy if exists owner_delete on public.study_document_chunks;

create policy owner_select on public.study_document_chunks
for select to authenticated using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.study_private_documents d
    where d.id = document_id and d.user_id = (select auth.uid())
  )
);

create policy owner_insert on public.study_document_chunks
for insert to authenticated with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.study_private_documents d
    where d.id = document_id and d.user_id = (select auth.uid())
  )
);

create policy owner_update on public.study_document_chunks
for update to authenticated using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.study_private_documents d
    where d.id = document_id and d.user_id = (select auth.uid())
  )
) with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.study_private_documents d
    where d.id = document_id and d.user_id = (select auth.uid())
  )
);

create policy owner_delete on public.study_document_chunks
for delete to authenticated using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.study_private_documents d
    where d.id = document_id and d.user_id = (select auth.uid())
  )
);
