# Three Project Migration Checklist

This checklist tracks the move from the current root `zider-ink` Next.js app into three Vercel apps.

## Target Projects

| Vercel project | Domain | Root directory |
|---|---|---|
| `zider-ink` | `zider.ink` | `apps/site` |
| `zider-app` | `app.zider.ink` | `apps/app` |
| `zider-workspace` | `workspace.zider.ink` | `apps/workspace` |

## Phase 0: Freeze Public Runtime Routes

- [ ] Confirm Wix still sends webhooks to `https://app.zider.ink/events/[platform]/[appKey]`.
- [ ] Confirm new embed script consumers use the workspace URL for `/widget/interactive-custom-cursor/embed.js`.
- [ ] Confirm widget config consumers use the workspace URL for `/widget/interactive-custom-cursor/config`.
- [ ] Confirm `/api/health` expectations.

## Phase 1: Prepare Skeleton

- [x] Create `apps/site`.
- [x] Create `apps/app`.
- [x] Create `apps/workspace`.
- [x] Create planned shared package placeholders.
- [x] Add migration ownership notes.

## Phase 2: Build `apps/app`

- [x] Copy current runtime code into `apps/app`.
- [x] Keep webhook and API routes.
- [x] Keep Supabase server client.
- [x] Keep Wix helpers.
- [x] Move embed script route out of `apps/app`.
- [x] Move config route out of `apps/app`.
- [x] Move Cursor product UI routes out of `apps/app`.
- [x] Remove landing page and CMS code from the app project surface.
- [x] Build locally.
- [ ] Deploy preview with all app env vars.
- [ ] Verify webhook route shape before switching Vercel root directory.

## Phase 3: Build `apps/site`

- [x] Create clean Next.js app.
- [x] Move landing page.
- [x] Move CMS code.
- [x] Add `/blog`.
- [x] Add `/blog/[slug]`.
- [x] Add `/forum`.
- [x] Add `/forum/[slug]`.
- [x] Add `/docs`.
- [x] Add `/account` placeholder.
- [x] Build locally.
- [ ] Deploy preview.

## Phase 4: Build `apps/workspace`

- [x] Create clean Next.js skeleton.
- [x] Move embed script route to `apps/workspace`.
- [x] Move config route to `apps/workspace`.
- [x] Move Workbench shell.
- [x] Move Cursor Lab pages.
- [x] Move cursor libs.
- [ ] Add host-based product-line routing.
- [ ] Add Components dashboard placeholder.
- [ ] Add Solutions dashboard placeholder.
- [x] Build locally.
- [ ] Deploy preview.

Workspace migration is intentionally deferred until `zider-ink` and `zider-app` can be deployed safely.

## Phase 5: Extract Shared Packages

- [ ] Extract stable UI primitives to `packages/ui`.
- [ ] Extract Supabase helpers to `packages/db`.
- [ ] Extract auth helpers to `packages/auth`.
- [ ] Extract CMS helpers to `packages/cms`.
- [ ] Extract constants to `packages/config`.

## Guardrails

- Do not break `app.zider.ink/events/*`.
- Do not run migrations from multiple app directories.
- Do not put `SUPABASE_SERVICE_ROLE_KEY` in browser-exposed code.
- Do not make `app.zider.ink` a public SEO site.
