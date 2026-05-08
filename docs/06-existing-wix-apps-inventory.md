# Existing Wix Apps Inventory

## Purpose

This document tracks the existing Wix apps that should be connected to the shared analytics and webhook foundation.

This inventory is for analytics onboarding only. It does not change the future product roadmap, where Cursor Studio and PrintSlip are planned separately.

## Current Count

There are 8 existing Wix apps to account for.

The screenshots show more visible rows than the stated count because at least one row is blurred or may not be part of the final analytics scope. Treat this list as a draft until each app is confirmed from Wix Developers.

## Draft Inventory

| app_key | app_name | platform | platform_app_id | listing_url | status | pricing | distribution_channel | acquisition_source | billing_provider | webhook_events_needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| store_content_suite | Store Content Suite | wix | TBD | TBD | draft_or_unknown | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Existing app only; removed from future roadmap planning. |
| zider_copy_button_clipboard | Zider Copy Button / Clipboard | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| zider_product_detail_enhancer | Zider Product Detail Enhancer | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| before_and_after_slider | Before And After Slider | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| beforeafter_slider_x | BeforeAfter Slider X | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| zider_countup | Zider CountUp | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| zider_loop_logo | Zider Loop Logo | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| smart_login_button | Smart Login Button | wix | TBD | TBD | draft_or_unknown | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Visible in screenshot. |

## Fields To Fill Before Implementation

For each app, collect:

- Exact Wix app name
- Internal `app_key`
- Wix app ID
- App Market listing URL
- Current publication status
- Pricing model
- Existing webhook configuration
- Wix webhook public key / verification details
- OAuth client details if needed
- Whether paid plan events are relevant

## Counting Issue To Resolve

The user confirmed 8 apps.

Visible names from screenshots include:

```text
Store Content Suite
Zider Copy Button / Clipboard
Unknown blurred app
Zider Product Detail Enhancer
Before And After Slider
BeforeAfter Slider X
Zider CountUp
Zider Loop Logo
Smart Login Button
```

This appears to be 9 visible rows if the blurred app and Smart Login Button are both in scope.

For implementation, the readable 8 apps above are treated as the current scope. Confirm the blurred app separately before adding it as a ninth endpoint.
