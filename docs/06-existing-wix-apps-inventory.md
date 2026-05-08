# Existing Wix Apps Inventory

## Purpose

This document tracks the existing Wix apps that should be connected to the shared analytics and webhook foundation.

This inventory is for analytics onboarding only. It does not change the future product roadmap, where Cursor Studio and PrintSlip are planned separately.

## Current Count

There are 8 existing Wix apps to account for. All 8 are treated as `published`.

## Draft Inventory

| app_key | app_name | platform | platform_app_id | listing_url | status | pricing | distribution_channel | acquisition_source | billing_provider | webhook_events_needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| store_content_suite | Store Content Suite | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Existing app only; removed from future roadmap planning. |
| zider_copy_button_clipboard | Zider Copy Button / Clipboard | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| zider_product_detail_enhancer | Zider Product Detail Enhancer | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| before_and_after_slider | Before And After Slider | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| beforeafter_slider_x | BeforeAfter Slider X | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| zider_countup | Zider CountUp | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| zider_loop_logo | Zider Loop Logo | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |
| smart_login_button | Smart Login Button | wix | TBD | TBD | published | TBD | marketplace | wix_app_market | wix | install, uninstall, paid_plan_purchase | Confirmed from screenshot. |

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

## Excluded From Current Scope

The user confirmed 8 apps. One blurred row appears in the screenshot, but it is not included in the current 8-app analytics scope.

Current scope:

```text
Store Content Suite
Zider Copy Button / Clipboard
Zider Product Detail Enhancer
Before And After Slider
BeforeAfter Slider X
Zider CountUp
Zider Loop Logo
Smart Login Button
```

Confirm the blurred app separately before adding it as a ninth endpoint.
