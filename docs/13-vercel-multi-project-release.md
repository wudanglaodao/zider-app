# Vercel Multi-Project Release

This repo is prepared as three separate Vercel projects that share one GitHub repository. Each Vercel project must point to a different root directory.

## Project Map

| Vercel project | Root Directory | Production domains | Purpose |
|---|---|---|---|
| `zider-ink` | `apps/site` | `zider.ink` | Public site, Blog, Forum, global account sign-in, CMS admin |
| `zider-app` | `apps/app` | `app.zider.ink` | Wix integration service, webhooks, analytics ingestion |
| `zider-workspace` | `apps/workspace` | `components.zider.ink`, `workspace.zider.ink` | Component runtime, embeds, workspace and solution pages |

Use `workspace.zider.ink` for the solutions workspace. Do not configure `solutions.zider.ink` for this release.

## Project Scenarios

### `zider-ink`

This is the public ZIDER site.

Use it for:

- Marketing/public website pages on `zider.ink`
- Blog and Forum content
- Forum search, app module pages, and community article detail pages
- Global account sign-in at `/account`
- CMS admin at `/admin/cms`

Do not use it for:

- Wix webhook callbacks
- Wix dashboard/runtime app pages
- Component embed scripts

### `zider-app`

This is the Wix integration service. Its only production domain is `app.zider.ink`.

Use it for:

- Wix webhook callbacks, for example `/events/wix/:app_key`
- Wix OAuth/runtime API work
- App install/runtime health checks
- App analytics ingestion
- Server-side Wix integration logic that should not live on the public site or workspace

Do not use it for:

- Public Forum/Blog pages
- Workspace or solution pages
- Component embed script hosting
- Workspace dashboard pages

### `zider-workspace`

This is one Vercel project with two production domains.

Use `components.zider.ink` for:

- Component runtime endpoints
- Widget embed scripts
- Widget config APIs
- URLs that installed Wix sites load directly

Use `workspace.zider.ink` for:

- Workspace UI
- Solution pages
- Internal/product workspace surfaces

Do not use `zider-workspace` for:

- Wix webhook callbacks
- Global account/CMS routes
- Public Blog/Forum routes

## Vercel Dashboard Settings

For each Vercel project:

1. Go to `Settings -> General`.
2. Set `Framework Preset` to `Next.js`.
3. Set `Root Directory` to the matching path from the table above.
4. Keep the commands from the app-level `vercel.json`:
   - Install Command: `npm install`
   - Build Command: `npm run build`
5. Keep Git integration connected to `wudanglaodao/zider-app`.

After this, pushing to GitHub will create preview deployments for all connected projects. Pushing or merging to the production branch will trigger production builds according to each project's Git settings.

## Domains

Configure domains in `Settings -> Domains`.

### `zider-ink`

- `zider.ink`
- Optional redirect: `www.zider.ink -> zider.ink`

### `zider-app`

- `app.zider.ink`

Keep Wix webhook URLs on this domain:

```text
https://app.zider.ink/events/[platform]/[appKey]
https://app.zider.ink/api/health
```

### `zider-workspace`

- `components.zider.ink`
- `workspace.zider.ink`

Current workspace routes include:

```text
https://components.zider.ink/api/widgets/interactive-custom-cursor/embed.js
https://components.zider.ink/api/widgets/interactive-custom-cursor/config
https://workspace.zider.ink/solutions
```

## Environment Variables

Set secrets in Vercel Dashboard, not in Git. Add required runtime variables to Production and Preview if preview deployments should be fully usable. Development is only needed when using `vercel dev` or `vercel env pull`.

Wix app credentials and webhook public keys live in Supabase table `app_platform_secrets`. They are not required as Vercel environment variables after the table is seeded.

### `zider-ink` (`apps/site`)

Required:

```text
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Optional:

```text
NEXT_PUBLIC_SITE_URL=https://zider.ink
```

One-time local/admin seed values:

```text
ZIDER_ADMIN_EMAIL=yancytien@gmail.com
ZIDER_ADMIN_PASSWORD=...
ZIDER_ADMIN_DISPLAY_NAME=Yancy Tien
```

Notes:

- CMS does not have a separate login page. Admins sign in through `/account?mode=signin`.
- Run `npm --prefix apps/site run seed:admin` after the `zider_users` migration is applied.
- Account permissions come from the `zider_users` table.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must not use a `NEXT_PUBLIC_` prefix.
- `NEXT_PUBLIC_SITE_URL` is not required for this release because the site falls back to `https://zider.ink`. Configure it only if an environment needs a different canonical URL.

### `zider-app` (`apps/app`)

Required:

```text
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Optional:

```text
ZIDER_COMPONENTS_URL=https://components.zider.ink
```

Notes:

- `ZIDER_COMPONENTS_URL` is only an override for Wix script installation previews. If omitted, the script URL defaults to `https://components.zider.ink`.
- Run `npm --prefix apps/app run seed:platform-secrets` after the `app_platform_secrets` migration is applied.
- `WIX_INTERACTIVE_CUSTOM_CURSOR_APP_ID`, `WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET`, `WIX_WEBHOOK_PUBLIC_KEY`, and `WIX_WEBHOOK_PUBLIC_KEYS` are legacy fallbacks only. Do not add them to Vercel unless recovering from an unseeded database.

Health check:

```text
https://app.zider.ink/api/health?checks=1
```

### `zider-workspace` (`apps/workspace`)

Required:

```text
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Optional:

```text
CURSOR_WIDGET_CONFIGS_TABLE=widget_configs
```

Notes:

- The widget embed route uses its own request origin, so `ZIDER_WORKSPACE_URL` and `NEXT_PUBLIC_ZIDER_WORKSPACE_URL` are not required.
- Interactive Custom Cursor instance verification reads the Wix app secret from `app_platform_secrets`. `WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET` and `WIX_APP_SECRET` are legacy fallbacks only.

Health check:

```text
https://workspace.zider.ink/api/health
```

## Release Order

1. Apply Supabase migrations, then seed `app_platform_secrets` and the first admin user.
2. Configure `zider-app` first because Wix webhook and runtime URLs are externally integrated.
3. Configure `zider-workspace` next and verify widget embed/config routes.
4. Configure `zider-ink` last, then verify public routes and `/account?mode=signin`.
5. Promote only after preview smoke tests pass.

## Smoke Tests

Run these after every production deployment:

```text
https://zider.ink/api/health
https://zider.ink/forum
https://zider.ink/account?mode=signin
https://app.zider.ink/api/health?checks=1
https://workspace.zider.ink/api/health
https://components.zider.ink/api/widgets/interactive-custom-cursor/embed.js?instanceId=test
```

## CLI Note

The local Vercel CLI currently reports a personal scope that does not list the screenshot projects. Use the Vercel dashboard for linking/configuration, or switch the CLI to the account/team that owns `zider-ink`, `zider-app`, and `zider-workspace` before running `vercel link`.
