-- Events: carnivals, town halls, outreach days and other dated activities
-- published by an office. Residents can RSVP from their account.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  slug text not null,
  summary text,
  description text,
  category text,
  venue text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  registration_url text,
  capacity integer,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  image_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create index if not exists events_org_status_starts_idx on public.events (organization_id, status, starts_at);

create table if not exists public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  resident_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, resident_id)
);

create index if not exists event_rsvps_resident_idx on public.event_rsvps (resident_id, created_at desc);

-- Public attendee count without exposing who is attending.
create or replace function public.event_rsvp_count(target_event uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.event_rsvps where event_id = target_event;
$$;

-- Events can be led by one leader or run as a joint collaboration.
alter table public.content_leaders drop constraint if exists content_leaders_content_type_check;
alter table public.content_leaders
  add constraint content_leaders_content_type_check
  check (content_type in ('programme', 'opportunity', 'project', 'event'));

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
  for select using (
    status = 'published'
    or public.is_platform_admin()
    or public.is_office_staff(organization_id)
  );

drop policy if exists "events_staff_write" on public.events;
create policy "events_staff_write" on public.events
  for all using (public.is_platform_admin() or public.is_office_staff(organization_id))
  with check (public.is_platform_admin() or public.is_office_staff(organization_id));

drop policy if exists "event_rsvps_own" on public.event_rsvps;
create policy "event_rsvps_own" on public.event_rsvps
  for all using (resident_id = auth.uid() or public.is_platform_admin())
  with check (resident_id = auth.uid() or public.is_platform_admin());

drop policy if exists "event_rsvps_staff_read" on public.event_rsvps;
create policy "event_rsvps_staff_read" on public.event_rsvps
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_id and public.is_office_staff(e.organization_id)
    )
  );
