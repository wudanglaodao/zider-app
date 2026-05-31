# Zider PrintOps Wix App

This folder is the installable Wix app configuration pack for the first PrintOps private preview.

Wix does not consume this JSON directly from the repo. Use it as the single source of truth when filling the Wix Developer Console.

## App Identity

- App name: `Zider PrintOps`
- App key: `zider_printops`
- App type: self-hosted Wix dashboard app
- First release status: private preview / internal test
- Dashboard URL: `https://workspace.zider.ink/apps/printops/wix`

## Required Wix Console Setup

### Dashboard

Set the dashboard page URL to:

```text
https://workspace.zider.ink/apps/printops/wix
```

When opened by Wix, this page must receive the signed `instance` query parameter. Local development may use:

```text
http://localhost:3102/apps/printops/wix?instanceId=wix-dev-preview
```

### OAuth And Secrets

Save Wix app credentials in one of two places.

Vercel environment variables for `zider-workspace`:

```text
WIX_PRINTOPS_APP_ID=...
WIX_PRINTOPS_APP_SECRET=...
```

Or Supabase:

```text
app_platform_secrets.app_key = zider_printops
app_platform_secrets.platform = wix
app_platform_secrets.oauth_client_id = ...
app_platform_secrets.oauth_client_secret = ...
app_platform_secrets.app_secret = ...
app_platform_secrets.webhook_public_key = ...
```

### Permissions

P0 requires:

- Read Orders
- Read Stores / Site Info

P1 optional:

- Read Products

Read Products is not required for the first invoice test because the order payload already carries line items, SKU, options, product image references, and custom fields where Wix includes them. Keep it available if the test store needs product enrichment.

### Webhooks

Configure these to the same endpoint:

```text
https://app.zider.ink/events/wix/zider_printops
```

P0 required:

- App Instance Installed
- App Instance Removed

P0.1 / P1 for incremental order refresh:

- Order Created
- Order Updated
- Order Canceled

The first dashboard test can work without order webhooks because the workspace has manual latest/history sync buttons. Webhooks become important after the install loop is stable.

## Runtime Routes

Workspace:

```text
GET  https://workspace.zider.ink/apps/printops/wix?instance=...
POST https://workspace.zider.ink/api/apps/printops/wix/orders/sync?instance=...
```

Webhook receiver:

```text
POST https://app.zider.ink/events/wix/zider_printops
```

## First Install Test

1. Create the Wix app in Wix Developer Console with the identity above.
2. Set the dashboard URL.
3. Add the permissions.
4. Store credentials in Vercel or Supabase.
5. Install the app on a Wix test site.
6. Open the app from the Wix dashboard.
7. Confirm the PrintOps Orders page shows the Wix connection panel.
8. Click `Sync latest`.
9. Create or update an order in Wix.
10. Click `Sync last 7 days`.

Expected result:

- Wix passes a signed `instance`.
- PrintOps resolves `instanceId`.
- PrintOps exchanges it for a Wix access token.
- PrintOps searches Wix orders by `updatedDate`.
- Response includes normalized orders, line items, SKU, and custom fields.

## Failure Cheatsheet

- `Missing Wix instance`: the app was not opened from Wix, or Wix did not append `instance`.
- `Missing zider_printops Wix OAuth credentials`: `WIX_PRINTOPS_APP_ID` / `WIX_PRINTOPS_APP_SECRET` or Supabase `app_platform_secrets` is not configured.
- `Wix orders search failed`: permissions are missing, the access token is invalid, or the test site has no eCommerce orders in the sync window.

