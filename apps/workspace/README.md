# Zider Workspace

Target Vercel project: `zider-workspace`
Domains: `components.zider.ink`, `workspace.zider.ink`

## Owns

```text
components.zider.ink
├── /dashboard
├── /widgets
├── /api/widgets/interactive-custom-cursor/embed.js
├── /api/widgets/interactive-custom-cursor/config
├── /components
├── /interaction-settings
└── /settings

workspace.zider.ink
├── /dashboard
├── /apps/printops
├── /apps/printops/templates
├── /apps/printops/settings
├── /plug-in/printops/wix
└── /settings
```

## Move From Current Root

- `src/app/interactive-custom-cursor/page.tsx`
- `src/app/wix/interactive-custom-cursor/page.tsx`
- `src/app/api/widgets/interactive-custom-cursor/embed.js/route.ts`
- `src/app/api/widgets/interactive-custom-cursor/config/route.ts`
- `src/app/_components/WorkbenchShell.tsx`
- `src/cursor/*`
- `src/lib/cursor/*`

## Host Routing

This app will use the request host to switch product line context:

- `components.zider.ink` -> Components workspace.
- `workspace.zider.ink` -> Solutions workspace.

## Current Skeleton

The standalone shell already builds with `/`, `/components`, `/solutions`, `/interactive-custom-cursor`, `/wix/interactive-custom-cursor`, `/apps/printops`, `/apps/printops/templates`, `/apps/printops/settings`, `/plug-in/printops/wix`, `/api/health`, `/api/widgets/interactive-custom-cursor/embed.js`, and `/api/widgets/interactive-custom-cursor/config`.

Next migration step: build the authenticated Components dashboard around these product routes.

## PrintOps Wix Preview

Use `/plug-in/printops/wix` as the Wix dashboard URL for the first Wix test app.

Local smoke test:

```text
http://localhost:3102/plug-in/printops/wix?instanceId=wix-dev-preview
```

Production / preview requires either database credentials in `app_platform_secrets` with `app_key=zider_printops` and `platform=wix`, or environment variables:

```text
WIX_PRINTOPS_APP_ID
WIX_PRINTOPS_APP_SECRET
```
