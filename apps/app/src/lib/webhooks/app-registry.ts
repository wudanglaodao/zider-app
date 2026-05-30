export type SupportedPlatform =
  | "wix"
  | "webflow"
  | "direct"
  | "wordpress"
  | "shopify"
  | "other";

export type AppRegistryEntry = {
  appKey: string;
  appName: string;
  platform: SupportedPlatform;
  platformAppId?: string;
  status: "published" | "planned";
  distributionChannel: "marketplace" | "direct" | "website" | "partner" | "agency" | "manual" | "import" | "unknown";
  acquisitionSource: string;
  billingProvider: "wix" | "stripe" | "paddle" | "manual" | "none" | "unknown";
};

export const INTERACTIVE_CUSTOM_CURSOR_APP_KEY = "interactive_custom_cursor";
export const PRINTOPS_APP_KEY = "zider_printops";

export const EXISTING_WIX_APPS: AppRegistryEntry[] = [
  {
    appKey: PRINTOPS_APP_KEY,
    appName: "Zider PrintOps",
    platform: "wix",
    status: "planned",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "none",
  },
  {
    appKey: INTERACTIVE_CUSTOM_CURSOR_APP_KEY,
    appName: "Interactive Custom Cursor",
    platform: "wix",
    status: "planned",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "none",
  },
  {
    appKey: "store_content_suite",
    appName: "Store Content Suite",
    platform: "wix",
    status: "published",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "wix",
  },
  {
    appKey: "zider_copy_button_clipboard",
    appName: "Zider Copy Button / Clipboard",
    platform: "wix",
    status: "published",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "wix",
  },
  {
    appKey: "zider_product_detail_enhancer",
    appName: "Zider Product Detail Enhancer",
    platform: "wix",
    status: "published",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "wix",
  },
  {
    appKey: "before_and_after_slider",
    appName: "Before And After Slider",
    platform: "wix",
    status: "published",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "wix",
  },
  {
    appKey: "beforeafter_slider_x",
    appName: "BeforeAfter Slider X",
    platform: "wix",
    status: "published",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "wix",
  },
  {
    appKey: "zider_countup",
    appName: "Zider CountUp",
    platform: "wix",
    status: "published",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "wix",
  },
  {
    appKey: "zider_loop_logo",
    appName: "Zider Loop Logo",
    platform: "wix",
    status: "published",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "wix",
  },
  {
    appKey: "smart_login_button",
    appName: "Smart Login Button",
    platform: "wix",
    status: "published",
    distributionChannel: "marketplace",
    acquisitionSource: "wix_app_market",
    billingProvider: "wix",
  },
];

const registry = new Map(EXISTING_WIX_APPS.map((app) => [`${app.platform}:${app.appKey}`, app]));

export function getAppRegistryEntry(platform: string, appKey: string) {
  return registry.get(`${platform}:${appKey}`) ?? registry.get(`${platform}:${normalizeAppKeyAlias(appKey)}`);
}

export function isSupportedPlatform(platform: string): platform is SupportedPlatform {
  return ["wix", "webflow", "direct", "wordpress", "shopify", "other"].includes(platform);
}

function normalizeAppKeyAlias(appKey: string) {
  if (appKey === "interactive-custom-cursor") {
    return "interactive_custom_cursor";
  }

  return appKey;
}
