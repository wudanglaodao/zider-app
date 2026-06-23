# PrintOps Template Library Architecture

This document defines the target foundation for the PrintOps template system.
The goal is to move from a single-page template state snapshot to a reusable
template library that can support merchant-owned custom templates, workspace
scoping, multiple stores, and future visual editing.

## Current State

The current implementation is intentionally simple:

- Template shape lives in `PrintOpsWorkbench.tsx` as `TemplateRecord`.
- Built-in templates and store templates are initialized in front-end code.
- Merchant edits are persisted as full JSON snapshots in `printops_templates`.
- Reads and writes are scoped by `app_key + platform + instance_id`.
- The API accepts and saves a full template array at once.
- The renderer is React-component driven and tied to the workbench UI.

This works for the current Wix-first PrintOps app, but it is not yet a durable
template library. The next architecture should separate official template
blueprints, merchant-owned templates, renderer keys, and assets.

## Goals

- Support official built-in templates without copying them into every store
  until a merchant chooses to use or customize them.
- Support merchant-created templates that persist across refreshes, devices,
  and future workspace/member sessions.
- Support one default template per workspace/store/document type.
- Support future multi-store filtering and template assignment.
- Keep rendering deterministic for preview, PDF export, browser print, and
  batch print.
- Allow template schema migrations without breaking older saved templates.
- Keep Wix `instance_id` compatibility while shifting new data toward
  `workspace_id` and `store_id`.

## Non-Goals For The First Phase

- No drag-and-drop visual editor.
- No arbitrary HTML/CSS template execution.
- No user-uploaded custom script.
- No shared template marketplace.
- No cross-app template reuse until the PrintOps schema is stable.

## Core Concepts

### Template Blueprint

A blueprint is an official ZIDER template definition.

Examples:

- `invoice_big_brand`
- `invoice_minimal`

Blueprints are versioned and read-only for merchants. They provide the renderer
key, default config, supported document type, and preview asset.

### User Template

A user template is a merchant-owned copy or custom template. It may be created
from a blueprint, duplicated from another user template, or created from a
future blank template.

User templates hold merchant configuration only. They should not duplicate
unchanged blueprint defaults unless needed for compatibility.

### Renderer

A renderer is code that knows how to turn a template schema into a printable
document.

Examples:

- `invoice_big_brand_v1`
- `invoice_minimal_v1`

Saved templates should reference a `renderer_key`. They should not depend on
front-end component internals.

### Template Assignment

An assignment determines which template should be used for a scope.

The first required assignment is:

```text
workspace_id + store_id + app_key + document_type -> default user_template_id
```

In the future, assignments may support rules such as order channel, language,
shipping country, or customer segment.

### Template Asset

Assets are images or files used by templates:

- Uploaded logo
- Preview cover image
- Future background image
- Future custom seal or brand mark

Assets should be stored separately from template JSON and referenced by stable
asset IDs or URLs.

## Target Data Model

### `printops_template_blueprints`

Official template library records.

```text
id uuid primary key
app_key text not null
blueprint_key text not null
version integer not null
name text not null
description text
document_type text not null
category text
audience text
paper_size text not null
renderer_key text not null
schema_version integer not null
default_config jsonb not null
preview_asset_url text
status text not null -- active | archived
created_at timestamptz
updated_at timestamptz

unique (app_key, blueprint_key, version)
```

### `printops_user_templates`

Merchant-owned templates.

```text
id uuid primary key
app_key text not null
platform text not null
instance_id text -- legacy compatibility
installation_id uuid
workspace_id uuid not null
store_id uuid
platform_store_profile_id uuid
member_id uuid
base_blueprint_key text
base_blueprint_version integer
renderer_key text not null
schema_version integer not null
name text not null
description text
document_type text not null
source text not null -- blueprint_copy | custom | imported
status text not null -- draft | ready | archived
config jsonb not null
label_overrides jsonb not null default '{}'::jsonb
created_by_member_id uuid
updated_by_member_id uuid
created_at timestamptz
updated_at timestamptz
```

### `printops_template_assignments`

Default and rule-based template selection.

```text
id uuid primary key
app_key text not null
workspace_id uuid not null
store_id uuid
document_type text not null
assignment_type text not null -- default
template_id uuid not null
created_at timestamptz
updated_at timestamptz

unique (app_key, workspace_id, store_id, document_type, assignment_type)
```

### `printops_template_assets`

Template-owned assets.

```text
id uuid primary key
app_key text not null
workspace_id uuid
store_id uuid
template_id uuid
asset_type text not null -- logo | preview | image
storage_path text
public_url text
mime_type text
width integer
height integer
created_at timestamptz
updated_at timestamptz
```

## Template Schema V1

Saved template JSON should be stable and renderer-oriented.

