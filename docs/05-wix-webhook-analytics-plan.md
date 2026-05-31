# App Analytics and Install Channel Plan

## Goal

Build a shared analytics foundation for app installs, lifecycle events, billing changes, and distribution channels before starting new product development.

The immediate goal is to answer:

- How many installs does each app get?
- How many uninstalls does each app get?
- Which apps are active?
- Which apps convert to paid plans?
- Which plans are upgraded, downgraded, or cancelled?
- Which sites and app instances are connected to each app?
- Which platform did an install come from?
- Which distribution channel produced the install?
- Which marketing source, campaign, or referral led to the install?

## Why This Comes First

There are already 8 Wix apps, but no unified statistics.

Webhook and install tracking should be added now because event data is forward-looking. Historical install events that happened before tracking may not be recoverable as webhook events.

Early tracking gives every future product a better foundation:

- Interactive Custom Cursor
- PrintSlip
- Existing 8 Wix apps
- Future Zider apps
- Webflow script installs
- Self-hosted/direct installs
- Other marketplace installs

## Scope

### In Scope

- Shared event receiver for multiple apps and platforms
- App lifecycle events
- Install tracking
- Uninstall tracking
- Paid plan purchase tracking
- Paid plan change tracking later if needed
- Trial / billing event tracking later if supported by each app
- Raw webhook payload storage
- Deduplication
- Platform and channel attribution
- UTM/referrer capture where available
- Basic event log
- Basic app analytics dashboard later

### Out of Scope

- Interactive Custom Cursor feature development
- PrintSlip feature development
- Full product analytics SDK
- Complex BI dashboard
- User behavior tracking inside every app
- Marketing attribution
- Revenue reporting beyond Wix plan event capture

## Recommended Architecture

```text
Platform Events
├─ Wix App Webhooks
├─ Webflow Script / License Events
├─ Self-hosted Install Events
└─ Other Marketplace Events
↓
app.zider.ink/events/:platform/:app_key
↓
Event Receiver
↓
Platform-specific Verification
↓
Raw Event Log
↓
Event Processor
↓
Supabase
↓
Analytics Views / Dashboard
```

## Endpoint Strategy

Use one shared event route with platform and app key in the URL:

```text
POST /events/:platform/:app_key
```

Examples:

```text
/events/wix/interactive_custom_cursor
/events/wix/printslip
/events/webflow/interactive_custom_cursor
/events/direct/interactive_custom_cursor
/events/shopify/future_app
```

Reason:

- Wix webhook payloads can differ by event type.
- Webflow and self-hosted installs will not look like Wix webhooks.
- Each published app may have separate credentials and webhook public keys.
- The URL app key gives a reliable internal app mapping even if the payload shape changes.
- The URL platform gives a reliable platform dimension even if the payload does not contain one.

## Platform and Channel Model

These concepts should stay separate:

```text
App
The Zider product, such as Interactive Custom Cursor or PrintSlip.

Platform
Where the app is installed or used, such as Wix, Webflow, direct, Shopify, WordPress, or other.

Distribution Channel
How the user acquired the app, such as marketplace, direct install, partner, agency, website CTA, or manual import.

Marketing Source
The attribution source, such as Google, Wix search, newsletter, affiliate, UTM campaign, or referrer.

Billing Provider
Where payment or plan state comes from, such as Wix, Stripe, Paddle, AppSumo, or manual.
```

Recommended controlled values:

### platform

```text
wix
webflow
direct
wordpress
shopify
other
```

### distribution_channel

```text
marketplace
direct
website
partner
agency
manual
import
unknown
```

### acquisition_source

Examples:

```text
wix_app_market
webflow_marketplace
zider_website
google
bing
newsletter
affiliate
partner
unknown
```

### billing_provider

```text
wix
stripe
paddle
manual
none
unknown
```

## Required Wix Events

Start with the three Wix-recommended app management and billing events:

- App Instance Installed
- App Instance Removed
- Paid Plan Purchased

Then add product-specific or additional billing events only when needed.

For future PrintSlip, possible later events may include order-related events.

For Interactive Custom Cursor, product-specific events may be internal dashboard usage events rather than Wix webhooks.

## Important Wix Webhook Rules

