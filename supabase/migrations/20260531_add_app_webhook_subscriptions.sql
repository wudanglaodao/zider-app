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

create index if not exists idx_app_webhook_subscriptions_app_platform
  on public.app_webhook_subscriptions(app_key, platform, status);
