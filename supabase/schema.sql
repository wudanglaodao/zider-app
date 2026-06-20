create extension if not exists pgcrypto;

create table if not exists public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('blog', 'forum')),
  locale text not null default 'en',
  title text not null,
  slug text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  excerpt text,
  body text,
  cover_image_url text,
  tags text[] not null default '{}',
  source_url text,
  author_name text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_type, locale, slug)
);

create table if not exists public.zider_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  avatar_url text,
  display_name text,
  password_hash text not null,
  role text not null default 'member' check (role in ('admin', 'editor', 'member')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

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
  default_billing_provider text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform)
);

create table if not exists public.app_platform_secrets (
  id uuid primary key default gen_random_uuid(),
  app_key text not null,
  platform text not null default 'wix',
  client_id text,
  client_secret text,
  webhook_public_key text,
  webhook_secret text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform)
);

create table if not exists public.app_webhook_subscriptions (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.zider_apps(id) on delete cascade,
  app_key text not null,
  app_platform_id uuid references public.app_platforms(id) on delete set null,
  platform text not null,
  event_type text not null,
  event_name text not null,
  callback_url text not null,
  status text not null default 'required',
  subscribed_at timestamptz,
  last_verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, event_type)
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

create table if not exists public.webhook_ingress_logs (
  id uuid primary key default gen_random_uuid(),
  request_id text,
  platform text not null,
  app_key text,
  route text not null,
  method text not null default 'POST',
  host text,
  user_agent text,
  source_ip text,
  content_type text,
  body_sha256 text,
  body_bytes integer,
  headers jsonb,
  status text not null default 'received',
  verification_status text not null default 'pending',
  processing_status text not null default 'pending',
  http_status integer,
  event_type text,
  raw_event_type text,
  event_id text,
  event_time timestamptz,
  instance_id text,
  event_source text,
  is_test_event boolean,
  test_reason text,
  platform_event_log_id uuid references public.platform_event_logs(id) on delete set null,
  error_type text,
  error_message text,
  received_at timestamptz not null default now(),
  verified_at timestamptz,
  responded_at timestamptz,
  processed_at timestamptz,
  duration_ms integer
);

create table if not exists public.app_business_event_logs (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.zider_apps(id) on delete cascade,
  app_key text not null,
  app_platform_id uuid references public.app_platforms(id) on delete set null,
  platform text not null,
  business_domain text not null default 'business',
  instance_id text,
  event_type text not null,
  event_id text,
  event_time timestamptz,
  source_entity_type text,
  source_entity_id text,
  source_entity_number text,
  dedupe_key text not null unique,
  raw_body text,
  raw_jwt text,
  raw_headers jsonb,
  decoded_payload jsonb,
  event_data jsonb,
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

create table if not exists public.printops_orders (
  id uuid primary key default gen_random_uuid(),
  app_key text not null default 'zider_printops',
  platform text not null,
  instance_id text not null,
  source_order_id text not null,
  source_order_number text,
  source_created_at timestamptz,
  source_updated_at timestamptz,
  payment_status text,
  fulfillment_status text,
  currency text,
  customer_name text,
  customer_email text,
  customer_phone text,
  delivery_method text,
  payment_method text,
  note text,
  total_item_quantity integer not null default 0,
  total_amount numeric,
  total_formatted text,
  line_item_count integer not null default 0,
  custom_field_count integer not null default 0,
  print_status text not null default 'unprinted',
  printed_at timestamptz,
  print_updated_at timestamptz,
  normalized_order jsonb not null,
  raw_order jsonb,
  last_sync_mode text,
  last_event_type text,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, instance_id, source_order_id)
);

create table if not exists public.platform_store_profiles (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'wix',
  platform_site_id text,
  primary_site_url text,
  business_name text,
  business_email text,
  owner_email text,
  logo_media_path text,
  logo_url text,
  phone text,
  address jsonb not null default '{}'::jsonb,
  language text,
  locale text,
  timezone text,
  currency text,
  raw_profile jsonb not null default '{}'::jsonb,
  first_seen_app_key text,
  last_synced_app_key text,
  last_seen_instance_id text not null,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, platform_site_id),
  unique (platform, last_seen_instance_id)
);

create index if not exists idx_app_installations_app_platform_status
  on public.app_installations(app_key, platform, status);

create index if not exists idx_app_platform_secrets_app_platform
  on public.app_platform_secrets(app_key, platform);

create index if not exists idx_app_webhook_subscriptions_app_platform
  on public.app_webhook_subscriptions(app_key, platform, status);

create index if not exists idx_platform_event_logs_received_at
  on public.platform_event_logs(received_at desc);

create index if not exists idx_platform_event_logs_app_type
  on public.platform_event_logs(app_key, platform, event_type);

create index if not exists idx_platform_event_logs_test_events
  on public.platform_event_logs(app_key, platform, is_test_event, received_at desc);

create index if not exists idx_webhook_ingress_logs_received_at
  on public.webhook_ingress_logs(received_at desc);

create index if not exists idx_webhook_ingress_logs_app_status
  on public.webhook_ingress_logs(app_key, platform, status, received_at desc);

create index if not exists idx_webhook_ingress_logs_request_id
  on public.webhook_ingress_logs(request_id);

create index if not exists idx_webhook_ingress_logs_body_sha
  on public.webhook_ingress_logs(body_sha256);

create index if not exists idx_app_business_event_logs_app_domain_type
  on public.app_business_event_logs(app_key, platform, business_domain, event_type);

create index if not exists idx_app_business_event_logs_source_entity
  on public.app_business_event_logs(app_key, platform, source_entity_type, source_entity_id);

create index if not exists idx_app_business_event_logs_received_at
  on public.app_business_event_logs(received_at desc);

create index if not exists idx_app_billing_events_app_created
  on public.app_billing_events(app_key, platform, created_at desc);

create index if not exists idx_printops_orders_instance_updated
  on public.printops_orders(app_key, platform, instance_id, source_updated_at desc nulls last);

create index if not exists idx_printops_orders_instance_synced
  on public.printops_orders(app_key, platform, instance_id, synced_at desc);

create index if not exists idx_printops_orders_number
  on public.printops_orders(app_key, platform, source_order_number);

create index if not exists idx_printops_orders_status
  on public.printops_orders(app_key, platform, payment_status, fulfillment_status);

create index if not exists idx_printops_orders_print_status
  on public.printops_orders(app_key, platform, instance_id, print_status);

create index if not exists idx_printops_orders_normalized_gin
  on public.printops_orders using gin(normalized_order);

create index if not exists idx_app_installations_platform_site
  on public.app_installations(platform, site_id);

create index if not exists idx_platform_store_profiles_site
  on public.platform_store_profiles(platform, platform_site_id);

create index if not exists idx_platform_store_profiles_instance
  on public.platform_store_profiles(platform, last_seen_instance_id);

create index if not exists idx_platform_store_profiles_synced
  on public.platform_store_profiles(platform, synced_at desc);

create index if not exists idx_cms_entries_public_lookup
  on public.cms_entries(content_type, locale, slug)
  where status = 'published';

create index if not exists idx_cms_entries_admin_updated
  on public.cms_entries(status, updated_at desc);

create index if not exists idx_cms_entries_tags
  on public.cms_entries using gin(tags);

create index if not exists idx_zider_users_role_status
  on public.zider_users(role, status);

alter table public.cms_entries enable row level security;
alter table public.zider_users enable row level security;
alter table public.app_platform_secrets enable row level security;
alter table public.printops_orders enable row level security;
alter table public.platform_store_profiles enable row level security;
