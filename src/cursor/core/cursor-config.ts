export const CURSOR_APP_KEY = "interactive_custom_cursor" as const;

export type CursorType = "dot" | "ring" | "dot-ring";
export type HoverEffect = "scale" | "ring-expand" | "glow" | "text";
export type ClickEffect = "pulse";
export type PerformanceMode = "auto" | "low" | "high";
export type CursorBlendMode = "normal" | "difference" | "screen" | "multiply";
export type CursorAssetMode = "none" | "icon" | "svg" | "logo";
export type CursorIconName = "pointer" | "sparkles" | "wand" | "circle-dot";

export type CursorDefaultStyle = {
  opacity: number;
  blendMode: CursorBlendMode;
};

export type CursorLinkStyle = {
  enabled: boolean;
  cursorType: CursorType;
  cursorSize: number;
  borderWidth: number;
  hoverColor: string;
  hoverText: "CLICK" | "OPEN" | "VIEW" | string;
};

export type CursorCustomAsset = {
  mode: CursorAssetMode;
  iconName: CursorIconName;
  svgMarkup: string;
  logoDataUrl: string;
  logoName: string;
};

export type CursorInteractionSettings = {
  followSpeed: number;
  hoverScale: number;
  ringExpandScale: number;
  hoverRingScale: number;
  glowStrength: number;
  pulseScale: number;
  pulseDuration: number;
};

export type CursorConfig = {
  appKey: typeof CURSOR_APP_KEY;
  schemaVersion: number;
  enabled: boolean;
  cursorType: CursorType;
  cursorSize: number;
  borderWidth: number;
  primaryColor: string;
  hoverColor: string;
  hoverText: "CLICK" | "OPEN" | "VIEW" | string;
  hoverEffect: HoverEffect;
  clickEffect: ClickEffect;
  defaultStyle: CursorDefaultStyle;
  linkStyle: CursorLinkStyle;
  customAsset: CursorCustomAsset;
  interaction: CursorInteractionSettings;
  disableMobile: boolean;
  disableEditor: boolean;
  performanceMode: PerformanceMode;
  reservedCapabilities?: string[];
};

export type CursorConfigInput = Partial<
  Omit<CursorConfig, "defaultStyle" | "linkStyle" | "customAsset" | "interaction">
> & {
  defaultStyle?: Partial<CursorDefaultStyle>;
  linkStyle?: Partial<CursorLinkStyle>;
  customAsset?: Partial<CursorCustomAsset>;
  interaction?: Partial<CursorInteractionSettings>;
};

export const DEFAULT_CURSOR_CONFIG: CursorConfig = {
  appKey: CURSOR_APP_KEY,
  schemaVersion: 1,
  enabled: true,
  cursorType: "dot-ring",
  cursorSize: 28,
  borderWidth: 1,
  primaryColor: "#111827",
  hoverColor: "#087a46",
  hoverText: "CLICK",
  hoverEffect: "scale",
  clickEffect: "pulse",
  defaultStyle: {
    opacity: 1,
    blendMode: "normal",
  },
  linkStyle: {
    enabled: true,
    cursorType: "dot-ring",
    cursorSize: 36,
    borderWidth: 1,
    hoverColor: "#087a46",
    hoverText: "OPEN",
  },
  customAsset: {
    mode: "none",
    iconName: "pointer",
    svgMarkup: "",
    logoDataUrl: "",
    logoName: "",
  },
  interaction: {
    followSpeed: 0.16,
    hoverScale: 1.8,
    ringExpandScale: 1.65,
    hoverRingScale: 1.22,
    glowStrength: 28,
    pulseScale: 2.25,
    pulseDuration: 520,
  },
  disableMobile: true,
  disableEditor: true,
  performanceMode: "auto",
  reservedCapabilities: [],
};

export function normalizeCursorConfig(config: CursorConfigInput = {}): CursorConfig {
  return {
    ...DEFAULT_CURSOR_CONFIG,
    ...config,
    appKey: CURSOR_APP_KEY,
    schemaVersion: config.schemaVersion ?? DEFAULT_CURSOR_CONFIG.schemaVersion,
    defaultStyle: {
      ...DEFAULT_CURSOR_CONFIG.defaultStyle,
      ...config.defaultStyle,
    },
    linkStyle: {
      ...DEFAULT_CURSOR_CONFIG.linkStyle,
      ...config.linkStyle,
    },
    customAsset: {
      ...DEFAULT_CURSOR_CONFIG.customAsset,
      ...config.customAsset,
    },
    interaction: {
      ...DEFAULT_CURSOR_CONFIG.interaction,
      ...config.interaction,
    },
  };
}
