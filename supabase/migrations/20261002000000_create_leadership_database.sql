-- supabase/migrations/20261002000000_create_leadership_database.sql

begin;

-- ============================================================
-- REACH — Leadership Database
-- Migration: 20261002000000
-- ============================================================

-- ------------------------------------------------------------
-- 1. Leadership levels
-- ------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'leadership_level'
  ) then
    create type public.leadership_level as enum (
      'federal',
      'state',
      'local'
    );
  end if;
end
$$;


-- ------------------------------------------------------------
-- 2. Leadership office types
-- ------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'leadership_office_type'
  ) then
    create type public.leadership_office_type as enum (
      'senate',
      'house_of_representatives',
      'house_of_assembly',
      'chief_of_staff',
      'lga_chairman',
      'lga_vice_chairman',
      'legislative_assembly',
      'lcda_chairman',
      'public_agency',
      'other'
    );
  end if;
end
$$;


-- ------------------------------------------------------------
-- 3. Leaders
-- ------------------------------------------------------------

create table if not exists public.leaders (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid
    references public.organizations(id)
    on delete set null,

  jurisdiction_id uuid
    references public.jurisdictions(id)
    on delete set null,

  office_id uuid
    references public.offices(id)
    on delete set null,

  name text not null,

  slug text not null,

  initial text,

  role text not null,

  level public.leadership_level not null,

  level_label text not null,

  office_type public.leadership_office_type not null,

  office text not null,

  jurisdiction text,

  constituency text,

  summary text,

  biography jsonb not null default '[]'::jsonb,

  service jsonb not null default '[]'::jsonb,

  sources jsonb not null default '[]'::jsonb,

  image text,

  is_active boolean not null default true,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint leaders_biography_array_check
    check (jsonb_typeof(biography) = 'array'),

  constraint leaders_service_array_check
    check (jsonb_typeof(service) = 'array'),

  constraint leaders_sources_array_check
    check (jsonb_typeof(sources) = 'array')
);


-- ------------------------------------------------------------
-- 4. Unique slug
-- ------------------------------------------------------------

create unique index if not exists leaders_slug_uidx
on public.leaders(slug);


-- ------------------------------------------------------------
-- 5. Indexes
-- ------------------------------------------------------------

create index if not exists leaders_organization_idx
on public.leaders(organization_id);

create index if not exists leaders_jurisdiction_idx
on public.leaders(jurisdiction_id);

create index if not exists leaders_office_idx
on public.leaders(office_id);

create index if not exists leaders_level_idx
on public.leaders(level);

create index if not exists leaders_office_type_idx
on public.leaders(office_type);

create index if not exists leaders_active_sort_idx
on public.leaders(is_active, sort_order);


-- ------------------------------------------------------------
-- 6. Updated-at trigger
-- ------------------------------------------------------------

create or replace function public.update_leaders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leaders_updated_at
on public.leaders;

create trigger leaders_updated_at
before update on public.leaders
for each row
execute function public.update_leaders_updated_at();


-- ------------------------------------------------------------
-- 7. Content ↔ Leadership relationship
--
-- This allows a leader to be attached to CMS content,
-- announcements, events, programmes, etc.
-- ------------------------------------------------------------

create table if not exists public.content_leaders (
  id uuid primary key default gen_random_uuid(),

  leader_id uuid not null
    references public.leaders(id)
    on delete cascade,

  content_type text not null,

  content_id uuid not null,

  relationship text not null default 'featured',

  created_at timestamptz not null default now(),

  constraint content_leaders_unique_relationship
    unique (
      leader_id,
      content_type,
      content_id,
      relationship
    )
);


create index if not exists content_leaders_leader_idx
on public.content_leaders(leader_id);

create index if not exists content_leaders_content_idx
on public.content_leaders(content_type, content_id);


-- ------------------------------------------------------------
-- 8. Leadership collaborations
--
-- Allows multiple leaders/offices to be associated with
-- a programme, project, opportunity or event.
-- ------------------------------------------------------------

create table if not exists public.leadership_collaborations (
  id uuid primary key default gen_random_uuid(),

  leader_id uuid not null
    references public.leaders(id)
    on delete cascade,

  organization_id uuid
    references public.organizations(id)
    on delete cascade,

  content_type text not null,

  content_id uuid not null,

  role text not null default 'participant',

  notes text,

  created_at timestamptz not null default now(),

  constraint leadership_collaborations_unique
    unique (
      leader_id,
      content_type,
      content_id
    )
);


