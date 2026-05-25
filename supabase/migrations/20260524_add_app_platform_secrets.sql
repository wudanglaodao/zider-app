create extension if not exists pgcrypto;

create table if not exists public.app_platform_secrets (
  id uuid primary key default gen_random_uuid(),
  app_key text not null,
  platform text not null default 'wix',
  oauth_client_id text,
  oauth_client_secret text,
  app_secret text,
  webhook_public_key text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform)
);

create index if not exists idx_app_platform_secrets_app_platform
  on public.app_platform_secrets(app_key, platform);

alter table public.app_platform_secrets enable row level security;
