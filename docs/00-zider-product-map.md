# Zider Product Map

## Product Direction

Zider is a Wix app brand that can grow into multiple focused apps over time.

For the current stage, the product map should stay small:

```text
Zider
├─ Foundation: Wix Webhook Analytics
│  ├─ Shared webhook endpoint
│  ├─ App install tracking
│  ├─ App uninstall tracking
│  ├─ Plan change tracking
│  └─ Basic analytics dashboard
│
├─ App 1: Interactive Custom Cursor
│  ├─ Wix App Market Listing
│  ├─ Dashboard Settings
│  ├─ Embedded Script
│  └─ Cursor Config
│
└─ App 2: Zider PrintOps
   ├─ Wix App Market Listing
   ├─ Dashboard Settings
   ├─ Invoice Template Center
   ├─ Wix Order Sync
   └─ Order Print / Preview
```

## Foundation: Wix Webhook Analytics

Wix Webhook Analytics should be planned before new app development.

Reason:

- There are already published Wix apps.
- Existing apps have no unified install, uninstall, billing, or lifecycle statistics.
- Future apps need the same analytics foundation.
- Webhooks are event-based, so new tracking starts after integration and should be added as early as possible.

This foundation should stay focused on app lifecycle statistics first, not product feature development.

## App 1: Interactive Custom Cursor

Interactive Custom Cursor is the first app and the current priority.

Positioning:

```text
Interactive Cursor Experience for Wix
```

It focuses on front-site visual interaction:

- Custom cursor
- Link and button hover states
- Click effects
- Smooth motion
- Simple dashboard configuration

The goal is to validate whether Wix users want a lightweight visual interaction enhancement app.

## App 2: Zider PrintOps

Zider PrintOps is the order printing app.

Positioning:

```text
Custom invoice templates and print-ready order documents for Wix Stores.
```

It focuses on store operations:

- Custom invoices
- Wix order sync
- Recent history backfill
- Store branding
- Order print preview
- Batch printing

PrintOps should not share runtime logic with Interactive Custom Cursor. It may share brand, dashboard layout patterns, billing, and analytics later.

## Shared Platform Principle

Do not build a full platform before the first app is validated.

Keep only light naming and structure conventions:

```text
app_key
app_name
platform
dashboard_entry
config_schema
runtime_type
```

Recommended app keys:

```text
interactive_custom_cursor
zider_printops
```

## Current Planning Rule

Wix Webhook Analytics is the first infrastructure planning target.

Interactive Custom Cursor is the first product app to plan in detail after the analytics foundation is defined.

PrintSlip is only documented as a future product note until Interactive Custom Cursor has a validated MVP.