```json
{
  "schemaVersion": 1,
  "rendererKey": "invoice_big_brand_v1",
  "document": {
    "type": "invoice",
    "paperSize": "A4",
    "orientation": "portrait",
    "density": "normal",
    "defaultLanguage": "en"
  },
  "brand": {
    "name": "ZIDER",
    "logoSource": "text",
    "logoText": "ZIDER",
    "logoImageAssetId": null,
    "accentColor": "#007a3d"
  },
  "layout": {
    "preset": "branded",
    "marginPreset": "normal",
    "visualStyle": "atelier"
  },
  "typography": {
    "titleFont": "sans",
    "titleSize": 34,
    "bodyFont": "sans",
    "bodySize": 14,
    "thankYouSize": 24
  },
  "visibility": {
    "logoText": true,
    "storeName": true,
    "invoiceMeta": true,
    "orderBarcode": true,
    "billTo": true,
    "shipTo": true,
    "productImages": true,
    "sku": true,
    "itemOptions": true,
    "notes": true,
    "itemsTotal": true,
    "shippingTotal": true,
    "taxTotal": true,
    "grandTotal": true,
    "paymentMethod": true,
    "shippingMethod": true,
    "thankYou": true,
    "contactFooter": true,
    "socialFooter": true
  },
  "copy": {
    "contactPrompt": "Questions? Please contact us.",
    "thankYou": "Thanks for your business!",
    "footerWebsite": "https://www.zider.ink/",
    "footerContact": "support@zider.ink"
  },
  "labels": {}
}
```

## API Design

Avoid full-array replacement for future custom templates. Use resource-level
operations instead.

```text
GET    /api/apps/printops/templates
POST   /api/apps/printops/templates
GET    /api/apps/printops/templates/:templateId
PATCH  /api/apps/printops/templates/:templateId
DELETE /api/apps/printops/templates/:templateId
POST   /api/apps/printops/templates/:templateId/default
GET    /api/apps/printops/template-blueprints
POST   /api/apps/printops/template-blueprints/:blueprintKey/use
```

Wix-specific routes may remain as wrappers while the underlying service should
use `workspace_id`, `store_id`, and `installation_id` where available.

## Template Selection Rules

When printing an order:

1. Resolve the order's `workspace_id` and `store_id`.
2. Resolve the default template assignment for `invoice`.
3. Load the user template.
4. Load the base blueprint if the user template references one.
5. Merge `blueprint.default_config` with `user_template.config`.
6. Render with `renderer_key`.
7. If no user template exists, create or use a default copy from the active
   blueprint.

The selected print language should come from the template first. Workspace or
settings language may be used only when the template has no default language.

## Rendering Contract

All renderers should accept the same normalized input:

```text
template config
resolved labels
normalized order
store profile
render mode -- preview | pdf | print | thumbnail
```

Renderer output must be deterministic across:

- Template editor preview
- Order detail preview
- Batch print preview
- PDF download
- Browser print
- Template cover image generation

## Migration Plan

### Phase 1: Stabilize Current Templates

- Add `schemaVersion`, `rendererKey`, `baseBlueprintKey`, and
  `baseBlueprintVersion` to the current `TemplateRecord` payload.
- Extract template types and helpers out of `PrintOpsWorkbench.tsx`.
- Add a normalizer/migrator for existing `template_record` payloads.
- Keep the existing `printops_templates` table and API for compatibility.

### Phase 2: Introduce Blueprint Registry

- Move built-in template definitions into a registry module.
- Seed or expose blueprint metadata through a new service.
- Stop treating built-in templates as merchant templates until the merchant
  chooses "Use this template".
- Use static preview images for library cards.

### Phase 3: Add User Template Resource API

- Add `printops_user_templates` and `printops_template_assignments`.
- Implement resource-level create, patch, delete, and set-default operations.
- Keep a legacy adapter that reads old `printops_templates` rows.
- Write all new saves to the new tables.

### Phase 4: Workspace And Multi-Store Scope

- Make `workspace_id + store_id` the primary template scope.
- Keep `instance_id` only as compatibility/audit metadata.
- Add store filter and per-store default template assignments.

### Phase 5: Custom Template Editor

- Introduce block/section schema after the parameterized editor is stable.
- Add template version history if merchants need rollback.
- Add asset management for uploaded logos and cover images.

## Compatibility Rules

- Existing `printops_templates` rows remain readable.
- Merchant-edited fields must always win over store profile refreshes.
- Default template selection should never depend on localStorage.
- localStorage may be a UI cache only, never the source of truth.
- Built-in blueprint updates should not silently overwrite merchant templates.
- If a blueprint is archived, existing user templates that reference it must
  continue to render through their saved `renderer_key`.

## Open Decisions

- Should user templates be scoped to store only, or workspace with optional
  store assignment?
- Should one workspace allow multiple default invoice templates by language?
- Do we need template version history in P1, or only after visual editing?
- Should template cover images be generated at build time or stored after first
  save?
- Should user-created templates be exportable/importable as JSON?

## Recommended Next Step

Start with Phase 1 and Phase 2. They reduce current risk without forcing a
large database migration immediately:

1. Extract current template model into a dedicated module.
2. Add schema/version fields and migration helpers.
3. Introduce a blueprint registry for the two current invoice templates.
4. Keep current UI behavior while making saved data future-proof.
