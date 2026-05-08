# Zider Docs

This folder splits the original Cursor Studio PRD into smaller planning documents.

## Documents

- [00 Product Map](./00-zider-product-map.md)
- [01 Cursor Studio PRD](./01-cursor-studio-prd.md)
- [02 Cursor Studio MVP Plan](./02-cursor-studio-mvp-plan.md)
- [03 Cursor Studio Technical Plan](./03-cursor-studio-technical-plan.md)
- [04 PrintSlip Product Note](./04-printslip-product-note.md)
- [05 Wix Webhook Analytics Plan](./05-wix-webhook-analytics-plan.md)
- [06 Existing Wix Apps Inventory](./06-existing-wix-apps-inventory.md)

## Current Decision

Zider currently has one analytics foundation project, one confirmed app, and one reserved future app:

```text
Zider Apps
├─ Wix Webhook Analytics
├─ Cursor Studio
└─ PrintSlip
```

Wix Webhook Analytics should be planned first because there are already 8 Wix apps without unified install, uninstall, billing, and usage statistics. Cursor Studio remains the active product planning target after analytics is clarified. PrintSlip is reserved as a separate future app and should not be mixed into Cursor Studio.
