-- AI과외 v9 member-ownership hardening
-- Run AFTER v9-schema.sql, and only in the dedicated AI과외 Supabase project.
-- This file is intentionally idempotent so development environments can re-apply it safely.

-- A chunk must belong to the same user as its parent private document.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'private_documents_id_user_id_key'
      and conrelid = 'public.private_documents'::regclass
  ) then
    alter table public.private_documents
      add constraint private_documents_id_user_id_key unique (id, user_id);
  end if;
end $$;

-- Replace the single-column document FK with an owner-bound composite FK.
alter table public.document_chunks
  drop constraint if exists document_chunks_document_id_fkey;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'document_chunks_owner_document_fkey'
      and conrelid = 'public.document_chunks'::regclass
  ) then
    alter table public.document_chunks
      add constraint document_chunks_owner_document_fkey
      foreign key (document_id, user_id)
      references public.private_documents(id, user_id)
      on delete cascade;
  end if;
end $$;

-- Defense in depth: RLS also verifies the parent document is owned by auth.uid().
drop policy if exists owner_select on public.document_chunks;
drop policy if exists owner_insert on public.document_chunks;
drop policy if exists owner_update on public.document_chunks;
drop policy if exists owner_delete on public.document_chunks;

create policy owner_select on public.document_chunks
for select using (
  auth.uid() = user_id
  and exists (
    select 1 from public.private_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
);

create policy owner_insert on public.document_chunks
for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.private_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
);

create policy owner_update on public.document_chunks
for update using (
  auth.uid() = user_id
  and exists (
    select 1 from public.private_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
) with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.private_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
);

create policy owner_delete on public.document_chunks
for delete using (
  auth.uid() = user_id
  and exists (
    select 1 from public.private_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
);
