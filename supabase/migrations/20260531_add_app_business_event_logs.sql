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

create index if not exists idx_app_business_event_logs_app_domain_type
  on public.app_business_event_logs(app_key, platform, business_domain, event_type);

create index if not exists idx_app_business_event_logs_source_entity
  on public.app_business_event_logs(app_key, platform, source_entity_type, source_entity_id);

create index if not exists idx_app_business_event_logs_received_at
  on public.app_business_event_logs(received_at desc);
