create table if not exists public.printops_orders (
  id uuid primary key default gen_random_uuid(),
  app_key text not null default 'zider_printops',
  platform text not null,
  instance_id text not null,
  source_order_id text not null,
  source_order_number text,
  source_created_at timestamptz,
  source_updated_at timestamptz,
  payment_status text,
  fulfillment_status text,
  currency text,
  customer_name text,
  customer_email text,
  customer_phone text,
  delivery_method text,
  payment_method text,
  note text,
  total_item_quantity integer not null default 0,
  total_amount numeric,
  total_formatted text,
  line_item_count integer not null default 0,
  custom_field_count integer not null default 0,
  normalized_order jsonb not null,
  raw_order jsonb,
  last_sync_mode text,
  last_event_type text,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, instance_id, source_order_id)
);

create index if not exists idx_printops_orders_instance_updated
  on public.printops_orders(app_key, platform, instance_id, source_updated_at desc nulls last);

create index if not exists idx_printops_orders_instance_synced
  on public.printops_orders(app_key, platform, instance_id, synced_at desc);

create index if not exists idx_printops_orders_number
  on public.printops_orders(app_key, platform, source_order_number);

create index if not exists idx_printops_orders_status
  on public.printops_orders(app_key, platform, payment_status, fulfillment_status);

create index if not exists idx_printops_orders_normalized_gin
  on public.printops_orders using gin(normalized_order);

alter table public.printops_orders enable row level security;
