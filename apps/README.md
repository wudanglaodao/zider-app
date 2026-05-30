# Zider Apps

This directory is the target home for the three Vercel applications.

The current repository still runs from the root Next.js app. These folders now contain buildable skeleton apps so migration can happen one project at a time without breaking the current runtime.

## Target Vercel Projects

| Vercel project | Domain | Vercel root directory | Responsibility |
|---|---|---|---|
| `zider-ink` | `zider.ink` | `apps/site` | Marketing site, Blog, Forum, Docs, Account, CMS |
| `zider-app` | `app.zider.ink` | `apps/app` | Wix webhook, API, analytics, system dashboard |
| `zider-workspace` | `workspace.zider.ink` | `apps/workspace` | Apps and widget product backends |

## Migration Rule

Do not move production webhook routes until `apps/app` can build and has matching environment variables.

## Local Commands

```bash
npm --prefix apps/site run dev
npm --prefix apps/app run dev
npm --prefix apps/workspace run dev
```

Ports:

- `apps/site`: `3100`
- `apps/app`: `3101`
- `apps/workspace`: `3102`
