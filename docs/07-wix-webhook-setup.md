# Wix Webhook Setup

Canonical routing and verification rules live in
[14 Wix Event Contract](./14-wix-event-contract.md). Treat that document as the
source of truth before changing any Wix event route.

## MVP Events

Configure these three webhook events for each existing Wix app:

```text
App Instance Installed
App Instance Removed
Paid Plan Purchased
```

These are the first analytics events. Other plan events can be added later:

- Paid Plan Changed
- Paid Plan Auto Renewal Cancelled
- Plan Converted to Paid
- Plan Reactivated
- Plan Transferred

## Endpoint Format

Use this callback URL pattern:

```text
https://app.zider.ink/events/wix/:app_key
```

Current draft app keys:

```text
https://app.zider.ink/events/wix/zider_printops
https://app.zider.ink/events/wix/store_content_suite
https://app.zider.ink/events/wix/zider_copy_button_clipboard
https://app.zider.ink/events/wix/zider_product_detail_enhancer
https://app.zider.ink/events/wix/before_and_after_slider
https://app.zider.ink/events/wix/beforeafter_slider_x
https://app.zider.ink/events/wix/zider_countup
https://app.zider.ink/events/wix/zider_loop_logo
https://app.zider.ink/events/wix/smart_login_button
```

The app inventory currently has one counting question: the user confirmed 8 apps, while screenshots show 9 visible or partially visible rows. Confirm the final 8 before production setup.

## Environment Variables

Required:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Preferred public key storage is `app_platform_secrets.webhook_public_key`, one row per Wix app. This keeps Wix webhook keys in Supabase instead of Vercel environment variables.

`/events/wix/{appKey}` is reserved for Wix app lifecycle and billing events such as install,
uninstall, and plan changes. These events are verified with the app's `webhook_public_key` and
written to the app installation / billing analytics tables. App business data, such as PrintOps
order events, must use the app-specific receiver instead: `/webhooks/printops/wix`.

Legacy fallback public key format, only for emergency recovery before database seeding:

```json
{
  "zider_copy_button_clipboard": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "zider_countup": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

If all apps share a public key, `WIX_WEBHOOK_PUBLIC_KEY` can be used as a temporary fallback instead.

## Supabase Setup

Run:

```text
supabase/schema.sql
```

For PrintOps, also run:

```text
supabase/seed-printops-wix-webhooks.sql
```

This creates the `zider_printops` app/platform row and records the required Wix App Management webhook subscriptions in `app_webhook_subscriptions`.

The route uses the Supabase service role key, so keep this backend-only and never expose it to browser code.

## Receiver Route

Next.js route:

```text
src/app/events/[platform]/[appKey]/route.ts
```

Public route:

```text
POST /events/wix/:app_key
```

The receiver:

- Reads raw request body
- Extracts the Wix JWT
- Verifies it with the app public key
- Normalizes the event type
- Stores the raw event
- Deduplicates by `dedupe_key`
- Upserts installation state
- Inserts billing rows for `Paid Plan Purchased`

## PrintOps Wix Subscription Checklist

Configure these Wix Dev Center app analytics webhooks for `Zider PrintOps`:

```text
App Instance Installed              -> https://app.zider.ink/events/wix/zider_printops
App Instance Removed                -> https://app.zider.ink/events/wix/zider_printops
Paid Plan Purchased                 -> https://app.zider.ink/events/wix/zider_printops
Paid Plan Changed                   -> https://app.zider.ink/events/wix/zider_printops
Paid Plan Auto Renewal Cancelled    -> https://app.zider.ink/events/wix/zider_printops
Plan Converted to Paid              -> https://app.zider.ink/events/wix/zider_printops
Plan Reactivated                    -> https://app.zider.ink/events/wix/zider_printops
Plan Transferred                    -> https://app.zider.ink/events/wix/zider_printops
```

After each webhook is saved and verified in Wix, update its row in `app_webhook_subscriptions.status` from `required` to `active`.

PrintOps order/business events are handled by Wix CLI Event extensions in the
PrintOps app code. Do not add them to the shared app analytics route.

Primary order-event delivery:

```text
Wix CLI Event extension -> https://app.zider.ink/webhooks/printops/wix
Authorization: Bearer ${PRINTOPS_WIX_EVENT_FORWARD_SECRET}
```

The app receiver accepts that secret from `PRINTOPS_WIX_EVENT_FORWARD_SECRET`
or `app_platform_secrets.webhook_secret` for `zider_printops` / `wix`.

Manual Wix webhook subscriptions are only a backup path. If used, point all
PrintOps order/business webhooks at the same app-specific route. These events
are not app install or billing analytics events and should not write to
`platform_event_logs` / `app_installations`.

```text
Order Created                       -> https://app.zider.ink/webhooks/printops/wix
Order Updated                       -> https://app.zider.ink/webhooks/printops/wix
Order Canceled                      -> https://app.zider.ink/webhooks/printops/wix
Order Approved                      -> https://app.zider.ink/webhooks/printops/wix
Order Fulfilled                     -> https://app.zider.ink/webhooks/printops/wix
Order Payment Status Updated        -> https://app.zider.ink/webhooks/printops/wix
Order Committed                     -> https://app.zider.ink/webhooks/printops/wix
```

The business receiver stores verified or trusted-forward payloads in
`app_business_event_logs`.

## Notes

Wix webhook bodies are JWTs. Store raw payloads for debugging and process events idempotently because retries and duplicates can happen.
