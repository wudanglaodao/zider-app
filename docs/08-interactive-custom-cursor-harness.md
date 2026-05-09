# Interactive Custom Cursor Platform Harness

## Purpose

Interactive Custom Cursor should start with Wix, but it should not become a Wix-only product.

This document defines the product harness: the boundaries, contracts, and safety rules that let the cursor system run across Wix first, then Webflow, Shopify, WordPress, or direct script installs later.

The core rule:

```text
Cursor behavior is platform-neutral.
Platform adapters only handle install, config, injection, billing, and platform identity.
```

## Product Boundary

Interactive Custom Cursor is a website interaction layer.

It provides:

- Custom cursor rendering
- Hover feedback for links, buttons, menus, and CTAs
- Hover text labels
- Click effects
- Preset templates
- Runtime performance and safety controls

It should not depend on:

- Wix APIs
- Wix Dashboard APIs
- Wix billing state
- Wix editor internals
- Any single platform's storage model

Wix is the first platform adapter, not the product architecture.

## Layer Model

Recommended architecture:

```text
Dashboard UI / Platform Settings
↓
Platform Adapter
↓
Shared Cursor Config
↓
Cursor Runtime Core
↓
Host Website DOM
```

### Core Layer

The core layer is platform-independent.

Responsibilities:

- Normalize cursor config
- Create and update cursor DOM
- Track pointer movement
- Detect hover targets
- Render hover state
- Render click effects
- Respect disabled/mobile/editor flags
- Clean up all injected DOM and event listeners

The core layer must not:

- Read Wix-specific objects
- Save settings
- Check billing plans
- Know marketplace install state
- Make network requests unless explicitly passed a config loader

### Preview Layer

The preview layer is also platform-independent.

Responsibilities:

- Render a local preview surface
- Simulate common targets such as links, buttons, menus, and CTA blocks
- Reflect config changes immediately
- Reuse the same config types and presets as the runtime

The preview should help users understand the effect before saving, but it should not become the source of truth.

### Platform Adapter Layer

Adapters are thin platform-specific wrappers.

Responsibilities:

- Identify the platform and installation
- Load saved config
- Save dashboard changes
- Inject or update the runtime script
- Pass config to the runtime
- Disable runtime in platform editor/admin contexts
- Handle platform-specific billing later

Adapters should call the core runtime through a small public API instead of modifying runtime internals.

## Runtime Public API

The runtime should expose a small contract:

```ts
type CursorRuntime = {
  mount(config: CursorConfig): void;
  update(config: Partial<CursorConfig>): void;
  destroy(): void;
};
```

Expected behavior:

- `mount` creates cursor nodes and attaches listeners.
- `update` changes visual behavior without remounting when possible.
- `destroy` removes all DOM nodes, animation frames, and event listeners.

Adapters can wrap this API, but should not bypass it.

## Config Contract

The shared config should stay platform-neutral.

Suggested shape:

```ts
type CursorConfig = {
  appKey: "interactive_custom_cursor";
  schemaVersion: number;
  enabled: boolean;
  cursorType: "dot" | "ring" | "dot-ring";
  cursorSize: number;
  borderWidth: number;
  primaryColor: string;
  hoverColor: string;
  hoverText: "CLICK" | "OPEN" | "VIEW" | string;
  hoverEffect: "scale" | "ring-expand" | "glow" | "text";
  clickEffect: "pulse" | "glow-flash" | "expand-circle";
  disableMobile: boolean;
  disableEditor: boolean;
  performanceMode: "auto" | "low" | "high";
  reservedCapabilities?: string[];
};
```

Platform identity should be stored outside the visual config:

```ts
type PlatformInstallContext = {
  appKey: "interactive_custom_cursor";
  platform: "wix" | "webflow" | "shopify" | "wordpress" | "direct";
  installationId: string;
  siteId?: string;
  siteUrl?: string;
  accountId?: string;
};
```

This keeps runtime behavior reusable even when install identity differs by platform.

## Platform Adapter Contract

Each platform adapter should answer the same questions:

- How is the app installed?
- How is an installation identified?
- Where is config saved?
- How is the runtime script injected?
- How does the runtime read config?
- How are editor/admin contexts detected?
- How will billing be checked later?

### Wix Adapter

V1 platform.

Responsibilities:

- Render the Wix Dashboard settings page
- Save cursor config through the chosen Wix-supported persistence path
- Install or update the Wix Embedded Script
- Pass config into the embedded script
- Disable runtime inside Wix Editor when configured
- Keep billing integration reserved for later

### Webflow Adapter

Later platform.

Possible approach:

- User adds a script snippet to a Webflow site
- Config is loaded by install id or domain
- Dashboard can live outside Webflow
- Runtime remains unchanged

### Shopify Adapter

Later platform.

