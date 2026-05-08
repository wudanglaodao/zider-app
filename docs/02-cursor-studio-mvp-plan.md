# Cursor Studio MVP Plan

## MVP Goal

Build the smallest version of Cursor Studio that can validate whether Wix users want full-site cursor and hover interaction enhancement.

The MVP should feel polished, but it should avoid platform complexity.

## In Scope

### Dashboard

Create a Cursor Settings page with:

- Enable / disable cursor
- Cursor type selector
- Primary color
- Hover color
- Cursor size
- Hover text
- Disable on mobile
- Disable in Wix Editor
- Save / apply action
- Live preview area

### Runtime Cursor Engine

Build a front-site script that:

- Creates custom cursor DOM elements
- Tracks pointer movement
- Supports smooth follow
- Detects link and button hover
- Shows hover state
- Plays click pulse
- Disables on mobile when configured
- Disables in Wix Editor when configured

### Cursor Styles

Implement:

- Dot
- Ring
- Dot + Ring

### Hover Effects

Implement:

- Scale
- Glow
- Text label
- Ring expand

### Presets

Include a small preset list:

- Minimal Dot
- Figma Style
- Glass AI
- Luxury Gold
- Cyber Neon
- Fashion Studio

Presets should only map to existing settings.

## Out of Scope

Do not build in MVP:

- Supabase
- Independent account system
- Complex billing
- Pro permission system
- Template marketplace
- Webflow support
- Full Zider platform dashboard
- Magnetic Button
- SVG / PNG upload
- Complex ecommerce product detection
- Advanced usage analytics
- PrintSlip features

## Suggested MVP User Flow

```text
User installs Cursor Studio
↓
User opens Cursor Settings
↓
User chooses Dot / Ring / Dot + Ring
↓
User adjusts color and hover text
↓
User previews effect
↓
User applies settings to site
↓
Cursor works globally
```

## Configuration Shape

Suggested config object:

```json
{
  "appKey": "cursor_studio",
  "enabled": true,
  "cursorType": "dot-ring",
  "cursorSize": 28,
  "borderWidth": 1,
  "primaryColor": "#8B5CF6",
  "hoverColor": "#111827",
  "hoverText": "CLICK",
  "hoverEffect": "scale",
  "clickEffect": "pulse",
  "disableMobile": true,
  "disableEditor": true,
  "performanceMode": "auto",
  "schemaVersion": 1
}
```

## MVP Milestones

### Milestone 1: Wix App Skeleton

Outcome:

- Wix app project is created
- Dashboard extension exists
- Embedded script extension exists

### Milestone 2: Dashboard Prototype

Outcome:

- Settings UI exists
- User can change config values
- Preview area reflects current settings

### Milestone 3: Cursor Runtime

Outcome:

- Front-site cursor renders
- Mouse tracking works
- Hover and click states work

### Milestone 4: Config Connection

Outcome:

- Dashboard config is saved
- Runtime reads applied config
- Site updates after settings are applied

### Milestone 5: Polish and Validation

Outcome:

- Mobile disable works
- Editor disable works
- Presets work
- Basic browser QA passes
- App is ready for Wix test install

## Acceptance Checklist

- Cursor appears on published Wix site
- Cursor follows pointer smoothly
- Dot, Ring, and Dot + Ring can be selected
- Hovering links changes cursor state
- Hovering buttons changes cursor state
- Clicking triggers pulse
- Dashboard preview matches selected style
- Saved settings affect the live site
- Cursor does not appear on mobile when disabled
- Cursor does not interfere with Wix Editor
- No obvious console errors

## Validation Questions

After MVP testing, answer:

- Do users understand the app immediately?
- Do users prefer presets or manual settings?
- Does the cursor improve perceived site quality?
- Are Wix users willing to keep it installed?
- Which vertical responds best: agency, SaaS, portfolio, ecommerce?
- Is this worth turning into a paid app?