Wix sends webhook event data as a JWT. The receiver must verify the JWT before trusting it.

Operational rules:

- Respond with HTTP 200 quickly.
- Wix retries failed webhooks.
- Duplicate events can happen.
- Events can arrive out of order.
- Store processed event IDs or a deterministic event fingerprint.
- Store raw payloads for debugging.
- Process business logic idempotently.

## Suggested Database Tables

### zider_apps

Stores every Zider product tracked by analytics.

```text
id
app_key
app_name
app_category
status
created_at
updated_at
```

### app_platforms

Stores app availability and credentials per platform.

One app can exist on multiple platforms.

```text
id
app_id
app_key
platform
platform_app_id
platform_app_name
marketplace_url
status
default_billing_provider
created_at
updated_at
```

Examples:

```text
interactive_custom_cursor | wix | <wix_app_id>
interactive_custom_cursor | webflow | null
interactive_custom_cursor | direct | null
printslip | wix | <wix_app_id>
```

### app_webhook_subscriptions

Stores the expected webhook subscriptions per app/platform, so setup status can be audited separately from received event logs.

```text
id
app_id
app_key
app_platform_id
platform
event_type
event_name
callback_url
status
subscribed_at
last_verified_at
notes
created_at
updated_at
```

### app_installations

Stores one row per app installation or license activation across all platforms.

```text
id
app_id
app_key
app_platform_id
platform
distribution_channel
acquisition_source
acquisition_medium
acquisition_campaign
referrer_url
landing_url
instance_id
external_install_id
site_id
external_site_id
site_owner_id
site_url
account_id
external_account_id
app_version
status
is_free
billing_provider
current_plan_id
current_plan_name
installed_at
uninstalled_at
last_event_at
first_seen_at
last_seen_at
created_at
updated_at
```

Important identity rule:

```text
Use app_key + platform + instance_id as the primary natural install identity when possible.
```

Fallback identities:

- Wix: Wix instance ID / app instance ID
- Webflow: license key, site ID, or script-generated install ID
- Direct: license key, domain, or generated install ID
- WordPress: site URL + license key
- Other: platform-native install ID

### install_attribution_events

Stores attribution changes and first-touch/last-touch details separately from installation state.

```text
id
installation_id
app_id
app_key
platform
distribution_channel
acquisition_source
acquisition_medium
acquisition_campaign
utm_source
utm_medium
utm_campaign
utm_term
utm_content
referrer_url
landing_url
captured_at
created_at
```

### platform_event_logs

Stores every verified webhook event.

```text
id
app_id
app_key
app_platform_id
platform
instance_id
event_type
event_id
event_time
dedupe_key
raw_body
raw_jwt
raw_headers
decoded_payload
verification_status
processing_status
processing_error
received_at
processed_at
```

### app_billing_events

Stores billing and plan changes.

```text
id
app_id
app_key
platform
app_platform_id
installation_id
instance_id
event_type
billing_provider
vendor_product_id
previous_vendor_product_id
cycle
previous_cycle
invoice_id
coupon_name
operation_timestamp
raw_event_id
created_at
```

### app_daily_metrics

Optional rollup table for simple dashboard performance.

```text
id
app_id
app_key
platform
distribution_channel
date
installs
uninstalls
net_installs
paid_plan_changes
active_instances
created_at
updated_at
```

## Event Processing Logic

### Install Event

On App Instance Installed:

```text
Verify JWT
↓
Store raw event
↓
Dedupe
↓
Upsert app_installations by app_key + platform + instance_id
↓
Set status = active
↓
Set installed_at if empty
↓
Store platform and distribution channel
↓
Optionally call Wix Get App Instance for enrichment
```

### Remove Event

On App Instance Removed:

```text
Verify JWT
↓
Store raw event
↓
Dedupe
↓
Update app_installations by app_key + platform + instance_id
↓
Set status = removed
↓
Set uninstalled_at
```

### Paid Plan Purchased Event

On Paid Plan Purchased:

```text
Verify JWT
↓
Store raw event
↓
Dedupe
↓
Insert app_billing_events
↓
Update app_installations current plan fields
```

## Channel Attribution Rules

### First-touch fields

The first known install source should be preserved:

