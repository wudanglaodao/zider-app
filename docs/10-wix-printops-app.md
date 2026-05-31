# Zider PrintOps Wix App Harness

This note captures the first installable Wix-app path for **Zider PrintOps**.

## Wix Developer Setup

Create a self-hosted Wix dashboard app and configure:

- App name: `Zider PrintOps`
- Internal app key: `zider_printops`
- Dashboard page URL: `https://workspace.zider.ink/apps/printops/wix`
- App Instance Installed webhook: `https://app.zider.ink/events/wix/zider_printops`
- App Instance Removed webhook: `https://app.zider.ink/events/wix/zider_printops`

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
app_platform_secrets.oauth_client_id=...
app_platform_secrets.oauth_client_secret=...
app_platform_secrets.app_secret=...
app_platform_secrets.webhook_public_key=...
```

Webhook receiver needs:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
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

## Current Boundary

Implemented now:

- Wix dashboard route.
- Wix signed instance parsing.
- PrintOps-specific Wix OAuth credential lookup.
- Latest and 7-day history order sync API.
- Normalized order and custom field extraction.
- Manual sync panel in the Orders workspace.

Still to build after install test:

- Persist `platform_connections`, `source_orders`, `order_sync_runs`.
- Render the Orders table from synced Wix orders instead of sample rows.
- Wire synced orders into Big Brand Invoice rendering.
- Add order webhooks for incremental refresh.

