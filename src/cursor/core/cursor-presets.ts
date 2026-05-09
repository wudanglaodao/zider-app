import type { CursorConfigInput } from "./cursor-config";

export type CursorPresetId =
  | "minimal-dot"
  | "clean-ring"
  | "studio-cursor"
  | "glass-ai"
  | "luxury-motion";

export type CursorPreset = {
  id: CursorPresetId;
  name: string;
  description: string;
  bestFor: string;
  config: CursorConfigInput;
};

export const CURSOR_PRESETS: CursorPreset[] = [
  {
    id: "minimal-dot",
    name: "Minimal Dot",
    description: "A quiet cursor for SaaS pages and clean brand sites.",
    bestFor: "SaaS and company websites",
    config: {
      cursorType: "dot",
      cursorSize: 20,
      borderWidth: 1,
      primaryColor: "#f8fafc",
      hoverColor: "#7dd3fc",
      hoverText: "CLICK",
      hoverEffect: "scale",
      clickEffect: "pulse",
      interaction: {
        followSpeed: 0.22,
        hoverScale: 1.55,
        pulseScale: 1.9,
      },
    },
  },
  {
    id: "clean-ring",
    name: "Clean Ring",
    description: "A crisp hollow ring with a clear hover state.",
    bestFor: "Portfolios and creative pages",
    config: {
      cursorType: "ring",
      cursorSize: 34,
      borderWidth: 2,
      primaryColor: "#f8fafc",
      hoverColor: "#22d3ee",
      hoverText: "OPEN",
      hoverEffect: "ring-expand",
      clickEffect: "pulse",
      linkStyle: {
        enabled: true,
        cursorType: "ring",
        cursorSize: 40,
        borderWidth: 2,
        hoverColor: "#22d3ee",
        hoverText: "OPEN",
      },
      interaction: {
        followSpeed: 0.18,
        ringExpandScale: 1.82,
      },
    },
  },
  {
    id: "studio-cursor",
    name: "Studio Cursor",
    description: "Dot plus ring with text feedback for high-touch websites.",
    bestFor: "AI products and creative studios",
    config: {
      cursorType: "dot-ring",
      cursorSize: 36,
      borderWidth: 1,
      primaryColor: "#f8fafc",
      hoverColor: "#fef08a",
      hoverText: "VIEW",
      hoverEffect: "text",
      clickEffect: "pulse",
      linkStyle: {
        enabled: true,
        cursorType: "dot-ring",
        cursorSize: 42,
        borderWidth: 1,
        hoverColor: "#fef08a",
        hoverText: "VIEW",
      },
      interaction: {
        followSpeed: 0.16,
        hoverScale: 1.75,
        pulseDuration: 560,
      },
    },
  },
  {
    id: "glass-ai",
    name: "Glass AI",
    description: "A luminous technology feel, mapped to MVP effects for now.",
    bestFor: "AI and technology websites",
    config: {
      cursorType: "dot-ring",
      cursorSize: 38,
      borderWidth: 1,
      primaryColor: "#e0f2fe",
      hoverColor: "#38bdf8",
      hoverText: "OPEN",
      hoverEffect: "glow",
      clickEffect: "pulse",
      defaultStyle: {
        opacity: 0.95,
        blendMode: "screen",
      },
      customAsset: {
        mode: "icon",
        iconName: "sparkles",
      },
      interaction: {
        followSpeed: 0.14,
        glowStrength: 38,
      },
      reservedCapabilities: ["glass_cursor"],
    },
  },
  {
    id: "luxury-motion",
    name: "Luxury Motion",
    description: "A restrained premium ring preset with reserved motion upgrades.",
    bestFor: "Luxury brands and landing pages",
    config: {
      cursorType: "ring",
      cursorSize: 40,
      borderWidth: 1,
      primaryColor: "#f8fafc",
      hoverColor: "#facc15",
      hoverText: "VIEW",
      hoverEffect: "ring-expand",
      clickEffect: "pulse",
      defaultStyle: {
        opacity: 0.96,
      },
      customAsset: {
        mode: "icon",
        iconName: "circle-dot",
      },
      interaction: {
        followSpeed: 0.12,
        ringExpandScale: 1.72,
        pulseScale: 2.55,
      },
      reservedCapabilities: ["magnetic_button", "advanced_templates"],
    },
  },
];

export function getCursorPreset(id: CursorPresetId): CursorPreset {
  const preset = CURSOR_PRESETS.find((item) => item.id === id);

  if (!preset) {
    throw new Error(`Unknown cursor preset: ${id}`);
  }

  return preset;
}
