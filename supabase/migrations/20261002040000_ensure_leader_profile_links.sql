-- The legacy leaders table included profile_id, but the newer create-table
-- migration can encounter an existing table and therefore cannot add it.
alter table public.leaders
  add column if not exists profile_id uuid
  references public.profiles(id)
  on delete set null;

create index if not exists leaders_profile_id_idx
  on public.leaders(profile_id)
  where profile_id is not null;