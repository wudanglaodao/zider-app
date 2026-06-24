# PrintOps Main Flow Harness

This document is the release harness for Zider PrintOps. Run it after every
meaningful product update and before every production release that touches
PrintOps, Wix events, billing, account binding, templates, PDFs, or shared
workspace UI.

The goal is not to test every edge case every time. The goal is to keep the
merchant's core path healthy:

```text
Wix installs app
-> merchant opens PrintOps
-> account/store context resolves
-> orders sync or arrive from Wix events
-> merchant previews, prints, downloads, and marks orders
-> template settings persist
-> billing/plan state is visible
```

## When To Run

Run the full harness when a change touches any of these areas:

- `apps/workspace/src/app/apps/printops`
- `apps/workspace/src/app/api/apps/printops`
- `apps/workspace/src/lib/printops`
- `apps/workspace/src/lib/platform`
- `apps/app/src/app/webhooks/printops`
- `apps/app/src/app/events/wix`
- `apps/app/src/lib/webhooks`
- `packages/platform-plugins/wix/app/zider-print-ops`
- `supabase/migrations`
- Vercel environment variables used by PrintOps, Wix, billing, or email

For docs-only changes, copy-only changes, or unrelated site pages, run only the
build/typecheck checks for the project that changed.

## Required Environments

Local smoke target:

```text
http://localhost:3102/apps/printops/wix?instanceId=wix-dev-preview
```

Production smoke target:

```text
https://workspace.zider.ink/apps/printops/wix
```

Event receiver:

```text
https://app.zider.ink/webhooks/printops/wix
```

Wix app lifecycle receiver:

```text
https://app.zider.ink/events/wix/zider_printops
```

Production deployments must be checked in the `duorouai-5425s-projects` Vercel
scope, not a personal or stale Vercel scope.

## Automated Checks

Run the checks for every project touched by the change.

Workspace:

```bash
npm --prefix apps/workspace run typecheck
npm --prefix apps/workspace run build
```

App/event service:

```bash
npm --prefix apps/app run typecheck
npm --prefix apps/app run build
```

Public site:

```bash
npm --prefix apps/site run typecheck
npm --prefix apps/site run build
```

If a change touches multiple projects, run every affected project. If the change
is going to production and there is any uncertainty, run all three.

## Data Tables To Check

Use these tables to confirm the UI is reading real persisted data instead of
local-only state.

Orders:

```sql
select
  instance_id,
  source_order_number,
  customer_name,
  customer_email,
  payment_status,
  fulfillment_status,
  print_status,
  last_sync_mode,
  last_event_type,
  synced_at,
  updated_at
from public.printops_orders
where app_key = 'zider_printops'
order by updated_at desc
limit 20;
```

Templates:

```sql
select
  instance_id,
  template_id,
  template_name,
  document_type,
  default_language,
  is_default,
  base_template_key,
  base_template_version,
  template_schema_version,
  renderer_version,
  paper_size,
  layout_key,
  status,
  updated_at
from public.printops_templates
where app_key = 'zider_printops'
order by updated_at desc
limit 20;
```

Business events:

```sql
select
  instance_id,
  event_type,
  source_entity_id,
  source_entity_number,
  verification_status,
  processing_status,
  processing_error,
  received_at
from public.app_business_event_logs
where app_key = 'zider_printops'
order by received_at desc
limit 20;
```

Account binding and billing state:

```sql
select
  app_key,
  platform,
  instance_id,
  binding_status,
  owner_email,
  plan_id,
  billing_status,
  workspace_id,
  platform_store_profile_id,
  updated_at
from public.app_installations
where app_key = 'zider_printops'
order by updated_at desc
limit 20;
```

## Main Flow Checklist

### 1. App Entry

- Open PrintOps from Wix Studio, not only from a direct localhost URL.
- Confirm the dashboard iframe loads without a 401, 404, or blank page.
- Confirm the sidebar shows the PrintOps app icon and app name.
- Confirm the left Orders badge shows unprinted order count, not total cached
  order count.
- Confirm top-right controls show current plan, Upgrade, notification, and
  language/account controls without overlap.
- Confirm Support opens `https://www.zider.ink/contact`.

Pass condition: the merchant can enter the Orders page and understand the
current app state without extra setup.

### 2. Account Binding

- Open Settings -> Account binding.
- Confirm the owner email is prefilled when Wix provides it.
- Confirm the merchant can delete and replace the email before sending code.
- Click Send code with a valid email.
- Confirm missing email-provider env vars show a clear configuration message:
  `BREVO_API_KEY` and `ACCOUNT_BINDING_FROM_EMAIL`.
- Confirm a successful code verification creates or links a ZIDER member,
  workspace, and installation binding.
- Refresh the page and confirm the bound state is still visible.

Pass condition: account binding is persisted in the database and does not depend
on localStorage.

### 3. Order Sync

- On first entry, confirm the sync panel is compact after initialization.
- Click Sync latest.
- Open the more menu and run Sync last 7 days.
- Refresh the page.
- Confirm synced orders remain visible from `printops_orders`.
- Confirm the sync status text is vertically aligned and localized:
  `Connected` plus last updated time.
