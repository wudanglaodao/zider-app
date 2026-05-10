# Interactive Custom Cursor Wix App Harness

This note captures the first installable Wix-app path for **Interactive Custom Cursor**.

## Wix Developer Setup

Create a self-hosted Wix app and configure:

- Dashboard page URL: `https://app.zider.ink/wix/interactive-custom-cursor`
- App Instance Installed webhook: `https://app.zider.ink/events/wix/interactive_custom_cursor`
- Embedded Script extension code:

```html
<script
  id="zider-interactive-custom-cursor-loader"
  async
  src="{{scriptUrl}}"
></script>
```

The Embedded Script extension must define a dynamic parameter named `scriptUrl`.

## Environment

```bash
NEXT_PUBLIC_ZIDER_APP_URL=https://app.zider.ink
WIX_INTERACTIVE_CUSTOM_CURSOR_APP_ID=...
WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET=...
CURSOR_WIDGET_CONFIGS_TABLE=widget_configs
```

## Webhook Public Key Storage

For multiple Wix apps, store the webhook public key per app in `app_platforms.webhook_public_key_ref`.

The field supports either:

- the full PEM public key from Wix, or
- an environment variable reference, for example `WIX_INTERACTIVE_CUSTOM_CURSOR_WEBHOOK_PUBLIC_KEY`.
- a JSON-map reference for legacy multi-app env storage, for example `WIX_WEBHOOK_PUBLIC_KEYS.zider_countup`.

Runtime lookup order:

1. `app_platforms.webhook_public_key_ref`
2. `WIX_WEBHOOK_PUBLIC_KEYS`
3. `WIX_WEBHOOK_PUBLIC_KEY`

## Local Testing

Use a dev instance ID:

```text
http://localhost:3100/wix/interactive-custom-cursor?instanceId=dev-site-1
```

Save writes draft config. Publish copies the draft to `publishedConfig`. The front-site embed reads the published config:

```text
http://localhost:3100/api/widgets/interactive-custom-cursor/embed.js?platform=wix&instanceId=dev-site-1
```

## Optional Supabase Table

The app falls back to in-memory storage if this table does not exist. For persistent config, create:

```sql
create table if not exists widget_configs (
  app_key text not null,
  platform text not null,
  instance_id text not null,
  draft_config jsonb not null,
  published_config jsonb not null,
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  primary key (app_key, platform, instance_id)
);
```

## Install Flow

1. Wix installs the app.
2. Wix sends `app_instance_installed` to `/events/wix/interactive_custom_cursor`.
3. The webhook persists the installation.
4. The app exchanges `instanceId` for an OAuth access token.
5. The app calls Wix Embedded Script API and passes `scriptUrl` as `properties.parameters.scriptUrl`.
   The generated script URL uses one query param only, for example `/embed.js?instanceId=...`, so Wix does not rewrite `&` inside the dynamic parameter.
6. Wix injects the script into the site.
7. The script fetches the published cursor config and mounts the DOM runtime.

## Platform Boundary

The builder and runtime remain platform-neutral. Wix-specific work is limited to:

- verifying/reading the Wix `instance` parameter,
- mapping `instanceId` to a widget config record,
- installing the embedded script after the Wix install webhook,
- using Wix billing later when pricing is introduced.
