# Zider PrintOps Wix App

This folder contains the installable Wix app configuration and local Wix CLI project for the first PrintOps private preview.

Wix does not consume `zider-printops.wix-app.json` directly from the repo. Use it as the single source of truth when filling the Wix Developer Console or checking the Wix CLI project.

## Wix CLI Project

The local Wix app project lives here:

```text
packages/platform-plugins/wix/app/zider-print-ops
```

It was generated with the Wix CLI app scaffold:

```bash
npm create @wix/new@latest -- app --app-name "Zider PrintOps" --template 24493a0d-18f2-4f68-b6d5-55992cef7daa
```

Registered Wix app:

```text
App ID: 5d48a40b-9822-4d8f-910a-d383501a4ea9
Project ID: zider-print-ops
```

The scaffold template currently has an npm registry gap for `@wix/wix-style-react-incubator@3.21.0`, so the generated `package.json` uses an npm `overrides` entry to resolve that dependency to `3.22.0`.

Local commands:

```bash
cd packages/platform-plugins/wix/app/zider-print-ops
npm install
npm run build
npm run dev
```

The generated `.env.local` contains Wix local credentials and must stay uncommitted.

Local dev note:

- A Wix development site named `dev sitex 1332118063` was created during the first `npm run dev` run.
- The CLI opened the install flow but timed out while waiting for browser-side installation.
- Re-run `npm run dev -- --port 4321`, choose that development site if prompted, then complete the app installation in the browser.

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
app_platform_secrets.client_id = ...
app_platform_secrets.client_secret = ...
app_platform_secrets.webhook_public_key = ...
```

`webhook_public_key` is the Wix Events/Webhooks JWT verification key for this app. `client_id`
and `client_secret` are only for OAuth/API access.

### Permissions

P0 requires:

- Read Orders
- Read Stores / Site Info

P1 optional:

- Read Products

Read Products is not required for the first invoice test because the order payload already carries line items, SKU, options, product image references, and custom fields where Wix includes them. Keep it available if the test store needs product enrichment.

### Webhooks

Configure app install and billing analytics webhooks to:

```text
https://app.zider.ink/events/wix/zider_printops
```

P0 app analytics:

- App Instance Installed
- App Instance Removed
- Paid Plan Purchased
- Paid Plan Changed
- Paid Plan Auto Renewal Cancelled
- Plan Converted to Paid
- Plan Reactivated
- Plan Transferred

Configure PrintOps business webhooks to:

```text
https://app.zider.ink/webhooks/printops/wix
```

P0.1 / P1 business events for incremental order refresh:

- Order Created
- Order Updated
- Order Canceled

The first dashboard test can work without order webhooks because the workspace has manual latest/history sync buttons. Business webhooks become important after the install loop is stable.

## Runtime Routes

Workspace:

```text
GET  https://workspace.zider.ink/apps/printops/wix?instance=...
POST https://workspace.zider.ink/api/apps/printops/wix/orders/sync?instance=...
```

Webhook receiver:

```text
POST https://app.zider.ink/events/wix/zider_printops
POST https://app.zider.ink/webhooks/printops/wix
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
