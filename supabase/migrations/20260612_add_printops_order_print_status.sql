alter table public.printops_orders
  add column if not exists print_status text not null default 'unprinted',
  add column if not exists printed_at timestamptz,
  add column if not exists print_updated_at timestamptz;

create index if not exists idx_printops_orders_print_status
  on public.printops_orders(app_key, platform, instance_id, print_status);