- Confirm printed and unprinted stat cards match order data.
- Confirm the sidebar Orders badge equals unprinted count.

Pass condition: manual sync persists orders and survives refresh.

### 4. New Wix Order Event

- Create or update a real Wix order on the test site.
- Confirm the Wix webhook log shows a successful response.
- Confirm Vercel logs for `app.zider.ink` do not show 401, invalid forward
  secret, or route-boundary errors.
- Confirm `app_business_event_logs` receives the event.
- If the event payload includes the full order, confirm `printops_orders`
  updates by the same `source_order_id`.
- Confirm the Orders page auto-refreshes on the configured interval and shows
  the new order without a full browser refresh.

Pass condition: new order data reaches the merchant list through the database,
not a mock row.

### 5. Order List Operations

- Search by order number, customer, email, and SKU.
- Filter Printed and Unprinted.
- Select one order.
- Select multiple orders.
- Confirm bulk actions are enabled only when selected orders exist.
- Run Download PDF for selected orders.
- Run Print preview for selected orders.
- Run Mark as printed for selected orders.
- Refresh the page and confirm print status is persisted.
- Confirm single-row PDF, print, preview, and more-menu actions still work.

Pass condition: single and batch operations use the same selected order data and
do not drop selection unexpectedly.

### 6. Template Library

- Open Templates.
- Confirm My templates and Built-in stats are readable and aligned.
- Confirm built-in template cards show stable cover previews.
- Use a built-in template.
- Save it to My templates.
- Set a template as default.
- Refresh the page.
- Confirm the default template is still default.
- Confirm order printing uses the database default template and language, not
  stale local state.

Pass condition: template selection and default assignment are database-backed.

### 7. Template Editor

- Edit store name, logo type, logo text, logo size, typography, and footer
  fields.
- Toggle each financial row setting: items, shipping, tax, total.
- Confirm SKU barcode appears only when a SKU exists.
- Change print language between English, Simplified Chinese, Traditional
  Chinese, Portuguese, Spanish, Japanese, Korean, and Arabic.
- Confirm label overrides update the preview in real time.
- Save the template.
- Refresh and reopen the same template.
- Confirm all edited values are still present.

Pass condition: editor changes update preview immediately and persist after
refresh.

### 8. Preview, PDF, And Print Consistency

- Open template preview.
- Download PDF.
- Open browser print.
- Confirm the top accent color and document spacing match between preview and
  PDF.
- Confirm barcode output is visible in preview and PDF.
- Confirm the downloaded PDF is not blank.
- Confirm A4 content is not clipped.
- Confirm Arabic uses RTL layout where intended.
- Confirm English and Chinese do not inherit Arabic direction.
- Confirm demo contact values are neutral:
  - phone: `180000000`
  - site: `zider.ink` or `https://www.zider.ink/`
  - email: `support@zider.ink`

Pass condition: the same template data produces consistent browser preview,
downloaded PDF, and print preview output.

### 9. Billing And Usage

- Confirm current plan name is shown in the top-right plan pill.
- Hover the plan pill and confirm monthly remaining/used order count is shown.
- Confirm usage is calculated from current-month orders, regardless of whether
  the orders were printed.
- Click Upgrade once and confirm it opens the Wix upgrade flow without needing
  a second click.
- Confirm billing events update `app_installations` plan fields when Wix sends
  plan events.

Pass condition: merchants can see their plan and reach the Wix upgrade flow.

### 10. Mobile Layout

- Test a mobile viewport around 390px width.
- Confirm the mobile menu opens as a sidebar drawer.
- Confirm menu text is visible for Orders, Templates, Settings, Help, and
  Support.
- Confirm Workspace and Account Center use the same top-menu and avatar
  interaction style.
- Confirm template cards, order rows, and batch actions remain usable.

Pass condition: mobile users can navigate and complete the main PrintOps flow
without hidden labels or blocked actions.

## Release Gate

Do not publish a PrintOps change when any P0 item below is failing:

- Wix dashboard entry fails to load.
- Sync latest cannot persist orders.
- New order events are rejected with 401 or invalid secret.
- Template save does not persist to `printops_templates`.
- Default template is ignored during print/PDF generation.
- Downloaded PDF is blank.
- Barcode disappears in PDF when expected.
- Account binding cannot send or verify code because production env vars are
  missing.
- Upgrade opens the wrong account, wrong project, or a dead URL.

P1 issues may ship only if they are written down before release:

- Minor spacing differences that do not affect printing.
- A non-primary language label that needs copy polish.
- A cover image mismatch when the real template preview and PDF are correct.

## Regression Notes Template

Paste this into the release note or PR after running the harness:

```text
PrintOps harness date:
Commit:
Environment: local / production
Wix app version:

Automated checks:
- workspace typecheck:
- workspace build:
- app typecheck:
- app build:
- site typecheck:
- site build:

Manual flows:
- App entry:
- Account binding:
- Order sync:
- New Wix order event:
- Order list operations:
- Template library:
- Template editor:
- Preview/PDF/print:
- Billing/usage:
- Mobile layout:

Known follow-ups:
```
