# Zider PrintOps Wix App Harness

This note captures the first installable Wix-app path for **Zider PrintOps**.
Webhook routing and verification boundaries are defined in
[14 Wix Event Contract](./14-wix-event-contract.md).

## Wix CLI Project

The actual local Wix CLI project has been created at:

```text
packages/platform-plugins/wix/app/zider-print-ops
```

Wix registration:

```text
App name: Zider PrintOps
App ID: 5d48a40b-9822-4d8f-910a-d383501a4ea9
Project ID: zider-print-ops
```

Run it locally with:

```bash
cd packages/platform-plugins/wix/app/zider-print-ops
npm run dev
```

The CLI dashboard page is a lightweight PrintOps entry point that links to the hosted workspace dashboard. The full order sync and template UI still lives in `apps/workspace`.

## Wix Developer Setup

Create a self-hosted Wix dashboard app and configure:

- App name: `Zider PrintOps`
- Internal app key: `zider_printops`
- Dashboard page URL: `https://workspace.zider.ink/apps/printops/wix`
- App Instance Installed webhook: `https://app.zider.ink/events/wix/zider_printops`
- App Instance Removed webhook: `https://app.zider.ink/events/wix/zider_printops`
- Paid Plan Purchased webhook: `https://app.zider.ink/events/wix/zider_printops`
- Paid Plan Changed webhook: `https://app.zider.ink/events/wix/zider_printops`
- Paid Plan Auto Renewal Cancelled webhook: `https://app.zider.ink/events/wix/zider_printops`
- Plan Converted to Paid webhook: `https://app.zider.ink/events/wix/zider_printops`
- Plan Reactivated webhook: `https://app.zider.ink/events/wix/zider_printops`
- Plan Transferred webhook: `https://app.zider.ink/events/wix/zider_printops`
- Order Created webhook: `https://app.zider.ink/webhooks/printops/wix`
- Order Updated webhook: `https://app.zider.ink/webhooks/printops/wix`
- Order Canceled webhook: `https://app.zider.ink/webhooks/printops/wix`

P0 permissions:

- Read Orders
- Read Stores / Site Info

P1 optional permission:

- Read Products

## Environment

Workspace needs Wix credentials:

```bash
WIX_PRINTOPS_APP_ID=...
WIX_PRINTOPS_APP_SECRET=...
```

Or store credentials in Supabase:

```text
app_platform_secrets.app_key=zider_printops
app_platform_secrets.platform=wix
app_platform_secrets.client_id=...
app_platform_secrets.client_secret=...
app_platform_secrets.webhook_public_key=...
```

`client_id` / `client_secret` are used for Wix OAuth and API calls. Wix Events/Webhooks use
`webhook_public_key` for JWT signature verification; do not store order or install webhook
verification under `webhook_secret`.

Webhook receiver needs:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Run the PrintOps webhook seed after the base schema:

```bash
psql "$DATABASE_URL" -f supabase/seed-printops-wix-webhooks.sql
```

## Local Testing

Use a dev instance ID:

```text
http://localhost:3102/apps/printops/wix?instanceId=wix-dev-preview
```

Manual order sync endpoint:

```text
POST http://localhost:3102/api/apps/printops/wix/orders/sync?instanceId=wix-dev-preview
```

Request body:

```json
{
  "mode": "latest",
  "limit": 50,
  "maxPages": 10
}
```

Historical P0 backfill:

```json
{
  "mode": "history",
  "historyDays": 7,
  "limit": 50,
  "maxPages": 10
}
```

## Install Flow

1. Wix installs the app.
2. Wix sends `app_instance_installed` to `/events/wix/zider_printops`.
3. The webhook persists the installation event.
4. Merchant opens the PrintOps dashboard from Wix.
5. Wix appends signed `instance`.
6. PrintOps resolves `instanceId`.
7. PrintOps exchanges `instanceId` for a Wix access token.
8. User clicks `Sync latest` or `Sync last 7 days`.
9. PrintOps searches Wix orders by `updatedDate`.
10. PrintOps returns normalized orders, line items, SKU, item options, and custom fields for invoice rendering.

Billing lifecycle:

- Wix sends paid-plan webhooks to `/events/wix/zider_printops`.
- The receiver stores every verified raw payload in `platform_event_logs`.
- Billing events are normalized into `app_billing_events`.
- Current plan fields on `app_installations` are updated from the Wix event payload when `vendorProductId` is present.

Order lifecycle:

- Wix CLI Event extensions subscribe to order events in the PrintOps Wix app.
- The event handlers forward parsed order events to `/webhooks/printops/wix`
  with `PRINTOPS_WIX_EVENT_FORWARD_SECRET`.
- The receiver stores trusted-forward payloads in `app_business_event_logs`.
- These events are intentionally separated from app install and billing analytics.

## Current Boundary

Implemented now:

- Wix dashboard route.
- Wix signed instance parsing.
- PrintOps-specific Wix OAuth credential lookup.
- Latest and 7-day history order sync API.
- Normalized order and custom field extraction.
- Manual sync panel in the Orders workspace.
- PrintOps Wix Event extensions for order created/updated/approved/canceled/fulfilled/payment-status/committed events.
- PrintOps business receiver for trusted-forward Wix order events.

Still to build after install test:

- Persist `platform_connections`, `source_orders`, `order_sync_runs`.
- Render the Orders table from synced Wix orders instead of sample rows.
- Wire synced orders into Big Brand Invoice rendering.
- Convert order webhooks into incremental order refresh jobs.
