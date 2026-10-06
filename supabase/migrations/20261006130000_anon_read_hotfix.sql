-- HOTFIX: restore anonymous reads of organizations and offices.
--
-- 20261006120000_security_hardening.sql revoked execute on
-- public.is_platform_admin() from anon while the organizations_public_read
-- and offices_public_read policies still called it. Postgres evaluates the
-- policy for anonymous requests too, so every public page failed with
-- "permission denied for function is_platform_admin" (verified live on
-- 2026-10-06). The fix keeps the function private to authenticated users
-- and splits each read into a public policy that never calls the function
-- and an admin policy restricted to authenticated users.

drop policy if exists "organizations_public_read" on public.organizations;
create policy "organizations_public_read" on public.organizations
  for select to anon, authenticated using (is_active);

drop policy if exists "organizations_admin_read" on public.organizations;
create policy "organizations_admin_read" on public.organizations
  for select to authenticated using ((select public.is_platform_admin()));

drop policy if exists "offices_public_read" on public.offices;
create policy "offices_public_read" on public.offices
  for select to anon, authenticated using (is_active);

drop policy if exists "offices_admin_read" on public.offices;
create policy "offices_admin_read" on public.offices
  for select to authenticated using ((select public.is_platform_admin()));

-- Any other policy that anonymous visitors hit must not call the helper.
-- These two read policies exist in the repository with the same pattern;
-- recreate them in the split form so they are safe whether or not they
-- were applied to the hosted project.
drop policy if exists "leaders_public_read" on public.leaders;
create policy "leaders_public_read" on public.leaders
  for select to anon, authenticated using (is_active);

drop policy if exists "leaders_admin_read" on public.leaders;
create policy "leaders_admin_read" on public.leaders
  for select to authenticated using ((select public.is_platform_admin()));
