# Interactive Custom Cursor Technical Plan

## Recommended Technical Approach

Interactive Custom Cursor should use:

- Wix Embedded Script
- Wix Dashboard Page
- Custom frontend cursor runtime

Recommended direction:

```text
Dashboard Settings
↓
Saved Cursor Config
↓
Embedded Script
↓
Runtime Cursor Engine
↓
Published Wix Site
```

## Why Embedded Script

Interactive Custom Cursor needs to affect the whole site.

Embedded Script is preferred because the user should not need to:

- Drag a widget onto every page
- Manually paste custom code
- Configure each page separately

Site Widget Only is not recommended for this product because it increases setup friction and does not match the desired full-site behavior.

## Main Modules

### Dashboard Extension

Responsibilities:

- Render Cursor Settings UI
- Show live preview
- Validate settings
- Save config
- Trigger embedded script install / update if needed

### Embedded Script Extension

Responsibilities:

- Inject cursor runtime into the Wix site
- Pass config to runtime
- Keep the script global across pages

### Cursor Runtime

Responsibilities:

- Create cursor DOM elements
- Manage cursor state
- Listen to pointer events
- Detect hover targets
- Render click pulse
- Respect disable rules
- Run with minimal performance cost

## Runtime Behavior

Runtime should initialize with these steps:

```text
Read config
↓
Check enabled
↓
Check mobile disable
↓
Check Wix Editor disable
↓
Create cursor DOM
↓
Attach pointer listeners
↓
Attach hover/click listeners
↓
Start animation loop
```

## Hover Target Detection

MVP detection:

```css
a,
button,
[role="button"],
input[type="button"],
input[type="submit"],
[data-zider-cursor]
```

Later detection:

- Product cards
- Gallery items
- Video blocks
- CMS repeater items

## Performance Rules

Cursor runtime should:

- Use `requestAnimationFrame`
- Avoid layout reads inside every pointer event
- Keep DOM nodes minimal
- Use CSS transforms for movement
- Avoid expensive filters unless enabled
- Disable on touch devices by default

Smooth follow formula:

```js
x += (targetX - x) * 0.15
y += (targetY - y) * 0.15
```

## Config Persistence

MVP should use the simplest Wix-supported persistence method available for Dashboard-to-Embedded-Script config.

Before implementation, confirm the current Wix CLI and Embedded Script APIs for:

- Saving app settings
- Updating embedded script parameters
- Reading config inside the injected script
- Applying changes after install

Do not introduce Supabase for MVP unless Wix-native persistence is insufficient.

## Suggested File Structure

This is a planning suggestion only:

```text
zider-app/
├─ docs/
├─ src/
│  ├─ dashboard/
│  │  └─ cursor-settings/
│  ├─ runtime/
│  │  ├─ cursor-engine.ts
│  │  ├─ cursor-config.ts
│  │  └─ cursor-styles.css
│  └─ shared/
│     ├─ app-keys.ts
│     └─ cursor-presets.ts
└─ package.json
```

Actual structure should follow the Wix CLI scaffold once development starts.

## Future Platform Data Model

Do not build these tables in MVP, but keep the naming compatible with later expansion:

```text
zider_apps
app_installs
app_configs
app_billing_events
app_usage_events
app_templates
```

Recommended Interactive Custom Cursor app key:

```text
interactive_custom_cursor
```

## Deployment Direction

Current stage:

- Wix App Market app
- Wix Dashboard extension
- Wix Embedded Script
- Simple product page on existing site

Later:

- `zider.ink` for product pages
- `app.zider.ink` for product hub
- `blog.zider.ink` for content
- `cdn.zider.ink` for runtime assets

Do not create extra services before MVP validation.

## Technical Risks

### Config Application

Risk:

Dashboard settings may not update the embedded script exactly as expected.

Mitigation:

Confirm Wix APIs early with a minimal spike.

### Editor Interference

Risk:

Custom cursor may affect Wix Editor usability.

Mitigation:

Detect editor context and disable runtime.

### Mobile Experience

Risk:

Cursor effects are irrelevant or harmful on touch devices.

Mitigation:

Disable on mobile by default.

### Performance

Risk:

Smooth cursor animation may feel heavy on low-end sites.

Mitigation:

Use transform-only animation and performance mode.

## Technical Acceptance

- Embedded script can be added to a test Wix site
- Runtime can read selected config
- Dashboard can update config
- Runtime can disable itself in editor/mobile contexts
- Cursor DOM does not break page layout
- Animation stays smooth on common pages
