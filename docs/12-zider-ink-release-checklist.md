# ZIDER Ink Release Checklist

This checklist prepares the public `zider.ink` site for release from `apps/site`.

## Project Identity

- [x] Use `zider-ink` as the repository/package identity.
- [x] Use `zider-ink` as the public site Vercel project name.
- [ ] Confirm the Vercel project is linked to `apps/site`.
- [ ] Confirm the production domain is `zider.ink`.
- [ ] Keep `zider-app` reserved for `app.zider.ink` webhook and app runtime work.
- [ ] Keep `zider-workspace` reserved for `components.zider.ink` and `workspace.zider.ink`.

## Environment

- [ ] Set CMS Supabase variables for production.
- [ ] Seed the first admin user with `ZIDER_ADMIN_EMAIL=yancytien@gmail.com`.
- [ ] Confirm service-role keys are available only to server routes.
- [ ] Confirm no app/webhook secrets are required by `apps/site`.
- [ ] For Preview, configure Supabase/account env vars if CMS or account routes must work before promotion.

## Content

- [ ] Review homepage copy and contact links.
- [ ] Review Blog list and Blog detail pages.
- [ ] Review Forum homepage, search, app module pages, and article detail pages.
- [ ] Confirm migrated WordPress media URLs render correctly.
- [ ] Confirm community posts are grouped under the right component modules.
- [ ] Keep planned forum top-level spaces disabled until ready: Components, Solutions, Announcements.

## Technical Checks

- [x] `npm --prefix apps/site run typecheck`
- [x] `npm --prefix apps/site run build`
- [x] Verify `/api/health` returns `service: "zider-ink"`.
- [x] Verify key public routes:
  - `/`
  - `/blog`
  - `/forum`
  - `/forum/search?q=slider`
  - `/contact`
  - `/privacy`

## Release

- [ ] Deploy preview from `apps/site`.
- [ ] Smoke test preview routes, `/account?mode=signin`, and CMS-backed pages.
- [ ] Add or confirm the `zider.ink` production domain.
- [ ] Promote preview to production.
- [ ] Check production health endpoint after promotion.
- [ ] Keep the previous deployment available for rollback.

## Post Release

- [ ] Submit or refresh sitemap if needed.
- [ ] Check canonical URLs and internal links.
- [ ] Watch runtime logs for 404s and server errors.
- [ ] Capture any follow-up polish items in a separate post-release list.
