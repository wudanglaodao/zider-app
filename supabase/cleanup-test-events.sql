delete from public.app_billing_events
where is_test_event = true;

delete from public.app_installations
where is_test_install = true;

delete from public.platform_event_logs
where is_test_event = true;