create index if not exists leadership_collaborations_leader_idx
on public.leadership_collaborations(leader_id);

create index if not exists leadership_collaborations_org_idx
on public.leadership_collaborations(organization_id);

create index if not exists leadership_collaborations_content_idx
on public.leadership_collaborations(
  content_type,
  content_id
);


-- ------------------------------------------------------------
-- 9. Row Level Security
-- ------------------------------------------------------------

alter table public.leaders
enable row level security;

alter table public.content_leaders
enable row level security;

alter table public.leadership_collaborations
enable row level security;


-- ------------------------------------------------------------
-- 10. Public leadership read access
--
-- Only active leadership profiles are publicly visible.
-- ------------------------------------------------------------

drop policy if exists "Public can view active leaders"
on public.leaders;

create policy "Public can view active leaders"
on public.leaders
for select
to anon, authenticated
using (
  is_active = true
);


-- ------------------------------------------------------------
-- 11. Public content ↔ leadership read access
-- ------------------------------------------------------------

drop policy if exists "Public can view content leaders"
on public.content_leaders;

create policy "Public can view content leaders"
on public.content_leaders
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.leaders l
    where l.id = content_leaders.leader_id
      and l.is_active = true
  )
);


-- ------------------------------------------------------------
-- 12. Public collaboration read access
-- ------------------------------------------------------------

drop policy if exists "Public can view leadership collaborations"
on public.leadership_collaborations;

create policy "Public can view leadership collaborations"
on public.leadership_collaborations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.leaders l
    where l.id = leadership_collaborations.leader_id
      and l.is_active = true
  )
);


-- ------------------------------------------------------------
-- 13. Admin helper
--
-- Determines whether the current authenticated user has
-- administrative privileges.
-- ------------------------------------------------------------

create or replace function public.is_leadership_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role::text in (
        'admin',
        'superadmin',
        'org_admin',
        'office_admin'
      )
  );
$$;


revoke all
on function public.is_leadership_admin()
from public, anon;

grant execute
on function public.is_leadership_admin()
to authenticated;


-- ------------------------------------------------------------
-- 14. Admin policies — leaders
-- ------------------------------------------------------------

drop policy if exists "Admins can manage leaders"
on public.leaders;

create policy "Admins can manage leaders"
on public.leaders
for all
to authenticated
using (
  public.is_leadership_admin()
)
with check (
  public.is_leadership_admin()
);


-- ------------------------------------------------------------
-- 15. Admin policies — content leaders
-- ------------------------------------------------------------

drop policy if exists "Admins can manage content leaders"
on public.content_leaders;

create policy "Admins can manage content leaders"
on public.content_leaders
for all
to authenticated
using (
  public.is_leadership_admin()
)
with check (
  public.is_leadership_admin()
);


-- ------------------------------------------------------------
-- 16. Admin policies — collaborations
-- ------------------------------------------------------------

drop policy if exists "Admins can manage leadership collaborations"
on public.leadership_collaborations;

create policy "Admins can manage leadership collaborations"
on public.leadership_collaborations
for all
to authenticated
using (
  public.is_leadership_admin()
)
with check (
  public.is_leadership_admin()
);


-- ------------------------------------------------------------
-- 17. Search helper
-- ------------------------------------------------------------

create index if not exists leaders_name_search_idx
on public.leaders
using gin (
  to_tsvector(
    'simple',
    coalesce(name, '') || ' ' ||
    coalesce(role, '') || ' ' ||
    coalesce(office, '') || ' ' ||
    coalesce(jurisdiction, '') || ' ' ||
    coalesce(constituency, '')
  )
);


-- ------------------------------------------------------------
-- 18. Comments
-- ------------------------------------------------------------

comment on table public.leaders is
'REACH public leadership profiles across federal, state and local jurisdictions.';

comment on table public.content_leaders is
'Associates leadership profiles with REACH content records.';

comment on table public.leadership_collaborations is
'Associates multiple leadership profiles with programmes, projects, opportunities or events.';


-- ------------------------------------------------------------
-- 19. Seed current FKL Connect leadership records
--
-- These are intentionally minimal seed records.
-- Verified biographies and source URLs can be added through
-- the Superadmin Leadership interface.
-- ------------------------------------------------------------

