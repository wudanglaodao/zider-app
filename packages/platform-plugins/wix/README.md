# Wix Platform Plugin

Wix is the first PrintOps platform adapter.

## App Identity

- App name: Zider PrintOps
- App key: `zider_printops`
- App URL namespace: `/apps/printops`
- Platform: Wix

## P0 Order Sync

P0 keeps the sync boundary intentionally small:

- `latest`: fetch orders changed since `lastSyncedAt`; if the store has never synced, look back 24 hours.
- `history`: manual backfill for a rolling window of up to 7 days.
- Historical ranges older than 7 days are rejected.
- Query by `updatedDate` descending so edits, payment updates and fulfillment changes can refresh existing orders.
- Default page size is 50 orders; default run cap is 10 pages, after which the caller can continue from `nextCursor`.
- Raw Wix order payloads must be stored before normalization.
- Custom fields must be captured and printable in the first version.

This is enough for development stores and early merchants to validate the core loop: connect Wix, receive orders, map custom fields, preview invoice, download PDF, and print.

## Code Entry Points

| File | Purpose |
|---|---|
| `src/config.ts` | App identity, sync limits and sync window creation |
| `src/orders.ts` | Build and send Wix Orders search requests |
| `src/normalize.ts` | Convert Wix raw orders into PrintOps normalized order data |
| `src/sync.ts` | Run latest/history sync across cursor pages and expose normalized results |
| `src/types.ts` | Shared Wix and PrintOps adapter types |

Workspace API entry point:

```text
POST /api/apps/printops/wix/orders/sync?instance=...
POST /api/apps/printops/wix/orders/sync?instanceId=wix-dev-preview
```

The workspace route handles Wix instance resolution and OAuth token exchange, then calls this adapter package. The response intentionally returns normalized order summaries and captured custom fields, not the full raw payload.

Recommended P0 flow:

1. Resolve the Wix `instanceId` from the Wix dashboard request.
2. Exchange `instanceId` for a Wix access token.
3. Call `syncWixOrders({ mode: "latest", accessToken, lastSyncedAt })`.
4. Persist every raw order payload first.
5. Persist the normalized order and custom fields for Template Render Context.
6. Update store `lastSyncedAt` only after the run succeeds.

## Later

- Wix webhooks for continuous incremental sync.
- Product sync and product custom fields.
- Full historical import with progress state.
- Fulfillment write-back.
- Shipping-platform handoff.
