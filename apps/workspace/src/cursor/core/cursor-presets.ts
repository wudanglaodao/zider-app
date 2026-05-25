import type { CursorConfigInput } from "./cursor-config";

export type CursorPresetId =
  | "light-site"
  | "dark-site"
  | "brand-accent"
  | "shop-cta"
  | "editorial-link"
  | "portfolio-soft"
  | "neon-product"
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
    id: "light-site",
    name: "Light Site",
    description: "Dark cursor with a calm brand hover for white and airy websites.",
    bestFor: "White backgrounds",
    config: {
      cursorType: "dot-ring",
      cursorSize: 28,
      borderWidth: 1,
      primaryColor: "#111827",
      hoverColor: "#087a46",
      hoverText: "CLICK",
      hoverEffect: "scale",
      clickEffect: "pulse",
      linkStyle: {
        enabled: true,
        cursorType: "dot-ring",
        cursorSize: 36,
        borderWidth: 1,
        hoverColor: "#087a46",
        hoverText: "OPEN",
      },
      interaction: {
        followSpeed: 0.2,
        hoverScale: 1.5,
        pulseScale: 1.85,
      },
    },
  },
  {
    id: "dark-site",
    name: "Dark Site",
    description: "Bright dot and ring for black, slate, and high-contrast sites.",
    bestFor: "Dark websites",
    config: {
      cursorType: "dot-ring",
      cursorSize: 32,
      borderWidth: 1,
      primaryColor: "#f8fafc",
      hoverColor: "#38bdf8",
      hoverText: "OPEN",
      hoverEffect: "scale",
      clickEffect: "pulse",
      defaultStyle: {
        opacity: 0.96,
        blendMode: "normal",
      },
      linkStyle: {
        enabled: true,
        cursorType: "dot-ring",
        cursorSize: 40,
        borderWidth: 1,
        hoverColor: "#38bdf8",
        hoverText: "OPEN",
      },
      interaction: {
        followSpeed: 0.16,
        hoverScale: 1.7,
      },
    },
  },
  {
    id: "brand-accent",
    name: "Brand Accent",
    description: "Zider green with a warm accent for branded business pages.",
    bestFor: "Brand-color sites",
    config: {
      cursorType: "dot-ring",
      cursorSize: 30,
      borderWidth: 1,
      primaryColor: "#087a46",
      hoverColor: "#f6b84b",
      hoverText: "OPEN",
      hoverEffect: "text",
      clickEffect: "pulse",
      defaultStyle: {
        opacity: 0.98,
        blendMode: "normal",
      },
      linkStyle: {
        enabled: true,
        cursorType: "dot-ring",
        cursorSize: 38,
        borderWidth: 1,
        hoverColor: "#f6b84b",
        hoverText: "OPEN",
      },
      interaction: {
        followSpeed: 0.17,
        hoverScale: 1.65,
        pulseDuration: 520,
      },
    },
  },
  {
    id: "shop-cta",
    name: "Shop CTA",
    description: "A clear retail cursor that makes products and buy buttons feel active.",
    bestFor: "Ecommerce pages",
    config: {
      cursorType: "dot",
      cursorSize: 24,
      borderWidth: 1,
      primaryColor: "#1f2937",
      hoverColor: "#ef4444",
      hoverText: "SHOP",
      hoverEffect: "text",
      clickEffect: "pulse",
      linkStyle: {
        enabled: true,
        cursorType: "dot-ring",
        cursorSize: 42,
        borderWidth: 2,
        hoverColor: "#ef4444",
        hoverText: "SHOP",
      },
      interaction: {
        followSpeed: 0.2,
        hoverScale: 1.85,
        pulseScale: 2.45,
      },
    },
  },
  {
    id: "editorial-link",
    name: "Editorial Link",
    description: "A subtle ring and blue hover for content-heavy pages.",
    bestFor: "Blogs and magazines",
    config: {
      cursorType: "ring",
      cursorSize: 34,
      borderWidth: 1,
      primaryColor: "#0f172a",
      hoverColor: "#2563eb",
      hoverText: "READ",
      hoverEffect: "ring-expand",
      clickEffect: "pulse",
      defaultStyle: {
        opacity: 0.9,
        blendMode: "normal",
      },
      linkStyle: {
        enabled: true,
        cursorType: "ring",
        cursorSize: 44,
        borderWidth: 2,
        hoverColor: "#2563eb",
        hoverText: "VIEW",
      },
      interaction: {
        followSpeed: 0.14,
        ringExpandScale: 1.7,
      },
    },
  },
  {
    id: "portfolio-soft",
    name: "Portfolio Soft",
    description: "Soft teal and coral motion for portfolios and personal sites.",
    bestFor: "Portfolios",
    config: {
      cursorType: "dot-ring",
      cursorSize: 30,
      borderWidth: 1,
      primaryColor: "#0f766e",
      hoverColor: "#fb7185",
      hoverText: "VIEW",
      hoverEffect: "scale",
      clickEffect: "pulse",
      defaultStyle: {
        opacity: 0.94,
        blendMode: "normal",
      },
      linkStyle: {
        enabled: true,
        cursorType: "dot-ring",
        cursorSize: 40,
        borderWidth: 1,
        hoverColor: "#fb7185",
        hoverText: "VIEW",
      },
      interaction: {
        followSpeed: 0.18,
        hoverScale: 1.62,
      },
    },
  },
  {
    id: "neon-product",
    name: "Neon Product",
    description: "A luminous technology feel for product launches and AI pages.",
    bestFor: "AI and SaaS launches",
    config: {
      cursorType: "dot-ring",
      cursorSize: 38,
      borderWidth: 1,
      primaryColor: "#e0f2fe",
      hoverColor: "#22d3ee",
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
      linkStyle: {
        enabled: true,
        cursorType: "dot-ring",
        cursorSize: 44,
        borderWidth: 1,
        hoverColor: "#22d3ee",
        hoverText: "OPEN",
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