insert into public.leaders (
  organization_id,
  name,
  slug,
  initial,
  role,
  level,
  level_label,
  office_type,
  office,
  jurisdiction,
  constituency,
  summary,
  image,
  is_active,
  sort_order
)
values
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Senator Wasiu Sanni Eshilokun',
  'wasiu-sanni-eshilokun',
  'W',
  'Senator',
  'federal',
  'Federal Government',
  'senate',
  'Senate',
  'Lagos Central Senatorial District',
  'Lagos Central',
  null,
  '/leaders/Senator Wasiu Sanni Eshilokun.jpeg',
  true,
  10
),
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Hon. Fuad Kayode Laguda',
  'fuad-kayode-laguda',
  'F',
  'Member, House of Representatives',
  'federal',
  'Federal Government',
  'house_of_representatives',
  'House of Representatives',
  'Surulere Federal Constituency I',
  'Surulere I',
  null,
  '/leaders/Fuad_Kayode_Laguda.jpg',
  true,
  20
),
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Hon. Lanre Okunlola',
  'lanre-okunlola',
  'L',
  'Member, House of Representatives',
  'federal',
  'Federal Government',
  'house_of_representatives',
  'House of Representatives',
  'Surulere Federal Constituency II',
  'Surulere II',
  null,
  '/leaders/Lanre_Okunlola.jpg',
  true,
  30
),
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Rt. Hon. Femi Gbajabiamila',
  'femi-gbajabiamila',
  'F',
  'Chief of Staff to the President',
  'federal',
  'Federal Government',
  'chief_of_staff',
  'Office of the Chief of Staff to the President',
  'Nigeria',
  null,
  null,
  '/leaders/Femi Gbajabiamila.webp',
  true,
  40
),
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Hon. Desmond Olushola Elliot',
  'desmond-olushola-elliot',
  'D',
  'Member, Lagos State House of Assembly',
  'state',
  'Lagos State Government',
  'house_of_assembly',
  'Lagos State House of Assembly',
  'Surulere State Constituency I',
  'Surulere I',
  null,
  '/leaders/Hon. Desmond Olushola Elliot.jpg',
  true,
  50
),
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Hon. Mosunmola Rotimi Sangodara',
  'mosunmola-rotimi-sangodara',
  'M',
  'Member, Lagos State House of Assembly',
  'state',
  'Lagos State Government',
  'house_of_assembly',
  'Lagos State House of Assembly',
  'Surulere State Constituency II',
  'Surulere II',
  null,
  '/leaders/Hon. Mosunmola Rotimi Sangodara.jpeg',
  true,
  60
),
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Hon. Sulaiman Bamidele Yusuf',
  'sulaiman-bamidele-yusuf',
  'S',
  'Chairman',
  'local',
  'Local Government & LCDA',
  'lga_chairman',
  'Surulere Local Government',
  'Surulere LGA',
  null,
  null,
  '/leaders/Hon. Sulaiman Bamidele Yusuf.jpeg',
  true,
  70
),
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Hon. Prince Muiz Dosunmu',
  'prince-muiz-dosunmu',
  'M',
  'Vice Chairman',
  'local',
  'Local Government & LCDA',
  'lga_vice_chairman',
  'Surulere Local Government',
  'Surulere LGA',
  null,
  null,
  null,
  true,
  80
),
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Hon. Akeem Olayiwola AbdulRahman',
  'akeem-olayiwola-abdulrahman',
  'A',
  'Legislative Assembly',
  'local',
  'Local Government & LCDA',
  'legislative_assembly',
  'Surulere Local Government Legislative Assembly',
  'Surulere LGA',
  null,
  null,
  null,
  true,
  90
),
(
  '846aee2f-71fb-4efd-b075-2d04cedc4716',
  'Hon. Odunayo Oluwafemi Daniel',
  'odunayo-oluwafemi-daniel',
  'O',
  'Executive Chairman',
  'local',
  'Local Government & LCDA',
  'lcda_chairman',
  'Itire-Ikate LCDA',
  'Itire-Ikate LCDA',
  null,
  null,
  '/leaders/Hon. Odunayo Oluwafemi Daniel.jpg',
  true,
  100
)
on conflict (slug)
do update set
  organization_id = excluded.organization_id,
  name = excluded.name,
  initial = excluded.initial,
  role = excluded.role,
  level = excluded.level,
  level_label = excluded.level_label,
  office_type = excluded.office_type,
  office = excluded.office,
  jurisdiction = excluded.jurisdiction,
  constituency = excluded.constituency,
  image = excluded.image,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();


-- ------------------------------------------------------------
-- 20. Lock down SECURITY DEFINER helper
-- ------------------------------------------------------------

revoke all
on function public.update_leaders_updated_at()
from public, anon, authenticated;

grant execute
on function public.update_leaders_updated_at()
to authenticated;


commit;