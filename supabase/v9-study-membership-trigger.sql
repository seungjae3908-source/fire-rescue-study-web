-- AI과외 v9 Study membership bootstrap for shared Supabase Auth.
-- Adds only a Study-specific auth.users trigger; existing investment trigger stays unchanged.

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
