create table if not exists public.account_email_verifications (
  id uuid primary key default gen_random_uuid(),
  app_installation_id uuid not null references public.app_installations(id) on delete cascade,
  email text not null,
  code_hash text not null,
  attempts integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'verified', 'expired')),
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_account_email_verifications_installation
  on public.account_email_verifications(app_installation_id, status, expires_at desc);

create index if not exists idx_account_email_verifications_email
  on public.account_email_verifications(email, status, expires_at desc);

alter table public.account_email_verifications enable row level security;
