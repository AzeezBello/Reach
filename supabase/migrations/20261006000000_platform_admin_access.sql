-- Platform-admin database access.
--
-- Findings from the hosted project on 2026-10-06:
--   * admin sessions could read only their own profile;
--   * admin sessions could not insert/update programmes, opportunities,
--     projects or events, and updates to leaders were silently filtered;
--   * the organization_members policy referenced itself and recursed, which
--     also broke service_routes reads;
--   * event_rsvp_count and find_service_for_request were not executable by
--     the authenticated/anon roles.
--
-- The application now performs verified-admin writes through the
-- server-only service role, so it works without this migration. Applying it
-- additionally lets admin sessions work directly against the database and
-- fixes the recursion. Every statement is idempotent.

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role::text in ('admin', 'superadmin')
  );
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated, anon;

-- Profiles: admins may read and update every profile.
drop policy if exists "platform_admin_read_profiles" on public.profiles;
create policy "platform_admin_read_profiles" on public.profiles
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "platform_admin_update_profiles" on public.profiles;
create policy "platform_admin_update_profiles" on public.profiles
  for update to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Content tables: admins manage everything.
drop policy if exists "platform_admin_manage_programmes" on public.programmes;
create policy "platform_admin_manage_programmes" on public.programmes
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "platform_admin_manage_opportunities" on public.opportunities;
create policy "platform_admin_manage_opportunities" on public.opportunities
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "platform_admin_manage_projects" on public.projects;
create policy "platform_admin_manage_projects" on public.projects
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "platform_admin_manage_events" on public.events;
create policy "platform_admin_manage_events" on public.events
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "platform_admin_manage_leaders" on public.leaders;
create policy "platform_admin_manage_leaders" on public.leaders
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "platform_admin_manage_content_leaders" on public.content_leaders;
create policy "platform_admin_manage_content_leaders" on public.content_leaders
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "platform_admin_read_event_rsvps" on public.event_rsvps;
create policy "platform_admin_read_event_rsvps" on public.event_rsvps
  for select to authenticated using (public.is_platform_admin());

-- Organization members: replace the self-referencing policy with the helper.
drop policy if exists "Platform admins manage organization memberships" on public.organization_members;
drop policy if exists "platform_admin_manage_organization_members" on public.organization_members;
create policy "platform_admin_manage_organization_members" on public.organization_members
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "platform_admin_manage_service_routes" on public.service_routes;
create policy "platform_admin_manage_service_routes" on public.service_routes
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "platform_admin_manage_service_directory" on public.service_directory;
create policy "platform_admin_manage_service_directory" on public.service_directory
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Public helper functions used by the site.
grant execute on function public.event_rsvp_count(uuid) to anon, authenticated;
grant execute on function public.find_service_for_request(text, uuid) to anon, authenticated;

-- Storage: the `media` bucket is public-read; uploads go through the service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = excluded.public;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