```text
first_distribution_channel
first_acquisition_source
first_acquisition_campaign
first_referrer_url
first_landing_url
```

These can either live directly on `app_installations` or be derived from the earliest `install_attribution_events` row.

### Last-touch fields

Last-touch can update when a better attribution event arrives:

```text
distribution_channel
acquisition_source
acquisition_medium
acquisition_campaign
referrer_url
landing_url
```

### Unknown is valid

Do not force attribution guesses.

If the source is unknown, store:

```text
distribution_channel = "unknown"
acquisition_source = "unknown"
```

### Wix Marketplace Installs

Default attribution for Wix App Market install webhooks:

```text
platform = "wix"
distribution_channel = "marketplace"
acquisition_source = "wix_app_market"
billing_provider = "wix"
```

If UTM/referrer data is not available from Wix, keep it unknown.

### Webflow Installs

Potential attribution:

```text
platform = "webflow"
distribution_channel = "direct" or "marketplace"
acquisition_source = "webflow_marketplace" or "zider_website"
billing_provider = "stripe" or "manual"
```

For early Webflow Custom Code installs, use a generated install ID plus domain/license key.

### Direct / Self-hosted Installs

Potential attribution:

```text
platform = "direct"
distribution_channel = "website"
acquisition_source = utm_source or referrer
billing_provider = "stripe" or "none"
```

For direct script installs, the runtime can send an activation event with:

- app key
- install ID
- domain
- script version
- UTM params if present
- referrer if available

## Backfill Reality

Webhook and event integration will mainly collect future events.

For the 8 existing Wix apps, historical data may require manual export, Wix dashboard reports, or another Wix-supported source if available.

Recommended approach:

1. Start capturing new webhook events immediately.
2. Manually record current known install/revenue baselines per app.
3. Mark baselines as imported snapshots with platform and channel fields.
4. Measure all changes from that date forward.

## MVP Dashboard Metrics

First dashboard should show:

- Total apps tracked
- Total active installs
- Active installs by platform
- Active installs by distribution channel
- Installs by app
- Uninstalls by app
- Net installs by app
- Paid plan changes by app
- Recent webhook events
- Failed processing events

Useful charts:

- Daily installs
- Daily uninstalls
- Active installs by app
- Active installs by platform
- Installs by channel
- Installs by source/campaign
- Plan changes by app

## Implementation Phases

### Phase 1: Inventory

Collect for each of the 8 Wix apps:

- App name
- Wix app ID
- Internal app key
- Current listing URL
- Current pricing model
- Current webhook settings
- Public key / webhook verification details
- Available events
- Default platform: `wix`
- Default distribution channel: `marketplace`
- Default acquisition source: `wix_app_market`
- Default billing provider

### Phase 2: Shared Receiver

Build the event endpoint and Wix verification flow.

Acceptance:

- Receives Wix test webhook
- Verifies JWT
- Stores raw decoded event
- Returns 200 quickly

### Phase 3: Lifecycle Processing

Process:

- App Instance Installed
- App Instance Removed
- Paid Plan Purchased

Acceptance:

- app_installations updates correctly
- billing events are recorded
- duplicate events do not corrupt data

### Phase 4: Basic Analytics

Create simple dashboard or admin page.

Acceptance:

- Can view events by app
- Can view active installs by app
- Can filter installs by platform
- Can filter installs by distribution channel
- Can view recent failures

### Phase 5: Extend Per App

Add product-specific events only after lifecycle stats are reliable.

## Open Questions

- Are the 8 apps all under the same Wix developer account?
- Are they all self-hosted apps, Wix CLI apps, or mixed?
- Do they use the same backend domain today?
- Do they already have OAuth credentials configured?
- Which events are currently available per app?
- Do any apps have paid plans already?
- Do you want stats inside a private admin page or inside Supabase first?
- Do you want Webflow/direct installs tracked in the same database from day one?
- Do you already have UTM links or landing pages for the 8 Wix apps?
- Should channel attribution use first-touch, last-touch, or both?

## Recommended Next Step

Create an app inventory table for the 8 existing Wix apps before writing the receiver.

The first useful artifact should be:

```text
app_key | app_name | platform | platform_app_id | listing_url | pricing | distribution_channel | acquisition_source | billing_provider | webhook_events_needed | status
```
