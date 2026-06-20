create table if not exists public.platform_store_profiles (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'wix',
  platform_site_id text,
  primary_site_url text,
  business_name text,
  business_email text,
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

do $$
begin
if to_regclass('public.printops_store_profiles') is not null then
insert into public.platform_store_profiles (
  platform,
  platform_site_id,
  primary_site_url,
  business_name,
  business_email,
  logo_media_path,
  logo_url,
  phone,
  address,
  language,
  locale,
  timezone,
  currency,
  raw_profile,
  first_seen_app_key,
  last_synced_app_key,
  last_seen_instance_id,
  synced_at,
  created_at,
  updated_at
)
select distinct on (legacy.platform, legacy.site_id)
  legacy.platform,
  legacy.site_id,
  legacy.site_url,
  legacy.business_name,
  legacy.business_email,
  legacy.logo_media_path,
  legacy.logo_url,
  legacy.phone,
  legacy.address,
  legacy.language,
  legacy.locale,
  legacy.timezone,
  legacy.currency,
  legacy.raw_profile,
  legacy.app_key,
  legacy.app_key,
  legacy.instance_id,
  legacy.synced_at,
  legacy.created_at,
  legacy.updated_at
from public.printops_store_profiles as legacy
where legacy.site_id is not null
order by legacy.platform, legacy.site_id, legacy.synced_at desc
on conflict (platform, platform_site_id) do update set
  primary_site_url = excluded.primary_site_url,
  business_name = excluded.business_name,
  business_email = excluded.business_email,
  logo_media_path = excluded.logo_media_path,
  logo_url = excluded.logo_url,
  phone = excluded.phone,
  address = excluded.address,
  language = excluded.language,
  locale = excluded.locale,
  timezone = excluded.timezone,
  currency = excluded.currency,
  raw_profile = excluded.raw_profile,
  first_seen_app_key = coalesce(public.platform_store_profiles.first_seen_app_key, excluded.first_seen_app_key),
  last_synced_app_key = excluded.last_synced_app_key,
  last_seen_instance_id = excluded.last_seen_instance_id,
  synced_at = excluded.synced_at,
  updated_at = excluded.updated_at;

insert into public.platform_store_profiles (
  platform,
  platform_site_id,
  primary_site_url,
  business_name,
  business_email,
  logo_media_path,
  logo_url,
  phone,
  address,
  language,
  locale,
  timezone,
  currency,
  raw_profile,
  first_seen_app_key,
  last_synced_app_key,
  last_seen_instance_id,
  synced_at,
  created_at,
  updated_at
)
select distinct on (legacy.platform, legacy.instance_id)
  legacy.platform,
  null,
  legacy.site_url,
  legacy.business_name,
  legacy.business_email,
  legacy.logo_media_path,
  legacy.logo_url,
  legacy.phone,
  legacy.address,
  legacy.language,
  legacy.locale,
  legacy.timezone,
  legacy.currency,
  legacy.raw_profile,
  legacy.app_key,
  legacy.app_key,
  legacy.instance_id,
  legacy.synced_at,
  legacy.created_at,
  legacy.updated_at
from public.printops_store_profiles as legacy
where legacy.site_id is null
order by legacy.platform, legacy.instance_id, legacy.synced_at desc
on conflict (platform, last_seen_instance_id) do update set
  primary_site_url = excluded.primary_site_url,
  business_name = excluded.business_name,
  business_email = excluded.business_email,
  logo_media_path = excluded.logo_media_path,
  logo_url = excluded.logo_url,
  phone = excluded.phone,
  address = excluded.address,
  language = excluded.language,
  locale = excluded.locale,
  timezone = excluded.timezone,
  currency = excluded.currency,
  raw_profile = excluded.raw_profile,
  first_seen_app_key = coalesce(public.platform_store_profiles.first_seen_app_key, excluded.first_seen_app_key),
  last_synced_app_key = excluded.last_synced_app_key,
  synced_at = excluded.synced_at,
  updated_at = excluded.updated_at;

create index if not exists idx_platform_store_profiles_site
  on public.platform_store_profiles(platform, platform_site_id);

create index if not exists idx_platform_store_profiles_instance
  on public.platform_store_profiles(platform, last_seen_instance_id);

create index if not exists idx_platform_store_profiles_synced
  on public.platform_store_profiles(platform, synced_at desc);

create index if not exists idx_app_installations_platform_site
  on public.app_installations(platform, site_id);

update public.app_installations as installation
set
  external_site_id = coalesce(installation.external_site_id, legacy.site_id),
  site_id = coalesce(installation.site_id, legacy.site_id),
  site_url = coalesce(installation.site_url, legacy.site_url),
  updated_at = now()
from (
  select distinct on (app_key, platform, instance_id)
    app_key,
    platform,
    instance_id,
    site_id,
    site_url
  from public.printops_store_profiles
  order by app_key, platform, instance_id, synced_at desc
) as legacy
where installation.app_key = legacy.app_key
  and installation.platform = legacy.platform
  and installation.instance_id = legacy.instance_id;

drop table public.printops_store_profiles;
end if;
end $$;

alter table public.platform_store_profiles enable row level security;
