# ZIDER Ink

ZIDER Ink is the monorepo for the public ZIDER site, Wix integration service, and component/workspace runtime.

## Projects

| Vercel project | Root directory | Production domains | Purpose |
| --- | --- | --- | --- |
| `zider-ink` | `apps/site` | `zider.ink` | Public site, Blog, Forum, global account sign-in, CMS admin |
| `zider-app` | `apps/app` | `app.zider.ink` | Wix integration service, webhook receiver, analytics ingestion |
| `zider-workspace` | `apps/workspace` | `components.zider.ink`, `workspace.zider.ink` | Component runtime, embed scripts, workspace and solution pages |

Keep these boundaries strict:

- `app.zider.ink` keeps existing Wix webhook URLs, for example `/events/wix/zider_product_detail_enhancer`.
- `components.zider.ink` serves component runtime and embed script endpoints.
- `workspace.zider.ink` serves workspace and solution UI.
- `zider.ink` serves the public website, Blog, Forum, account, and CMS routes.

## Key Routes

```text
apps/site
├── /
├── /blog
├── /forum
├── /account
└── /admin/cms

apps/app
├── /api/health
└── /events/[platform]/[appKey]

apps/workspace
├── /components
├── /solutions
├── /wix/interactive-custom-cursor
└── /api/widgets/interactive-custom-cursor/embed.js
```

## Development

Install dependencies from the repo root:

```bash
npm install
```

Run each app separately:

```bash
npm --prefix apps/site run dev
npm --prefix apps/app run dev
npm --prefix apps/workspace run dev
```

Default local ports:

```text
apps/site      http://localhost:3100
apps/app       http://localhost:3101
apps/workspace http://localhost:3102
```

## Environment

All three deployed projects need Supabase service credentials:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Wix app credentials and webhook public keys live in Supabase. Existing published app webhook public keys are still supported through `app_platforms.webhook_public_key_ref`; new secret storage uses `app_platform_secrets`.

Seed helpers:

```bash
npm --prefix apps/site run seed:admin
npm --prefix apps/app run seed:platform-secrets
```

## Verification

Run before release:

```bash
npm --prefix apps/site run typecheck
npm --prefix apps/site run build
npm --prefix apps/app run typecheck
npm --prefix apps/app run build
npm --prefix apps/workspace run typecheck
npm --prefix apps/workspace run build
```

## Release Notes

Vercel must be configured as three separate projects with the root directories listed above. Do not move existing Wix webhook URLs away from `app.zider.ink/events/wix/...`.

See [docs/13-vercel-multi-project-release.md](docs/13-vercel-multi-project-release.md) for the full release checklist.
