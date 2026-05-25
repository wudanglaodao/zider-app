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
├── /wix-order-printer
├── /wix-order-printer/orders
├── /wix-order-printer/templates
├── /wix-order-printer/print-jobs
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

The standalone shell already builds with `/`, `/components`, `/solutions`, `/interactive-custom-cursor`, `/wix/interactive-custom-cursor`, `/api/health`, `/api/widgets/interactive-custom-cursor/embed.js`, and `/api/widgets/interactive-custom-cursor/config`.

Next migration step: build the authenticated Components dashboard around these product routes.
