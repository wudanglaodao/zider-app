create table if not exists public.printops_templates (
  id uuid primary key default gen_random_uuid(),
  app_key text not null default 'zider_printops',
  platform text not null,
  instance_id text not null,
  template_id text not null,
  document_type text,
  template_name text,
  default_language text,
  is_default boolean not null default false,
  template_record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, instance_id, template_id)
);

create index if not exists idx_printops_templates_instance
  on public.printops_templates(app_key, platform, instance_id, updated_at desc);

create index if not exists idx_printops_templates_default
  on public.printops_templates(app_key, platform, instance_id, document_type, is_default)
  where is_default = true;

create index if not exists idx_printops_templates_record_gin
  on public.printops_templates using gin(template_record);

alter table public.printops_templates enable row level security;
