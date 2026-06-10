# Wix Event Contract

This document is the source of truth for Wix event routing, verification, and
persistence boundaries. Update this file before changing any Wix event route.

## Non-Negotiable Rules

- Direct Wix JWT webhooks are verified with the app-specific
  `webhook_public_key`.
- Wix CLI Event extensions may forward parsed events to the same business route
  only with `PRINTOPS_WIX_EVENT_FORWARD_SECRET`.
- Store the public key in `app_platform_secrets.webhook_public_key`, keyed by
  `app_key` and `platform='wix'`.
- Do not use `client_id`, `client_secret`, OAuth app ID, or `webhook_secret` for
  Wix event JWT verification.
- `/events/wix/{appKey}` is only for app lifecycle and billing analytics.
- App business events must use an app-specific webhook route.
- PrintOps Wix order events must use `/webhooks/printops/wix`.
- Installation and billing data must not be mixed with order/business data.

## Route Ownership

| Route | Owner | Accepted events | Writes to |
| --- | --- | --- | --- |
| `/events/wix/{appKey}` | App analytics receiver | App installed, app removed, paid plan events | `platform_event_logs`, `app_installations`, `app_billing_events` |
| `/webhooks/printops/wix` | PrintOps business receiver | Order created, order updated, order approved, order canceled, order fulfilled, order payment status updated, order committed, future PrintOps business events | `app_business_event_logs`, `printops_orders` when a full order payload is present |

If a request reaches the wrong route, return a `409` style boundary error rather
than silently writing it to the wrong table.

## Verification Contract

There are two valid delivery modes:

1. **Direct Wix JWT webhook**: Wix calls our public receiver directly. Verify the
   JWT with `app_platform_secrets.webhook_public_key`.
2. **Wix CLI Event extension forward**: Wix invokes our backend event handler
   inside the Wix CLI app. That handler forwards parsed order events to
   `/webhooks/printops/wix` with:

   ```http
   Authorization: Bearer ${PRINTOPS_WIX_EVENT_FORWARD_SECRET}
   x-zider-event-source: wix-event-extension
   ```

   The receiver resolves the forward secret from
   `PRINTOPS_WIX_EVENT_FORWARD_SECRET`, then
   `app_platform_secrets.webhook_secret`. These records use
   `verification_status='trusted_forward'` and have no `raw_jwt`.

Direct Wix webhook bodies are JWT payloads.

Verification lookup order:

1. `app_platform_secrets.webhook_public_key`
2. `WIX_WEBHOOK_PUBLIC_KEYS` JSON fallback, only for emergency recovery
3. `WIX_WEBHOOK_PUBLIC_KEY` single-key fallback, only for temporary recovery

The primary database row must look like this:

```sql
insert into public.app_platform_secrets (
  app_key,
  platform,
  webhook_public_key,
  notes
)
values (
  'zider_copy_button_clipboard',
  'wix',
  $$-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----$$,
  'Wix Events/Webhooks public key for JWT verification.'
)
on conflict (app_key, platform)
do update set
  webhook_public_key = excluded.webhook_public_key,
  notes = excluded.notes,
  updated_at = now();
```

`client_id` and `client_secret` are OAuth credentials for Wix API access. They
may live in the same table, but they are not part of webhook verification.

## App Analytics Events

Use `/events/wix/{appKey}` for these Wix App Management events:

- `App Instance Installed`
- `App Instance Removed`
- `Paid Plan Purchased`
- `Paid Plan Changed`
- `Paid Plan Auto Renewal Cancelled`
- `Plan Converted to Paid`
- `Plan Reactivated`
- `Plan Transferred`

Normalized event names in code:

- `app_instance_installed`
- `app_instance_removed`
- `paid_plan_purchased`
- `paid_plan_changed`
- `paid_plan_auto_renewal_cancelled`
- `plan_converted_to_paid`
- `plan_reactivated`
- `plan_transferred`

This receiver must:

- Verify JWT signature with `webhook_public_key`.
- Store the raw verified payload in `platform_event_logs`.
- Deduplicate by `dedupe_key`.
- Update `app_installations` for install/removal state.
- Insert `app_billing_events` for paid plan and plan lifecycle events.
- Reject unknown/business event types.

## PrintOps Business Events

Use `/webhooks/printops/wix` for PrintOps order/business data:

- `Order Created`
- `Order Updated`
- `Order Canceled`
- `Order Approved`
- `Order Fulfilled`
- `Order Payment Status Updated`
- `Order Committed`

This receiver must:

- Verify direct Wix JWT signatures with the PrintOps `webhook_public_key`, or
  verify Wix CLI Event extension forwards with
  `PRINTOPS_WIX_EVENT_FORWARD_SECRET`.
- Store the verified or trusted-forward payload in `app_business_event_logs`.
- Upsert the current order into `printops_orders` when the event includes a full
  printable order payload.
- Preserve `raw_body`, `raw_jwt`, `decoded_payload`, `event_data`, headers, and
  dedupe metadata for replay/debugging. Event extension forwards keep `raw_jwt`
  as `null`.
- Normalize order events to `order_created`, `order_updated`, `order_canceled`,
  `order_approved`, `order_fulfilled`, `order_payment_status_updated`,
  `order_committed`, or `order_event`.
- Reject app lifecycle and billing events.

## PrintOps Order Cache

