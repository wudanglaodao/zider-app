create extension if not exists pgcrypto;

create table if not exists public.app_pricing_plans (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.zider_apps(id) on delete cascade,
  app_key text not null,
  app_platform_id uuid references public.app_platforms(id) on delete set null,
  platform text not null default 'wix',
  product_id text not null,
  plan_name text,
  cycle text not null,
  billing_interval_months integer not null default 1,
  currency text not null default 'USD',
  list_price_amount numeric(12, 6),
  expected_revenue_share_pct numeric(8, 6),
  expected_your_revenue_amount numeric(12, 6),
  effective_from date not null default current_date,
  effective_to date,
  source text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_key, platform, product_id, cycle, currency, effective_from)
);

create table if not exists public.app_revenue_transactions (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.zider_apps(id) on delete cascade,
  app_key text not null,
  app_platform_id uuid references public.app_platforms(id) on delete set null,
  platform text not null default 'wix',
  source text not null default 'wix_payout_csv',
  source_file text,
  transaction_at timestamptz not null,
  invoice_id text not null,
  instance_id text,
  website text,
  transaction_type text not null,
  cycle text,
  product_id text,
  offer text,
  amount_usd numeric(12, 6),
  amount_after_billing_fee_usd numeric(12, 6),
  your_revenue_usd numeric(12, 6),
  revenue_share_pct numeric(8, 6),
  transaction_currency text,
  raw_row jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invoice_id)
);

create index if not exists idx_app_pricing_plans_lookup
  on public.app_pricing_plans(app_key, platform, product_id, cycle, currency, effective_from desc);

create index if not exists idx_app_revenue_transactions_app_month
  on public.app_revenue_transactions(app_key, platform, transaction_at desc);

create index if not exists idx_app_revenue_transactions_instance
  on public.app_revenue_transactions(app_key, platform, instance_id, transaction_at desc);

create index if not exists idx_app_revenue_transactions_product
  on public.app_revenue_transactions(app_key, platform, product_id, cycle);

insert into public.app_pricing_plans (
  app_id,
  app_key,
  app_platform_id,
  platform,
  product_id,
  plan_name,
  cycle,
  billing_interval_months,
  currency,
  list_price_amount,
  expected_revenue_share_pct,
  expected_your_revenue_amount,
  effective_from,
  effective_to,
  source,
  notes
)
select
  app.id,
  'zider_countup',
  platform.id,
  'wix',
  plan.product_id,
  plan.plan_name,
  plan.cycle,
  plan.billing_interval_months,
  plan.currency,
  plan.list_price_amount,
  plan.expected_revenue_share_pct,
  plan.expected_your_revenue_amount,
  plan.effective_from,
  plan.effective_to,
  'inferred_from_wix_payout_csv',
  plan.notes
from public.zider_apps as app
left join public.app_platforms as platform
  on platform.app_key = app.app_key
  and platform.platform = 'wix'
cross join (
  values
    (
      'premium',
      'Premium',
      'MONTHLY',
      1,
      'USD',
      2.000000,
      1.000000,
      2.000000,
      date '2025-03-01',
      date '2025-06-30',
      'Observed early payout rows before revenue-share changed to 80%.'
    ),
    (
      'premium',
      'Premium',
      'MONTHLY',
      1,
      'USD',
      2.000000,
      0.800000,
      1.600000,
      date '2025-07-01',
      null::date,
      'Observed recurring monthly price in Wix payout rows.'
    ),
    (
      'premium',
      'Premium',
      'YEARLY',
      12,
      'USD',
      31.200000,
      0.800000,
      24.960000,
      date '2025-12-01',
      null::date,
      'Observed annual benchmark price; payout rows may vary because of offers or currency conversion.'
    )
) as plan(
  product_id,
  plan_name,
  cycle,
  billing_interval_months,
  currency,
  list_price_amount,
  expected_revenue_share_pct,
  expected_your_revenue_amount,
  effective_from,
  effective_to,
  notes
)
where app.app_key = 'zider_countup'
on conflict (app_key, platform, product_id, cycle, currency, effective_from)
do update set
  app_id = excluded.app_id,
  app_platform_id = excluded.app_platform_id,
  plan_name = excluded.plan_name,
  billing_interval_months = excluded.billing_interval_months,
  list_price_amount = excluded.list_price_amount,
  expected_revenue_share_pct = excluded.expected_revenue_share_pct,
  expected_your_revenue_amount = excluded.expected_your_revenue_amount,
  effective_to = excluded.effective_to,
  source = excluded.source,
  notes = excluded.notes,
  updated_at = now();

