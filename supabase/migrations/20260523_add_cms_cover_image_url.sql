alter table public.cms_entries
  add column if not exists cover_image_url text;
