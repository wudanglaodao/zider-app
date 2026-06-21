alter table public.app_installations
  add column if not exists platform_store_profile_id uuid references public.platform_store_profiles(id) on delete set null;

alter table public.printops_orders
  add column if not exists installation_id uuid references public.app_installations(id) on delete set null,
  add column if not exists platform_store_profile_id uuid references public.platform_store_profiles(id) on delete set null;

alter table public.printops_templates
  add column if not exists installation_id uuid references public.app_installations(id) on delete set null,
  add column if not exists platform_store_profile_id uuid references public.platform_store_profiles(id) on delete set null;

alter table public.printops_settings
  add column if not exists installation_id uuid references public.app_installations(id) on delete set null,
  add column if not exists platform_store_profile_id uuid references public.platform_store_profiles(id) on delete set null;

update public.app_installations as installation
set
  platform_store_profile_id = profile.id,
  updated_at = now()
from public.platform_store_profiles as profile
where installation.platform_store_profile_id is null
  and profile.platform = installation.platform
  and (
    (installation.site_id is not null and profile.platform_site_id = installation.site_id)
    or (installation.external_site_id is not null and profile.platform_site_id = installation.external_site_id)
    or profile.last_seen_instance_id = installation.instance_id
  );

update public.printops_orders as printops
set
  installation_id = installation.id,
  platform_store_profile_id = installation.platform_store_profile_id,
  updated_at = now()
from public.app_installations as installation
where printops.installation_id is null
  and installation.app_key = printops.app_key
  and installation.platform = printops.platform
  and installation.instance_id = printops.instance_id;

update public.printops_templates as printops
set
  installation_id = installation.id,
  platform_store_profile_id = installation.platform_store_profile_id,
  updated_at = now()
from public.app_installations as installation
where printops.installation_id is null
  and installation.app_key = printops.app_key
  and installation.platform = printops.platform
  and installation.instance_id = printops.instance_id;

update public.printops_settings as printops
set
  installation_id = installation.id,
  platform_store_profile_id = installation.platform_store_profile_id,
  updated_at = now()
from public.app_installations as installation
where printops.installation_id is null
  and installation.app_key = printops.app_key
  and installation.platform = printops.platform
  and installation.instance_id = printops.instance_id;

create index if not exists idx_app_installations_store_profile
  on public.app_installations(platform_store_profile_id);

create index if not exists idx_printops_orders_installation
  on public.printops_orders(installation_id, synced_at desc);

create index if not exists idx_printops_orders_store_profile
  on public.printops_orders(platform_store_profile_id, synced_at desc);

create index if not exists idx_printops_templates_installation
  on public.printops_templates(installation_id, updated_at desc);

create index if not exists idx_printops_templates_store_profile
  on public.printops_templates(platform_store_profile_id, updated_at desc);

create index if not exists idx_printops_settings_installation
  on public.printops_settings(installation_id);

create index if not exists idx_printops_settings_store_profile
  on public.printops_settings(platform_store_profile_id);
