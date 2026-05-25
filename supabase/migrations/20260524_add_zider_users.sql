create extension if not exists pgcrypto;

create table if not exists public.zider_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text,
  password_hash text not null,
  role text not null default 'member' check (role in ('admin', 'editor', 'member')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create index if not exists idx_zider_users_role_status
  on public.zider_users(role, status);

alter table public.zider_users enable row level security;
