alter table public.profiles
  add column if not exists home_jurisdiction_id uuid
  references public.jurisdictions(id)
  on delete set null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  home_jurisdiction uuid;
begin
  home_jurisdiction := nullif(
    new.raw_user_meta_data ->> 'home_jurisdiction_id',
    ''
  )::uuid;

  insert into public.profiles (
    id,
    full_name,
    email,
    home_jurisdiction_id
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    home_jurisdiction
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(
          nullif(public.profiles.full_name, ''),
          excluded.full_name
        ),
        home_jurisdiction_id = coalesce(
          excluded.home_jurisdiction_id,
          public.profiles.home_jurisdiction_id
        );

  return new;
end;
$$;