create extension if not exists pgcrypto;

create table if not exists public.zider_apps (
  id uuid primary key default gen_random_uuid(),
  app_key text not null unique,
  app_name text not null,
  app_category text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_platforms (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.zider_apps(id) on delete cascade,
  app_key text not null,
  platform text not null,
  platform_app_id text,
  platform_app_name text,
  marketplace_url text,
  status text not null default 'active',
  webhook_public_key_ref text,
  oauth_client_id_ref text,
  default_billing_provider text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform)
);

create table if not exists public.app_installations (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.zider_apps(id) on delete cascade,
  app_key text not null,
  app_platform_id uuid references public.app_platforms(id) on delete set null,
  platform text not null,
  distribution_channel text not null default 'unknown',
  acquisition_source text not null default 'unknown',
  acquisition_medium text,
  acquisition_campaign text,
  referrer_url text,
  landing_url text,
  instance_id text not null,
  external_install_id text,
  site_id text,
  external_site_id text,
  site_owner_id text,
  site_url text,
  account_id text,
  external_account_id text,
  app_version text,
  status text not null default 'active',
  event_source text not null default 'live',
  is_test_install boolean not null default false,
  test_reason text,
  is_free boolean,
  billing_provider text not null default 'unknown',
  current_plan_id text,
  current_plan_name text,
  installed_at timestamptz,
  uninstalled_at timestamptz,
  last_event_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, instance_id)
);

create table if not exists public.install_attribution_events (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid references public.app_installations(id) on delete cascade,
  app_id uuid references public.zider_apps(id) on delete cascade,
  app_key text not null,
  platform text not null,
  distribution_channel text not null default 'unknown',
  acquisition_source text not null default 'unknown',
  acquisition_medium text,
  acquisition_campaign text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer_url text,
  landing_url text,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.platform_event_logs (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.zider_apps(id) on delete cascade,
  app_key text not null,
  app_platform_id uuid references public.app_platforms(id) on delete set null,
  platform text not null,
  instance_id text,
  event_type text not null,
  event_id text,
  event_time timestamptz,
  dedupe_key text not null unique,
  raw_body text,
  raw_jwt text,
  raw_headers jsonb,
  decoded_payload jsonb,
  event_source text not null default 'live',
  is_test_event boolean not null default false,
  test_reason text,
  verification_status text not null default 'unverified',
  processing_status text not null default 'received',
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.app_billing_events (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.zider_apps(id) on delete cascade,
  app_key text not null,
  platform text not null,
  app_platform_id uuid references public.app_platforms(id) on delete set null,
  installation_id uuid references public.app_installations(id) on delete set null,
  instance_id text,
  event_type text not null,
  event_source text not null default 'live',
  is_test_event boolean not null default false,
  test_reason text,
  billing_provider text not null default 'unknown',
  vendor_product_id text,
  previous_vendor_product_id text,
  cycle text,
  previous_cycle text,
  invoice_id text,
  coupon_name text,
  operation_timestamp timestamptz,
  raw_event_id uuid unique references public.platform_event_logs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.app_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.zider_apps(id) on delete cascade,
  app_key text not null,
  platform text not null,
  distribution_channel text not null default 'unknown',
  date date not null,
  installs integer not null default 0,
  uninstalls integer not null default 0,
  net_installs integer not null default 0,
  paid_plan_purchases integer not null default 0,
  paid_plan_changes integer not null default 0,
  active_instances integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, distribution_channel, date)
);

create index if not exists idx_app_installations_app_platform_status
  on public.app_installations(app_key, platform, status);

create index if not exists idx_platform_event_logs_received_at
  on public.platform_event_logs(received_at desc);

create index if not exists idx_platform_event_logs_app_type
  on public.platform_event_logs(app_key, platform, event_type);

create index if not exists idx_platform_event_logs_test_events
  on public.platform_event_logs(app_key, platform, is_test_event, received_at desc);

create index if not exists idx_app_billing_events_app_created
  on public.app_billing_events(app_key, platform, created_at desc);
