alter table public.printops_templates
  add column if not exists base_template_key text,
  add column if not exists base_template_version integer,
  add column if not exists template_schema_version integer,
  add column if not exists renderer_version text,
  add column if not exists paper_size text,
  add column if not exists layout_key text,
  add column if not exists status text not null default 'ready';

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

create index if not exists idx_printops_templates_metadata
  on public.printops_templates(app_key, platform, paper_size, layout_key, status);