`printops_orders` is the current-state cache for printable PrintOps orders. It
is separate from app analytics tables.

Canonical upsert key:

```text
app_key + platform + instance_id + source_order_id
```

Writers:

- Manual sync API:
  `apps/workspace/src/app/api/apps/printops/wix/orders/sync/route.ts`
- PrintOps business webhook:
  `apps/app/src/app/webhooks/printops/wix/route.ts`

Manual sync writes normalized Wix orders after calling the Wix Orders API.
Business webhooks write to the same cache only when the event includes a full
order object. If a webhook only includes an order ID, keep the event in
`app_business_event_logs` and let a later refresh job fetch the order by ID.

The cache stores:

- Source identifiers: `source_order_id`, `source_order_number`.
- Current status: `payment_status`, `fulfillment_status`.
- Customer and contact summary.
- Delivery and payment method summary.
- Totals and item counts.
- `normalized_order` for PrintOps rendering.
- `raw_order` for replay/debugging.
- `last_sync_mode` or `last_event_type` to explain the latest update source.

Run this migration before testing real order sync:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260609_add_printops_order_cache.sql
```

## Wix CLI Event Extensions

PrintOps uses Wix CLI Event extensions as the primary order-event subscription
mechanism. The extension files live in:

```text
packages/platform-plugins/wix/app/zider-print-ops/src/extensions/backend/events/
```

Current handlers:

- `order-created` -> `wix.ecom.v1.order_created`
- `order-updated` -> `wix.ecom.v1.order_updated`
- `order-approved` -> `wix.ecom.v1.order_approved`
- `order-canceled` -> `wix.ecom.v1.order_canceled`
- `order-fulfilled` -> `wix.ecom.v1.order_fulfilled`
- `order-payment-status-updated` -> `wix.ecom.v1.order_payment_status_updated`
- `order-committed` -> `wix.ecom.v1.order_committed`

Required Wix app permission:

- `SCOPE.DC-STORES.READ-ORDERS`

Required environment variables for the Wix CLI app runtime:

- `PRINTOPS_WIX_EVENT_INGEST_URL`, default:
  `https://app.zider.ink/webhooks/printops/wix`
- `PRINTOPS_WIX_EVENT_FORWARD_SECRET`

The app receiver can also read the same secret from:

- `app_platform_secrets.webhook_secret`, where `app_key='zider_printops'` and
  `platform='wix'`

Database setup example:

```sql
insert into public.app_platform_secrets (
  app_key,
  platform,
  webhook_secret,
  notes
)
values (
  'zider_printops',
  'wix',
  '<same-value-as-PRINTOPS_WIX_EVENT_FORWARD_SECRET>',
  'Shared secret for Wix CLI Event extension forwarding to PrintOps order webhook.'
)
on conflict (app_key, platform)
do update set
  webhook_secret = excluded.webhook_secret,
  notes = excluded.notes,
  updated_at = now();
```

This receiver must not:

- Write order events to `platform_event_logs`.
- Upsert `app_installations`.
- Insert `app_billing_events`.

## Why The Split Exists

The app analytics route answers these questions:

- Which Wix apps were installed?
- Which sites uninstalled?
- Which paid plan events happened?
- What is the current installation and billing state?

The PrintOps business route answers different questions:

- Which orders changed?
- Which order needs sync or re-render?
- Which source entity should become a PrintOps order/job record?

Keeping these streams separate prevents reporting pollution and makes it safe to
add Shopify, WordPress, or other platform business webhooks later.

## Adding A New Wix App

1. Add the app to `EXISTING_WIX_APPS` in
   `apps/app/src/lib/webhooks/app-registry.ts`.
2. Add one row in `app_platform_secrets` with the Wix
   `webhook_public_key`.
3. Configure app lifecycle and billing webhooks in Wix Dev Center to:
   `/events/wix/{appKey}`.
4. If the app has business webhooks, create a dedicated route:
   `/webhooks/{appName}/wix`.
5. Persist business events to an app-specific business table or
   `app_business_event_logs`, not installation analytics tables.
6. Update this contract before changing accepted event classes.

## Guardrails For Future Changes

- Do not reintroduce `app_platforms.webhook_public_key_ref`.
- Do not treat `_ref` columns as public key sources.
- Do not share `/events/wix/{appKey}` with order/product/business data.
- Do not make PrintOps order webhooks depend on OAuth credentials.
- Do not write order current state to `app_installations`,
  `platform_event_logs`, or `app_billing_events`.
- Do not store public keys in frontend code.
- Keep raw verified payloads for debugging and replay.
- Keep webhook processing idempotent; Wix can retry and duplicate events.

## Code Pointers

- App analytics route:
  `apps/app/src/app/events/[platform]/[appKey]/route.ts`
- PrintOps business route:
  `apps/app/src/app/webhooks/printops/wix/route.ts`
- Wix JWT verification:
  `apps/app/src/lib/webhooks/wix.ts`
- App analytics persistence:
  `apps/app/src/lib/webhooks/persistence.ts`
- PrintOps business persistence:
  `apps/app/src/lib/webhooks/printops-business.ts`
- PrintOps order cache mapper:
  `packages/platform-plugins/wix/src/order-cache.ts`
- Workspace order sync cache writer:
  `apps/workspace/src/lib/printops/order-cache.ts`
- Platform secret lookup:
  `apps/app/src/lib/platform-secrets.ts`
