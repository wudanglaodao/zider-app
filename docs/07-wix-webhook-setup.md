# Wix Webhook Setup

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

Preferred public key storage is `app_platforms.webhook_public_key_ref`, one row per Wix app. Store either the full PEM public key, a single env var reference, or a legacy JSON-map reference such as `WIX_WEBHOOK_PUBLIC_KEYS.zider_countup`.

Legacy fallback public key format:

```json
{
  "zider_copy_button_clipboard": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "zider_countup": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

If all apps share a public key, `WIX_WEBHOOK_PUBLIC_KEY` can be used instead.

## Supabase Setup

Run:

```text
supabase/schema.sql
```

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

## Notes

Wix webhook bodies are JWTs. Store raw payloads for debugging and process events idempotently because retries and duplicates can happen.
