-- Role expansion
alter type public.user_role
  add value if not exists 'superadmin';

alter type public.user_role
  add value if not exists 'org_admin';

alter type public.user_role
  add value if not exists 'office_admin';


-- Organization memberships
create table if not exists public.organization_members (
  organization_id uuid not null
    references public.organizations(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  role public.user_role not null
    default 'staff',

  created_at timestamptz not null
    default now(),

  primary key (
    organization_id,
    user_id
  )
);

create index if not exists
organization_members_user_idx
on public.organization_members(user_id);

create index if not exists
organization_members_org_role_idx
on public.organization_members(
  organization_id,
  role
);

alter table public.organization_members
enable row level security;


-- Request routing
alter table public.requests
add column if not exists
assigned_office_id uuid
references public.offices(id)
on delete set null;

alter table public.requests
add column if not exists
routed_at timestamptz;

create index if not exists
requests_assigned_office_idx
on public.requests(assigned_office_id);


create table if not exists public.service_routes (
  id uuid primary key
    default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id)
    on delete cascade,

  jurisdiction_id uuid
    references public.jurisdictions(id)
    on delete cascade,

  category text,

  office_id uuid not null
    references public.offices(id)
    on delete cascade,

  priority integer not null
    default 100,

  is_active boolean not null
    default true,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);

create index if not exists
service_routes_lookup_idx
on public.service_routes(
  organization_id,
  jurisdiction_id,
  category,
  is_active,
  priority
);


-- WhatsApp
create table if not exists public.whatsapp_conversations (
  id uuid primary key
    default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id)
    on delete cascade,

  resident_id uuid
    references auth.users(id)
    on delete set null,

  phone_number text not null,

  status text not null
    default 'open'
    check (
      status in (
        'open',
        'pending',
        'closed'
      )
    ),

  last_message_at timestamptz,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);


create table if not exists public.whatsapp_messages (
  id uuid primary key
    default gen_random_uuid(),

  conversation_id uuid not null
    references public.whatsapp_conversations(id)
    on delete cascade,

  direction text not null
    check (
      direction in (
        'inbound',
        'outbound'
      )
    ),

  provider_message_id text,

  message_type text not null
    default 'text',

  body text,

  media_url text,

  status text not null
    default 'received',

  created_at timestamptz not null
    default now()
);


-- Notification delivery tracking
create table if not exists public.notification_deliveries (
  id uuid primary key
    default gen_random_uuid(),

  notification_id uuid not null
    references public.notifications(id)
    on delete cascade,

  channel text not null
    check (
      channel in (
        'in_app',
        'whatsapp',
        'email',
        'sms'
      )
    ),

  provider text,

  provider_message_id text,

  status text not null
    default 'queued',

  attempts integer not null
    default 0,

  last_error text,

  sent_at timestamptz,

  delivered_at timestamptz,

  created_at timestamptz not null
    default now()
);


-- Security
alter table public.organization_members
enable row level security;

drop policy if exists
"Members can view their organization memberships"
on public.organization_members;

create policy
"Members can view their organization memberships"
on public.organization_members
for select
to authenticated
using (
  user_id = (select auth.uid())
);


drop policy if exists
"Platform admins manage organization memberships"
on public.organization_members;

create policy
"Platform admins manage organization memberships"
on public.organization_members
for all
to authenticated
using (
  (select role
   from public.profiles
   where id = (select auth.uid()))
  in ('admin','superadmin')
)
with check (
  (select role
   from public.profiles
   where id = (select auth.uid()))
  in ('admin','superadmin')
);