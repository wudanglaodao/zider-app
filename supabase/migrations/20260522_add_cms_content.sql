create table if not exists public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('blog', 'forum')),
  locale text not null default 'en',
  title text not null,
  slug text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  excerpt text,
  body text,
  cover_image_url text,
  tags text[] not null default '{}',
  source_url text,
  author_name text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_type, locale, slug)
);

create index if not exists idx_cms_entries_public_lookup
  on public.cms_entries(content_type, locale, slug)
  where status = 'published';

create index if not exists idx_cms_entries_admin_updated
  on public.cms_entries(status, updated_at desc);

create index if not exists idx_cms_entries_tags
  on public.cms_entries using gin(tags);

alter table public.cms_entries enable row level security;