create or replace view public.app_pricing_observations as
select
  app_key,
  platform,
  product_id,
  cycle,
  transaction_currency as currency,
  count(*) as transaction_count,
  min(transaction_at) as first_seen_at,
  max(transaction_at) as last_seen_at,
  min(amount_usd) as min_amount_usd,
  max(amount_usd) as max_amount_usd,
  avg(amount_usd) as avg_amount_usd,
  min(your_revenue_usd) as min_your_revenue_usd,
  max(your_revenue_usd) as max_your_revenue_usd,
  avg(your_revenue_usd) as avg_your_revenue_usd,
  avg(revenue_share_pct) as avg_revenue_share_pct
from public.app_revenue_transactions
group by app_key, platform, product_id, cycle, transaction_currency;

create or replace view public.app_revenue_monthly_actuals as
select
  app_key,
  platform,
  date_trunc('month', transaction_at)::date as revenue_month,
  count(*) as transaction_count,
  count(*) filter (where upper(transaction_type) = 'CHARGE') as charge_count,
  count(*) filter (where upper(transaction_type) = 'RENEWAL') as renewal_count,
  count(*) filter (where upper(transaction_type) in ('REFUND', 'CHARGEBACK')) as reversal_count,
  count(distinct instance_id) as paying_instance_count,
  sum(amount_usd) as amount_usd,
  sum(amount_after_billing_fee_usd) as amount_after_billing_fee_usd,
  sum(your_revenue_usd) as your_revenue_usd
from public.app_revenue_transactions
group by app_key, platform, date_trunc('month', transaction_at)::date;

create or replace view public.app_revenue_subscription_baseline as
with ranked as (
  select
    revenue.*,
    row_number() over (
      partition by revenue.app_key, revenue.platform, revenue.instance_id, revenue.product_id
      order by revenue.transaction_at desc, revenue.invoice_id desc
    ) as row_number,
    min(revenue.transaction_at) over (
      partition by revenue.app_key, revenue.platform, revenue.instance_id, revenue.product_id
    ) as first_transaction_at
  from public.app_revenue_transactions as revenue
  where upper(revenue.transaction_type) in ('CHARGE', 'RENEWAL', 'SWITCH')
    and revenue.instance_id is not null
)
select
  app_id,
  app_key,
  app_platform_id,
  platform,
  instance_id,
  website,
  product_id,
  cycle,
  transaction_currency,
  invoice_id as latest_invoice_id,
  first_transaction_at,
  transaction_at as latest_transaction_at,
  amount_usd as current_amount_usd,
  your_revenue_usd as current_your_revenue_usd,
  revenue_share_pct,
  case
    when upper(cycle) = 'MONTHLY' then transaction_at + interval '1 month'
    when upper(cycle) = 'YEARLY' then transaction_at + interval '1 year'
    else null
  end as estimated_next_charge_at,
  case
    when upper(cycle) = 'MONTHLY' then your_revenue_usd
    when upper(cycle) = 'YEARLY' then your_revenue_usd / 12
    else null
  end as expected_monthly_recognized_revenue_usd,
  case
    when upper(cycle) = 'MONTHLY' then transaction_at >= now() - interval '45 days'
    when upper(cycle) = 'YEARLY' then transaction_at >= now() - interval '395 days'
    else true
  end as is_inferred_active
from ranked
where row_number = 1;

create or replace view public.app_revenue_monthly_forecast_baseline as
with months as (
  select generate_series(
    date_trunc('month', current_date)::date,
    (date_trunc('month', current_date)::date + interval '12 months')::date,
    interval '1 month'
  )::date as forecast_month
),
expanded as (
  select
    baseline.*,
    months.forecast_month
  from public.app_revenue_subscription_baseline as baseline
  cross join months
  where baseline.is_inferred_active = true
)
select
  app_key,
  platform,
  forecast_month,
  count(*) filter (where upper(cycle) = 'MONTHLY') as inferred_monthly_subscriptions,
  count(*) filter (where upper(cycle) = 'YEARLY') as inferred_yearly_subscriptions,
  sum(expected_monthly_recognized_revenue_usd) as expected_recognized_revenue_usd,
  sum(
    case
      when upper(cycle) = 'MONTHLY'
        and forecast_month >= date_trunc('month', estimated_next_charge_at)::date
        then current_your_revenue_usd
      when upper(cycle) = 'YEARLY'
        and forecast_month = date_trunc('month', estimated_next_charge_at)::date
        then current_your_revenue_usd
      else 0
    end
  ) as expected_cash_revenue_usd,
  'baseline_latest_payout_no_churn'::text as forecast_method
from expanded
group by app_key, platform, forecast_month;
