-- REACH baseline schema.
--
-- Every statement is idempotent (IF NOT EXISTS / CREATE OR REPLACE) so this
-- file can be applied to the existing Supabase project without touching the
-- tables that are already there, and to a fresh project to recreate them.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Platform
-- ---------------------------------------------------------------------------

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  primary_color text,
  secondary_color text,
  whatsapp_number text,
  email text,
  phone text,
  website text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jurisdictions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null check (type in (
    'state', 'senatorial_district', 'federal_constituency', 'state_constituency',
    'lga', 'lcda', 'ward', 'community'
  )),
  state text,
  lga text,
  lcda text,
  ward text,
  parent_id uuid references public.jurisdictions(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  jurisdiction_id uuid references public.jurisdictions(id) on delete set null,
  name text not null,
  type text not null check (type in (
    'governor', 'senator', 'house_of_representatives', 'house_of_assembly',
    'lga', 'lcda', 'councillor', 'public_agency', 'community_office', 'other'
  )),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'resident' check (role in ('resident', 'staff', 'admin', 'superadmin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.office_members (
  office_id uuid not null references public.offices(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  created_at timestamptz not null default now(),
  primary key (office_id, user_id)
);

-- Keep a profile row for every auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Civic content
-- ---------------------------------------------------------------------------

create table if not exists public.programmes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  slug text not null,
  summary text,
  description text,
  category text,
  location text,
  start_date date,
  end_date date,
  registration_deadline date,
  capacity integer,
  status text not null default 'draft' check (status in ('draft', 'open', 'ongoing', 'completed', 'archived')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  slug text not null,
  organization text,
  type text check (type in ('scholarship', 'job', 'training', 'grant', 'internship', 'business_support', 'other')),
  summary text,
  description text,
  application_url text,
  deadline date,
  location text,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed', 'archived')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  slug text not null,
  category text,
  description text,
  location text,
  status text not null default 'planned' check (status in ('planned', 'ongoing', 'completed')),
  start_date date,
  completion_date date,
  beneficiary_count integer,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.programme_applications (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  resident_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  notes text,
  created_at timestamptz not null default now(),
  unique (programme_id, resident_id)
);

-- ---------------------------------------------------------------------------
-- Requests
-- ---------------------------------------------------------------------------

create sequence if not exists public.request_reference_seq;

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  reference_no text unique,
  resident_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  jurisdiction_id uuid references public.jurisdictions(id) on delete set null,
  category text,
  subject text not null,
  description text,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'in_progress', 'resolved', 'closed')),
  staff_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.assign_request_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference_no is null then
    new.reference_no := 'REACH-' || lpad(nextval('public.request_reference_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists requests_assign_reference on public.requests;
create trigger requests_assign_reference
  before insert on public.requests
  for each row execute function public.assign_request_reference();

drop trigger if exists requests_set_updated_at on public.requests;
create trigger requests_set_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

create table if not exists public.request_updates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  status text check (status in ('submitted', 'under_review', 'in_progress', 'resolved', 'closed')),
  message text,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Messaging & audit
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists offices_organization_idx on public.offices (organization_id);
create index if not exists programmes_org_status_idx on public.programmes (organization_id, status);
create index if not exists opportunities_org_status_idx on public.opportunities (organization_id, status);
create index if not exists projects_org_idx on public.projects (organization_id);
create index if not exists requests_resident_idx on public.requests (resident_id, created_at desc);
create index if not exists requests_org_status_idx on public.requests (organization_id, status);
create index if not exists request_updates_request_idx on public.request_updates (request_id, created_at);
create index if not exists notifications_resident_idx on public.notifications (resident_id, created_at desc);
