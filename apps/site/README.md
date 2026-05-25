# ZIDER Ink

Target Vercel project: `zider-ink`
Domain: `zider.ink`

## Owns

- `/`
- `/components`
- `/solutions`
- `/solutions/wix-order-printer`
- `/blog`
- `/forum`
- `/docs`
- `/account`
- `/admin/cms`
- `/contact`
- `/privacy`

## Move From Current Root

- `src/app/page.tsx`
- `src/app/admin/cms/*`
- `src/lib/cms/*`

## Does Not Own

- Wix webhook routes.
- Widget runtime API routes.
- Internal analytics ingestion.
- Product workspace dashboards.

## Current Skeleton

The standalone shell now contains the current landing page, global account sign-in, and CMS backend. It builds with routes for `/`, `/blog`, `/blog/[slug]`, `/forum`, `/forum/[slug]`, `/forum/search`, `/forum/apps/[moduleKey]`, `/docs`, `/account`, `/admin/cms`, and `/api/health`.

Next migration step: deploy a preview with Supabase and account env vars, seed the first admin user, then verify `/account?mode=signin&next=%2Fadmin%2Fcms` and migrate the old Blog/Forum content into `cms_entries`.
