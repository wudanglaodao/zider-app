create table if not exists public.printops_store_profiles (
  id uuid primary key default gen_random_uuid(),
  app_key text not null default 'zider_printops',
  platform text not null default 'wix',
  instance_id text not null,
  site_id text,
  site_url text,
  business_name text,
  business_email text,
  logo_media_path text,
  logo_url text,
  phone text,
  address jsonb not null default '{}'::jsonb,
  language text,
  locale text,
  timezone text,
  currency text,
  raw_profile jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, instance_id)
);

create index if not exists idx_printops_store_profiles_instance
  on public.printops_store_profiles(app_key, platform, instance_id);

create index if not exists idx_printops_store_profiles_synced
  on public.printops_store_profiles(app_key, platform, synced_at desc);

alter table public.printops_store_profiles enable row level security;
