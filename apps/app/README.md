# Zider App

Target Vercel project: `zider-app`
Domain: `app.zider.ink`

## Owns

- `/events/[platform]/[appKey]`
- `/api/health`

## Move From Current Root

- `src/app/events/[platform]/[appKey]/route.ts`
- `src/app/api/health/route.ts`
- `src/lib/webhooks/*`
- `src/lib/wix/*`
- `src/lib/supabase/server.ts`
- `scripts/import-wix-payout-csv.mjs`

## Must Not Break

These paths are externally integrated and must keep the same public URL shape:

```text
https://app.zider.ink/events/[platform]/[appKey]
https://app.zider.ink/api/health
```

## Current Skeleton

The standalone shell now contains the current webhook/API runtime and keeps historical compatibility routes:

- `/events/[platform]/[appKey]`
- `/api/health`

Cursor product UI, embed, and config routes now live in `apps/workspace`.

Next migration step: deploy a preview with the current `app.zider.ink` Supabase env vars, verify Wix webhook signing and analytics writes, then switch the existing Vercel project's root directory to `apps/app`.
