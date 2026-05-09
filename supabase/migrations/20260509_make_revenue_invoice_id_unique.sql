do $$
begin
  if exists (
    select 1
    from public.app_revenue_transactions
    group by invoice_id
    having count(*) > 1
  ) then
    raise exception 'Duplicate invoice_id values exist in app_revenue_transactions. Resolve duplicates before adding the unique index.';
  end if;
end $$;

create unique index if not exists idx_app_revenue_transactions_invoice_id_unique
  on public.app_revenue_transactions(invoice_id);
