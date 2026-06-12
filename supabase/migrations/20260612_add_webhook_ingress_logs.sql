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

create index if not exists idx_webhook_ingress_logs_received_at
  on public.webhook_ingress_logs(received_at desc);

create index if not exists idx_webhook_ingress_logs_app_status
  on public.webhook_ingress_logs(app_key, platform, status, received_at desc);

create index if not exists idx_webhook_ingress_logs_request_id
  on public.webhook_ingress_logs(request_id);

create index if not exists idx_webhook_ingress_logs_body_sha
  on public.webhook_ingress_logs(body_sha256);
