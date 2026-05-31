-- Zider PrintOps Wix app and required App Management webhook subscriptions.
-- The webhook subscription inventory is optional. If
-- public.app_webhook_subscriptions has not been migrated yet, this seed still
-- creates the core app/platform/secret records and skips the inventory insert.

with upserted_app as (
  insert into public.zider_apps (
    app_key,
    app_name,
    app_category,
    status
  )
  values (
    'zider_printops',
    'Zider PrintOps',
    'print_operations',
    'private-preview'
  )
  on conflict (app_key)
  do update set
    app_name = excluded.app_name,
    app_category = excluded.app_category,
    status = excluded.status,
    updated_at = now()
  returning id, app_key, app_name, status
),
upserted_platform as (
  insert into public.app_platforms (
    app_id,
    app_key,
    platform,
    platform_app_id,
    platform_app_name,
    marketplace_url,
    status,
    default_billing_provider
  )
  select
    id,
    app_key,
    'wix',
    '5d48a40b-9822-4d8f-910a-d383501a4ea9',
    app_name,
    null,
    status,
    'wix'
  from upserted_app
  on conflict (app_key, platform)
  do update set
    app_id = excluded.app_id,
    platform_app_id = excluded.platform_app_id,
    platform_app_name = excluded.platform_app_name,
    marketplace_url = excluded.marketplace_url,
    status = excluded.status,
    default_billing_provider = excluded.default_billing_provider,
    updated_at = now()
  returning id, app_id, app_key
),
upserted_secret as (
  insert into public.app_platform_secrets (
    app_key,
    platform,
    client_id,
    client_secret,
    webhook_public_key,
    notes
  )
  values (
    'zider_printops',
    'wix',
    '5d48a40b-9822-4d8f-910a-d383501a4ea9',
    null,
    null,
    'Zider PrintOps Wix credentials. Fill client_secret for OAuth/API calls and webhook_public_key for Wix Events/Webhooks JWT verification.'
  )
  on conflict (app_key, platform)
  do update set
    client_id = excluded.client_id,
    notes = excluded.notes,
    updated_at = now()
  returning app_key, platform
)
select
  upserted_platform.app_key,
  upserted_platform.id as app_platform_id,
  upserted_secret.platform
from upserted_platform
cross join upserted_secret;

do $$
begin
  if to_regclass('public.app_webhook_subscriptions') is null then
    raise notice 'Skipping app_webhook_subscriptions seed because the table does not exist.';
    return;
  end if;

  execute $sql$
    with required_webhooks(event_type, event_name, notes) as (
      values
        ('app_instance_installed', 'App Instance Installed', 'Install lifecycle event.'),
        ('app_instance_removed', 'App Instance Removed', 'Uninstall lifecycle event.'),
        ('paid_plan_purchased', 'Paid Plan Purchased', 'Wix billing conversion event.'),
        ('paid_plan_changed', 'Paid Plan Changed', 'Upgrade or downgrade event.'),
        ('paid_plan_auto_renewal_cancelled', 'Paid Plan Auto Renewal Cancelled', 'Renewal cancellation event.'),
        ('plan_converted_to_paid', 'Plan Converted to Paid', 'Trial or free plan converted to paid.'),
        ('plan_reactivated', 'Plan Reactivated', 'Paid plan reactivation event.'),
        ('plan_transferred', 'Plan Transferred', 'Plan transfer event.')
    )
    insert into public.app_webhook_subscriptions (
      app_id,
      app_key,
      app_platform_id,
      platform,
      event_type,
      event_name,
      callback_url,
      status,
      notes
    )
    select
      app_platforms.app_id,
      app_platforms.app_key,
      app_platforms.id,
      app_platforms.platform,
      required_webhooks.event_type,
      required_webhooks.event_name,
      'https://app.zider.ink/events/wix/zider_printops',
      'required',
      required_webhooks.notes
    from public.app_platforms
    cross join required_webhooks
    where app_platforms.app_key = 'zider_printops'
      and app_platforms.platform = 'wix'
    on conflict (app_key, platform, event_type)
    do update set
      app_id = excluded.app_id,
      app_platform_id = excluded.app_platform_id,
      event_name = excluded.event_name,
      callback_url = excluded.callback_url,
      status = excluded.status,
      notes = excluded.notes,
      updated_at = now();
  $sql$;
end $$;
