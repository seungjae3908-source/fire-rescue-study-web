-- AI과외 v9 shared Auth routing gate.
-- IMPORTANT: this changes an EXISTING investment-Staging auth trigger function.
-- Keep as code-only until explicit DB-mutation approval is given.
-- Non-Study signups retain the exact existing investment profile bootstrap behavior.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  -- Study v9 users share auth.users in this free-plan Staging project, but must not
  -- become investment-app members/profiles merely because they signed up for Study.
  if coalesce(new.raw_user_meta_data->>'app_scope', '') = 'study-v9' then
    return new;
  end if;

  -- Existing investment-app behavior preserved byte-for-byte in semantics.
  insert into public.profiles(id, login_name, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'login_name', ''), split_part(new.email, '@', 1)),
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(new.raw_user_meta_data->>'login_name', ''),
      '사용자'
    )
  )
  on conflict (id) do nothing;
  return new;
end
$$;
