with apps(app_key, app_name, app_category, status) as (
  values
    ('store_content_suite', 'Store Content Suite', 'wix_existing_app', 'published'),
    ('zider_copy_button_clipboard', 'Zider Copy Button / Clipboard', 'wix_existing_app', 'published'),
    ('zider_product_detail_enhancer', 'Zider Product Detail Enhancer', 'wix_existing_app', 'published'),
    ('before_and_after_slider', 'Before And After Slider', 'wix_existing_app', 'published'),
    ('beforeafter_slider_x', 'BeforeAfter Slider X', 'wix_existing_app', 'published'),
    ('zider_countup', 'Zider CountUp', 'wix_existing_app', 'published'),
    ('zider_loop_logo', 'Zider Loop Logo', 'wix_existing_app', 'published'),
    ('smart_login_button', 'Smart Login Button', 'wix_existing_app', 'published')
),
upserted_apps as (
  insert into public.zider_apps (app_key, app_name, app_category, status)
  select app_key, app_name, app_category, status
  from apps
  on conflict (app_key)
  do update set
    app_name = excluded.app_name,
    app_category = excluded.app_category,
    status = excluded.status,
    updated_at = now()
  returning id, app_key, app_name, status
)
insert into public.app_platforms (
  app_id,
  app_key,
  platform,
  platform_app_id,
  platform_app_name,
  status,
  default_billing_provider
)
select
  id,
  app_key,
  'wix',
  null,
  app_name,
  status,
  'wix'
from upserted_apps
on conflict (app_key, platform)
do update set
  platform_app_name = excluded.platform_app_name,
  status = excluded.status,
  default_billing_provider = excluded.default_billing_provider,
  updated_at = now();
