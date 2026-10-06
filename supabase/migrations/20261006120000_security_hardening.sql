-- Security and performance hardening after the platform-admin migration.
--
-- Addresses the Supabase advisor findings from 2026-10-06:
--   * is_platform_admin() was executable by anon (unnecessary);
--   * policies on requests, offices and organizations re-evaluated auth.*
--     per row instead of once per statement;
--   * foreign-key columns used by the app's filters had no index;
--   * the sign-up trigger did not copy the residential address.
--
-- event_rsvp_count(uuid) and find_service_for_request(text, uuid) stay
-- executable by anon on purpose: the public event page shows the attendee
-- count, and the public request form matches a service before sign-in. Both
-- are SECURITY DEFINER because they read private tables (event_rsvps,
-- service_routes); they return only an integer and a matched service row.
--
-- Every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Function grants
-- ---------------------------------------------------------------------------

revoke execute on function public.is_platform_admin() from anon, public;
grant execute on function public.is_platform_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Sign-up trigger: copy jurisdiction and address from the metadata
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- RLS on requests, offices and organizations
--
-- The hosted project accumulated policies under several naming schemes
-- ("Admins can…", "Office staff can…", "*_admin_write", "platform_admin_manage_*").
-- This block removes every policy on these three tables and recreates the
-- canonical set, with auth.uid() / is_platform_admin() evaluated once per
-- statement instead of once per row:
--   organizations, offices : public read of active rows, admin read/write
--   requests               : residents read/insert their own; office staff
--                            and platform admins read/update
-- ---------------------------------------------------------------------------

do $$
declare
  p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('organizations', 'offices', 'requests')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

create policy "organizations_public_read" on public.organizations
  for select using (is_active or (select public.is_platform_admin()));

create policy "organizations_admin_write" on public.organizations
  for all to authenticated
  using ((select public.is_platform_admin()))
  with check ((select public.is_platform_admin()));

create policy "offices_public_read" on public.offices
  for select using (is_active or (select public.is_platform_admin()));

create policy "offices_admin_write" on public.offices
  for all to authenticated
  using ((select public.is_platform_admin()))
  with check ((select public.is_platform_admin()));

create policy "requests_own_read" on public.requests
  for select to authenticated using (
    resident_id = (select auth.uid())
    or (select public.is_platform_admin())
    or public.is_office_staff(organization_id)
  );

create policy "requests_own_insert" on public.requests
  for insert to authenticated with check (resident_id = (select auth.uid()));

create policy "requests_staff_update" on public.requests
  for update to authenticated
  using ((select public.is_platform_admin()) or public.is_office_staff(organization_id))
  with check ((select public.is_platform_admin()) or public.is_office_staff(organization_id));

alter table public.organizations enable row level security;
alter table public.offices enable row level security;
alter table public.requests enable row level security;

-- ---------------------------------------------------------------------------
-- Foreign-key indexes for the app's filter and join patterns
-- ---------------------------------------------------------------------------

create index if not exists profiles_jurisdiction_idx on public.profiles (jurisdiction_id);

create index if not exists offices_organization_idx on public.offices (organization_id);
create index if not exists offices_jurisdiction_idx on public.offices (jurisdiction_id);

create index if not exists programmes_organization_idx on public.programmes (organization_id);
create index if not exists programmes_jurisdiction_idx on public.programmes (jurisdiction_id);

create index if not exists opportunities_organization_idx on public.opportunities (organization_id);
create index if not exists opportunities_jurisdiction_idx on public.opportunities (jurisdiction_id);

create index if not exists projects_organization_idx on public.projects (organization_id);
create index if not exists projects_jurisdiction_idx on public.projects (jurisdiction_id);

create index if not exists events_organization_idx on public.events (organization_id);
create index if not exists events_jurisdiction_idx on public.events (jurisdiction_id);

create index if not exists requests_resident_idx on public.requests (resident_id, created_at desc);
create index if not exists requests_organization_idx on public.requests (organization_id);
create index if not exists requests_jurisdiction_idx on public.requests (jurisdiction_id);
create index if not exists requests_assigned_office_idx on public.requests (assigned_office_id);

create index if not exists request_updates_request_idx on public.request_updates (request_id, created_at desc);
create index if not exists request_updates_author_idx on public.request_updates (author_id);

create index if not exists service_routes_organization_idx on public.service_routes (organization_id);
create index if not exists service_routes_jurisdiction_idx on public.service_routes (jurisdiction_id);
create index if not exists service_routes_office_idx on public.service_routes (office_id);

create index if not exists leaders_organization_idx on public.leaders (organization_id);
create index if not exists leaders_jurisdiction_idx on public.leaders (jurisdiction_id);
create index if not exists leaders_office_idx on public.leaders (office_id);

create index if not exists content_leaders_leader_idx on public.content_leaders (leader_id);
create index if not exists content_leaders_content_idx on public.content_leaders (content_type, content_id);

create index if not exists notifications_resident_idx on public.notifications (resident_id, created_at desc);
create index if not exists notifications_organization_idx on public.notifications (organization_id);

create index if not exists office_members_user_idx on public.office_members (user_id);
create index if not exists organization_members_user_idx on public.organization_members (user_id);

create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id);
