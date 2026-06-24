create extension if not exists pgcrypto;

create table if not exists public.printops_templates (
  id uuid primary key default gen_random_uuid(),
  app_key text not null default 'zider_printops',
  platform text not null,
  instance_id text not null,
  installation_id uuid,
  platform_store_profile_id uuid,
  member_id uuid,
  workspace_id uuid,
  template_id text not null,
  document_type text,
  template_name text,
  default_language text,
  is_default boolean not null default false,
  base_template_key text,
  base_template_version integer,
  template_schema_version integer,
  renderer_version text,
  paper_size text,
  layout_key text,
  status text not null default 'ready',
  template_record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, instance_id, template_id)
);

alter table public.printops_templates
  add column if not exists installation_id uuid,
  add column if not exists platform_store_profile_id uuid,
  add column if not exists member_id uuid,
  add column if not exists workspace_id uuid,
  add column if not exists base_template_key text,
  add column if not exists base_template_version integer,
  add column if not exists template_schema_version integer,
  add column if not exists renderer_version text,
  add column if not exists paper_size text,
  add column if not exists layout_key text,
  add column if not exists status text not null default 'ready';

create table if not exists public.printops_settings (
  id uuid primary key default gen_random_uuid(),
  app_key text not null default 'zider_printops',
  platform text not null,
  instance_id text not null,
  installation_id uuid,
  platform_store_profile_id uuid,
  member_id uuid,
  workspace_id uuid,
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

alter table public.printops_settings
  add column if not exists installation_id uuid,
  add column if not exists platform_store_profile_id uuid,
  add column if not exists member_id uuid,
  add column if not exists workspace_id uuid;

do $$
begin
  if to_regclass('public.app_installations') is not null then
    begin
      alter table public.printops_templates
        add constraint printops_templates_installation_id_fkey
        foreign key (installation_id) references public.app_installations(id) on delete set null;
    exception
      when duplicate_object then null;
    end;

    begin
      alter table public.printops_settings
        add constraint printops_settings_installation_id_fkey
        foreign key (installation_id) references public.app_installations(id) on delete set null;
    exception
      when duplicate_object then null;
    end;
  end if;

  if to_regclass('public.platform_store_profiles') is not null then
    begin
      alter table public.printops_templates
        add constraint printops_templates_platform_store_profile_id_fkey
        foreign key (platform_store_profile_id) references public.platform_store_profiles(id) on delete set null;
    exception
      when duplicate_object then null;
    end;

    begin
      alter table public.printops_settings
        add constraint printops_settings_platform_store_profile_id_fkey
        foreign key (platform_store_profile_id) references public.platform_store_profiles(id) on delete set null;
    exception
      when duplicate_object then null;
    end;
  end if;

  if to_regclass('public.zider_members') is not null then
    begin
      alter table public.printops_templates
        add constraint printops_templates_member_id_fkey
        foreign key (member_id) references public.zider_members(id) on delete set null;
    exception
      when duplicate_object then null;
    end;

    begin
      alter table public.printops_settings
        add constraint printops_settings_member_id_fkey
        foreign key (member_id) references public.zider_members(id) on delete set null;
    exception
      when duplicate_object then null;
    end;
  end if;

  if to_regclass('public.workspaces') is not null then
    begin
      alter table public.printops_templates
        add constraint printops_templates_workspace_id_fkey
        foreign key (workspace_id) references public.workspaces(id) on delete set null;
    exception
      when duplicate_object then null;
    end;

    begin
      alter table public.printops_settings
        add constraint printops_settings_workspace_id_fkey
        foreign key (workspace_id) references public.workspaces(id) on delete set null;
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;

update public.printops_templates
set
  base_template_key = coalesce(base_template_key, template_record->>'baseTemplateKey', template_record->>'baseBlueprintKey'),
  base_template_version = coalesce(
    base_template_version,
    case
      when nullif(template_record->>'baseTemplateVersion', '') ~ '^[0-9]+$'
      then nullif(template_record->>'baseTemplateVersion', '')::integer
      else null
    end,
    case
      when nullif(template_record->>'baseBlueprintVersion', '') ~ '^[0-9]+$'
      then nullif(template_record->>'baseBlueprintVersion', '')::integer
      else null
    end
  ),
  template_schema_version = coalesce(
    template_schema_version,
    case
      when nullif(template_record->>'schemaVersion', '') ~ '^[0-9]+$'
      then nullif(template_record->>'schemaVersion', '')::integer
      else null
    end
  ),
  renderer_version = coalesce(renderer_version, template_record->>'rendererVersion', template_record->>'rendererKey'),
  paper_size = coalesce(paper_size, template_record->>'paperSize'),
  layout_key = coalesce(layout_key, template_record->>'layoutKey', template_record->>'layoutPreset'),
  status = coalesce(nullif(status, ''), lower(coalesce(template_record->>'status', 'ready'))),
  updated_at = now()
where
  base_template_key is null
  or base_template_version is null
  or template_schema_version is null
  or renderer_version is null
  or paper_size is null
  or layout_key is null
  or status is null
  or status = '';

with ranked_defaults as (
  select
    id,
    row_number() over (
      partition by
        app_key,
        platform,
        workspace_id,
        platform_store_profile_id,
        coalesce(document_type, ''),
        coalesce(default_language, '')
      order by updated_at desc, created_at desc, id desc
    ) as default_rank
  from public.printops_templates
  where is_default = true
    and workspace_id is not null
    and platform_store_profile_id is not null
)
update public.printops_templates
set
  is_default = false,
  template_record = jsonb_set(template_record, '{isDefault}', 'false'::jsonb, true),
  updated_at = now()
where id in (select id from ranked_defaults where default_rank > 1);

with ranked_defaults as (
  select
    id,
    row_number() over (
      partition by
        app_key,
        platform,
        workspace_id,
        coalesce(document_type, ''),
        coalesce(default_language, '')
      order by updated_at desc, created_at desc, id desc
    ) as default_rank
  from public.printops_templates
  where is_default = true
    and workspace_id is not null
    and platform_store_profile_id is null
)
update public.printops_templates
set
  is_default = false,
  template_record = jsonb_set(template_record, '{isDefault}', 'false'::jsonb, true),
  updated_at = now()
where id in (select id from ranked_defaults where default_rank > 1);

with ranked_defaults as (
  select
    id,
    row_number() over (
      partition by
        app_key,
        platform,
        instance_id,
        coalesce(document_type, ''),
        coalesce(default_language, '')
      order by updated_at desc, created_at desc, id desc
    ) as default_rank
  from public.printops_templates
  where is_default = true
    and workspace_id is null
    and platform_store_profile_id is null
)
update public.printops_templates
set
  is_default = false,
  template_record = jsonb_set(template_record, '{isDefault}', 'false'::jsonb, true),
  updated_at = now()
where id in (select id from ranked_defaults where default_rank > 1);

create unique index if not exists idx_printops_templates_identity
  on public.printops_templates(app_key, platform, instance_id, template_id);

create unique index if not exists idx_printops_settings_identity
  on public.printops_settings(app_key, platform, instance_id);

create index if not exists idx_printops_templates_instance
  on public.printops_templates(app_key, platform, instance_id, updated_at desc);

create index if not exists idx_printops_templates_default
  on public.printops_templates(app_key, platform, instance_id, document_type, is_default)
  where is_default = true;

create unique index if not exists idx_printops_templates_default_store_scope
  on public.printops_templates(
    app_key,
    platform,
    workspace_id,
    platform_store_profile_id,
    coalesce(document_type, ''),
    coalesce(default_language, '')
  )
  where is_default = true
    and workspace_id is not null
    and platform_store_profile_id is not null;

create unique index if not exists idx_printops_templates_default_workspace_scope
  on public.printops_templates(
    app_key,
    platform,
    workspace_id,
    coalesce(document_type, ''),
    coalesce(default_language, '')
  )
  where is_default = true
    and workspace_id is not null
    and platform_store_profile_id is null;

create unique index if not exists idx_printops_templates_default_instance_scope
  on public.printops_templates(
    app_key,
    platform,
    instance_id,
    coalesce(document_type, ''),
    coalesce(default_language, '')
  )
  where is_default = true
    and workspace_id is null
    and platform_store_profile_id is null;

create index if not exists idx_printops_templates_installation
  on public.printops_templates(installation_id, updated_at desc);

create index if not exists idx_printops_templates_store_profile
  on public.printops_templates(platform_store_profile_id, updated_at desc);

create index if not exists idx_printops_templates_metadata
  on public.printops_templates(app_key, platform, paper_size, layout_key, status);

create index if not exists idx_printops_templates_record_gin
  on public.printops_templates using gin(template_record);

create index if not exists idx_printops_templates_workspace
  on public.printops_templates(workspace_id, updated_at desc);

create index if not exists idx_printops_settings_instance
  on public.printops_settings(app_key, platform, instance_id);

create index if not exists idx_printops_settings_json_gin
  on public.printops_settings using gin(settings);

create index if not exists idx_printops_settings_installation
  on public.printops_settings(installation_id);

create index if not exists idx_printops_settings_store_profile
  on public.printops_settings(platform_store_profile_id);

create index if not exists idx_printops_settings_workspace
  on public.printops_settings(workspace_id);

alter table public.printops_templates enable row level security;
alter table public.printops_settings enable row level security;

notify pgrst, 'reload schema';
