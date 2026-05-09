alter table public.platform_event_logs
  add column if not exists event_source text not null default 'live',
  add column if not exists is_test_event boolean not null default false,
  add column if not exists test_reason text;

alter table public.app_installations
  add column if not exists event_source text not null default 'live',
  add column if not exists is_test_install boolean not null default false,
  add column if not exists test_reason text;

alter table public.app_billing_events
  add column if not exists event_source text not null default 'live',
  add column if not exists is_test_event boolean not null default false,
  add column if not exists test_reason text;

create index if not exists idx_platform_event_logs_test_events
  on public.platform_event_logs(app_key, platform, is_test_event, received_at desc);

update public.platform_event_logs
set
  event_source = 'wix_test',
  is_test_event = true,
  test_reason = 'wix_sample_payload'
where
  decoded_payload->>'data' like '%2019-12-09T07:44:53.659Z%'
  or decoded_payload->>'data' like '%07864c16-3a6f-4dd2-9973-028705762b2c%'
  or decoded_payload->>'data' like '%e8f429d5-0a6a-468f-8044-87f519a53202%'
  or (
    event_type = 'plan_converted_to_paid'
    and decoded_payload->>'data' like '%2025-05-06T21:50:23.963Z%'
    and decoded_payload->>'data' like '%"vendorProductId":"basic"%'
  );

update public.app_installations as installation
set
  event_source = 'wix_test',
  is_test_install = true,
  test_reason = 'wix_sample_payload'
from public.platform_event_logs as event_log
where
  event_log.app_key = installation.app_key
  and event_log.platform = installation.platform
  and event_log.instance_id = installation.instance_id
  and event_log.is_test_event = true;

update public.app_billing_events as billing_event
set
  event_source = 'wix_test',
  is_test_event = true,
  test_reason = 'wix_sample_payload'
from public.platform_event_logs as event_log
where
  billing_event.raw_event_id = event_log.id
  and event_log.is_test_event = true;
