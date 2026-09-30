-- Row-level security.
--
-- Principles (see README → Security):
--   * anyone can read active organizations, jurisdictions, offices, leaders
--     and published content;
--   * residents can read and write only their own profile, requests,
--     applications and notifications;
--   * office staff can read and manage records belonging to their office's
--     organization;
--   * platform admins (profiles.role in admin/superadmin) can manage everything.
--
-- Policies are dropped and recreated by name so the file is idempotent.

-- ---------------------------------------------------------------------------
-- Role helpers (security definer so they can read profiles under RLS)
-- ---------------------------------------------------------------------------

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'superadmin')
  );
$$;

create or replace function public.is_office_staff(target_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.office_members m
    join public.offices o on o.id = m.office_id
    where m.user_id = auth.uid() and o.organization_id = target_organization
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.jurisdictions enable row level security;
alter table public.offices enable row level security;
alter table public.profiles enable row level security;
alter table public.office_members enable row level security;
alter table public.programmes enable row level security;
alter table public.opportunities enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.programme_applications enable row level security;
alter table public.requests enable row level security;
alter table public.request_updates enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.leaders enable row level security;
alter table public.content_leaders enable row level security;

-- ---------------------------------------------------------------------------
-- Organizations / jurisdictions / offices
-- ---------------------------------------------------------------------------

drop policy if exists "organizations_public_read" on public.organizations;
create policy "organizations_public_read" on public.organizations
  for select using (is_active or public.is_platform_admin());

drop policy if exists "organizations_admin_write" on public.organizations;
create policy "organizations_admin_write" on public.organizations
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "jurisdictions_public_read" on public.jurisdictions;
create policy "jurisdictions_public_read" on public.jurisdictions
  for select using (true);

drop policy if exists "jurisdictions_admin_write" on public.jurisdictions;
create policy "jurisdictions_admin_write" on public.jurisdictions
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "offices_public_read" on public.offices;
create policy "offices_public_read" on public.offices
  for select using (is_active or public.is_platform_admin());

drop policy if exists "offices_admin_write" on public.offices;
create policy "offices_admin_write" on public.offices
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Profiles / office members
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_own_read" on public.profiles;
create policy "profiles_own_read" on public.profiles
  for select using (id = auth.uid() or public.is_platform_admin());

drop policy if exists "profiles_own_insert" on public.profiles;
create policy "profiles_own_insert" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_update" on public.profiles
  for update using (id = auth.uid() or public.is_platform_admin())
  with check (
    public.is_platform_admin()
    or (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()))
  );

drop policy if exists "office_members_read" on public.office_members;
create policy "office_members_read" on public.office_members
  for select using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "office_members_admin_write" on public.office_members;
create policy "office_members_admin_write" on public.office_members
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Published content
-- ---------------------------------------------------------------------------

drop policy if exists "programmes_public_read" on public.programmes;
create policy "programmes_public_read" on public.programmes
  for select using (
    status in ('open', 'ongoing', 'completed')
    or public.is_platform_admin()
    or public.is_office_staff(organization_id)
  );

drop policy if exists "programmes_staff_write" on public.programmes;
create policy "programmes_staff_write" on public.programmes
  for all using (public.is_platform_admin() or public.is_office_staff(organization_id))
  with check (public.is_platform_admin() or public.is_office_staff(organization_id));

drop policy if exists "opportunities_public_read" on public.opportunities;
create policy "opportunities_public_read" on public.opportunities
  for select using (
    status = 'active'
    or public.is_platform_admin()
    or public.is_office_staff(organization_id)
  );

drop policy if exists "opportunities_staff_write" on public.opportunities;
create policy "opportunities_staff_write" on public.opportunities
  for all using (public.is_platform_admin() or public.is_office_staff(organization_id))
  with check (public.is_platform_admin() or public.is_office_staff(organization_id));

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select using (true);

drop policy if exists "projects_staff_write" on public.projects;
create policy "projects_staff_write" on public.projects
  for all using (public.is_platform_admin() or public.is_office_staff(organization_id))
  with check (public.is_platform_admin() or public.is_office_staff(organization_id));

drop policy if exists "project_updates_public_read" on public.project_updates;
create policy "project_updates_public_read" on public.project_updates
  for select using (true);

drop policy if exists "project_updates_staff_write" on public.project_updates;
create policy "project_updates_staff_write" on public.project_updates
  for all using (
    public.is_platform_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and public.is_office_staff(p.organization_id)
    )
  )
  with check (
    public.is_platform_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and public.is_office_staff(p.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Leaders & collaborations
-- ---------------------------------------------------------------------------

drop policy if exists "leaders_public_read" on public.leaders;
create policy "leaders_public_read" on public.leaders
  for select using (is_active or public.is_platform_admin());

drop policy if exists "leaders_admin_write" on public.leaders;
create policy "leaders_admin_write" on public.leaders
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "content_leaders_public_read" on public.content_leaders;
create policy "content_leaders_public_read" on public.content_leaders
  for select using (true);

drop policy if exists "content_leaders_admin_write" on public.content_leaders;
create policy "content_leaders_admin_write" on public.content_leaders
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Applications / requests / notifications
-- ---------------------------------------------------------------------------

drop policy if exists "applications_own" on public.programme_applications;
create policy "applications_own" on public.programme_applications
  for all using (resident_id = auth.uid() or public.is_platform_admin())
  with check (resident_id = auth.uid() or public.is_platform_admin());

drop policy if exists "applications_staff_read" on public.programme_applications;
create policy "applications_staff_read" on public.programme_applications
  for select using (
    exists (
      select 1 from public.programmes p
      where p.id = programme_id and public.is_office_staff(p.organization_id)
    )
  );

drop policy if exists "requests_own_read" on public.requests;
create policy "requests_own_read" on public.requests
  for select using (
    resident_id = auth.uid()
    or public.is_platform_admin()
    or public.is_office_staff(organization_id)
  );

drop policy if exists "requests_own_insert" on public.requests;
create policy "requests_own_insert" on public.requests
  for insert with check (resident_id = auth.uid());

drop policy if exists "requests_staff_update" on public.requests;
create policy "requests_staff_update" on public.requests
  for update using (public.is_platform_admin() or public.is_office_staff(organization_id))
  with check (public.is_platform_admin() or public.is_office_staff(organization_id));

drop policy if exists "request_updates_read" on public.request_updates;
create policy "request_updates_read" on public.request_updates
  for select using (
    public.is_platform_admin()
    or exists (
      select 1 from public.requests r
      where r.id = request_id
        and (r.resident_id = auth.uid() or public.is_office_staff(r.organization_id))
    )
  );

drop policy if exists "request_updates_staff_insert" on public.request_updates;
create policy "request_updates_staff_insert" on public.request_updates
  for insert with check (
    public.is_platform_admin()
    or exists (
      select 1 from public.requests r
      where r.id = request_id and public.is_office_staff(r.organization_id)
    )
  );

drop policy if exists "notifications_own_read" on public.notifications;
create policy "notifications_own_read" on public.notifications
  for select using (resident_id = auth.uid() or public.is_platform_admin());

drop policy if exists "notifications_admin_write" on public.notifications;
create policy "notifications_admin_write" on public.notifications
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "audit_logs_admin" on public.audit_logs;
create policy "audit_logs_admin" on public.audit_logs
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());
