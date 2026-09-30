-- Public leadership profiles and content collaborations.
--
-- A leader is a public office holder with a profile page. Programmes,
-- opportunities and projects can be linked to one leader (individual) or to
-- several leaders (joint collaboration) through content_leaders, where each
-- link carries a role: 'lead' or 'partner'.

create table if not exists public.leaders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  slug text not null unique,
  name text not null,
  role text not null,
  level text check (level in ('federal', 'state', 'local')),
  level_label text,
  office text,
  jurisdiction text,
  constituency text,
  summary text,
  biography text[] not null default '{}',
  service text[] not null default '{}',
  sources jsonb not null default '[]'::jsonb,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists leaders_set_updated_at on public.leaders;
create trigger leaders_set_updated_at
  before update on public.leaders
  for each row execute function public.set_updated_at();

create table if not exists public.content_leaders (
  content_type text not null check (content_type in ('programme', 'opportunity', 'project')),
  content_id uuid not null,
  leader_id uuid not null references public.leaders(id) on delete cascade,
  role text not null default 'lead' check (role in ('lead', 'partner')),
  created_at timestamptz not null default now(),
  primary key (content_type, content_id, leader_id)
);

create index if not exists content_leaders_leader_idx on public.content_leaders (leader_id);
create index if not exists content_leaders_content_idx on public.content_leaders (content_type, content_id);
create index if not exists leaders_active_idx on public.leaders (is_active, sort_order, name);
