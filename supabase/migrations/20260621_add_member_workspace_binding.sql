create table if not exists public.zider_members (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_member_id uuid references public.zider_members(id) on delete set null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id uuid not null references public.zider_members(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, member_id)
);

alter table public.app_installations
  add column if not exists member_id uuid references public.zider_members(id) on delete set null,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists binding_email text,
  add column if not exists binding_status text not null default 'pending' check (binding_status in ('pending', 'verified', 'revoked')),
  add column if not exists binding_verified_at timestamptz;

alter table public.platform_store_profiles
  add column if not exists member_id uuid references public.zider_members(id) on delete set null,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

alter table public.printops_orders
  add column if not exists member_id uuid references public.zider_members(id) on delete set null,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

alter table public.printops_templates
  add column if not exists member_id uuid references public.zider_members(id) on delete set null,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

alter table public.printops_settings
  add column if not exists member_id uuid references public.zider_members(id) on delete set null,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

update public.platform_store_profiles as profile
set
  member_id = installation.member_id,
  workspace_id = installation.workspace_id,
  updated_at = now()
from public.app_installations as installation
where profile.id = installation.platform_store_profile_id
  and (profile.member_id is null or profile.workspace_id is null)
  and (installation.member_id is not null or installation.workspace_id is not null);

update public.printops_orders as printops
set
  member_id = installation.member_id,
  workspace_id = installation.workspace_id,
  updated_at = now()
from public.app_installations as installation
where printops.installation_id = installation.id
  and (printops.member_id is null or printops.workspace_id is null)
  and (installation.member_id is not null or installation.workspace_id is not null);

update public.printops_templates as printops
set
  member_id = installation.member_id,
  workspace_id = installation.workspace_id,
  updated_at = now()
from public.app_installations as installation
where printops.installation_id = installation.id
  and (printops.member_id is null or printops.workspace_id is null)
  and (installation.member_id is not null or installation.workspace_id is not null);

update public.printops_settings as printops
set
  member_id = installation.member_id,
  workspace_id = installation.workspace_id,
  updated_at = now()
from public.app_installations as installation
where printops.installation_id = installation.id
  and (printops.member_id is null or printops.workspace_id is null)
  and (installation.member_id is not null or installation.workspace_id is not null);

create index if not exists idx_zider_members_email
  on public.zider_members(email);

create index if not exists idx_workspaces_owner
  on public.workspaces(owner_member_id);

create index if not exists idx_workspace_members_member
  on public.workspace_members(member_id, status);

create index if not exists idx_app_installations_member_workspace
  on public.app_installations(member_id, workspace_id);

create index if not exists idx_app_installations_binding
  on public.app_installations(app_key, platform, binding_status);

create index if not exists idx_platform_store_profiles_workspace
  on public.platform_store_profiles(workspace_id, platform);

create index if not exists idx_printops_orders_workspace
  on public.printops_orders(workspace_id, synced_at desc);

create index if not exists idx_printops_templates_workspace
  on public.printops_templates(workspace_id, updated_at desc);

create index if not exists idx_printops_settings_workspace
  on public.printops_settings(workspace_id);

alter table public.zider_members enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
