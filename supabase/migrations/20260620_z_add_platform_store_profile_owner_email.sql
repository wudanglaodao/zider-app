alter table public.platform_store_profiles
  add column if not exists owner_email text;
