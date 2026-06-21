create table if not exists public.printops_settings (
  id uuid primary key default gen_random_uuid(),
  app_key text not null default 'zider_printops',
  platform text not null,
  instance_id text not null,
  site_locale text,
  print_locale text,
  timezone text,
  workspace_accent text,
  theme text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, instance_id)
);

create index if not exists idx_printops_settings_instance
  on public.printops_settings(app_key, platform, instance_id);

create index if not exists idx_printops_settings_json_gin
  on public.printops_settings using gin(settings);

alter table public.printops_settings enable row level security;
