# Platform Plugins

This package is the home for PrintOps platform adapters. WordPress / WooCommerce, Shopify and Wix integrations all live here, but the template engine and workspace UI should only consume normalized PrintOps data.

Each adapter translates a commerce platform into the same PrintOps concepts:

- store identity
- order sync
- product and line-item data
- custom fields
- print template field mapping

## Directory

```text
packages/platform-plugins/
  wix/
    app/
      zider-printops.wix-app.json
      README.md
    src/
      config.ts
      orders.ts
      normalize.ts
      sync.ts
      types.ts
      index.ts
  shopify/
    README.md
  wordpress/
    README.md
```

## Adapter Boundary

Adapters may:

- exchange platform credentials for access tokens
- fetch latest and historical orders within the product scope
- keep platform raw payloads available for persistence
- normalize order, line-item and custom field data
- expose field metadata needed by the template editor

Adapters must not:

- render templates
- know about React components or workspace UI state
- write directly to platform fulfillment records unless a later shipping milestone enables it
- drop source custom fields that are not yet mapped

## P0 Scope

The first adapter is Wix. It only supports:

- latest order sync
- manual historical sync for the last 7 days
- raw payload retention
- normalized invoice fields
- order and line-item custom fields

The recommended first-version policy is:

- automatic latest sync uses `lastSyncedAt`; if it is missing, look back 24 hours
- manual history sync accepts 1-7 days only
- each request page defaults to 50 orders
- a single sync run defaults to at most 10 pages, returning `nextCursor` if the UI should ask the user to continue

Full historical import, fulfillment updates, shipping-platform sync, and advanced product sync are later milestones.
