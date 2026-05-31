# Zider Workspace

Target Vercel project: `zider-workspace`
Domain: `workspace.zider.ink`

## Owns

```text
workspace.zider.ink
├── /apps/printops
├── /apps/printops/templates
├── /apps/printops/settings
├── /apps/printops/wix
├── /widget/interactive-custom-cursor
├── /widget/interactive-custom-cursor/wix
├── /widget/interactive-custom-cursor/embed.js
└── /widget/interactive-custom-cursor/config
```

## Move From Current Root

- `src/app/widget/interactive-custom-cursor/page.tsx`
- `src/app/widget/interactive-custom-cursor/wix/page.tsx`
- `src/app/widget/interactive-custom-cursor/embed.js/route.ts`
- `src/app/widget/interactive-custom-cursor/config/route.ts`
- `src/app/_components/WorkbenchShell.tsx`
- `src/cursor/*`
- `src/lib/cursor/*`

## Host Routing

This app separates product lines by route namespace:

- `/apps/*` -> merchant apps and solution workspaces.
- `/widget/*` -> embedded widget products and runtime endpoints.

## Current Skeleton

The standalone shell already builds with `/`, `/components`, `/solutions`, `/apps/printops`, `/apps/printops/templates`, `/apps/printops/settings`, `/apps/printops/wix`, `/api/health`, `/widget/interactive-custom-cursor`, `/widget/interactive-custom-cursor/wix`, `/widget/interactive-custom-cursor/embed.js`, and `/widget/interactive-custom-cursor/config`.

Next migration step: build the authenticated Components dashboard around these product routes.

## PrintOps Wix Preview

Use `/apps/printops/wix` as the Wix dashboard URL for the first Wix test app.

Wix Developer Console setup source:

```text
packages/platform-plugins/wix/app/zider-printops.wix-app.json
packages/platform-plugins/wix/app/README.md
docs/10-wix-printops-app.md
```

Local smoke test:

```text
http://localhost:3102/apps/printops/wix?instanceId=wix-dev-preview
```

Production / preview requires either database credentials in `app_platform_secrets` with `app_key=zider_printops` and `platform=wix`, or environment variables:

```text
WIX_PRINTOPS_APP_ID
WIX_PRINTOPS_APP_SECRET
```

P0 order sync endpoint:

```text
POST /api/apps/printops/wix/orders/sync?instance=...
POST /api/apps/printops/wix/orders/sync?instanceId=wix-dev-preview
```

Supported request body:

```json
{
  "mode": "latest",
  "limit": 50,
  "maxPages": 10
}
```

Use `"mode": "history"` with `"historyDays": 7` for the first-version manual backfill window. The endpoint exchanges the Wix `instanceId` for an access token, queries Wix orders by `updatedDate`, and returns normalized orders plus captured custom fields for invoice rendering.
