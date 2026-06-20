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

Store profile endpoint:

```text
GET  http://localhost:3102/api/apps/printops/wix/store-profile?instanceId=wix-dev-preview
POST http://localhost:3102/api/apps/printops/wix/store-profile?instanceId=wix-dev-preview
```

Readiness endpoint:

```text
GET http://localhost:3102/api/apps/printops/wix/readiness?instanceId=wix-dev-preview&verifyOAuth=1
```

It checks the Wix instance, PrintOps OAuth credentials, `printops_orders` database table,
and whether Wix accepts the configured app credentials for the current instance. The
response must not expose client secrets, access tokens, or webhook private material.

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
8. PrintOps fetches Wix site properties and upserts `platform_store_profiles`.
9. PrintOps creates or resolves the isolated workspace/app context for this Wix instance.
10. Merchant enters PrintOps without a required Zider Account login.
11. User clicks `Sync latest` or `Sync last 7 days`.
12. PrintOps searches Wix orders by `updatedDate`.
13. PrintOps upserts normalized orders into `printops_orders`.
14. PrintOps returns normalized orders, line items, SKU, item options, and custom fields for invoice rendering.

Store profile cache:

- Table: `platform_store_profiles`.
- Shared key: `platform + platform_site_id`.
- Instance fallback: `platform + last_seen_instance_id` when Wix does not expose
  a site ID yet.
- Source: Wix Site Properties API.
- Normalized fields: `platform_site_id`, `primary_site_url`, `business_name`,
  `business_email`, `logo_media_path`, `logo_url`, `phone`, `address`,
  `language`, `locale`, `timezone`, `currency`, and `raw_profile`.
- Wix fields to prefer when available:
  - Site identity: published/external site URL, domain, site ID, display name,
    site name, business name.
  - Business profile/contact: business email, phone, address, logo media path,
    logo image URL.
  - Regional defaults: site language, default language, locale/regional format,
    timezone, payment/default currency.
- `raw_profile` is retained so newly exposed Wix Site Properties fields can be
  inspected without changing the app contract first.
- First entry into the Wix PrintOps workspace refreshes the profile once.
- Manual order sync also refreshes the profile opportunistically.
- Template defaults prefer cached profile values for logo, store name, footer website,
  footer contact, print language, and timezone.
- Merchant-entered template overrides always win after the initial default application.
- If Wix has no logo or email, the profile keeps those values empty and the template
  editor prompts the merchant to upload a logo or enter contact details manually.
- If Wix has no site profile value, system defaults are:
  `business_name = ZIDER` and `site_url = https://www.zider.ink/`. Do not use
  demo store names, demo email addresses, or fake addresses as fallbacks.

Account and workspace identity:

- P0 does not create a separate PrintOps username/password login for Wix merchants.
- Wix installation is the first-class P0 entry point. It creates or resolves an
  isolated PrintOps workspace/app context for the current Wix `instance_id`.
- The dashboard session is identified by the signed Wix `instance` and the resolved
  `instance_id`.
- Data isolation uses `app_key + platform + instance_id` for app-owned records
  such as orders and templates. Store profile reads prefer the shared
  `platform + platform_site_id` profile, then fall back to the current instance.
- `platform_store_profiles` is the workspace display source after installation.
  The top-right account area should prefer `business_name`, `site_url`, logo, locale,
  timezone, and currency from this cache.
- Wix site or business profile values are workspace/store identity, not personal user
  identity. If Wix later exposes the current dashboard operator, use it only for
  audit metadata such as `updated_by` or activity logs.
- When account-level features are needed, prompt the merchant to claim the workspace
  with Google or email OTP. Do not block the base Wix app flow on this claim.
- Claiming or merging into an existing Zider Account must use an explicit
  `account_link_intent`; matching email, domain, site name, or Wix owner id is only
  a hint and must not merge accounts by itself.
- If `business_name` is missing, display `ZIDER` as the fallback workspace name.
  If `site_url` is missing, display `https://www.zider.ink/` as the fallback scope.
- Merchant template overrides always win over store profile defaults. Updating the
  cached profile must not overwrite a merchant-edited template field after the first
  default application.
- Future explicit workspace tables should map `instance_id` to `workspace_id`,
  `store_id`, and user memberships. Wix app access remains valid through the app
  installation even before the merchant claims a Zider Account.

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
- When the event includes a full order payload, the receiver also upserts
  `printops_orders` by `app_key + platform + instance_id + source_order_id`.
- These events are intentionally separated from app install and billing analytics.

## Current Boundary

Implemented now:

- Wix dashboard route.
- Wix signed instance parsing.
- PrintOps-specific Wix OAuth credential lookup.
- Latest and 7-day history order sync API.
- Normalized order and custom field extraction.
- `printops_orders` current-state order cache.
- `platform_store_profiles` current-state site profile cache.
- Manual sync persistence into `printops_orders`.
- Wix site profile refresh on first workspace entry and manual order sync.
- Template defaults seeded from Wix site profile with merchant override support.
- Orders workspace reads `printops_orders` through `/api/apps/printops/wix/orders`.
- Manual sync panel in the Orders workspace.
- PrintOps Wix Event extensions for order created/updated/approved/canceled/fulfilled/payment-status/committed events.
- PrintOps business receiver for trusted-forward Wix order events.

Still to build after install test:

- Convert ID-only order webhooks into incremental order refresh jobs.
