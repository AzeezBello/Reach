-- Community requests: residents can share a request publicly so other
-- residents can see it and add their support.
--
--   requests.is_public        resident opt-in; private by default
--   request_supports          one row per resident per request
--   public_requests (view)    the public fields of shared requests with a
--                             support count; no resident identity is exposed
--   set_request_visibility()  resident toggles sharing on their own request
--   toggle_request_support()  resident adds or withdraws support
--   request_support_count()   count for the owner's private request page
--
-- Every statement is idempotent.

alter table public.requests
  add column if not exists is_public boolean not null default false;

create index if not exists requests_public_idx
  on public.requests (is_public, created_at desc)
  where is_public;

create table if not exists public.request_supports (
  request_id uuid not null references public.requests(id) on delete cascade,
  resident_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, resident_id)
);

create index if not exists request_supports_resident_idx
  on public.request_supports (resident_id);

alter table public.request_supports enable row level security;

drop policy if exists "request_supports_own_read" on public.request_supports;
create policy "request_supports_own_read" on public.request_supports
  for select to authenticated using (resident_id = (select auth.uid()));

drop policy if exists "platform_admin_read_request_supports" on public.request_supports;
create policy "platform_admin_read_request_supports" on public.request_supports
  for select to authenticated using ((select public.is_platform_admin()));

-- ---------------------------------------------------------------------------
-- Public view: only shared requests, only non-identifying fields.
-- The view runs with the owner's privileges, so it bypasses the private
-- requests policies but exposes nothing a resident did not opt into.
-- ---------------------------------------------------------------------------

create or replace view public.public_requests as
  select
    r.id,
    r.reference_no,
    r.category,
    r.subject,
    r.description,
    r.status,
    r.created_at,
    r.updated_at,
    r.jurisdiction_id,
    j.name as jurisdiction_name,
    j.type as jurisdiction_type,
    (select count(*)::integer from public.request_supports s where s.request_id = r.id) as support_count
  from public.requests r
  left join public.jurisdictions j on j.id = r.jurisdiction_id
  where r.is_public;

grant select on public.public_requests to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

create or replace function public.set_request_visibility(target_request uuid, make_public boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  if auth.uid() is null then
    raise exception 'Sign in to change who can see this request.';
  end if;

  update public.requests
    set is_public = make_public, updated_at = now()
    where id = target_request and resident_id = auth.uid();

  get diagnostics affected = row_count;

  if affected = 0 then
    raise exception 'Request not found.';
  end if;

  return make_public;
end;
$$;

create or replace function public.toggle_request_support(target_request uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
  shared boolean;
begin
  if auth.uid() is null then
    raise exception 'Sign in to support a request.';
  end if;

  select resident_id, is_public into owner, shared
  from public.requests where id = target_request;

  if owner is null or not shared then
    raise exception 'This request is not open for support.';
  end if;

  if owner = auth.uid() then
    raise exception 'You cannot support your own request.';
  end if;

  if exists (
    select 1 from public.request_supports
    where request_id = target_request and resident_id = auth.uid()
  ) then
    delete from public.request_supports
      where request_id = target_request and resident_id = auth.uid();
    return false;
  end if;

  insert into public.request_supports (request_id, resident_id)
    values (target_request, auth.uid());
  return true;
end;
$$;

create or replace function public.request_support_count(target_request uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.request_supports where request_id = target_request;
$$;

revoke all on function public.set_request_visibility(uuid, boolean) from public, anon;
revoke all on function public.toggle_request_support(uuid) from public, anon;
revoke all on function public.request_support_count(uuid) from public;
grant execute on function public.set_request_visibility(uuid, boolean) to authenticated;
grant execute on function public.toggle_request_support(uuid) to authenticated;
grant execute on function public.request_support_count(uuid) to anon, authenticated;