Possible approach:

- Theme app extension or script injection
- Config tied to shop domain or app installation id
- Checkout/admin contexts must be carefully excluded

### Direct Script Adapter

Later platform.

Possible approach:

- User copies a script tag
- Script includes an install id
- Config is loaded from a hosted endpoint
- Useful for static sites and early cross-platform validation

## Harmless Runtime Rules

The cursor runtime must be safe for host websites.

It should be visually expressive, but harmless by default.

Required rules:

- Do not change host layout.
- Do not rewrite existing DOM.
- Do not intercept or block native clicks.
- Do not prevent default browser behavior.
- Do not attach global styles outside a namespaced selector.
- Do not hide the native cursor until the custom cursor is mounted and active.
- Do not run on touch-only devices when `disableMobile` is true.
- Do not run inside editors/admin surfaces when `disableEditor` is true.
- Do not create more DOM nodes than needed.
- Do not leave event listeners after destroy.
- Do not perform layout reads inside every pointer event.
- Do not assume a specific framework on the host site.

Namespace recommendation:

```text
zider-cursor-root
zider-cursor-dot
zider-cursor-ring
zider-cursor-label
zider-cursor-pulse
```

Data attribute recommendation:

```text
data-zider-cursor
data-zider-cursor-label
data-zider-cursor-disabled
```

## Hover Target Rules

V1 target detection:

```css
a,
button,
[role="button"],
input[type="button"],
input[type="submit"],
[data-zider-cursor]
```

Later target detection can include:

- Product cards
- Gallery items
- Video blocks
- CMS repeater items
- Platform-specific components

Platform-specific targets should be added through adapter-provided selector extensions, not hardcoded into the core.

## Preset Strategy

Presets should be config shortcuts, not separate implementations.

V1 presets:

- Minimal Dot
- Clean Ring
- Studio Cursor
- Glass AI
- Luxury Motion

Even if some presets become paid later, they should still map to the same config contract.

Billing should decide whether a user can save or activate a preset. Runtime should only receive valid config.

## Billing Strategy

Do not implement plan restrictions in the first build.

For now:

- Keep all effects technically available.
- Reserve capability names for future billing.
- Avoid UI copy that promises a final Pro package.
- Avoid hardcoding paid/free gates inside the runtime.

Later:

- Wix billing can be added in the Wix adapter.
- Webflow or direct billing can be added through a separate billing provider.
- The runtime should not know how the user paid.

Reserved capability examples:

```text
glass_cursor
magnetic_button
advanced_templates
custom_image_cursor
page_rules
remove_watermark
```

## Suggested File Structure

```text
src/
  cursor/
    core/
      cursor-config.ts
      cursor-presets.ts
      cursor-runtime.ts
      cursor-targets.ts
      cursor-types.ts
    preview/
      CursorPreview.tsx
      CursorPreviewSurface.tsx
    adapters/
      wix/
        wix-dashboard.tsx
        wix-config.ts
        wix-embedded-script.ts
      webflow/
        README.md
      shopify/
        README.md
      direct/
        README.md
```

This structure can change with the Wix CLI scaffold, but the boundaries should remain.

## MVP Harness Milestones

### Milestone 1: Core Config and Presets

Outcome:

- Shared config type exists
- Default config exists
- Presets map to config values
- No platform dependency

### Milestone 2: Runtime Core

Outcome:

- Cursor mounts on a normal web page
- Dot, Ring, and Dot + Ring render
- Hover and click effects work
- Destroy fully cleans up

### Milestone 3: Preview UI

Outcome:

- Dashboard preview can simulate cursor behavior
- Config changes update preview
- Preview uses the same presets and config as runtime

### Milestone 4: Wix Adapter

Outcome:

- Wix Dashboard can save config
- Wix Embedded Script can load config
- Runtime works on a Wix test site
- Editor/mobile disable rules work

### Milestone 5: Cross-Platform Readiness Check

Outcome:

- Direct script adapter can mount runtime with a static config
- No Wix-only assumptions exist in core files
- Future platform adapters have a clear contract

## Acceptance Checklist

- Core runtime can run without Wix.
- Runtime can mount, update, and destroy.
- Runtime does not break host layout.
- Runtime does not block clicks or navigation.
- Runtime disables on mobile when configured.
- Runtime disables in editor/admin contexts when configured by adapter.
- Presets are config-only.
- Billing logic is absent from runtime.
- Wix adapter is isolated from core behavior.
- Future adapters can reuse config, presets, and runtime.

## Open Questions

- Which Wix persistence API should be used for V1 config?
- Should config be embedded inline with the script or fetched at runtime?
- Should direct script installs be supported before Webflow?
- Should advanced templates be visible before billing is implemented?
- Should watermark behavior exist in V1, or wait until billing is designed?
