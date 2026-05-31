-- ============================================================
-- Refactor: clean app_platform_secrets + remove _ref columns
-- ============================================================

-- 1. Create or migrate app_platform_secrets to clean schema
-- ---------------------------------------------------------------
create table if not exists public.app_platform_secrets (
  id uuid primary key default gen_random_uuid(),
  app_key  text not null,
  platform text not null default 'wix',
  client_id     text,
  client_secret text,
  webhook_public_key text,
  webhook_secret text,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform)
);

-- If table already existed with old column names, rename them.
do $$
begin
  -- oauth_client_id → client_id
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'app_platform_secrets'
      and column_name  = 'oauth_client_id'
  ) then
    alter table public.app_platform_secrets
      rename column oauth_client_id to client_id;
  end if;

  -- oauth_client_secret → client_secret
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'app_platform_secrets'
      and column_name  = 'oauth_client_secret'
  ) then
    alter table public.app_platform_secrets
      rename column oauth_client_secret to client_secret;
  end if;

  -- drop app_secret (folded into client_secret)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'app_platform_secrets'
      and column_name  = 'app_secret'
  ) then
    alter table public.app_platform_secrets
      drop column app_secret;
  end if;

  -- add webhook_secret if missing
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'app_platform_secrets'
      and column_name  = 'webhook_secret'
  ) then
    alter table public.app_platform_secrets
      add column webhook_secret text;
  end if;
end $$;

create index if not exists idx_app_platform_secrets_lookup
  on public.app_platform_secrets(app_key, platform);

alter table public.app_platform_secrets enable row level security;

-- 2. Migrate existing Wix public keys from app_platforms
-- ---------------------------------------------------------------
insert into public.app_platform_secrets (
  app_key,
  platform,
  client_id,
  webhook_public_key,
  notes
)
select
  ap.app_key,
  ap.platform,
  -- oauth_client_id_ref: only migrate if it looks like a real ID (not an env var name)
  case
    when ap.oauth_client_id_ref is not null
      and ap.oauth_client_id_ref !~ '^[A-Z0-9_]+$'
    then ap.oauth_client_id_ref
    else null
  end as client_id,
  -- webhook_public_key_ref: only migrate if it contains an actual PEM key
  case
    when ap.webhook_public_key_ref like '%BEGIN PUBLIC KEY%'
    then ap.webhook_public_key_ref
    else null
  end as webhook_public_key,
  'Migrated from app_platforms refs' as notes
from public.app_platforms ap
where ap.webhook_public_key_ref is not null
   or ap.oauth_client_id_ref is not null
on conflict (app_key, platform) do update
  set
    client_id          = coalesce(excluded.client_id,          app_platform_secrets.client_id),
    webhook_public_key = coalesce(excluded.webhook_public_key, app_platform_secrets.webhook_public_key),
    updated_at         = now();

-- 3. Verify migration before dropping columns
-- ---------------------------------------------------------------
-- Run this SELECT first; if results look correct, proceed to step 4.
select
  app_key,
  platform,
  client_id,
  left(webhook_public_key, 40) as key_preview
from public.app_platform_secrets
order by app_key;

-- 4. Drop legacy _ref columns from app_platforms
-- ---------------------------------------------------------------
-- Only run after verifying step 3 results are correct.
alter table public.app_platforms
  drop column if exists webhook_public_key_ref,
  drop column if exists oauth_client_id_ref;
