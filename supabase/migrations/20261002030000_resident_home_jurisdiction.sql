-- Residents choose a home area when they create an account.
--
-- The sign-up form sends `jurisdiction_id` and `address` in the user
-- metadata and the trigger below copies both onto the profile, so they are
-- stored even when email confirmation means there is no browser session
-- right after signUp().

alter table public.profiles
  add column if not exists jurisdiction_id uuid
  references public.jurisdictions(id)
  on delete set null;

alter table public.profiles add column if not exists area text;
alter table public.profiles add column if not exists address text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  home_jurisdiction uuid;
  home_address text;
begin
  home_jurisdiction := nullif(new.raw_user_meta_data ->> 'jurisdiction_id', '')::uuid;
  home_address := nullif(trim(new.raw_user_meta_data ->> 'address'), '');

  insert into public.profiles (id, full_name, email, jurisdiction_id, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    home_jurisdiction,
    home_address
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
        jurisdiction_id = coalesce(excluded.jurisdiction_id, public.profiles.jurisdiction_id),
        address = coalesce(excluded.address, public.profiles.address);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
