"use client";

import { Checkbox } from "@base-ui/react/checkbox";
import { Drawer } from "@base-ui/react/drawer";
import { Menu } from "@base-ui/react/menu";
import { Select } from "@base-ui/react/select";
import { Switch } from "@base-ui/react/switch";
import {
  AlertTriangle,
  BellRing,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Globe,
  Languages,
  LayoutTemplate,
  Menu as MenuIcon,
  MoreHorizontal,
  Minus,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Printer,
  Search,
  Settings,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { type ChangeEvent, type CSSProperties, type MouseEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  defaultPrintLocale,
  defaultSiteLocale,
  getLocaleDirection,
  getPrintLocaleOptions,
  getPrintOpsMessages,
  getPrintTemplateCopy,
  isPrintLocale,
  isSiteLocale,
  resolveLocalizedText,
  type LocalizedText,
  siteLocaleOptions,
  type PrintLocale,
  type PrintOpsMessages,
  type SiteLocale,
} from "./_lib/i18n";
import { coreFieldRegistry, type FieldScope } from "./_lib/template-render-context";
import styles from "./printops.module.css";

type Order = {
  id: string;
  number: string;
  customer: string;
  email: string;
  total: string;
  date: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  printedAt?: string | null;
  printUpdatedAt?: string | null;
  fulfillment: "Unfulfilled" | "Pickup" | "Partial" | "Ready";
  payment: "Paid" | "Unpaid" | "Partially paid";
  print: "Unprinted" | "Generated" | "Printed" | "Failed";
  template: string;
  language: string;
  warning?: string;
  items: string;
  barcode?: string;
  customFields?: Array<{
    label: string;
    value: string;
  }>;
  sku?: string;
  source?: "cache" | "sync";
  rawOrder?: WixSyncOrderSummary;
};

type OrderActionRequest = {
  action: "download" | "print";
  id: number;
  orders: Order[];
};

type OrderPrintLineItem = {
  barcode?: string | null;
  imageUrl?: string | null;
  optionsText?: string;
  price: string;
  quantity: number;
  sku?: string | null;
  title: string;
  total: string;
};

type OrderPrintDetails = {
  billAddressLines: string[];
  customFields: Array<{ label: string; value: string }>;
  date: string;
  deliveryMethod: string;
  lineItems: OrderPrintLineItem[];
  note: string;
  number: string;
  paymentMethod: string;
  shipAddressLines: string[];
  totals: {
    items: string;
    shipping: string;
    tax: string;
    total: string;
  };
};

type PrintOpsView = "orders" | "templates" | "settings";

function getPrintOpsViewFromLocation(fallback: PrintOpsView): PrintOpsView {
  if (typeof window === "undefined") {
    return fallback;
  }

  const viewParam = new URLSearchParams(window.location.search).get("view");

  if (viewParam === "templates" || viewParam === "settings") {
    return viewParam;
  }

  if (window.location.pathname.endsWith("/templates")) {
    return "templates";
  }

  if (window.location.pathname.endsWith("/settings")) {
    return "settings";
  }

  return "orders";
}

type PageMetric = {
  label: string;
  value: string;
  tone?: "warning";
};

type PrintOpsPluginContext = {
  appKey: string;
  appName: string;
  instanceId: string | null;
  ordersEndpoint: string;
  platform: "wix";
  source: "instance" | "dev-instance-id" | "missing";
  storeProfileEndpoint?: string;
  syncEndpoint: string;
  viewLinks?: Record<PrintOpsView, string>;
  verified: boolean;
};
type PrintOpsStoreProfileSummary = {
  address?: Record<string, unknown>;
  businessEmail: string | null;
  businessName: string | null;
  currency: string | null;
  language: string | null;
  locale: string | null;
  logoMediaPath: string | null;
  logoUrl: string | null;
  phone: string | null;
  siteUrl: string | null;
  syncedAt: string | null;
  timezone: string | null;
};
type StoreProfileStatus = {
  error: string | null;
  source: "cache" | "wix" | null;
  status: "idle" | "loading" | "loaded" | "error";
};
type WixSyncOrderSummary = {
  billingAddress?: unknown;
  createdAt: string | null;
  currency: string | null;
  customer?: unknown;
  deliveryMethod: string | null;
  fulfillmentStatus: string | null;
  note: string | null;
  orderNumber: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  shippingAddress?: unknown;
  sourceOrderId: string;
  tags: string[];
  totalItemQuantity: number;
  totals?: unknown;
  updatedAt: string | null;
  lineItems: Array<{
    barcode: string | null;
    imageUrl: string | null;
    options: unknown[];
    price?: unknown;
    title: string | null;
    sku: string | null;
    totalPrice?: unknown;
    variant: string | null;
    quantity: number | null;
    customFields: unknown[];
  }>;
  customFields: unknown[];
};
type PrintOpsCachedOrderSummary = {
  sourceOrderId: string;
  orderNumber: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  paymentStatus: string | null;
  fulfillmentStatus: string | null;
  currency: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  deliveryMethod: string | null;
  paymentMethod: string | null;
  totalItemQuantity: number;
  totalAmount: number | null;
  totalFormatted: string | null;
  lineItemCount: number;
  customFieldCount: number;
  printStatus: string | null;
  printedAt: string | null;
  printUpdatedAt: string | null;
  normalizedOrder: WixSyncOrderSummary | null;
  lastSyncMode: string | null;
  lastEventType: string | null;
  syncedAt: string;
};
type WixSyncStatus = {
  customFieldCount: number;
  error: string | null;
  mode: "latest" | "history" | null;
  orderCount: number;
  orders: WixSyncOrderSummary[];
  persistence: {
    persistedCount?: number;
    reason?: string;
    status?: "persisted" | "skipped" | "error";
  } | null;
  status: "idle" | "syncing" | "success" | "error";
  window: { from: string; to: string } | null;
};
type OrderCacheStatus = {
  error: string | null;
  orderCount: number;
  status: "idle" | "loading" | "loaded" | "skipped" | "error";
};
type OrderTemplateVisualStyle = "atelier" | "market" | "mono";
type OrderTemplateAccent = "charcoal" | "forest" | "slate" | "custom";
type WorkspaceAccent = "forest" | "blue" | "violet" | "red" | "amber";
type OrderTemplateDensity = "balanced" | "compact" | "spacious";
type OrderTemplateLogoSource = "generated-svg" | "uploaded-image";
type OrderTemplateLogoFont = "sans" | "serif" | "mono";
type SocialPlatform = "instagram" | "facebook" | "x" | "website";
type SocialLinkMode = "username" | "url";
type SocialProfile = {
  mode: SocialLinkMode;
  value: string;
  url: string;
};
type TemplateSocialProfiles = Partial<Record<SocialPlatform, SocialProfile>>;
type TemplateDateFormat =
  | "MM-DD-YYYY"
  | "DD-MM-YYYY"
  | "YYYY-MM-DD"
  | "MM/DD/YYYY"
  | "DD/MM/YYYY"
  | "YYYY/MM/DD"
  | "MMM D, YYYY"
  | "D MMM, YYYY"
  | "MM.DD.YYYY"
  | "DD.MM.YYYY"
  | "YYYY.MM.DD"
  | "YYYY MMM D";
type TemplateAddressFormat = "western" | "china" | "compact" | "single-line";
type TemplateLabelOverrides = Record<string, LocalizedText>;
type TemplateLabelGroup = "Template" | "Order" | "Customer" | "Address" | "Items" | "Payment" | "Fulfillment" | "Store" | "Custom";
type TemplateVisibilityKey =
  | "showLogoText"
  | "showStoreName"
  | "showInvoiceMeta"
  | "showOrderBarcode"
  | "showPaymentMethod"
  | "showShippingMethod"
  | "showBillTo"
  | "showShipTo"
  | "showProductImages"
  | "showSku"
  | "showItemOptions"
  | "showNotes"
  | "showTotals"
  | "showThankYou"
  | "showContactFooter"
  | "showSocialFooter";

type TemplateLabelDefinition = {
  key: string;
  group: TemplateLabelGroup;
  label: LocalizedText;
  helper?: string;
};

type TemplateRecord = {
  id: string;
  name: string;
  description: string;
  documentType: string;
  category: "Fulfillment" | "Picking" | "Production" | "Customer Documents" | "Finance Helper" | "Store / POS";
  scenario: string;
  audience: "Customer" | "Warehouse" | "Production" | "Finance" | "Store staff";
  paperSize: "A4" | "Letter" | "4x6" | "80mm";
  orientation: "Portrait" | "Landscape";
  marginPreset: "Normal" | "Compact" | "Narrow";
  layoutPreset: "Branded" | "Compact" | "Table-first" | "Thermal";
  dateFormat: TemplateDateFormat;
  addressFormat: TemplateAddressFormat;
  visualStyle: OrderTemplateVisualStyle;
  defaultLanguage: PrintLocale;
  labelOverrides: TemplateLabelOverrides;
  source: "Store copy" | "Built-in";
  status: "Draft" | "Ready";
  brandName: string;
  logoText: string;
  logoFont: OrderTemplateLogoFont;
  logoFontSize: number;
  logoSource: OrderTemplateLogoSource;
  logoImageUrl: string;
  footerWebsite: string;
  footerContact: string;
  thankYouText: string;
  accentColor: OrderTemplateAccent;
  customAccentColor: string;
  density: OrderTemplateDensity;
  socialLinks: string;
  socialProfiles?: TemplateSocialProfiles;
  showLogoText: boolean;
  showStoreName: boolean;
  showInvoiceMeta: boolean;
  showOrderBarcode: boolean;
  showBillTo: boolean;
  showShipTo: boolean;
  showProductImages: boolean;
  showSku: boolean;
  showItemOptions: boolean;
  showNotes: boolean;
  showTotals: boolean;
  showPaymentMethod: boolean;
  showShippingMethod: boolean;
  showThankYou: boolean;
  showContactFooter: boolean;
  showSocialFooter: boolean;
  isDefault?: boolean;
  updatedAt: string;
  dataRequirements: string[];
  validation: {
    tone: "ok" | "warning";
    label: string;
  };
};

type TemplateEditorMode = "create" | "edit" | "duplicate";

type TemplateDraft = {
  id?: string;
  name: string;
  description: string;
  documentType: string;
  category: TemplateRecord["category"];
  scenario: string;
  audience: TemplateRecord["audience"];
  paperSize: TemplateRecord["paperSize"];
  orientation: TemplateRecord["orientation"];
  marginPreset: TemplateRecord["marginPreset"];
  layoutPreset: TemplateRecord["layoutPreset"];
  dateFormat: TemplateDateFormat;
  addressFormat: TemplateAddressFormat;
  visualStyle: OrderTemplateVisualStyle;
  defaultLanguage: PrintLocale;
  labelOverrides: TemplateLabelOverrides;
  brandName: string;
  logoText: string;
  logoFont: OrderTemplateLogoFont;
  logoFontSize: number;
  logoSource: OrderTemplateLogoSource;
  logoImageUrl: string;
  footerWebsite: string;
  footerContact: string;
  thankYouText: string;
  accentColor: OrderTemplateAccent;
  customAccentColor: string;
  density: OrderTemplateDensity;
  socialLinks: string;
  socialProfiles: TemplateSocialProfiles;
  showLogoText: boolean;
  showStoreName: boolean;
  showInvoiceMeta: boolean;
  showOrderBarcode: boolean;
  showBillTo: boolean;
  showShipTo: boolean;
  showProductImages: boolean;
  showSku: boolean;
  showItemOptions: boolean;
  showNotes: boolean;
  showTotals: boolean;
  showPaymentMethod: boolean;
  showShippingMethod: boolean;
  showThankYou: boolean;
  showContactFooter: boolean;
  showSocialFooter: boolean;
  dataRequirements: string;
};

const templateStorageKey = "printops-templates-v12";
const siteLocaleStorageKey = "printops-site-locale-v1";
const printLocaleStorageKey = "printops-print-locale-v1";
const timezoneStorageKey = "printops-timezone-v1";
const workspaceAccentStorageKey = "printops-accent-v1";
const deprecatedTemplateIds = new Set(["library-order-field-map"]);

const workspaceAccentOptions = [
  { value: "forest", color: "#087a46" },
  { value: "blue", color: "#2563eb" },
  { value: "violet", color: "#7c3aed" },
  { value: "red", color: "#dc2626" },
  { value: "amber", color: "#d97706" },
] satisfies { value: WorkspaceAccent; color: string }[];

function isWorkspaceAccent(value: string | null): value is WorkspaceAccent {
  return workspaceAccentOptions.some((option) => option.value === value);
}

const timezoneOptions = [
  { label: "Asia/Shanghai (UTC+08:00)", value: "Asia/Shanghai" },
  { label: "Asia/Taipei (UTC+08:00)", value: "Asia/Taipei" },
  { label: "Asia/Hong_Kong (UTC+08:00)", value: "Asia/Hong_Kong" },
  { label: "America/Los_Angeles (UTC-08:00)", value: "America/Los_Angeles" },
  { label: "America/New_York (UTC-05:00)", value: "America/New_York" },
  { label: "Europe/London (UTC+00:00)", value: "Europe/London" },
  { label: "Europe/Berlin (UTC+01:00)", value: "Europe/Berlin" },
];

const templateDateFormatOptions: Array<{ label: string; value: TemplateDateFormat }> = [
  { label: "05-30-2026", value: "MM-DD-YYYY" },
  { label: "30-05-2026", value: "DD-MM-YYYY" },
  { label: "2026-05-30", value: "YYYY-MM-DD" },
  { label: "05/30/2026", value: "MM/DD/YYYY" },
  { label: "30/05/2026", value: "DD/MM/YYYY" },
  { label: "2026/05/30", value: "YYYY/MM/DD" },
  { label: "May 30, 2026", value: "MMM D, YYYY" },
  { label: "30 May, 2026", value: "D MMM, YYYY" },
  { label: "05.30.2026", value: "MM.DD.YYYY" },
  { label: "30.05.2026", value: "DD.MM.YYYY" },
  { label: "2026.05.30", value: "YYYY.MM.DD" },
  { label: "2026 May 30", value: "YYYY MMM D" },
];

const templateAddressFormatOptions: Record<SiteLocale, Array<{ label: string; value: TemplateAddressFormat }>> = {
  en: [
    { label: "Western multi-line", value: "western" },
    { label: "China / Taiwan multi-line", value: "china" },
    { label: "Compact", value: "compact" },
    { label: "Single line", value: "single-line" },
  ],
  "zh-Hant": [
    { label: "歐美多行格式", value: "western" },
    { label: "中國 / 台灣多行格式", value: "china" },
    { label: "緊湊格式", value: "compact" },
    { label: "單行格式", value: "single-line" },
  ],
};

const templates = [
  { label: "Invoice", value: "invoice" },
];

const printOpsSystemBrandName = "ZIDER";
const printOpsSystemSiteUrl = "https://www.zider.ink/";
const printOpsSystemFooterContact = "";

const legacyTemplateDefaults = {
  brandName: "Green Studio",
  footerContact: "150 Elgin Street, 8th Floor / support@wixcn.net",
  footerWebsite: "greenstudio.com",
  logoText: "Hello",
  socialUsername: "greenstudio",
  websiteUrl: "https://greenstudio.com",
};

const socialPlatformOptions = [
  { label: "Instagram", platform: "instagram", baseUrl: "https://instagram.com/", placeholder: "zider" },
  { label: "Facebook", platform: "facebook", baseUrl: "https://facebook.com/", placeholder: "zider" },
  { label: "X", platform: "x", baseUrl: "https://x.com/", placeholder: "zider" },
  { label: "Website", platform: "website", baseUrl: "", placeholder: printOpsSystemSiteUrl },
] satisfies Array<{ label: string; platform: SocialPlatform; baseUrl: string; placeholder: string }>;

function ensureUrlProtocol(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return "";
  }

  if (/^https?:\/\//i.test(cleanValue)) {
    return cleanValue;
  }

  return `https://${cleanValue.replace(/^\/+/, "")}`;
}

function isValidHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value.trim());
}

function normalizeSocialUsername(value: string) {
  return value.trim().replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
}

function buildSocialUrl(platform: SocialPlatform, mode: SocialLinkMode, value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return "";
  }

  if (mode === "url" || platform === "website") {
    return ensureUrlProtocol(cleanValue);
  }

  const platformOption = socialPlatformOptions.find((option) => option.platform === platform);
  const username = normalizeSocialUsername(cleanValue);

  return platformOption?.baseUrl ? `${platformOption.baseUrl}${username}` : ensureUrlProtocol(username);
}

function createSocialProfile(platform: SocialPlatform, mode: SocialLinkMode, value: string): SocialProfile {
  return {
    mode,
    value,
    url: buildSocialUrl(platform, mode, value),
  };
}

const defaultTemplateSocialProfiles: TemplateSocialProfiles = {
  website: createSocialProfile("website", "url", printOpsSystemSiteUrl),
};

function serializeSocialProfiles(profiles: TemplateSocialProfiles) {
  return socialPlatformOptions
    .map((option) => profiles[option.platform]?.url.trim())
    .filter(Boolean)
    .join("\n");
}

function detectSocialPlatform(value: string): SocialPlatform | null {
  const lowerValue = value.toLowerCase();

  if (lowerValue.includes("instagram")) {
    return "instagram";
  }

  if (lowerValue.includes("facebook") || lowerValue === "fb") {
    return "facebook";
  }

  if (lowerValue.includes("twitter") || lowerValue.includes("x.com") || lowerValue === "x") {
    return "x";
  }

  if (lowerValue.includes(".") || lowerValue.includes("http")) {
    return "website";
  }

  return null;
}

function normalizeSocialProfiles(profiles?: TemplateSocialProfiles, legacyLinks?: string): TemplateSocialProfiles {
  const normalizedProfiles: TemplateSocialProfiles = {};

  socialPlatformOptions.forEach(({ platform }) => {
    const profile = profiles?.[platform];

    if (!profile) {
      return;
    }

    const value = profile.value || profile.url;

    if (!value) {
      if (platform === "website") {
        normalizedProfiles.website = createSocialProfile("website", "url", "");
      }
      return;
    }

    normalizedProfiles[platform] = createSocialProfile(
      platform,
      profile.mode ?? (platform === "website" ? "url" : "username"),
      value,
    );
  });

  if (!profiles && legacyLinks) {
    legacyLinks
      .split(/(?:\s+\/\s+|,|\n)+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        const platform = detectSocialPlatform(item);

        if (!platform) {
          return;
        }

        const isUrl = /^https?:\/\//i.test(item) || item.includes(".");
        const value = isUrl ? item : item === platform ? "zider" : item;

        normalizedProfiles[platform] = createSocialProfile(platform, isUrl ? "url" : "username", value);
      });
  }

  if (!normalizedProfiles.website) {
    normalizedProfiles.website = {
      ...(defaultTemplateSocialProfiles.website ?? createSocialProfile("website", "url", printOpsSystemSiteUrl)),
    };
  }

  return normalizedProfiles;
}

const defaultTemplateBrandSettings = {
  brandName: printOpsSystemBrandName,
  logoText: printOpsSystemBrandName,
  logoFont: "sans",
  logoFontSize: 68,
  logoSource: "generated-svg",
  logoImageUrl: "",
  footerWebsite: printOpsSystemSiteUrl,
  footerContact: printOpsSystemFooterContact,
  thankYouText: "Thanks for your business!",
  accentColor: "charcoal",
  customAccentColor: "#087a46",
  density: "balanced",
  socialLinks: serializeSocialProfiles(defaultTemplateSocialProfiles),
  socialProfiles: defaultTemplateSocialProfiles,
  showLogoText: true,
  showStoreName: true,
  showInvoiceMeta: true,
  showOrderBarcode: true,
  showBillTo: true,
  showShipTo: true,
  showProductImages: true,
  showSku: true,
  showItemOptions: true,
  showNotes: true,
  showTotals: true,
  showPaymentMethod: true,
  showShippingMethod: true,
  showThankYou: true,
  showContactFooter: true,
  showSocialFooter: true,
  dateFormat: "MMM D, YYYY",
  addressFormat: "western",
} satisfies Pick<
  TemplateRecord,
  | "accentColor"
  | "brandName"
  | "density"
  | "footerContact"
  | "footerWebsite"
  | "addressFormat"
  | "dateFormat"
  | "logoImageUrl"
  | "logoFont"
  | "logoFontSize"
  | "logoSource"
  | "logoText"
  | "customAccentColor"
  | "showBillTo"
  | "showContactFooter"
  | "showInvoiceMeta"
  | "showOrderBarcode"
  | "showItemOptions"
  | "showLogoText"
  | "showNotes"
  | "showPaymentMethod"
  | "showProductImages"
  | "showShipTo"
  | "showShippingMethod"
  | "showSocialFooter"
  | "showSku"
  | "showStoreName"
  | "showThankYou"
  | "showTotals"
  | "socialLinks"
  | "socialProfiles"
  | "thankYouText"
>;

function applyStoreProfileDefaultsToTemplates(templates: TemplateRecord[], profile: PrintOpsStoreProfileSummary | null) {
  const businessName = cleanProfileString(profile?.businessName) ?? printOpsSystemBrandName;
  const siteUrl = cleanProfileString(profile?.siteUrl) ?? printOpsSystemSiteUrl;
  const siteDisplay = getWebsiteDisplay(siteUrl) ?? siteUrl;
  const footerContact = profile ? createStoreContactLine(profile) : printOpsSystemFooterContact || null;
  const defaultLanguage = profile ? resolveProfilePrintLocale(profile.language ?? profile.locale) : null;
  const brandSamples = [defaultTemplateBrandSettings.brandName, legacyTemplateDefaults.brandName];
  const footerContactSamples = [defaultTemplateBrandSettings.footerContact, legacyTemplateDefaults.footerContact];
  const footerWebsiteSamples = [defaultTemplateBrandSettings.footerWebsite, legacyTemplateDefaults.footerWebsite];
  const logoTextSamples = [defaultTemplateBrandSettings.logoText, legacyTemplateDefaults.logoText, "GS"];
  const websiteProfileSamples = [
    defaultTemplateSocialProfiles.website?.url ?? "",
    legacyTemplateDefaults.websiteUrl,
    legacyTemplateDefaults.footerWebsite,
  ];

  return templates.map((templateRecord) => {
    if (templateRecord.source !== "Store copy") {
      return templateRecord;
    }

    const nextSocialProfiles = normalizeSocialProfiles(templateRecord.socialProfiles, templateRecord.socialLinks);

    if (siteUrl && shouldReplaceProfileValue(nextSocialProfiles.website?.url, websiteProfileSamples)) {
      nextSocialProfiles.website = createSocialProfile("website", "url", siteUrl);
    }

    const profileLogoUrl = cleanProfileString(profile?.logoUrl);
    const shouldUseProfileLogo =
      profileLogoUrl &&
      (!templateRecord.logoImageUrl || templateRecord.logoImageUrl === defaultTemplateBrandSettings.logoImageUrl) &&
      shouldReplaceProfileValue(templateRecord.logoText, logoTextSamples);
    const logoPatch =
      shouldUseProfileLogo
        ? {
            logoImageUrl: profileLogoUrl,
            logoSource: "uploaded-image" as OrderTemplateLogoSource,
          }
        : {};
    const nextTemplate: TemplateRecord = {
      ...templateRecord,
      ...logoPatch,
      brandName: patchProfileText(templateRecord.brandName, businessName, brandSamples),
      defaultLanguage: defaultLanguage ?? templateRecord.defaultLanguage,
      footerContact: patchProfileText(templateRecord.footerContact, footerContact, footerContactSamples),
      footerWebsite: patchProfileText(templateRecord.footerWebsite, siteDisplay, footerWebsiteSamples),
      logoText: patchProfileText(templateRecord.logoText, createProfileWordmark(businessName), logoTextSamples),
      socialProfiles: nextSocialProfiles,
      socialLinks: serializeSocialProfiles(nextSocialProfiles),
    };

    return nextTemplate;
  });
}

function createTemplateDraftWithStoreProfile(profile: PrintOpsStoreProfileSummary | null) {
  const blankDraft = createBlankTemplateDraft();
  const seededTemplate = applyStoreProfileDefaultsToTemplates([createTemplateRecordFromDraft(blankDraft)], profile)[0];
  const seededSocialProfiles = normalizeSocialProfiles(seededTemplate.socialProfiles, seededTemplate.socialLinks);

  return {
    ...blankDraft,
    brandName: seededTemplate.brandName,
    defaultLanguage: seededTemplate.defaultLanguage,
    footerContact: seededTemplate.footerContact,
    footerWebsite: seededTemplate.footerWebsite,
    logoImageUrl: seededTemplate.logoImageUrl,
    logoSource: seededTemplate.logoSource,
    logoText: seededTemplate.logoText,
    socialLinks: serializeSocialProfiles(seededSocialProfiles),
    socialProfiles: seededSocialProfiles,
  };
}

function cleanProfileString(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed || null;
}

function patchProfileText(currentValue: string, nextValue: string | null, sampleValues: Array<string | null | undefined>) {
  if (!shouldReplaceProfileValue(currentValue, sampleValues)) {
    return currentValue;
  }

  return nextValue ?? "";
}

function shouldReplaceProfileValue(currentValue: string | null | undefined, sampleValues: Array<string | null | undefined>) {
  const normalizedCurrent = normalizeComparableText(currentValue);

  if (!normalizedCurrent) {
    return true;
  }

  return sampleValues.map(normalizeComparableText).filter(Boolean).includes(normalizedCurrent);
}

function normalizeComparableText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function createProfileWordmark(businessName: string | null) {
  if (!businessName) {
    return null;
  }

  return businessName.length > 18 ? businessName.slice(0, 18).trim() : businessName;
}

function createStoreContactLine(profile: PrintOpsStoreProfileSummary) {
  const addressLine = formatStoreAddress(profile.address);
  const segments = [addressLine, cleanProfileString(profile.businessEmail), cleanProfileString(profile.phone)].filter(Boolean);

  return segments.join(" / ") || null;
}

function formatStoreAddress(address: Record<string, unknown> | undefined) {
  if (!address) {
    return null;
  }

  const street = pickProfileString(address, ["streetAddress", "street", "addressLine", "addressLine1", "line1"]);
  const city = pickProfileString(address, ["city"]);
  const subdivision = pickProfileString(address, ["subdivision", "state", "region"]);
  const country = pickProfileString(address, ["country", "countryCode"]);
  const postalCode = pickProfileString(address, ["postalCode", "zipCode"]);
  const pieces = [street, city, subdivision, postalCode, country].filter(Boolean);

  return pieces.join(", ") || null;
}

function pickProfileString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return null;
}

function getWebsiteDisplay(siteUrl: string | null) {
  if (!siteUrl) {
    return null;
  }

  try {
    const url = new URL(siteUrl);

    return url.hostname.replace(/^www\./, "");
  } catch {
    return siteUrl.replace(/^https?:\/\//i, "").replace(/^www\./, "").replace(/\/$/, "");
  }
}

function resolveProfilePrintLocale(value: string | null | undefined): PrintLocale | null {
  const normalized = value?.trim().replace("_", "-").toLowerCase();

  if (!normalized) {
    return null;
  }

  const candidates: Record<string, PrintLocale> = {
    ar: "ar",
    de: "de",
    en: "en",
    es: "es",
    fr: "fr",
    it: "it",
    ja: "ja",
    ko: "ko",
    nl: "nl",
    pt: "pt",
    zh: "zh-Hans",
    "zh-cn": "zh-Hans",
    "zh-hans": "zh-Hans",
    "zh-hk": "zh-Hant",
    "zh-hant": "zh-Hant",
    "zh-mo": "zh-Hant",
    "zh-tw": "zh-Hant",
  };

  return candidates[normalized] ?? candidates[normalized.split("-")[0]] ?? null;
}

function resolveProfileTimezone(value: string | null | undefined) {
  const timezoneValue = value?.trim();

  if (!timezoneValue) {
    return null;
  }

  return timezoneOptions.some((option) => option.value === timezoneValue) ? timezoneValue : null;
}

function getAvatarInitials(value: string) {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "ZS";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

const fixedTemplateLabels = {
  invoiceTitle: {
    default: "Invoice",
    es: "Factura",
    de: "Rechnung",
    ja: "請求書",
    fr: "Facture",
    pt: "Fatura",
    "zh-Hans": "发票",
    "zh-Hant": "發票",
    ar: "فاتورة",
    nl: "Factuur",
    it: "Fattura",
    ko: "인보이스",
  },
  invoiceNo: {
    default: "Invoice No.",
    es: "Factura n.º",
    de: "Rechnungsnr.",
    ja: "請求書番号",
    fr: "N° de facture",
    pt: "Nº da fatura",
    "zh-Hans": "发票号",
    "zh-Hant": "發票號碼",
    ar: "رقم الفاتورة",
    nl: "Factuurnr.",
    it: "N. fattura",
    ko: "인보이스 번호",
  },
  invoiceDate: {
    default: "Invoice Date",
    es: "Fecha de factura",
    de: "Rechnungsdatum",
    ja: "請求日",
    fr: "Date de facture",
    pt: "Data da fatura",
    "zh-Hans": "发票日期",
    "zh-Hant": "發票日期",
    ar: "تاريخ الفاتورة",
    nl: "Factuurdatum",
    it: "Data fattura",
    ko: "인보이스 날짜",
  },
  orderDate: {
    default: "Order Date",
    es: "Fecha del pedido",
    de: "Bestelldatum",
    ja: "注文日",
    fr: "Date de commande",
    pt: "Data do pedido",
    "zh-Hans": "订单日期",
    "zh-Hant": "訂單日期",
    ar: "تاريخ الطلب",
    nl: "Besteldatum",
    it: "Data ordine",
    ko: "주문 날짜",
  },
  payment: {
    default: "Payment",
    es: "Pago",
    de: "Zahlung",
    ja: "支払い",
    fr: "Paiement",
    pt: "Pagamento",
    "zh-Hans": "付款",
    "zh-Hant": "付款",
    ar: "الدفع",
    nl: "Betaling",
    it: "Pagamento",
    ko: "결제",
  },
  shipping: {
    default: "Shipping",
    es: "Envío",
    de: "Versand",
    ja: "配送",
    fr: "Livraison",
    pt: "Envio",
    "zh-Hans": "配送",
    "zh-Hant": "配送",
    ar: "الشحن",
    nl: "Verzending",
    it: "Spedizione",
    ko: "배송",
  },
  orderBarcode: {
    default: "Order barcode",
    es: "Código de barras del pedido",
    de: "Bestellbarcode",
    ja: "注文バーコード",
    fr: "Code-barres de commande",
    pt: "Código de barras do pedido",
    "zh-Hans": "订单条形码",
    "zh-Hant": "訂單條形碼",
    ar: "باركود الطلب",
    nl: "Bestelbarcode",
    it: "Codice a barre ordine",
    ko: "주문 바코드",
  },
  billTo: {
    default: "Bill to",
    es: "Facturar a",
    de: "Rechnung an",
    ja: "請求先",
    fr: "Facturer à",
    pt: "Faturar para",
    "zh-Hans": "账单地址",
    "zh-Hant": "帳單地址",
    ar: "الفاتورة إلى",
    nl: "Factuur aan",
    it: "Fatturare a",
    ko: "청구지",
  },
  shipTo: {
    default: "Ship to",
    es: "Enviar a",
    de: "Versand an",
    ja: "配送先",
    fr: "Expédier à",
    pt: "Enviar para",
    "zh-Hans": "收货地址",
    "zh-Hant": "收貨地址",
    ar: "الشحن إلى",
    nl: "Verzenden naar",
    it: "Spedire a",
    ko: "배송지",
  },
  itemDescription: {
    default: "Item Description",
    es: "Descripción del artículo",
    de: "Artikelbeschreibung",
    ja: "商品説明",
    fr: "Description de l'article",
    pt: "Descrição do item",
    "zh-Hans": "商品描述",
    "zh-Hant": "商品描述",
    ar: "وصف العنصر",
    nl: "Artikelomschrijving",
    it: "Descrizione articolo",
    ko: "상품 설명",
  },
  sku: { default: "SKU", es: "SKU", de: "SKU", ja: "SKU", fr: "SKU", pt: "SKU", "zh-Hans": "SKU", "zh-Hant": "SKU", ar: "SKU", nl: "SKU", it: "SKU", ko: "SKU" },
  qty: {
    default: "Qty",
    es: "Cant.",
    de: "Menge",
    ja: "数量",
    fr: "Qté",
    pt: "Qtd.",
    "zh-Hans": "数量",
    "zh-Hant": "數量",
    ar: "الكمية",
    nl: "Aantal",
    it: "Qtà",
    ko: "수량",
  },
  price: {
    default: "Price",
    es: "Precio",
    de: "Preis",
    ja: "価格",
    fr: "Prix",
    pt: "Preço",
    "zh-Hans": "价格",
    "zh-Hant": "價格",
    ar: "السعر",
    nl: "Prijs",
    it: "Prezzo",
    ko: "가격",
  },
  total: {
    default: "Total",
    es: "Total",
    de: "Gesamt",
    ja: "合計",
    fr: "Total",
    pt: "Total",
    "zh-Hans": "合计",
    "zh-Hant": "合計",
    ar: "الإجمالي",
    nl: "Totaal",
    it: "Totale",
    ko: "합계",
  },
  items: {
    default: "Items",
    es: "Artículos",
    de: "Artikel",
    ja: "商品",
    fr: "Articles",
    pt: "Itens",
    "zh-Hans": "商品",
    "zh-Hant": "商品",
    ar: "العناصر",
    nl: "Artikelen",
    it: "Articoli",
    ko: "상품",
  },
  tax: {
    default: "Tax",
    es: "Impuesto",
    de: "Steuer",
    ja: "税",
    fr: "Taxe",
    pt: "Imposto",
    "zh-Hans": "税金",
    "zh-Hant": "稅金",
    ar: "الضريبة",
    nl: "Belasting",
    it: "Imposta",
    ko: "세금",
  },
  notes: {
    default: "Notes",
    es: "Notas",
    de: "Notizen",
    ja: "メモ",
    fr: "Notes",
    pt: "Observações",
    "zh-Hans": "备注",
    "zh-Hant": "備註",
    ar: "ملاحظات",
    nl: "Notities",
    it: "Note",
    ko: "메모",
  },
  questions: {
    default: "Questions? Please contact us.",
    es: "¿Preguntas? Contáctanos.",
    de: "Fragen? Bitte kontaktiere uns.",
    ja: "ご不明点があればお問い合わせください。",
    fr: "Questions ? Contactez-nous.",
    pt: "Dúvidas? Fale conosco.",
    "zh-Hans": "如有问题，请联系我们。",
    "zh-Hant": "如有問題，請聯絡我們。",
    ar: "هل لديك أسئلة؟ تواصل معنا.",
    nl: "Vragen? Neem contact met ons op.",
    it: "Domande? Contattaci.",
    ko: "문의 사항은 연락해 주세요.",
  },
  totalItems: {
    default: "Total items",
    es: "Total de artículos",
    de: "Artikel gesamt",
    ja: "合計点数",
    fr: "Total des articles",
    pt: "Total de itens",
    "zh-Hans": "商品总数",
    "zh-Hant": "商品總數",
    ar: "إجمالي العناصر",
    nl: "Totaal artikelen",
    it: "Totale articoli",
    ko: "총 상품 수",
  },
  additionalDetails: {
    default: "Additional details",
    es: "Detalles adicionales",
    de: "Zusaetzliche Details",
    ja: "追加情報",
    fr: "Details supplementaires",
    pt: "Detalhes adicionais",
    "zh-Hans": "附加信息",
    "zh-Hant": "附加資訊",
    ar: "تفاصيل إضافية",
    nl: "Aanvullende details",
    it: "Dettagli aggiuntivi",
    ko: "추가 정보",
  },
} satisfies Record<string, LocalizedText>;

const templateFixedLabelDefinitions: TemplateLabelDefinition[] = [
  { key: "template.invoice_title", group: "Template", label: fixedTemplateLabels.invoiceTitle, helper: "Document title in the header." },
  { key: "template.invoice_no", group: "Template", label: fixedTemplateLabels.invoiceNo, helper: "Invoice number prefix." },
  { key: "template.invoice_date", group: "Template", label: fixedTemplateLabels.invoiceDate, helper: "Invoice date label." },
  { key: "template.order_date", group: "Template", label: fixedTemplateLabels.orderDate, helper: "Order date label for compact layouts." },
  { key: "template.payment", group: "Template", label: fixedTemplateLabels.payment, helper: "Payment method label." },
  { key: "template.shipping", group: "Template", label: fixedTemplateLabels.shipping, helper: "Shipping method label." },
  { key: "template.order_barcode", group: "Order", label: fixedTemplateLabels.orderBarcode, helper: "Order barcode label." },
  { key: "template.bill_to", group: "Address", label: fixedTemplateLabels.billTo, helper: "Billing address heading." },
  { key: "template.ship_to", group: "Address", label: fixedTemplateLabels.shipTo, helper: "Shipping address heading." },
  { key: "template.item_description", group: "Items", label: fixedTemplateLabels.itemDescription, helper: "Line-item table heading." },
  { key: "template.sku", group: "Items", label: fixedTemplateLabels.sku, helper: "SKU label for line items." },
  { key: "template.qty", group: "Items", label: fixedTemplateLabels.qty, helper: "Quantity column heading." },
  { key: "template.price", group: "Payment", label: fixedTemplateLabels.price, helper: "Unit price column heading." },
  { key: "template.total", group: "Payment", label: fixedTemplateLabels.total, helper: "Total column and summary heading." },
  { key: "template.items", group: "Payment", label: fixedTemplateLabels.items, helper: "Subtotal line label." },
  { key: "template.tax", group: "Payment", label: fixedTemplateLabels.tax, helper: "Tax line label." },
  { key: "template.notes", group: "Template", label: fixedTemplateLabels.notes, helper: "Order notes heading." },
  { key: "template.additional_details", group: "Custom", label: fixedTemplateLabels.additionalDetails, helper: "Custom fields section heading." },
  { key: "template.questions", group: "Template", label: fixedTemplateLabels.questions, helper: "Support line above the closing message." },
  { key: "template.total_items", group: "Items", label: fixedTemplateLabels.totalItems, helper: "Total item count label." },
];

const fieldScopeLabelGroup: Record<FieldScope, TemplateLabelGroup> = {
  address: "Address",
  computed: "Custom",
  custom: "Custom",
  customer: "Customer",
  fulfillment: "Fulfillment",
  line_item: "Items",
  order: "Order",
  payment: "Payment",
  shipment: "Fulfillment",
  store: "Store",
  template: "Template",
};

const fieldRegistryLabelDefinitions: TemplateLabelDefinition[] = coreFieldRegistry
  .filter((field) => field.printable)
  .map((field) => ({
    key: field.key,
    group: fieldScopeLabelGroup[field.scope],
    label: field.label,
    helper: field.source === "standard" ? "Standard order field label." : "Platform or custom printable field label.",
  }));

const templateLabelDefinitions: TemplateLabelDefinition[] = Array.from(
  new Map([...templateFixedLabelDefinitions, ...fieldRegistryLabelDefinitions].map((definition) => [definition.key, definition])).values(),
);

const templateLabelGroupOrder: TemplateLabelGroup[] = ["Template", "Order", "Customer", "Address", "Items", "Payment", "Fulfillment", "Store", "Custom"];

function getVisibleFieldGroups(editorCopy: PrintOpsMessages["templateEditor"]): Array<{
  title: string;
  description: string;
  items: Array<{ key: TemplateVisibilityKey; label: string; description: string }>;
}> {
  return [
    {
      title: editorCopy.visibleHeaderTitle,
      description: editorCopy.visibleHeaderDescription,
      items: [
        { key: "showLogoText", label: editorCopy.visibleHeroWordmark, description: editorCopy.visibleHeroWordmarkDescription },
        { key: "showStoreName", label: editorCopy.visibleStoreName, description: editorCopy.visibleStoreNameDescription },
        { key: "showInvoiceMeta", label: editorCopy.visibleInvoiceMetadata, description: editorCopy.visibleInvoiceMetadataDescription },
        { key: "showOrderBarcode", label: editorCopy.visibleOrderBarcode, description: editorCopy.visibleOrderBarcodeDescription },
        { key: "showPaymentMethod", label: editorCopy.visiblePaymentMethod, description: editorCopy.visiblePaymentMethodDescription },
        { key: "showShippingMethod", label: editorCopy.visibleShippingMethod, description: editorCopy.visibleShippingMethodDescription },
      ],
    },
    {
      title: editorCopy.visibleAddressesTitle,
      description: editorCopy.visibleAddressesDescription,
      items: [
        { key: "showBillTo", label: editorCopy.visibleBillTo, description: editorCopy.visibleBillToDescription },
        { key: "showShipTo", label: editorCopy.visibleShipTo, description: editorCopy.visibleShipToDescription },
      ],
    },
    {
      title: editorCopy.visibleItemsTitle,
      description: editorCopy.visibleItemsDescription,
      items: [
        { key: "showProductImages", label: editorCopy.visibleProductImages, description: editorCopy.visibleProductImagesDescription },
        { key: "showSku", label: editorCopy.visibleSku, description: editorCopy.visibleSkuDescription },
        { key: "showItemOptions", label: editorCopy.visibleItemOptions, description: editorCopy.visibleItemOptionsDescription },
      ],
    },
    {
      title: editorCopy.visibleSummaryTitle,
      description: editorCopy.visibleSummaryDescription,
      items: [
        { key: "showNotes", label: editorCopy.visibleNotes, description: editorCopy.visibleNotesDescription },
        { key: "showTotals", label: editorCopy.visibleTotals, description: editorCopy.visibleTotalsDescription },
      ],
    },
    {
      title: editorCopy.visibleFooterTitle,
      description: editorCopy.visibleFooterDescription,
      items: [
        { key: "showThankYou", label: editorCopy.visibleThankYou, description: editorCopy.visibleThankYouDescription },
        { key: "showContactFooter", label: editorCopy.visibleContactFooter, description: editorCopy.visibleContactFooterDescription },
        { key: "showSocialFooter", label: editorCopy.visibleSocialFooter, description: editorCopy.visibleSocialFooterDescription },
      ],
    },
  ];
}

const initialTemplateRecords: TemplateRecord[] = [
  {
    id: "store-order-clean",
    name: "Invoice - Big Brand",
    description: "Large logo invoice layout with bill/ship sections, product photo, notes, totals, and social footer.",
    documentType: "Invoice",
    category: "Customer Documents",
    scenario: "wix-default-order",
    audience: "Customer",
    paperSize: "A4",
    orientation: "Portrait",
    marginPreset: "Normal",
    layoutPreset: "Branded",
    visualStyle: "atelier",
    defaultLanguage: "en",
    labelOverrides: {},
    source: "Store copy",
    status: "Ready",
    ...defaultTemplateBrandSettings,
    logoText: printOpsSystemBrandName,
    socialLinks: defaultTemplateBrandSettings.socialLinks,
    showProductImages: true,
    showSocialFooter: true,
    isDefault: true,
    updatedAt: "Today, 11:38",
    dataRequirements: ["order_number", "order_barcode", "customer_contact", "line_items", "sku", "item_options", "totals", "payment", "delivery_address", "billing_address", "delivery_method", "store_contact"],
    validation: { tone: "ok", label: "Ready to print" },
  },
  {
    id: "store-order-compact",
    name: "Invoice - Market",
    description: "Warm retail invoice layout with logo card, product image row, customer blocks, and compact social footer.",
    documentType: "Invoice",
    category: "Fulfillment",
    scenario: "fulfillment-handoff",
    audience: "Store staff",
    paperSize: "A4",
    orientation: "Portrait",
    marginPreset: "Compact",
    layoutPreset: "Compact",
    visualStyle: "market",
    defaultLanguage: "en",
    labelOverrides: {},
    source: "Store copy",
    status: "Ready",
    ...defaultTemplateBrandSettings,
    accentColor: "forest",
    density: "compact",
    logoText: printOpsSystemBrandName,
    socialLinks: defaultTemplateBrandSettings.socialLinks,
    showProductImages: true,
    showSocialFooter: true,
    updatedAt: "Today, 10:24",
    dataRequirements: ["order_number", "order_barcode", "customer_contact", "line_items", "sku", "item_options", "totals", "delivery_method"],
    validation: { tone: "ok", label: "Ready to print" },
  },
  {
    id: "store-order-payment-check",
    name: "Invoice - Mono",
    description: "High-contrast invoice template for sharp office printing, product thumbnails, payment summary, and social footer.",
    documentType: "Invoice",
    category: "Customer Documents",
    scenario: "payment-review",
    audience: "Store staff",
    paperSize: "A4",
    orientation: "Portrait",
    marginPreset: "Compact",
    layoutPreset: "Branded",
    visualStyle: "mono",
    defaultLanguage: "en",
    labelOverrides: {},
    source: "Store copy",
    status: "Ready",
    ...defaultTemplateBrandSettings,
    accentColor: "slate",
    density: "compact",
    logoText: printOpsSystemBrandName,
    socialLinks: defaultTemplateBrandSettings.socialLinks,
    showProductImages: true,
    showSocialFooter: true,
    updatedAt: "May 25",
    dataRequirements: ["order_number", "order_barcode", "payment_status", "payment_method", "totals", "tax", "product_image", "sku", "store_social_links"],
    validation: { tone: "ok", label: "Ready to print" },
  },
  {
    id: "library-order-modern",
    name: "Invoice - Big Brand",
    description: "Large-brand invoice document adapted to Wix default order fields.",
    documentType: "Invoice",
    category: "Customer Documents",
    scenario: "customer-copy",
    audience: "Customer",
    paperSize: "A4",
    orientation: "Portrait",
    marginPreset: "Normal",
    layoutPreset: "Branded",
    visualStyle: "atelier",
    defaultLanguage: "en",
    labelOverrides: {},
    source: "Built-in",
    status: "Ready",
    ...defaultTemplateBrandSettings,
    logoText: printOpsSystemBrandName,
    socialLinks: defaultTemplateBrandSettings.socialLinks,
    showProductImages: true,
    showSocialFooter: true,
    updatedAt: "Built-in",
    dataRequirements: ["order_number", "order_barcode", "customer_contact", "line_items", "sku", "item_options", "totals", "store_contact"],
    validation: { tone: "ok", label: "Built-in template" },
  },
  {
    id: "library-order-minimal",
    name: "Invoice - Minimal",
    description: "Low-ink black-and-white invoice print for fast office printing and archive copies.",
    documentType: "Invoice",
    category: "Customer Documents",
    scenario: "archive-copy",
    audience: "Store staff",
    paperSize: "A4",
    orientation: "Portrait",
    marginPreset: "Compact",
    layoutPreset: "Compact",
    visualStyle: "market",
    defaultLanguage: "en",
    labelOverrides: {},
    source: "Built-in",
    status: "Ready",
    ...defaultTemplateBrandSettings,
    accentColor: "forest",
    density: "compact",
    logoText: printOpsSystemBrandName,
    socialLinks: defaultTemplateBrandSettings.socialLinks,
    showProductImages: true,
    showSocialFooter: true,
    updatedAt: "Built-in",
    dataRequirements: ["order_number", "order_barcode", "customer_contact", "line_items", "sku", "totals", "payment"],
    validation: { tone: "ok", label: "Built-in template" },
  },
];

const documentFilters = [
  { label: "All documents", value: "all" },
  { label: "Invoice", value: "Invoice" },
];

function localizeTemplateDocumentType(documentType: string, messages: PrintOpsMessages) {
  if (documentType === "Invoice") {
    return messages.templateEditor.documentInvoice;
  }

  return documentType;
}

function localizeTemplateCategory(category: TemplateRecord["category"], messages: PrintOpsMessages) {
  const categoryLabels: Record<TemplateRecord["category"], string> = {
    "Customer Documents": messages.templateEditor.categoryCustomerDocuments,
    "Finance Helper": messages.templateEditor.categoryFinanceHelper,
    Fulfillment: messages.templateEditor.categoryFulfillment,
    Picking: messages.templateEditor.categoryPicking,
    Production: messages.templateEditor.categoryProduction,
    "Store / POS": messages.templateEditor.categoryStorePos,
  };

  return categoryLabels[category] ?? category;
}

function localizeTemplateAudience(audience: TemplateRecord["audience"], messages: PrintOpsMessages) {
  const audienceLabels: Record<TemplateRecord["audience"], string> = {
    Customer: messages.templateEditor.audienceCustomer,
    Finance: messages.templateEditor.audienceFinance,
    Production: messages.templateEditor.audienceProduction,
    "Store staff": messages.templateEditor.audienceStoreStaff,
    Warehouse: messages.templateEditor.audienceWarehouse,
  };

  return audienceLabels[audience] ?? audience;
}

function localizeTemplateStatus(status: TemplateRecord["status"], messages: PrintOpsMessages) {
  if (status === "Ready") {
    return messages.templates.statusReady;
  }

  return messages.templates.statusDraft;
}

function localizeTemplateUpdatedAt(updatedAt: string, messages: PrintOpsMessages) {
  if (updatedAt === "Built-in") {
    return messages.templates.builtInTimestamp;
  }

  if (updatedAt.startsWith("Today")) {
    return updatedAt.replace("Today", messages.templates.todayPrefix);
  }

  return updatedAt;
}

function localizeTemplateValidationLabel(label: string, messages: PrintOpsMessages) {
  const validationLabels: Record<string, string> = {
    "Add required fields": messages.templates.addRequiredFields,
    "Built-in template": messages.templates.builtInTemplate,
    "Field mapping recommended": messages.templates.fieldMappingRecommended,
    "Ready to print": messages.templates.readyToPrint,
  };

  return validationLabels[label] ?? label;
}

function getLocalizedTemplateRecord(templateRecord: TemplateRecord, messages: PrintOpsMessages) {
  const knownTemplateCopy: Record<string, { name: string; description: string }> = {
    "library-order-minimal": {
      name: messages.templates.invoiceMinimalName,
      description: messages.templates.invoiceMinimalDescription,
    },
    "library-order-modern": {
      name: messages.templates.invoiceBigBrandName,
      description: messages.templates.invoiceBigBrandDescription,
    },
    "store-order-clean": {
      name: messages.templates.invoiceBigBrandName,
      description: messages.templates.invoiceBigBrandDescription,
    },
    "store-order-compact": {
      name: messages.templates.invoiceMarketName,
      description: messages.templates.invoiceMarketDescription,
    },
    "store-order-payment-check": {
      name: messages.templates.invoiceMonoName,
      description: messages.templates.invoiceMonoDescription,
    },
  };
  const localizedCopy = knownTemplateCopy[templateRecord.id];

  return {
    audience: localizeTemplateAudience(templateRecord.audience, messages),
    category: localizeTemplateCategory(templateRecord.category, messages),
    description: localizedCopy?.description ?? templateRecord.description,
    documentType: localizeTemplateDocumentType(templateRecord.documentType, messages),
    name: localizedCopy?.name ?? templateRecord.name,
    status: localizeTemplateStatus(templateRecord.status, messages),
    updatedAt: localizeTemplateUpdatedAt(templateRecord.updatedAt, messages),
    validationLabel: localizeTemplateValidationLabel(templateRecord.validation.label, messages),
  };
}

function getDefaultCategory(documentType: string): TemplateRecord["category"] {
  if (documentType === "Invoice") {
    return "Customer Documents";
  }

  if (documentType === "Production Sheet") {
    return "Production";
  }

  if (documentType === "Pick List") {
    return "Picking";
  }

  if (documentType === "Invoice Helper") {
    return "Finance Helper";
  }

  if (documentType === "Thermal Receipt") {
    return "Store / POS";
  }

  return "Fulfillment";
}

function createBlankTemplateDraft(): TemplateDraft {
  return {
    name: "New Invoice Template",
    description: "Customer-facing Wix invoice print with contact, items, totals, payment, delivery, and store details.",
    documentType: "Invoice",
    category: "Customer Documents",
    scenario: "wix-default-order",
    audience: "Customer",
    paperSize: "A4",
    orientation: "Portrait",
    marginPreset: "Normal",
    layoutPreset: "Branded",
    dateFormat: defaultTemplateBrandSettings.dateFormat,
    addressFormat: defaultTemplateBrandSettings.addressFormat,
    visualStyle: "atelier",
    defaultLanguage: defaultPrintLocale,
    labelOverrides: {},
    brandName: defaultTemplateBrandSettings.brandName,
    logoText: defaultTemplateBrandSettings.logoText,
    logoFont: defaultTemplateBrandSettings.logoFont,
    logoFontSize: defaultTemplateBrandSettings.logoFontSize,
    logoSource: defaultTemplateBrandSettings.logoSource,
    logoImageUrl: defaultTemplateBrandSettings.logoImageUrl,
    footerWebsite: defaultTemplateBrandSettings.footerWebsite,
    footerContact: defaultTemplateBrandSettings.footerContact,
    thankYouText: defaultTemplateBrandSettings.thankYouText,
    accentColor: defaultTemplateBrandSettings.accentColor,
    customAccentColor: defaultTemplateBrandSettings.customAccentColor,
    density: defaultTemplateBrandSettings.density,
    socialProfiles: normalizeSocialProfiles(defaultTemplateBrandSettings.socialProfiles),
    socialLinks: defaultTemplateBrandSettings.socialLinks,
    showLogoText: true,
    showStoreName: true,
    showInvoiceMeta: true,
    showOrderBarcode: true,
    showBillTo: true,
    showShipTo: true,
    showProductImages: true,
    showSku: true,
    showItemOptions: true,
    showNotes: true,
    showTotals: true,
    showPaymentMethod: true,
    showShippingMethod: true,
    showThankYou: true,
    showContactFooter: true,
    showSocialFooter: true,
    dataRequirements: "order_number, order_barcode, customer_contact, line_items, sku, item_options, totals, payment, delivery_address, billing_address, delivery_method, store_contact",
  };
}

function createDraftFromTemplate(templateRecord: TemplateRecord, mode: TemplateEditorMode): TemplateDraft {
  const normalizedSocialProfiles = normalizeSocialProfiles(templateRecord.socialProfiles, templateRecord.socialLinks);

  return {
    id: mode === "edit" ? templateRecord.id : undefined,
    name: mode === "duplicate" ? `${templateRecord.name} Copy` : templateRecord.name,
    description: templateRecord.description,
    documentType: templateRecord.documentType,
    category: templateRecord.category,
    scenario: templateRecord.scenario,
    audience: templateRecord.audience,
    paperSize: "A4",
    orientation: templateRecord.orientation,
    marginPreset: templateRecord.marginPreset,
    layoutPreset: templateRecord.layoutPreset,
    dateFormat: templateRecord.dateFormat ?? defaultTemplateBrandSettings.dateFormat,
    addressFormat: templateRecord.addressFormat ?? defaultTemplateBrandSettings.addressFormat,
    visualStyle: templateRecord.visualStyle ?? "atelier",
    defaultLanguage: templateRecord.defaultLanguage,
    labelOverrides: normalizeLabelOverrides(templateRecord.labelOverrides),
    brandName: templateRecord.brandName ?? defaultTemplateBrandSettings.brandName,
    logoText: templateRecord.logoText ?? defaultTemplateBrandSettings.logoText,
    logoFont: templateRecord.logoFont ?? defaultTemplateBrandSettings.logoFont,
    logoFontSize: templateRecord.logoFontSize ?? defaultTemplateBrandSettings.logoFontSize,
    logoSource: templateRecord.logoSource ?? defaultTemplateBrandSettings.logoSource,
    logoImageUrl: templateRecord.logoImageUrl ?? defaultTemplateBrandSettings.logoImageUrl,
    footerWebsite: templateRecord.footerWebsite ?? defaultTemplateBrandSettings.footerWebsite,
    footerContact: templateRecord.footerContact ?? defaultTemplateBrandSettings.footerContact,
    thankYouText: templateRecord.thankYouText ?? defaultTemplateBrandSettings.thankYouText,
    accentColor: templateRecord.accentColor ?? defaultTemplateBrandSettings.accentColor,
    customAccentColor: templateRecord.customAccentColor ?? defaultTemplateBrandSettings.customAccentColor,
    density: templateRecord.density ?? defaultTemplateBrandSettings.density,
    socialProfiles: normalizedSocialProfiles,
    socialLinks: serializeSocialProfiles(normalizedSocialProfiles),
    showLogoText: templateRecord.showLogoText ?? true,
    showStoreName: templateRecord.showStoreName ?? true,
    showInvoiceMeta: templateRecord.showInvoiceMeta ?? true,
    showOrderBarcode: templateRecord.showOrderBarcode ?? true,
    showBillTo: templateRecord.showBillTo ?? true,
    showShipTo: templateRecord.showShipTo ?? true,
    showProductImages: templateRecord.showProductImages ?? true,
    showSku: templateRecord.showSku ?? true,
    showItemOptions: templateRecord.showItemOptions ?? true,
    showNotes: templateRecord.showNotes ?? true,
    showTotals: templateRecord.showTotals ?? true,
    showPaymentMethod: templateRecord.showPaymentMethod ?? true,
    showShippingMethod: templateRecord.showShippingMethod ?? true,
    showThankYou: templateRecord.showThankYou ?? true,
    showContactFooter: templateRecord.showContactFooter ?? true,
    showSocialFooter: templateRecord.showSocialFooter ?? true,
    dataRequirements: templateRecord.dataRequirements.join(", "),
  };
}

function parseDataRequirements(value: string) {
  return value
    .split(/[,\n]/)
    .map((requirement) => requirement.trim())
    .filter(Boolean);
}

function createTemplateValidation(requirements: string[]): TemplateRecord["validation"] {
  if (requirements.length === 0) {
    return { tone: "warning", label: "Add required fields" };
  }

  if (requirements.some((requirement) => requirement.includes("custom") || requirement.includes("tax") || requirement.includes("bin"))) {
    return { tone: "warning", label: "Field mapping recommended" };
  }

  return { tone: "ok", label: "Ready to print" };
}

function createTemplateId(name: string) {
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "template";

  return `store-${slug}-${Date.now()}`;
}

function getTemplateLabelFallback(key: string): LocalizedText {
  return templateLabelDefinitions.find((definition) => definition.key === key)?.label ?? { default: key };
}

function normalizeLabelOverrides(overrides: TemplateLabelOverrides | undefined): TemplateLabelOverrides {
  const normalized: TemplateLabelOverrides = {};

  Object.entries(overrides ?? {}).forEach(([key, localizedValue]) => {
    const fallback = getTemplateLabelFallback(key);
    const nextValue: LocalizedText = { default: localizedValue.default?.trim() || fallback.default };
    let hasOverride = nextValue.default !== fallback.default;

    Object.entries(localizedValue).forEach(([locale, text]) => {
      if (locale === "default" || !isPrintLocale(locale)) {
        return;
      }

      const cleanText = text?.trim();
      const localeFallback = resolveLocalizedText(fallback, locale);

      if (cleanText && cleanText !== localeFallback) {
        nextValue[locale] = cleanText;
        hasOverride = true;
      }
    });

    if (hasOverride) {
      normalized[key] = nextValue;
    }
  });

  return normalized;
}

function setTemplateLabelOverrideValue(overrides: TemplateLabelOverrides, key: string, locale: PrintLocale, value: string): TemplateLabelOverrides {
  const fallback = getTemplateLabelFallback(key);
  const nextLocalizedValue: LocalizedText = { ...(overrides[key] ?? {}), default: overrides[key]?.default ?? fallback.default };
  const cleanValue = value.trim();

  if (cleanValue) {
    nextLocalizedValue[locale] = cleanValue;
  } else {
    delete nextLocalizedValue[locale];
  }

  return normalizeLabelOverrides({ ...overrides, [key]: nextLocalizedValue });
}

function getTemplateLabelInputValue(overrides: TemplateLabelOverrides, key: string, locale: PrintLocale) {
  return overrides[key]?.[locale] ?? resolveLocalizedText(getTemplateLabelFallback(key), locale);
}

function resolveTemplateLabel(key: string, locale: PrintLocale, overrides: TemplateLabelOverrides | undefined) {
  const fallback = getTemplateLabelFallback(key);
  const override = overrides?.[key];
  const localeOverride = override?.[locale]?.trim();

  if (localeOverride) {
    return localeOverride;
  }

  if (override?.default && override.default !== fallback.default) {
    return override.default;
  }

  return resolveLocalizedText(fallback, locale);
}

function createTemplateRecordFromDraft(draft: TemplateDraft, existing?: TemplateRecord): TemplateRecord {
  const dataRequirements = parseDataRequirements(draft.dataRequirements);
  const normalizedSocialProfiles = normalizeSocialProfiles(draft.socialProfiles, draft.socialLinks);

  return {
    id: existing?.id ?? createTemplateId(draft.name),
    name: draft.name.trim(),
    description: draft.description.trim(),
    documentType: draft.documentType,
    category: getDefaultCategory(draft.documentType),
    scenario: draft.scenario.trim() || "custom",
    audience: draft.audience,
    paperSize: "A4",
    orientation: draft.orientation,
    marginPreset: draft.marginPreset,
    layoutPreset: draft.layoutPreset,
    dateFormat: draft.dateFormat,
    addressFormat: draft.addressFormat,
    visualStyle: draft.visualStyle,
    defaultLanguage: draft.defaultLanguage,
    labelOverrides: normalizeLabelOverrides(draft.labelOverrides),
    source: "Store copy",
    status: dataRequirements.length > 0 ? "Ready" : "Draft",
    brandName: draft.brandName.trim() || defaultTemplateBrandSettings.brandName,
    logoText: draft.logoText.trim() || defaultTemplateBrandSettings.logoText,
    logoFont: draft.logoFont,
    logoFontSize: Math.min(Math.max(Number(draft.logoFontSize) || defaultTemplateBrandSettings.logoFontSize, 28), 96),
    logoSource: draft.logoSource,
    logoImageUrl: draft.logoImageUrl.trim(),
    footerWebsite: draft.footerWebsite.trim(),
    footerContact: draft.footerContact.trim(),
    thankYouText: draft.thankYouText.trim() || defaultTemplateBrandSettings.thankYouText,
    accentColor: draft.accentColor,
    customAccentColor: draft.customAccentColor.trim() || defaultTemplateBrandSettings.customAccentColor,
    density: draft.density,
    socialProfiles: normalizedSocialProfiles,
    socialLinks: serializeSocialProfiles(normalizedSocialProfiles),
    showLogoText: draft.showLogoText,
    showStoreName: draft.showStoreName,
    showInvoiceMeta: draft.showInvoiceMeta,
    showOrderBarcode: draft.showOrderBarcode,
    showBillTo: draft.showBillTo,
    showShipTo: draft.showShipTo,
    showProductImages: draft.showProductImages,
    showSku: draft.showSku,
    showItemOptions: draft.showItemOptions,
    showNotes: draft.showNotes,
    showTotals: draft.showTotals,
    showPaymentMethod: draft.showPaymentMethod,
    showShippingMethod: draft.showShippingMethod,
    showThankYou: draft.showThankYou,
    showContactFooter: draft.showContactFooter,
    showSocialFooter: draft.showSocialFooter,
    isDefault: existing?.isDefault,
    updatedAt: "Just now",
    dataRequirements,
    validation: createTemplateValidation(dataRequirements),
  };
}

export function PrintOpsWorkbench({ initialView = "orders", pluginContext }: { initialView?: PrintOpsView; pluginContext?: PrintOpsPluginContext }) {
  const [activeView, setActiveView] = useState<PrintOpsView>(initialView);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cachedOrders, setCachedOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilters, setOrderFilters] = useState({
    last30Days: true,
    unfulfilled: false,
    unprinted: false,
  });
  const [orderCacheStatus, setOrderCacheStatus] = useState<OrderCacheStatus>({
    error: null,
    orderCount: 0,
    status: "idle",
  });
  const [orderActionRequest, setOrderActionRequest] = useState<OrderActionRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [workspaceAccent, setWorkspaceAccent] = useState<WorkspaceAccent>("forest");
  const [siteLocale, setSiteLocale] = useState<SiteLocale>(defaultSiteLocale);
  const [templateTab, setTemplateTab] = useState<"mine" | "library">("mine");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateDocumentFilter, setTemplateDocumentFilter] = useState("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState("store-order-clean");
  const [templateRecords, setTemplateRecords] = useState<TemplateRecord[]>(initialTemplateRecords);
  const [templatesHydrated, setTemplatesHydrated] = useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [templateEditorMode, setTemplateEditorMode] = useState<TemplateEditorMode>("create");
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft>(() => createBlankTemplateDraft());
  const [template, setTemplate] = useState("order");
  const [language, setLanguage] = useState<PrintLocale>(defaultPrintLocale);
  const [timezone, setTimezone] = useState("Asia/Shanghai");
  const [wixSyncStatus, setWixSyncStatus] = useState<WixSyncStatus>({
    customFieldCount: 0,
    error: null,
    mode: null,
    orderCount: 0,
    orders: [],
    persistence: null,
    status: "idle",
    window: null,
  });
  const [storeProfile, setStoreProfile] = useState<PrintOpsStoreProfileSummary | null>(null);
  const [storeProfileStatus, setStoreProfileStatus] = useState<StoreProfileStatus>({
    error: null,
    source: null,
    status: "idle",
  });
  const [storeProfileDefaultsApplied, setStoreProfileDefaultsApplied] = useState(false);
  const messages = getPrintOpsMessages(siteLocale);
  const printLanguageOptions = useMemo(() => getPrintLocaleOptions(siteLocale), [siteLocale]);
  const displayOrders = useMemo(() => {
    const normalizedSearch = orderSearch.trim().toLowerCase();

    return cachedOrders.filter((order) => {
      const matchesSearch = !normalizedSearch || orderMatchesSearch(order, normalizedSearch);
      const matchesDate = !orderFilters.last30Days || isOrderWithinLastDays(order, 30);
      const matchesFulfillment = !orderFilters.unfulfilled || order.fulfillment === "Unfulfilled";
      const matchesPrint = !orderFilters.unprinted || order.print === "Unprinted";

      return matchesSearch && matchesDate && matchesFulfillment && matchesPrint;
    });
  }, [cachedOrders, orderFilters.last30Days, orderFilters.unfulfilled, orderFilters.unprinted, orderSearch]);
  const selectedOrders = useMemo(() => displayOrders.filter((order) => selectedIds.includes(order.id)), [displayOrders, selectedIds]);
  const selectedCount = selectedOrders.length;
  const orderMetrics = useMemo(
    () => ({
      generated: cachedOrders.filter((order) => order.print === "Generated").length,
      unprinted: cachedOrders.filter((order) => order.print === "Unprinted").length,
    }),
    [cachedOrders],
  );
  const viewLinks = useMemo(
    () =>
      pluginContext?.viewLinks ?? {
        orders: "/apps/printops",
        settings: "/apps/printops/settings",
        templates: "/apps/printops/templates",
      },
    [pluginContext?.viewLinks],
  );
  const navigationSections = useMemo(
    () => [
      {
        label: messages.nav.menu,
        items: [
          { icon: Package, label: messages.nav.orders, href: viewLinks.orders, view: "orders", count: String(cachedOrders.length) },
          { icon: LayoutTemplate, label: messages.nav.templates, href: viewLinks.templates, view: "templates", count: "" },
        ],
      },
      {
        label: messages.nav.general,
        items: [
          { icon: Settings, label: messages.nav.settings, href: viewLinks.settings, view: "settings", count: "" },
          { icon: BookOpen, label: messages.nav.help, href: "#", view: "help", count: "" },
        ],
      },
    ],
    [cachedOrders.length, messages, viewLinks],
  );
  const filteredTemplates = useMemo(() => {
    const source = templateTab === "mine" ? "Store copy" : "Built-in";
    const normalizedSearch = templateSearch.trim().toLowerCase();

    return templateRecords.filter((templateRecord) => {
      const matchesSource = templateRecord.source === source;
      const matchesSearch =
        !normalizedSearch ||
        templateRecord.name.toLowerCase().includes(normalizedSearch) ||
        templateRecord.description.toLowerCase().includes(normalizedSearch) ||
        templateRecord.documentType.toLowerCase().includes(normalizedSearch);
      const matchesDocument = templateDocumentFilter === "all" || templateRecord.documentType === templateDocumentFilter;
      return matchesSource && matchesSearch && matchesDocument;
    });
  }, [templateDocumentFilter, templateRecords, templateSearch, templateTab]);
  const storeTemplateCount = useMemo(() => templateRecords.filter((templateRecord) => templateRecord.source === "Store copy").length, [templateRecords]);

  const selectedTemplate = filteredTemplates.find((templateRecord) => templateRecord.id === selectedTemplateId) ?? filteredTemplates[0] ?? templateRecords[0];
  const defaultOrderTemplate =
    templateRecords.find((templateRecord) => templateRecord.isDefault && templateRecord.documentType === "Invoice") ??
    templateRecords.find((templateRecord) => templateRecord.id === "store-order-clean") ??
    templateRecords.find((templateRecord) => templateRecord.documentType === "Invoice") ??
    templateRecords[0];
  const templateStats = useMemo(
    () => ({
      mine: templateRecords.filter((templateRecord) => templateRecord.source === "Store copy").length,
      library: templateRecords.filter((templateRecord) => templateRecord.source === "Built-in").length,
      ready: templateRecords.filter((templateRecord) => templateRecord.status === "Ready").length,
      needsFields: templateRecords.filter((templateRecord) => templateRecord.validation.tone === "warning").length,
    }),
    [templateRecords],
  );
  const pageTitle =
    activeView === "templates"
      ? messages.pages.templatesTitle
      : activeView === "settings"
        ? messages.pages.settingsTitle
        : messages.pages.ordersTitle;
  const searchLabel =
    activeView === "templates"
      ? messages.topbar.searchTemplates
      : activeView === "settings"
        ? messages.topbar.searchSettings
        : messages.topbar.searchOrders;
  const pageDescription =
    activeView === "templates"
      ? messages.pages.templatesDescription
      : activeView === "settings"
        ? messages.pages.settingsDescription
        : messages.pages.ordersDescription;
  const workspaceStoreName = storeProfile?.businessName?.trim() || printOpsSystemBrandName;
  const workspaceStoreScope = storeProfile?.siteUrl ? getWebsiteDisplay(storeProfile.siteUrl) : printOpsSystemSiteUrl;
  const workspaceStoreInitials = getAvatarInitials(workspaceStoreName);
  const hasUnreadProductUpdates = false;
  const pageMetrics: PageMetric[] =
    activeView === "templates"
      ? [
          { label: messages.metrics.myTemplates, value: String(templateStats.mine) },
          { label: messages.metrics.builtIn, value: String(templateStats.library) },
          { label: messages.metrics.ready, value: String(templateStats.ready) },
          { label: messages.metrics.needsFields, value: String(templateStats.needsFields), tone: "warning" as const },
        ]
      : activeView === "settings"
        ? []
      : [
          { label: messages.metrics.unprinted, value: String(orderMetrics.unprinted) },
          { label: messages.metrics.generated, value: String(orderMetrics.generated) },
        ];

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveView(getPrintOpsViewFromLocation(initialView));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [initialView]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("printops-theme");
    const savedSidebar = window.localStorage.getItem("printops-sidebar-v1");
    const savedSiteLocale = window.localStorage.getItem(siteLocaleStorageKey);
    const savedPrintLocale = window.localStorage.getItem(printLocaleStorageKey);
    const savedTimezone = window.localStorage.getItem(timezoneStorageKey);
    const savedAccent = window.localStorage.getItem(workspaceAccentStorageKey);

    if (savedTheme === "dark") {
      setDarkTheme(true);
    }

    if (savedSidebar === "collapsed") {
      setSidebarCollapsed(true);
    }

    if (isSiteLocale(savedSiteLocale)) {
      setSiteLocale(savedSiteLocale);
    }

    if (isPrintLocale(savedPrintLocale)) {
      setLanguage(savedPrintLocale);
    }

    if (savedTimezone && timezoneOptions.some((option) => option.value === savedTimezone)) {
      setTimezone(savedTimezone);
    }

    if (isWorkspaceAccent(savedAccent)) {
      setWorkspaceAccent(savedAccent);
    }

    const savedTemplates = window.localStorage.getItem(templateStorageKey);

    if (savedTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedTemplates) as TemplateRecord[];

        const supportedTemplates = Array.isArray(parsedTemplates)
          ? parsedTemplates.filter((templateRecord) => !deprecatedTemplateIds.has(templateRecord.id))
          : [];

        if (supportedTemplates.length > 0) {
          setTemplateRecords(supportedTemplates);
        }
      } catch {
        window.localStorage.removeItem(templateStorageKey);
      }
    }

    setTemplatesHydrated(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("printops-theme", darkTheme ? "dark" : "light");
  }, [darkTheme]);

  useEffect(() => {
    window.localStorage.setItem(workspaceAccentStorageKey, workspaceAccent);
  }, [workspaceAccent]);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.printopsAccent = workspaceAccent;
    root.dataset.printopsTheme = darkTheme ? "dark" : "light";

    return () => {
      delete root.dataset.printopsAccent;
      delete root.dataset.printopsTheme;
    };
  }, [darkTheme, workspaceAccent]);

  useEffect(() => {
    window.localStorage.setItem("printops-sidebar-v1", sidebarCollapsed ? "collapsed" : "expanded");
  }, [sidebarCollapsed]);

  useEffect(() => {
    window.localStorage.setItem(siteLocaleStorageKey, siteLocale);
  }, [siteLocale]);

  useEffect(() => {
    window.localStorage.setItem(printLocaleStorageKey, language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(timezoneStorageKey, timezone);
  }, [timezone]);

  useEffect(() => {
    if (templatesHydrated) {
      window.localStorage.setItem(templateStorageKey, JSON.stringify(templateRecords));
    }
  }, [templateRecords, templatesHydrated]);

  useEffect(() => {
    if (!pluginContext?.instanceId || !pluginContext.storeProfileEndpoint) {
      return;
    }

    void loadStoreProfile("refresh");
  }, [pluginContext?.instanceId, pluginContext?.storeProfileEndpoint]);

  useEffect(() => {
    if (!templatesHydrated || !storeProfile || storeProfileDefaultsApplied) {
      return;
    }

    const profileLanguage = resolveProfilePrintLocale(storeProfile.language ?? storeProfile.locale);
    const profileTimezone = resolveProfileTimezone(storeProfile.timezone);

    setTemplateRecords((currentTemplates) => applyStoreProfileDefaultsToTemplates(currentTemplates, storeProfile));

    if (profileLanguage && language === defaultPrintLocale) {
      setLanguage(profileLanguage);
    }

    if (profileTimezone && timezone === "Asia/Shanghai") {
      setTimezone(profileTimezone);
    }

    setStoreProfileDefaultsApplied(true);
  }, [language, storeProfile, storeProfileDefaultsApplied, templatesHydrated, timezone]);

  useEffect(() => {
    if (!pluginContext) {
      return;
    }

    if (pluginContext.instanceId) {
      void loadCachedOrders();
    }
  }, [pluginContext?.instanceId, pluginContext?.ordersEndpoint]);

  useEffect(() => {
    if (displayOrders.length === 0) {
      if (selectedIds.length > 0) {
        setSelectedIds([]);
      }
      return;
    }

    const availableIds = new Set(displayOrders.map((order) => order.id));
    const nextSelectedIds = selectedIds.filter((orderId) => availableIds.has(orderId));

    if (nextSelectedIds.length !== selectedIds.length) {
      setSelectedIds(nextSelectedIds);
    }
  }, [displayOrders, selectedIds]);

  function toggleOrder(orderId: string, checked: boolean) {
    setSelectedIds((current) => (checked ? [...new Set([...current, orderId])] : current.filter((id) => id !== orderId)));
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? displayOrders.map((order) => order.id) : []);
  }

  function toggleOrderFilter(filter: keyof typeof orderFilters) {
    setOrderFilters((currentFilters) => ({
      ...currentFilters,
      [filter]: !currentFilters[filter],
    }));
  }

  function selectOrders(orders: Order[]) {
    setSelectedIds(orders.map((order) => order.id));
  }

  function openOrdersPreview(orders: Order[]) {
    if (orders.length === 0) {
      return;
    }

    selectOrders(orders);
    setDrawerOpen(true);
  }

  function requestOrderExport(action: OrderActionRequest["action"], orders: Order[]) {
    if (orders.length === 0) {
      return;
    }

    setOrderActionRequest({
      action,
      id: Date.now(),
      orders,
    });
  }

  async function markOrdersAsPrinted(orderIds: string[]) {
    if (orderIds.length === 0) {
      return;
    }

    const sourceOrderIds = [...new Set(orderIds)];
    const printableIds = new Set(sourceOrderIds);
    setCachedOrders((currentOrders) => currentOrders.map((order) => (printableIds.has(order.id) ? { ...order, print: "Printed" } : order)));

    if (!pluginContext?.ordersEndpoint) {
      return;
    }

    try {
      const response = await fetch(pluginContext.ordersEndpoint, {
        body: JSON.stringify({
          printStatus: "printed",
          sourceOrderIds,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        ok?: boolean;
        printStatus?: {
          reason?: string;
          status?: "persisted" | "skipped" | "error";
          updatedCount?: number;
        };
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error ?? payload?.printStatus?.reason ?? `Print status update failed with ${response.status}`);
      }

      void loadCachedOrders();
    } catch (error) {
      setOrderCacheStatus((currentStatus) => ({
        ...currentStatus,
        error: error instanceof Error ? error.message : "Failed to save print status",
        status: "error",
      }));
    }
  }

  function updateWorkspaceView(view: PrintOpsView, href: string) {
    setActiveView(view);

    if (href && href !== "#") {
      const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (href !== currentHref) {
        window.history.pushState({ printOpsView: view }, "", href);
      }
    }
  }

  function switchWorkspaceView(view: PrintOpsView, href: string, event: MouseEvent<HTMLAnchorElement>) {
    setMobileSidebarOpen(false);

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    updateWorkspaceView(view, href);
  }

  function patchTemplateDraft(patch: Partial<TemplateDraft>) {
    setTemplateDraft((current) => ({ ...current, ...patch }));
  }

  function openCreateTemplate() {
    setTemplateEditorMode("create");
    setTemplateDraft(createTemplateDraftWithStoreProfile(storeProfile));
    setTemplateEditorOpen(true);
  }

  function openTemplateEditor(templateRecord: TemplateRecord) {
    const mode: TemplateEditorMode = templateRecord.source === "Built-in" ? "duplicate" : "edit";

    setTemplateEditorMode(mode);
    setTemplateDraft(createDraftFromTemplate(templateRecord, mode));
    setTemplateEditorOpen(true);
  }

  function saveTemplateDraft() {
    const existingTemplate = templateRecords.find((templateRecord) => templateRecord.id === templateDraft.id);
    const savedTemplate = createTemplateRecordFromDraft(templateDraft, templateEditorMode === "edit" ? existingTemplate : undefined);

    setTemplateRecords((currentTemplates) => {
      if (templateEditorMode === "edit" && existingTemplate) {
        return currentTemplates.map((templateRecord) => (templateRecord.id === existingTemplate.id ? savedTemplate : templateRecord));
      }

      return [savedTemplate, ...currentTemplates];
    });
    setTemplateTab("mine");
    setSelectedTemplateId(savedTemplate.id);
    setTemplateEditorOpen(false);
  }

  function setDefaultTemplate(templateId: string) {
    setTemplateRecords((currentTemplates) =>
      currentTemplates.map((templateRecord) => ({
        ...templateRecord,
        isDefault: templateRecord.id === templateId,
      })),
    );
    setSelectedTemplateId(templateId);
  }

  function deleteTemplate(templateId: string) {
    setTemplateRecords((currentTemplates) => {
      const targetTemplate = currentTemplates.find((templateRecord) => templateRecord.id === templateId);

      if (!targetTemplate || targetTemplate.source === "Built-in") {
        return currentTemplates;
      }

      const storeTemplates = currentTemplates.filter((templateRecord) => templateRecord.source === "Store copy");

      if (storeTemplates.length <= 1) {
        return currentTemplates;
      }

      const remainingTemplates = currentTemplates.filter((templateRecord) => templateRecord.id !== templateId);

      if (remainingTemplates.some((templateRecord) => templateRecord.isDefault)) {
        return remainingTemplates;
      }

      const nextDefault =
        remainingTemplates.find((templateRecord) => templateRecord.source === "Store copy" && templateRecord.documentType === targetTemplate.documentType) ??
        remainingTemplates.find((templateRecord) => templateRecord.source === "Store copy");

      return remainingTemplates.map((templateRecord) => ({
        ...templateRecord,
        isDefault: templateRecord.id === nextDefault?.id,
      }));
    });

    setSelectedTemplateId((currentTemplateId) => {
      if (currentTemplateId !== templateId) {
        return currentTemplateId;
      }

      const fallbackTemplate =
        templateRecords.find((templateRecord) => templateRecord.id !== templateId && templateRecord.source === "Store copy") ??
        templateRecords.find((templateRecord) => templateRecord.id !== templateId) ??
        templateRecords[0];

      return fallbackTemplate?.id ?? currentTemplateId;
    });
  }

  async function syncWixOrders(mode: "latest" | "history") {
    if (!pluginContext?.instanceId) {
      setWixSyncStatus((current) => ({
        ...current,
        error: messages.wixSync.missingInstance,
        mode,
        status: "error",
      }));
      return;
    }

    setWixSyncStatus((current) => ({ ...current, error: null, mode, status: "syncing" }));

    try {
      const response = await fetch(pluginContext.syncEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          historyDays: mode === "history" ? 7 : undefined,
          mode,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        orders?: WixSyncOrderSummary[];
        persistence?: {
          persistedCount?: number;
          reason?: string;
          status?: "persisted" | "skipped" | "error";
        };
        sync?: {
          customFieldCount?: number;
          orderCount?: number;
          window?: { from: string; to: string };
        };
      } | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? `Wix sync request failed with ${response.status}`);
      }

      const persistence = payload.persistence ?? null;

      setWixSyncStatus({
        customFieldCount: payload.sync?.customFieldCount ?? 0,
        error: null,
        mode,
        orderCount: payload.sync?.orderCount ?? 0,
        orders: payload.orders ?? [],
        persistence,
        status: "success",
        window: payload.sync?.window ?? null,
      });
      const syncedOrders = (payload.orders ?? []).map((order) => mapWixSyncOrderToOrder(order));

      if (syncedOrders.length > 0) {
        setCachedOrders(syncedOrders);
      }

      if (!persistence || persistence.status === "persisted") {
        void loadCachedOrders();
      }

      void loadStoreProfile("cache");
    } catch (error) {
      setWixSyncStatus((current) => ({
        ...current,
        error: error instanceof Error ? error.message : messages.wixSync.failed,
        mode,
        status: "error",
      }));
    }
  }

  async function loadStoreProfile(mode: "cache" | "refresh" = "cache") {
    if (!pluginContext?.instanceId || !pluginContext.storeProfileEndpoint) {
      return;
    }

    setStoreProfileStatus((current) => ({
      ...current,
      error: null,
      status: current.status === "loaded" ? "loaded" : "loading",
    }));

    try {
      const response = await fetch(pluginContext.storeProfileEndpoint, {
        method: mode === "refresh" ? "POST" : "GET",
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        profile?: PrintOpsStoreProfileSummary | null;
        source?: "cache" | "wix";
        warning?: string;
      } | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? `PrintOps store profile request failed with ${response.status}`);
      }

      setStoreProfile(payload.profile ?? null);
      setStoreProfileStatus({
        error: payload.warning ?? null,
        source: payload.source ?? null,
        status: "loaded",
      });
    } catch (error) {
      setStoreProfileStatus({
        error: error instanceof Error ? error.message : "Failed to load PrintOps store profile",
        source: null,
        status: "error",
      });
    }
  }

  async function loadCachedOrders() {
    if (!pluginContext?.instanceId) {
      setOrderCacheStatus({
        error: messages.wixSync.missingInstance,
        orderCount: 0,
        status: "error",
      });
      return;
    }

    setOrderCacheStatus((current) => ({
      ...current,
      error: null,
      status: current.status === "loaded" ? "loaded" : "loading",
    }));

    try {
      const response = await fetch(pluginContext.ordersEndpoint);
      const payload = (await response.json().catch(() => null)) as {
        cache?: {
          orderCount?: number;
          reason?: string | null;
          status?: "loaded" | "skipped" | "error";
        };
        error?: string;
        orders?: PrintOpsCachedOrderSummary[];
      } | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? `PrintOps order cache request failed with ${response.status}`);
      }

      const mappedOrders = (payload.orders ?? []).map(mapCachedPrintOpsOrderToOrder);

      setCachedOrders(mappedOrders);
      setOrderCacheStatus({
        error: payload.cache?.reason ?? null,
        orderCount: payload.cache?.orderCount ?? mappedOrders.length,
        status: payload.cache?.status ?? "loaded",
      });
    } catch (error) {
      setOrderCacheStatus({
        error: error instanceof Error ? error.message : "Failed to load PrintOps orders",
        orderCount: 0,
        status: "error",
      });
    }
  }

  return (
    <main
      className={styles.shell}
      data-mobile-sidebar={mobileSidebarOpen ? "open" : "closed"}
      data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
      data-accent={workspaceAccent}
      data-theme={darkTheme ? "dark" : "light"}
      dir={getLocaleDirection(siteLocale)}
      lang={siteLocale}
    >
      <aside className={styles.sidebar} aria-label="PrintOps">
        <div className={styles.brandRow}>
          <a className={styles.logo} href="/" aria-label="Zider workspace">
            Z
          </a>
          <div className={styles.brandCopy}>
            <strong>{messages.app.name}</strong>
            <span>{messages.app.scope}</span>
          </div>
          <button
            className={styles.iconButton}
            type="button"
            aria-label={mobileSidebarOpen ? "Close menu" : sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={mobileSidebarOpen ? "Close menu" : sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => {
              if (mobileSidebarOpen) {
                setMobileSidebarOpen(false);
                return;
              }
              setSidebarCollapsed((current) => !current);
            }}
          >
            {mobileSidebarOpen ? <X size={18} aria-hidden /> : sidebarCollapsed ? <PanelLeftOpen size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
          </button>
        </div>
        <nav className={styles.nav} aria-label="PrintOps navigation">
          {navigationSections.map((section) => (
            <div className={styles.navSection} key={section.label}>
              <p className={styles.navSectionTitle}>{section.label}</p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.view === activeView;
                return (
                  <a
                    aria-current={isActive ? "page" : undefined}
                    className={styles.navItem}
                    data-active={isActive}
                    href={item.href}
                    key={item.label}
                    onClick={(event) => {
                      if (item.view !== "orders" && item.view !== "templates" && item.view !== "settings") {
                        setMobileSidebarOpen(false);
                        return;
                      }

                      switchWorkspaceView(item.view, item.href, event);
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className={styles.navIcon}>
                      <Icon size={19} aria-hidden />
                    </span>
                    <span>{item.label}</span>
                    {item.count ? <strong className={styles.navCount}>{item.count}</strong> : null}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <button className={styles.mobileSidebarBackdrop} type="button" aria-label="Close menu" onClick={() => setMobileSidebarOpen(false)} />

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.topbarMain}>
            <button className={styles.mobileMenuButton} type="button" aria-label="Open menu" onClick={() => setMobileSidebarOpen(true)}>
              <MenuIcon size={20} aria-hidden />
            </button>
            <button className={styles.globalSearch} type="button">
              <Search size={17} aria-hidden />
              <span>{searchLabel}</span>
              <kbd>⌘ K</kbd>
            </button>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.roundAction} type="button" aria-label={messages.topbar.notifications} title={messages.topbar.notifications}>
              <BellRing size={18} aria-hidden />
              {hasUnreadProductUpdates ? <span aria-hidden /> : null}
            </button>
            <button className={styles.profileButton} type="button">
              <span className={styles.avatar}>{workspaceStoreInitials}</span>
              <span>
                <strong>{workspaceStoreName}</strong>
                <small>{workspaceStoreScope}</small>
              </span>
              <ChevronDown size={15} aria-hidden />
            </button>
          </div>
        </header>

        <section className={styles.titleRow}>
          <div>
            <p className={styles.kicker}>Zider PrintOps</p>
            <h1>{pageTitle}</h1>
            <span className={styles.titleDescription}>{pageDescription}</span>
          </div>
          {pageMetrics.length > 0 ? (
            <div className={styles.metrics} aria-label="PrintOps summary">
              {pageMetrics.map((metric) => (
                <Metric key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
              ))}
            </div>
          ) : null}
        </section>

        {activeView === "settings" ? (
          <SettingsCenter
            accentColor={workspaceAccent}
            darkTheme={darkTheme}
            messages={messages}
            onAccentColorChange={setWorkspaceAccent}
            onPrintLanguageChange={setLanguage}
            onSiteLocaleChange={setSiteLocale}
            onThemeChange={setDarkTheme}
            onTimezoneChange={setTimezone}
            printLanguage={language}
            printLanguageOptions={printLanguageOptions}
            siteLocale={siteLocale}
            timezone={timezone}
          />
        ) : activeView === "templates" ? (
          <TemplateCenter
            documentFilter={templateDocumentFilter}
            filteredTemplates={filteredTemplates}
            onDocumentFilterChange={setTemplateDocumentFilter}
            onSearchChange={setTemplateSearch}
            onSelectedTemplateChange={setSelectedTemplateId}
            onTabChange={setTemplateTab}
            onCreateTemplate={openCreateTemplate}
            onDeleteTemplate={deleteTemplate}
            onEditTemplate={openTemplateEditor}
            messages={messages}
            onSetDefaultTemplate={setDefaultTemplate}
            search={templateSearch}
            selectedTemplate={selectedTemplate}
            storeTemplateCount={storeTemplateCount}
            tab={templateTab}
          />
        ) : (
          <>
            {pluginContext ? (
              <>
                <WixSyncPanel context={pluginContext} messages={messages} onSync={syncWixOrders} status={wixSyncStatus} />
                <WixOrderCacheNotice messages={messages} status={orderCacheStatus} />
              </>
            ) : null}
            <div className={styles.mainGrid}>
          <section className={styles.ordersPanel}>
            <div className={styles.filterBar}>
            <label className={styles.search}>
              <Search size={17} aria-hidden />
              <input
                aria-label="Search orders, customer, or SKU"
                onChange={(event) => setOrderSearch(event.currentTarget.value)}
                placeholder="Search orders, customer, SKU"
                value={orderSearch}
              />
            </label>
              <FilterChip label="30 days" active={orderFilters.last30Days} onClick={() => toggleOrderFilter("last30Days")} />
              <FilterChip label="Unfulfilled" active={orderFilters.unfulfilled} onClick={() => toggleOrderFilter("unfulfilled")} />
              <FilterChip label="Unprinted" active={orderFilters.unprinted} onClick={() => toggleOrderFilter("unprinted")} />
            </div>

            <div className={styles.tableToolbar}>
              <div className={styles.bulkState}>
                {displayOrders.length > 0 ? (
                  <BaseCheckbox
                    checked={selectedCount === displayOrders.length}
                    indeterminate={selectedCount > 0 && selectedCount < displayOrders.length}
                    label={messages.orderPanel.selectAll}
                    onCheckedChange={toggleAll}
                  />
                ) : null}
                <span>
                  {selectedCount} {messages.orderPanel.selectedOrders}
                </span>
              </div>
              <div className={styles.bulkActions}>
                <button className={styles.secondaryButton} type="button" disabled={selectedOrders.length === 0} onClick={() => openOrdersPreview(selectedOrders)}>
                  <Eye size={16} aria-hidden />
                  {messages.orderPanel.previewBatch}
                </button>
                <button className={styles.secondaryButton} type="button" disabled={selectedOrders.length === 0} onClick={() => requestOrderExport("download", selectedOrders)}>
                  <Download size={16} aria-hidden />
                  {messages.orderPanel.downloadPdf}
                </button>
                <button className={styles.secondaryButton} type="button" disabled={selectedOrders.length === 0} onClick={() => requestOrderExport("print", selectedOrders)}>
                  <Printer size={16} aria-hidden />
                  {messages.orderPanel.printPreview}
                </button>
                <button className={styles.secondaryButton} type="button" disabled={selectedOrders.length === 0} onClick={() => void markOrdersAsPrinted(selectedOrders.map((order) => order.id))}>
                  <CheckCircle2 size={16} aria-hidden />
                  {messages.orderPanel.markAsPrinted}
                </button>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th aria-label="Select order" />
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Fulfillment</th>
                    <th>Print</th>
                    <th>Template</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {displayOrders.length > 0 ? (
                    displayOrders.map((order) => {
                      const isSelected = selectedIds.includes(order.id);

                      return (
                        <tr
                          data-selected={isSelected}
                          key={order.id}
                          onClick={(event) => {
                            const target = event.target as HTMLElement;

                            if (target.closest("button,a,input,label,[role='menuitem'],[data-ignore-row-select='true']")) {
                              return;
                            }

                            toggleOrder(order.id, !isSelected);
                          }}
                        >
                          <td>
                            <BaseCheckbox
                              checked={isSelected}
                              label={`Select order ${order.number}`}
                              onCheckedChange={(checked) => toggleOrder(order.id, checked)}
                            />
                          </td>
                          <td>
                            <strong>{order.number}</strong>
                            <span>{order.date}</span>
                          </td>
                          <td>
                            <strong>{order.customer}</strong>
                            <span>{order.email}</span>
                          </td>
                          <td>
                            <span>{order.items}</span>
                            <small>{order.total}</small>
                          </td>
                          <td>
                            <StatusPill value={order.payment} />
                          </td>
                          <td>
                            <StatusPill value={order.fulfillment} />
                          </td>
                          <td>
                            <StatusPill value={order.print} />
                            {order.warning ? <small className={styles.warningText}>{order.warning}</small> : null}
                          </td>
                          <td>
                            <strong>{order.template}</strong>
                            <span>{order.language}</span>
                          </td>
                          <td>
                            <div className={styles.rowActions} data-ignore-row-select="true">
                              <button
                                aria-label={`${messages.orderPanel.downloadPdf}: ${order.number}`}
                                className={styles.rowActionButton}
                                title={messages.orderPanel.downloadPdf}
                                type="button"
                                onClick={() => requestOrderExport("download", [order])}
                              >
                                <Download size={15} aria-hidden />
                                <span>{messages.orderPanel.pdfAction}</span>
                              </button>
                              <button
                                aria-label={`${messages.orderPanel.printPreview}: ${order.number}`}
                                className={styles.rowActionButton}
                                title={messages.orderPanel.printPreview}
                                type="button"
                                onClick={() => requestOrderExport("print", [order])}
                              >
                                <Printer size={15} aria-hidden />
                                <span>{messages.orderPanel.printAction}</span>
                              </button>
                              <OrderMenu
                                messages={messages}
                                onMarkPrinted={() => void markOrdersAsPrinted([order.id])}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9}>
                        <div className={styles.emptyOrdersState}>
                          <strong>{cachedOrders.length > 0 ? messages.orders.emptyFilterTitle : messages.orders.emptyTitle}</strong>
                          <span>
                            {cachedOrders.length > 0
                              ? messages.orders.emptyFilterDescription
                              : pluginContext
                                ? messages.orders.emptySyncedDescription
                                : messages.orders.emptyDescription}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
            <OrderExportController
              actionRequest={orderActionRequest}
              onActionHandled={() => setOrderActionRequest(null)}
              printLocale={language}
              selectedOrders={selectedOrders}
              templateRecord={defaultOrderTemplate}
            />
          </>
        )}
      </section>

      <TemplateEditorDrawer
        draft={templateDraft}
        messages={messages}
        mode={templateEditorMode}
        onDraftChange={patchTemplateDraft}
        onOpenChange={setTemplateEditorOpen}
        onSave={saveTemplateDraft}
        open={templateEditorOpen}
        printLanguageOptions={printLanguageOptions}
        siteLocale={siteLocale}
        storeProfile={storeProfile}
        storeProfileStatus={storeProfileStatus}
      />

      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Backdrop className={styles.drawerBackdrop} />
          <Drawer.Viewport className={styles.drawerViewport}>
            <Drawer.Popup className={styles.drawerPopup}>
              <div className={styles.drawerHeader}>
                <div>
                  <Drawer.Title className={styles.drawerTitle}>{messages.drawer.batchPrint}</Drawer.Title>
                  <Drawer.Description className={styles.drawerDescription}>
                    {selectedCount} {messages.drawer.selectedOrders}
                  </Drawer.Description>
                </div>
                <Drawer.Close className={styles.iconButton} aria-label="Close batch print">
                  <X size={18} aria-hidden />
                </Drawer.Close>
              </div>

              <div className={styles.drawerGrid}>
                <section className={styles.drawerControls}>
                  <SelectField label={messages.drawer.documentType} options={templates} value={template} onValueChange={setTemplate} />
                  <SelectField
                    label={messages.drawer.printLanguage}
                    options={printLanguageOptions}
                    value={language}
                    onValueChange={(value) => isPrintLocale(value) && setLanguage(value)}
                  />
                  <label className={styles.fieldGroup}>
                    <span>{messages.drawer.paperSize}</span>
                    <input className={styles.textInput} readOnly value="A4" />
                  </label>

                  <div className={styles.drawerActions}>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={() => document.querySelector<HTMLButtonElement>('[data-preview-id="drawer"][data-preview-action="download"]')?.click()}
                    >
                      <FileText size={17} aria-hidden />
                      {messages.drawer.generatePdf}
                    </button>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => document.querySelector<HTMLButtonElement>('[data-preview-id="drawer"][data-preview-action="print"]')?.click()}
                    >
                      <Printer size={17} aria-hidden />
                      {messages.drawer.browserPrint}
                    </button>
                  </div>
                </section>

                <section className={styles.drawerPreview}>
                  <PrintPreview compact previewId="drawer" printLocale={language} selectedOrders={selectedOrders} templateRecord={defaultOrderTemplate} />
                </section>
              </div>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </main>
  );
}

function SettingsCenter({
  accentColor,
  darkTheme,
  messages,
  onAccentColorChange,
  onPrintLanguageChange,
  onSiteLocaleChange,
  onThemeChange,
  onTimezoneChange,
  printLanguage,
  printLanguageOptions,
  siteLocale,
  timezone,
}: {
  accentColor: WorkspaceAccent;
  darkTheme: boolean;
  messages: PrintOpsMessages;
  onAccentColorChange: (value: WorkspaceAccent) => void;
  onPrintLanguageChange: (value: PrintLocale) => void;
  onSiteLocaleChange: (value: SiteLocale) => void;
  onThemeChange: (value: boolean) => void;
  onTimezoneChange: (value: string) => void;
  printLanguage: PrintLocale;
  printLanguageOptions: { label: string; value: string }[];
  siteLocale: SiteLocale;
  timezone: string;
}) {
  const [activeSettingsTab, setActiveSettingsTab] = useState<"appearance" | "preferences">("appearance");
  const isAppearanceSettings = activeSettingsTab === "appearance";
  const accentLabels: Record<WorkspaceAccent, string> = {
    forest: messages.settings.accentForest,
    blue: messages.settings.accentBlue,
    violet: messages.settings.accentViolet,
    red: messages.settings.accentRed,
    amber: messages.settings.accentAmber,
  };
  const previewDate = useMemo(() => {
    const date = new Date("2026-05-30T10:30:00.000Z");

    return {
      date: new Intl.DateTimeFormat(siteLocale, {
        dateStyle: "medium",
        timeZone: timezone,
      }).format(date),
      time: new Intl.DateTimeFormat(siteLocale, {
        timeStyle: "short",
        timeZone: timezone,
      }).format(date),
    };
  }, [siteLocale, timezone]);

  return (
    <div className={styles.settingsLayout}>
      <aside className={styles.settingsMenuCard} aria-label={messages.pages.settingsTitle}>
        <button
          className={styles.settingsMenuItem}
          data-active={isAppearanceSettings}
          onClick={() => setActiveSettingsTab("appearance")}
          type="button"
        >
          <Settings size={18} aria-hidden />
          <strong>{messages.settings.appearanceLanguage}</strong>
        </button>
        <button
          className={styles.settingsMenuItem}
          data-active={!isAppearanceSettings}
          onClick={() => setActiveSettingsTab("preferences")}
          type="button"
        >
          <Globe size={18} aria-hidden />
          <strong>{messages.settings.preferences}</strong>
        </button>
      </aside>

      <section className={styles.settingsContent}>
        <div className={styles.settingsCard}>
          <div className={styles.settingsCardHeader}>
            <span className={styles.settingsIconBubble}>
              {isAppearanceSettings ? <Settings size={20} aria-hidden /> : <Globe size={20} aria-hidden />}
            </span>
            <div>
              <h2>{isAppearanceSettings ? messages.settings.appearanceLanguage : messages.settings.preferences}</h2>
              <p>{isAppearanceSettings ? messages.settings.appearanceLanguageDescription : messages.settings.preferencesDescription}</p>
            </div>
          </div>

          {isAppearanceSettings ? (
            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionHeader}>
                <strong>{messages.settings.theme}</strong>
                <span>{messages.settings.themeDescription}</span>
              </div>
              <div className={styles.themeCardGrid}>
                <button className={styles.themeOptionCard} data-active={!darkTheme} type="button" onClick={() => onThemeChange(false)}>
                  <span className={styles.themePreview} data-theme-card="light" />
                  <strong>{messages.settings.lightTheme}</strong>
                  {!darkTheme ? <small>{messages.settings.activeTheme}</small> : null}
                </button>
                <button className={styles.themeOptionCard} data-active={darkTheme} type="button" onClick={() => onThemeChange(true)}>
                  <span className={styles.themePreview} data-theme-card="dark" />
                  <strong>{messages.settings.darkTheme}</strong>
                  {darkTheme ? <small>{messages.settings.activeTheme}</small> : null}
                </button>
              </div>
              <div className={styles.accentSwatchRow} aria-label={messages.settings.accentColor}>
                <span>{messages.settings.accentColor}</span>
                <div className={styles.accentSwatches}>
                  {workspaceAccentOptions.map((option) => (
                    <button
                      aria-label={accentLabels[option.value]}
                      className={styles.accentSwatch}
                      data-active={accentColor === option.value}
                      data-color={option.value}
                      key={option.value}
                      onClick={() => onAccentColorChange(option.value)}
                      style={{ "--swatch-color": option.color } as CSSProperties}
                      title={accentLabels[option.value]}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionHeader}>
                <strong>{messages.settings.languageRegion}</strong>
                <span>{messages.settings.timezoneDescription}</span>
              </div>
              <div className={styles.settingsTwoColumns}>
                <SelectField
                  label={messages.settings.interfaceLanguage}
                  options={siteLocaleOptions}
                  value={siteLocale}
                  onValueChange={(value) => isSiteLocale(value) && onSiteLocaleChange(value)}
                />
                <SelectField
                  label={messages.settings.defaultPrintLanguage}
                  options={printLanguageOptions}
                  value={printLanguage}
                  onValueChange={(value) => isPrintLocale(value) && onPrintLanguageChange(value)}
                />
                <SelectField label={messages.settings.timezone} options={timezoneOptions} value={timezone} onValueChange={onTimezoneChange} />
              </div>
              <div className={styles.regionalPreviewBox}>
                <span>{messages.settings.regionalPreview}</span>
                <strong>
                  {messages.settings.previewDate}: {previewDate.date}
                </strong>
                <strong>
                  {messages.settings.previewTime}: {previewDate.time}
                </strong>
                <small>{messages.settings.previewNote}</small>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function WixSyncPanel({
  context,
  messages,
  onSync,
  status,
}: {
  context: PrintOpsPluginContext;
  messages: PrintOpsMessages;
  onSync: (mode: "latest" | "history") => Promise<void>;
  status: WixSyncStatus;
}) {
  const hasInstance = Boolean(context.instanceId);
  const statusLabel = hasInstance ? (context.verified ? messages.wixSync.connected : messages.wixSync.devMode) : messages.wixSync.missingInstance;
  const statusTone = hasInstance ? (context.verified ? "good" : "warn") : "warn";
  const syncMessage =
    status.status === "syncing"
      ? messages.wixSync.syncing
      : status.status === "success"
        ? messages.wixSync.synced
        : status.status === "error"
          ? messages.wixSync.failed
          : messages.wixSync.ready;

  return (
    <section className={styles.syncPanel} data-tone={statusTone}>
      <div className={styles.syncMain}>
        <span className={styles.syncIcon}>
          {status.status === "error" ? <AlertTriangle size={18} aria-hidden /> : <CheckCircle2 size={18} aria-hidden />}
        </span>
        <div>
          <div className={styles.syncTitle}>
            <strong>{messages.wixSync.title}</strong>
            <span>{statusLabel}</span>
          </div>
          <p>{messages.wixSync.description}</p>
          <small data-state={status.status}>{status.error ?? syncMessage}</small>
        </div>
      </div>

      <div className={styles.syncActions}>
        <button className={styles.secondaryButton} type="button" disabled={!hasInstance || status.status === "syncing"} onClick={() => onSync("latest")}>
          {messages.wixSync.syncLatest}
        </button>
        <button className={styles.primaryButton} type="button" disabled={!hasInstance || status.status === "syncing"} onClick={() => onSync("history")}>
          {messages.wixSync.syncHistory}
        </button>
      </div>

      {status.status === "success" ? (
        <div className={styles.syncResult}>
          <span>
            <strong>{status.orderCount}</strong> {messages.wixSync.ordersSynced}
          </span>
          <span>
            <strong>{status.customFieldCount}</strong> {messages.wixSync.customFieldsFound}
          </span>
          {status.window ? (
            <span>
              {messages.wixSync.window}: {formatSyncDate(status.window.from)} - {formatSyncDate(status.window.to)}
            </span>
          ) : null}
          {status.orders.length > 0 ? (
            <span>
              {messages.wixSync.syncedOrders}: {status.orders.slice(0, 3).map(formatSyncedOrder).join(", ")}
            </span>
          ) : null}
          {status.persistence?.status === "persisted" ? (
            <span data-tone="good">
              <strong>{status.persistence.persistedCount ?? status.orderCount}</strong> {messages.wixSync.cachePersisted}
            </span>
          ) : null}
          {status.persistence && status.persistence.status !== "persisted" ? (
            <span data-tone="warning">
              {messages.wixSync.cacheNotPersisted}: {status.persistence.reason ?? status.persistence.status}
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function WixOrderCacheNotice({ messages, status }: { messages: PrintOpsMessages; status: OrderCacheStatus }) {
  if (status.status === "idle" || status.status === "loading") {
    return null;
  }

  return (
    <div className={styles.syncResult} data-cache-status={status.status}>
      {status.status === "loaded" ? (
        <span>
          <strong>{status.orderCount}</strong> {messages.wixSync.cachedOrdersLoaded}
        </span>
      ) : (
        <span>{status.error ?? messages.wixSync.cacheUnavailable}</span>
      )}
    </div>
  );
}

function formatSyncedOrder(order: WixSyncOrderSummary) {
  const itemCount = order.totalItemQuantity || order.lineItems.reduce((total, lineItem) => total + (lineItem.quantity ?? 0), 0);
  const customFieldCount = countWixOrderCustomFields(order);

  return `${order.orderNumber ?? order.sourceOrderId} (${itemCount || order.lineItems.length} items, ${customFieldCount} custom)`;
}

function formatSyncDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function orderMatchesSearch(order: Order, normalizedSearch: string) {
  const searchableValues = [
    order.number,
    order.customer,
    order.email,
    order.total,
    order.items,
    order.template,
    order.language,
    order.warning,
    order.sku,
    order.barcode,
    ...(order.customFields ?? []).flatMap((field) => [field.label, field.value]),
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedSearch));
}

function isOrderWithinLastDays(order: Order, days: number) {
  const timestamp = getOrderTimestamp(order);

  if (!timestamp) {
    return true;
  }

  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

function getOrderTimestamp(order: Order) {
  const rawValue = order.updatedAt ?? order.createdAt ?? null;

  if (!rawValue) {
    return null;
  }

  const timestamp = new Date(rawValue).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function mapCachedPrintStatus(value: string | null): Order["print"] {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized === "printed") {
    return "Printed";
  }

  if (normalized === "generated") {
    return "Generated";
  }

  if (normalized === "failed") {
    return "Failed";
  }

  return "Unprinted";
}

function mapCachedPrintOpsOrderToOrder(order: PrintOpsCachedOrderSummary): Order {
  const printStatus = mapCachedPrintStatus(order.printStatus);

  if (order.normalizedOrder) {
    const mappedOrder = mapWixSyncOrderToOrder(order.normalizedOrder, "cache");

    return {
      ...mappedOrder,
      createdAt: order.createdAt ?? mappedOrder.createdAt,
      date: formatOrderDate(order.updatedAt ?? order.createdAt ?? order.syncedAt),
      id: order.sourceOrderId,
      number: formatOrderNumber(order.orderNumber ?? mappedOrder.number),
      print: printStatus,
      printedAt: order.printedAt,
      printUpdatedAt: order.printUpdatedAt,
      total: order.totalFormatted ?? mappedOrder.total,
      updatedAt: order.updatedAt ?? mappedOrder.updatedAt,
      warning: mappedOrder.warning,
    };
  }

  return {
    createdAt: order.createdAt,
    customer: order.customerName ?? "Wix customer",
    date: formatOrderDate(order.updatedAt ?? order.createdAt ?? order.syncedAt),
    email: order.customerEmail ?? order.customerPhone ?? "No contact",
    fulfillment: mapFulfillmentStatus(order.fulfillmentStatus),
    id: order.sourceOrderId,
    items: `${order.totalItemQuantity || order.lineItemCount || 0} items`,
    language: "English",
    number: formatOrderNumber(order.orderNumber ?? order.sourceOrderId),
    payment: mapPaymentStatus(order.paymentStatus),
    print: printStatus,
    printedAt: order.printedAt,
    printUpdatedAt: order.printUpdatedAt,
    source: "cache",
    template: "Invoice",
    total: order.totalFormatted ?? formatMoney(order.totalAmount, order.currency),
    updatedAt: order.updatedAt,
    warning: undefined,
  };
}

function mapWixSyncOrderToOrder(order: WixSyncOrderSummary, source: Order["source"] = "sync"): Order {
  const firstLineItem = order.lineItems[0];
  const customerRecord = getRecord(order.customer);
  const customerName = getString(customerRecord?.name) ?? getString(customerRecord?.fullName) ?? "Wix customer";
  const customerEmail = getString(customerRecord?.email) ?? getString(customerRecord?.phone) ?? "No contact";
  const itemCount = order.totalItemQuantity || order.lineItems.reduce((total, lineItem) => total + (lineItem.quantity ?? 0), 0) || order.lineItems.length;
  const firstItemTitle = firstLineItem?.title ?? "Wix order item";
  const firstItemQuantity = firstLineItem?.quantity ?? 1;
  const customFields = collectWixOrderCustomFields(order);

  return {
    barcode: firstLineItem?.barcode ?? undefined,
    createdAt: order.createdAt,
    customFields,
    customer: customerName,
    date: formatOrderDate(order.updatedAt ?? order.createdAt),
    email: customerEmail,
    fulfillment: mapFulfillmentStatus(order.fulfillmentStatus ?? order.deliveryMethod),
    id: order.sourceOrderId,
    items: itemCount > firstItemQuantity ? `${firstItemTitle} + ${Math.max(itemCount - firstItemQuantity, 0)} more` : `${firstItemTitle} x ${firstItemQuantity}`,
    language: "English",
    number: formatOrderNumber(order.orderNumber ?? order.sourceOrderId),
    payment: mapPaymentStatus(order.paymentStatus ?? order.paymentMethod),
    print: "Unprinted",
    rawOrder: order,
    sku: firstLineItem?.sku ?? undefined,
    source,
    template: "Invoice",
    total: getOrderTotal(order) ?? "$0.00",
    updatedAt: order.updatedAt,
    warning: undefined,
  };
}

function countWixOrderCustomFields(order: WixSyncOrderSummary) {
  return collectWixOrderCustomFields(order).length;
}

function collectWixOrderCustomFields(order: WixSyncOrderSummary) {
  const fields: Array<{ label: string; value: string }> = [];

  order.customFields.forEach((field) => {
    const formatted = formatWixCustomField(field);

    if (formatted) {
      fields.push(formatted);
    }
  });

  order.lineItems.forEach((lineItem, index) => {
    const itemLabel = lineItem.title ?? `Line item ${index + 1}`;

    lineItem.customFields.forEach((field) => {
      const formatted = formatWixCustomField(field);

      if (formatted) {
        if (!isGenericWixOptionLabel(formatted.label)) {
          fields.push({
            label: `${itemLabel}: ${formatted.label}`,
            value: formatted.value,
          });
        }
      }
    });
  });

  return fields.slice(0, 8);
}

function formatWixCustomField(field: unknown, prefix?: string) {
  const record = getRecord(field);

  if (!record) {
    const value = formatCustomFieldValue(field);

    if (!value || isInternalWixCustomField("Custom field", value)) {
      return null;
    }

    return {
      label: prefix ? `${prefix}: Custom field` : "Custom field",
      value,
    };
  }

  const rawLabel =
    getString(record.label) ??
    getString(record.key) ??
    getString(record.name) ??
    getString(record.path) ??
    getString(record.optionName) ??
    getString(record.option) ??
    "Options";
  const optionName = getString(record.optionName) ?? getString(record.option);
  const value = formatCustomFieldValue(
    record.value ?? record.displayValue ?? record.formattedValue ?? record.text ?? record.selection ?? record.selectedValue ?? record.choice ?? record.name ?? record.label,
  );

  if (!value) {
    return null;
  }

  const label = formatCustomFieldLabel(optionName ?? rawLabel);

  if (isInternalWixCustomField(label, value)) {
    return null;
  }

  return {
    label: prefix ? `${prefix}: ${label}` : label,
    value,
  };
}

function formatCustomFieldValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return null;
    }

    if ((trimmedValue.startsWith("{") && trimmedValue.endsWith("}")) || (trimmedValue.startsWith("[") && trimmedValue.endsWith("]"))) {
      try {
        const parsedValue = JSON.parse(trimmedValue) as unknown;
        const formattedValue = formatCustomFieldValue(parsedValue);

        if (formattedValue) {
          return formattedValue;
        }
      } catch {
        return trimmedValue;
      }
    }

    return trimmedValue;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    const parts = value.map(formatCustomFieldValue).filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : null;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const directValue = getString(record.formatted) ?? getString(record.formattedValue) ?? getString(record.displayValue) ?? getString(record.text) ?? getString(record.value);

    if (directValue) {
      return formatCustomFieldValue(directValue);
    }

    const fieldParts = Object.entries(record)
      .map(([key, nestedValue]) => {
        if (isCustomFieldMetadataKey(key)) {
          return null;
        }

        const formattedValue = formatCustomFieldValue(nestedValue);

        if (!formattedValue || isInternalWixCustomField(key, formattedValue)) {
          return null;
        }

        return `${formatCustomFieldLabel(key)}: ${formattedValue}`;
      })
      .filter((part): part is string => Boolean(part));

    return fieldParts.length > 0 ? fieldParts.join(" / ") : null;
  }

  return null;
}

function formatCustomFieldLabel(label: string) {
  const normalizedLabel = label
    .replace(/[._-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();

  if (!normalizedLabel) {
    return "Custom field";
  }

  return normalizedLabel
    .split(/\s+/)
    .map((word) => {
      const upperWord = word.toUpperCase();

      if (["ID", "SKU", "VAT", "URL"].includes(upperWord)) {
        return upperWord;
      }

      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");
}

function normalizeCustomFieldKey(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isCustomFieldMetadataKey(key: string) {
  const normalizedKey = normalizeCustomFieldKey(key);

  return ["label", "name", "key", "path", "type", "typename", "formatted", "formattedvalue", "displayvalue", "text"].includes(normalizedKey);
}

function isGenericWixOptionLabel(label: string) {
  return ["option", "options", "itemoption", "itemoptions", "choice", "choices", "customfield"].includes(normalizeCustomFieldKey(label));
}

function isInternalWixCustomField(label: string, value: string) {
  const normalizedLabel = normalizeCustomFieldKey(label);
  const normalizedValue = value.trim();

  if (
    /variant.*id/.test(normalizedLabel) ||
    /lineitem.*id/.test(normalizedLabel) ||
    /source.*id/.test(normalizedLabel) ||
    /catalog.*reference/.test(normalizedLabel) ||
    /product.*id/.test(normalizedLabel) ||
    /option.*id/.test(normalizedLabel) ||
    /choice.*id/.test(normalizedLabel)
  ) {
    return true;
  }

  const isUuidValue = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedValue);

  return isUuidValue && (normalizedLabel === "id" || isGenericWixOptionLabel(label));
}

function getOrderTotal(order: WixSyncOrderSummary) {
  const totals = getRecord(order.totals);
  const total = getRecord(totals?.total);
  const formatted = getString(total?.formatted) ?? getString(total?.formattedAmount) ?? getString(total?.displayValue);
  const amount = getNumber(total?.amount ?? total?.value);
  const currency = getString(total?.currency) ?? order.currency;

  return formatted ?? formatMoney(amount, currency);
}

function formatOrderNumber(value: string | null) {
  if (!value) {
    return "Wix order";
  }

  return value.startsWith("#") ? value : `#${value}`;
}

function formatOrderDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function mapPaymentStatus(value: string | null): Order["payment"] {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("partial")) {
    return "Partially paid";
  }

  if (normalized.includes("unpaid") || normalized.includes("not_paid")) {
    return "Unpaid";
  }

  return "Paid";
}

function mapFulfillmentStatus(value: string | null): Order["fulfillment"] {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("pickup")) {
    return "Pickup";
  }

  if (normalized.includes("partial")) {
    return "Partial";
  }

  if (normalized.includes("ready") || normalized.includes("fulfilled") || normalized.includes("complete")) {
    return "Ready";
  }

  return "Unfulfilled";
}

function formatMoney(amount: number | null, currency: string | null) {
  if (amount === null) {
    return currency ? `${currency} 0.00` : "$0.00";
  }

  if (!currency) {
    return amount.toFixed(2);
  }

  try {
    return new Intl.NumberFormat(undefined, {
      currency,
      style: "currency",
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function getString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "warning" }) {
  return (
    <div className={styles.metric} data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TemplateToggleRow({
  checked,
  description,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.toggleRow}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <Switch.Root aria-label={label} checked={checked} className={styles.themeSwitch} onCheckedChange={onCheckedChange}>
        <Switch.Thumb className={styles.themeThumb} />
      </Switch.Root>
    </label>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button aria-pressed={Boolean(active)} className={styles.filterChip} data-active={active} type="button" onClick={onClick}>
      {label}
    </button>
  );
}

function BaseCheckbox({
  checked,
  indeterminate,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Checkbox.Root
      aria-label={label}
      checked={checked}
      className={styles.checkbox}
      indeterminate={indeterminate}
      onCheckedChange={onCheckedChange}
    >
      <Checkbox.Indicator className={styles.checkboxIndicator}>
        {indeterminate ? (
          <Minus color="#fff" size={15} strokeWidth={3} aria-hidden />
        ) : (
          <Check color="#fff" size={15} strokeWidth={3} aria-hidden />
        )}
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}

function SelectField({
  compact,
  icon,
  label,
  options,
  value,
  onValueChange,
}: {
  compact?: boolean;
  icon?: ReactNode;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <label className={styles.selectField} data-compact={compact}>
      <span>{label}</span>
      <Select.Root<string> value={value} onValueChange={(nextValue) => nextValue && onValueChange(nextValue)} items={options}>
        <Select.Trigger className={styles.selectTrigger}>
          {icon ? <span className={styles.selectIcon}>{icon}</span> : null}
          <Select.Value />
          <Select.Icon>
            <ChevronDown size={16} aria-hidden />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner className={styles.selectPositioner} sideOffset={6}>
            <Select.Popup className={styles.selectPopup}>
              {options.map((option) => (
                <Select.Item className={styles.selectItem} key={option.value} value={option.value}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className={styles.selectIndicator}>
                    <CheckCircle2 size={14} aria-hidden />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </label>
  );
}

function StatusPill({ value, label }: { value: string; label?: string }) {
  const tone =
    value === "Paid" || value === "Printed" || value === "Ready"
      ? "good"
      : value === "Generated" || value === "Partially paid" || value === "Partial"
        ? "warn"
        : "neutral";

  return (
    <span className={styles.statusPill} data-tone={tone}>
      {label ?? value}
    </span>
  );
}

function OrderMenu({
  messages,
  onMarkPrinted,
}: {
  messages: PrintOpsMessages;
  onMarkPrinted: () => void;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger className={styles.iconButton} aria-label="Order actions">
        <MoreHorizontal size={18} aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          align="end"
          className={styles.menuPositioner}
          collisionPadding={12}
          side="bottom"
          sideOffset={8}
        >
          <Menu.Popup className={styles.menuPopup}>
            <Menu.Item className={styles.menuItem} onClick={onMarkPrinted}>
              {messages.orderPanel.markAsPrinted}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function TemplateCenter({
  documentFilter,
  filteredTemplates,
  onDocumentFilterChange,
  onSearchChange,
  onSelectedTemplateChange,
  onTabChange,
  onCreateTemplate,
  onDeleteTemplate,
  onEditTemplate,
  messages,
  onSetDefaultTemplate,
  search,
  selectedTemplate,
  storeTemplateCount,
  tab,
}: {
  documentFilter: string;
  filteredTemplates: TemplateRecord[];
  onDocumentFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSelectedTemplateChange: (id: string) => void;
  onTabChange: (value: "mine" | "library") => void;
  onCreateTemplate: () => void;
  onDeleteTemplate: (id: string) => void;
  onEditTemplate: (templateRecord: TemplateRecord) => void;
  messages: PrintOpsMessages;
  onSetDefaultTemplate: (id: string) => void;
  search: string;
  selectedTemplate: TemplateRecord;
  storeTemplateCount: number;
  tab: "mine" | "library";
}) {
  const hasTemplates = filteredTemplates.length > 0;
  const isLibrary = tab === "library";
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRecord | null>(null);
  const localizedDocumentFilters = documentFilters.map((option) => ({
    ...option,
    label: option.value === "all" ? messages.templates.allDocuments : localizeTemplateDocumentType(option.value, messages),
  }));

  return (
    <div className={styles.templateGrid} data-detail="preview">
      <section className={styles.templatePanel}>
        <div className={styles.templateHeader}>
          <div className={styles.segmentedTabs} aria-label="Template source">
            <button data-active={tab === "mine"} type="button" onClick={() => onTabChange("mine")}>
              {messages.templates.myTemplates}
            </button>
            <button data-active={tab === "library"} type="button" onClick={() => onTabChange("library")}>
              {messages.templates.templateLibrary}
            </button>
          </div>
          <button className={styles.primaryButton} type="button" onClick={onCreateTemplate}>
            <LayoutTemplate size={17} aria-hidden />
            {messages.templates.createTemplate}
          </button>
        </div>

        <div className={styles.templateFilters}>
          <label className={styles.search}>
            <Search size={17} aria-hidden />
            <input
              aria-label="Search templates, scenario, or fields"
              placeholder={messages.templates.searchPlaceholder}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <SelectField compact label={messages.templates.document} options={localizedDocumentFilters} value={documentFilter} onValueChange={onDocumentFilterChange} />
        </div>

        <div className={styles.templateCards} data-mode={tab}>
          {hasTemplates ? (
            filteredTemplates.map((templateRecord) => {
              const localizedTemplate = getLocalizedTemplateRecord(templateRecord, messages);
              const isStoreTemplate = templateRecord.source === "Store copy";
              const canDeleteTemplate = isStoreTemplate && storeTemplateCount > 1;
              const canSetDefaultTemplate = isStoreTemplate && !templateRecord.isDefault && templateRecord.status === "Ready";
              const openTemplatePreview = () => {
                onSelectedTemplateChange(templateRecord.id);
                setPreviewTemplate(templateRecord);
              };

              return (
                <article
                  className={styles.templateCard}
                  data-mode={tab}
                  data-selected={templateRecord.id === selectedTemplate.id}
                  key={templateRecord.id}
                  role="button"
                  tabIndex={0}
                  onClick={openTemplatePreview}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) {
                      return;
                    }

                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openTemplatePreview();
                    }
                  }}
                >
                  {isLibrary ? (
                    <span className={styles.templateCardPreview} aria-hidden="true">
                      <TemplatePaperPreview
                        accentColor={templateRecord.accentColor}
                        addressFormat={templateRecord.addressFormat}
                        brandName={templateRecord.brandName}
                        dateFormat={templateRecord.dateFormat}
                        defaultLanguage={templateRecord.defaultLanguage}
                        density={templateRecord.density}
                        documentType={templateRecord.documentType}
                        footerContact={templateRecord.footerContact}
                        footerWebsite={templateRecord.footerWebsite}
                        labelOverrides={templateRecord.labelOverrides}
                        layoutPreset={templateRecord.layoutPreset}
                        logoImageUrl={templateRecord.logoImageUrl}
                        logoFont={templateRecord.logoFont}
                        logoFontSize={templateRecord.logoFontSize}
                        logoSource={templateRecord.logoSource}
                        logoText={templateRecord.logoText}
                        paperSize={templateRecord.paperSize}
                        showBillTo={templateRecord.showBillTo}
                        showContactFooter={templateRecord.showContactFooter}
                        showInvoiceMeta={templateRecord.showInvoiceMeta}
                        showItemOptions={templateRecord.showItemOptions}
                        showLogoText={templateRecord.showLogoText}
                        showNotes={templateRecord.showNotes}
                        showOrderBarcode={templateRecord.showOrderBarcode}
                        showPaymentMethod={templateRecord.showPaymentMethod}
                        showProductImages={templateRecord.showProductImages}
                        showShipTo={templateRecord.showShipTo}
                        showShippingMethod={templateRecord.showShippingMethod}
                        showSocialFooter={templateRecord.showSocialFooter}
                        showSku={templateRecord.showSku}
                        showStoreName={templateRecord.showStoreName}
                        showThankYou={templateRecord.showThankYou}
                        showTotals={templateRecord.showTotals}
                        customAccentColor={templateRecord.customAccentColor}
                        socialLinks={templateRecord.socialLinks}
                        socialProfiles={templateRecord.socialProfiles}
                        thankYouText={templateRecord.thankYouText}
                        variant="card"
                        visualStyle={templateRecord.visualStyle}
                      />
                    </span>
                  ) : null}
                  <span className={styles.templateCardContent}>
                    <span className={styles.templateCardTop}>
                      <strong>{localizedTemplate.name}</strong>
                      <StatusPill value={templateRecord.status} label={localizedTemplate.status} />
                    </span>
                    <span className={styles.templateCardDescription}>{localizedTemplate.description}</span>
                    <span className={styles.templateMeta}>
                      <small>{localizedTemplate.documentType}</small>
                      <small>{templateRecord.paperSize}</small>
                      <small>{localizedTemplate.audience}</small>
                    </span>
                    <span className={styles.templateCardFooter}>
                      <small>{localizedTemplate.updatedAt}</small>
                      <span className={styles.templateCardActions}>
                        {templateRecord.isDefault ? <strong className={styles.defaultBadge}>{messages.templates.default}</strong> : null}
                        <button
                          className={styles.templateCardAction}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEditTemplate(templateRecord);
                          }}
                        >
                          <Pencil size={14} aria-hidden />
                          {isStoreTemplate ? messages.templates.editTemplate : messages.templates.useTemplate}
                        </button>
                        {isStoreTemplate ? (
                          <>
                            {!templateRecord.isDefault ? (
                              <button
                                className={styles.templateCardAction}
                                type="button"
                                disabled={!canSetDefaultTemplate}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (canSetDefaultTemplate) {
                                    onSetDefaultTemplate(templateRecord.id);
                                  }
                                }}
                              >
                                <Star size={14} aria-hidden />
                                {messages.templates.setDefaultTemplate}
                              </button>
                            ) : null}
                            <button
                              className={styles.templateCardAction}
                              data-tone="danger"
                              type="button"
                              disabled={!canDeleteTemplate}
                              title={canDeleteTemplate ? messages.templates.deleteTemplate : messages.templates.keepOneTemplate}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (canDeleteTemplate && window.confirm(messages.templates.deleteConfirm)) {
                                  onDeleteTemplate(templateRecord.id);
                                }
                              }}
                            >
                              <Trash2 size={14} aria-hidden />
                              {messages.templates.deleteTemplate}
                            </button>
                          </>
                        ) : null}
                        <button
                          className={styles.templateCardAction}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openTemplatePreview();
                          }}
                        >
                          {messages.templates.preview}
                        </button>
                      </span>
                    </span>
                  </span>
                </article>
              );
            })
          ) : (
            <div className={styles.emptyTemplateState}>
              <LayoutTemplate size={24} aria-hidden />
              <strong>{messages.templates.noResultsTitle}</strong>
              <span>{messages.templates.noResultsBody}</span>
              <button className={styles.secondaryButton} type="button" onClick={() => onTabChange("library")}>
                {messages.templates.browseLibrary}
              </button>
            </div>
          )}
        </div>
      </section>

      <TemplatePreviewModal
        messages={messages}
        onEditTemplate={onEditTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTemplate(null);
          }
        }}
        templateRecord={previewTemplate}
      />
    </div>
  );
}

const templatePrintHtmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const A4_EXPORT_WIDTH_PX = 794;
const A4_EXPORT_HEIGHT_PX = 1122;

function escapeTemplatePrintHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => templatePrintHtmlEscapes[character] ?? character);
}

function getTemplateFileName(templateRecord: TemplateRecord) {
  const normalizedName = templateRecord.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${normalizedName || "printops-template"}.pdf`;
}

function getOrderFileName(order: Order) {
  const normalizedNumber = order.number.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "");

  return `invoice-${normalizedNumber || order.id || "order"}.pdf`;
}

function getTemplatePreviewNode() {
  const previewNode = document.querySelector<HTMLElement>('[data-template-print-preview="true"]');
  const paperNode = previewNode?.querySelector<HTMLElement>('[class*="templatePaper"]');

  return paperNode ?? previewNode;
}

function getOrderPreviewPaperNode(previewNode: HTMLElement | null) {
  return previewNode?.querySelector<HTMLElement>('[class*="templatePaper"]') ?? previewNode;
}

function applyTemplateExportTokens(element: HTMLElement) {
  const tokens = {
    "--ink": "#121817",
    "--muted": "#65706d",
    "--line": "#dde5df",
    "--line-strong": "#c7d4cc",
    "--surface": "#ffffff",
    "--surface-elevated": "#ffffff",
    "--surface-soft": "#f5f7f3",
    "--green": "#087a46",
    "--green-strong": "#046137",
    "--green-soft": "#e6f4ec",
    "--paper-surface": "#ffffff",
    "--paper-ink": "#121817",
    "--paper-muted": "#65706d",
    "--shadow-soft": "none",
  };

  Object.entries(tokens).forEach(([name, value]) => {
    element.style.setProperty(name, value);
  });
}

async function createOrderPdfBlob(sourceNode: HTMLElement, fileName: string) {
  const { default: html2pdf } = await import("html2pdf.js");
  const exportHost = document.createElement("div");
  const clonedPaper = sourceNode.cloneNode(true) as HTMLElement;

  clonedPaper.setAttribute("data-order-paper", "true");
  applyTemplateExportTokens(exportHost);
  exportHost.setAttribute("aria-hidden", "true");
  exportHost.style.position = "fixed";
  exportHost.style.top = "0";
  exportHost.style.left = "-10000px";
  exportHost.style.width = `${A4_EXPORT_WIDTH_PX}px`;
  exportHost.style.height = `${A4_EXPORT_HEIGHT_PX}px`;
  exportHost.style.boxSizing = "border-box";
  exportHost.style.background = "#ffffff";
  exportHost.style.overflow = "hidden";
  exportHost.style.pointerEvents = "none";

  clonedPaper.style.width = `${A4_EXPORT_WIDTH_PX}px`;
  clonedPaper.style.maxWidth = "none";
  clonedPaper.style.minHeight = `${A4_EXPORT_HEIGHT_PX}px`;
  clonedPaper.style.height = `${A4_EXPORT_HEIGHT_PX}px`;
  clonedPaper.style.boxSizing = "border-box";
  clonedPaper.style.boxShadow = "none";
  clonedPaper.style.border = "0";
  clonedPaper.style.borderRadius = "0";
  clonedPaper.style.margin = "0";
  clonedPaper.style.overflow = "hidden";
  clonedPaper.style.padding = "64px";
  clonedPaper.querySelectorAll<HTMLElement>("*").forEach((node) => {
    node.style.boxSizing = "border-box";
  });

  exportHost.appendChild(clonedPaper);
  document.body.appendChild(exportHost);

  try {
    return (await html2pdf()
      .set({
        margin: 0,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          backgroundColor: "#ffffff",
          height: A4_EXPORT_HEIGHT_PX,
          logging: false,
          scale: 3,
          useCORS: true,
          width: A4_EXPORT_WIDTH_PX,
          windowHeight: A4_EXPORT_HEIGHT_PX,
          windowWidth: A4_EXPORT_WIDTH_PX,
        },
        jsPDF: {
          format: "a4",
          orientation: "portrait",
          unit: "mm",
        },
      })
      .from(clonedPaper)
      .outputPdf("blob")) as Blob;
  } finally {
    exportHost.remove();
  }
}

function downloadPdfBlob(pdfBlob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function openOrderPrintWindow(sourceNode: HTMLElement, title: string) {
  const printWindow = window.open("", "_blank", "width=980,height=1200");

  if (!printWindow) {
    return;
  }

  const clonedPaper = sourceNode.cloneNode(true) as HTMLElement;
  clonedPaper.setAttribute("data-order-paper", "true");
  const stylesMarkup = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((node) => node.outerHTML)
    .join("\n");

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeTemplatePrintHtml(title)}</title>
    ${stylesMarkup}
    <style>
      :root,
      body,
      .printops-order-print-preview {
        --ink: #121817;
        --muted: #65706d;
        --line: #dde5df;
        --line-strong: #c7d4cc;
        --surface: #ffffff;
        --surface-elevated: #ffffff;
        --surface-soft: #f5f7f3;
        --workspace-bg: #f8faf9;
        --green: #087a46;
        --green-strong: #046137;
        --green-soft: #e6f4ec;
        --paper-surface: #ffffff;
        --paper-ink: #121817;
        --paper-muted: #65706d;
      }

      * {
        box-sizing: border-box;
      }

      .printops-order-print-preview,
      .printops-order-print-preview * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: #eef1ef;
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .printops-order-print-preview {
        display: grid;
        justify-items: center;
        min-height: 100vh;
        padding: 32px;
      }

      .printops-order-print-preview [data-order-paper="true"] {
        width: ${A4_EXPORT_WIDTH_PX}px !important;
        max-width: none !important;
        min-height: ${A4_EXPORT_HEIGHT_PX}px !important;
        height: ${A4_EXPORT_HEIGHT_PX}px !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 64px !important;
      }

      @page {
        size: A4 portrait;
        margin: 0;
      }

      @media print {
        body {
          background: #ffffff;
        }

        .printops-order-print-preview {
          min-height: auto;
          padding: 0;
        }

        .printops-order-print-preview [data-order-paper="true"] {
          width: 210mm !important;
          max-width: none !important;
          min-height: 297mm !important;
          height: 297mm !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          padding: 17mm !important;
        }
      }
    </style>
  </head>
  <body>
    <main class="printops-order-print-preview">${clonedPaper.outerHTML}</main>
    <script>
      window.addEventListener("load", () => {
        window.focus();
        window.setTimeout(() => window.print(), 250);
      });
    </script>
  </body>
</html>`);
  printWindow.document.close();
}

async function createTemplatePdfBlob(templateRecord: TemplateRecord) {
  const sourceNode = getTemplatePreviewNode();

  if (!sourceNode) {
    return null;
  }

  const { default: html2pdf } = await import("html2pdf.js");
  const exportHost = document.createElement("div");
  const clonedPaper = sourceNode.cloneNode(true) as HTMLElement;

  applyTemplateExportTokens(exportHost);
  exportHost.setAttribute("aria-hidden", "true");
  exportHost.style.position = "fixed";
  exportHost.style.top = "0";
  exportHost.style.left = "-10000px";
  exportHost.style.width = `${A4_EXPORT_WIDTH_PX}px`;
  exportHost.style.height = `${A4_EXPORT_HEIGHT_PX}px`;
  exportHost.style.boxSizing = "border-box";
  exportHost.style.background = "#ffffff";
  exportHost.style.overflow = "hidden";
  exportHost.style.pointerEvents = "none";

  clonedPaper.style.width = `${A4_EXPORT_WIDTH_PX}px`;
  clonedPaper.style.maxWidth = "none";
  clonedPaper.style.minHeight = `${A4_EXPORT_HEIGHT_PX}px`;
  clonedPaper.style.height = `${A4_EXPORT_HEIGHT_PX}px`;
  clonedPaper.style.boxSizing = "border-box";
  clonedPaper.style.boxShadow = "none";
  clonedPaper.style.border = "0";
  clonedPaper.style.borderRadius = "0";
  clonedPaper.style.margin = "0";
  clonedPaper.style.overflow = "hidden";
  clonedPaper.style.padding = "64px";
  clonedPaper.querySelectorAll<HTMLElement>("*").forEach((node) => {
    node.style.boxSizing = "border-box";
  });

  exportHost.appendChild(clonedPaper);
  document.body.appendChild(exportHost);

  try {
    return (await html2pdf()
      .set({
        margin: 0,
        filename: getTemplateFileName(templateRecord),
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          backgroundColor: "#ffffff",
          height: A4_EXPORT_HEIGHT_PX,
          logging: false,
          scale: 3,
          useCORS: true,
          width: A4_EXPORT_WIDTH_PX,
          windowHeight: A4_EXPORT_HEIGHT_PX,
          windowWidth: A4_EXPORT_WIDTH_PX,
        },
        jsPDF: {
          format: "a4",
          orientation: "portrait",
          unit: "mm",
        },
      })
      .from(clonedPaper)
      .outputPdf("blob")) as Blob;
  } finally {
    exportHost.remove();
  }
}

function openTemplatePrintWindow(templateRecord: TemplateRecord) {
  const previewNode = getTemplatePreviewNode();
  const printWindow = window.open("", "_blank", "width=980,height=1200");

  if (!previewNode || !printWindow) {
    return;
  }

  const stylesMarkup = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((node) => node.outerHTML)
    .join("\n");
  const printTitle = `${templateRecord.name} - Print preview`;

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeTemplatePrintHtml(printTitle)}</title>
    ${stylesMarkup}
    <style>
      :root,
      body,
      .printops-print-preview {
        --ink: #121817;
        --muted: #65706d;
        --line: #dde5df;
        --line-strong: #c7d4cc;
        --surface: #ffffff;
        --surface-elevated: #ffffff;
        --surface-soft: #f5f7f3;
        --workspace-bg: #f8faf9;
        --green: #087a46;
        --green-strong: #046137;
        --green-soft: #e6f4ec;
        --paper-surface: #ffffff;
        --paper-ink: #121817;
        --paper-muted: #65706d;
        --order-accent: #087a46;
        --order-accent-2: #273d65;
        --order-soft: #eff6f1;
        --order-line: #dce5de;
        --order-ink: #111816;
        --order-muted: #65706d;
      }

      * {
        box-sizing: border-box;
      }

      .printops-print-preview,
      .printops-print-preview * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: #eef1ef;
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .printops-print-preview {
        display: grid;
        justify-items: center;
        min-height: 100vh;
        padding: 32px;
      }

      .printops-print-preview [class*="templatePaper"] {
        width: ${A4_EXPORT_WIDTH_PX}px !important;
        max-width: none !important;
        min-height: ${A4_EXPORT_HEIGHT_PX}px !important;
        height: ${A4_EXPORT_HEIGHT_PX}px !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none;
        margin: 0;
        padding: 64px !important;
      }

      @page {
        size: A4 portrait;
        margin: 0;
      }

      @media print {
        body {
          background: #ffffff;
        }

        .printops-print-preview {
          min-height: auto;
          padding: 0;
        }

        .printops-print-preview [class*="templatePaper"] {
          width: 210mm !important;
          max-width: none !important;
          min-height: 297mm !important;
          height: 297mm !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none;
          padding: 17mm !important;
        }
      }
    </style>
  </head>
  <body>
    <main class="printops-print-preview">${previewNode.outerHTML}</main>
    <script>
      window.addEventListener("load", () => {
        window.focus();
        window.setTimeout(() => window.print(), 250);
      });
    </script>
  </body>
</html>`);
  printWindow.document.close();
}

function TemplatePreviewModal({
  messages,
  onEditTemplate,
  onOpenChange,
  templateRecord,
}: {
  messages: PrintOpsMessages;
  onEditTemplate: (templateRecord: TemplateRecord) => void;
  onOpenChange: (open: boolean) => void;
  templateRecord: TemplateRecord | null;
}) {
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);

  useEffect(() => {
    if (!templateRecord) {
      setPdfDownloadUrl(null);
      setIsPreparingPdf(false);
      return;
    }

    let isActive = true;
    let objectUrl: string | null = null;

    setPdfDownloadUrl(null);
    setIsPreparingPdf(true);

    const timer = window.setTimeout(() => {
      void createTemplatePdfBlob(templateRecord)
        .then((pdfBlob) => {
          if (!pdfBlob) {
            return;
          }

          const nextUrl = URL.createObjectURL(pdfBlob);

          if (isActive) {
            objectUrl = nextUrl;
            setPdfDownloadUrl(nextUrl);
            return;
          }

          URL.revokeObjectURL(nextUrl);
        })
        .catch(() => {
          if (isActive) {
            setPdfDownloadUrl(null);
          }
        })
        .finally(() => {
          if (isActive) {
            setIsPreparingPdf(false);
          }
        });
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timer);

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [templateRecord]);

  if (!templateRecord) {
    return null;
  }

  const isBuiltIn = templateRecord.source === "Built-in";
  const localizedTemplate = getLocalizedTemplateRecord(templateRecord, messages);
  const pdfFileName = getTemplateFileName(templateRecord);

  return (
    <Drawer.Root open={Boolean(templateRecord)} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className={styles.drawerBackdrop} />
        <Drawer.Viewport className={styles.previewModalViewport}>
          <Drawer.Popup className={styles.templatePreviewModal}>
            <div className={styles.previewModalHeader}>
              <div>
                <span>{localizedTemplate.category}</span>
                <Drawer.Title className={styles.previewModalTitle}>{localizedTemplate.name}</Drawer.Title>
                <Drawer.Description className={styles.previewModalDescription}>{localizedTemplate.description}</Drawer.Description>
              </div>
              <div className={styles.previewModalActions}>
                {templateRecord.isDefault ? <strong className={styles.defaultBadge}>{messages.templates.default}</strong> : null}
                {pdfDownloadUrl ? (
                  <a className={styles.secondaryButton} download={pdfFileName} href={pdfDownloadUrl}>
                    <Download size={17} aria-hidden />
                    {messages.templates.downloadPdf}
                  </a>
                ) : (
                  <button className={styles.secondaryButton} type="button" disabled aria-busy={isPreparingPdf}>
                    <Download size={17} aria-hidden />
                    {messages.templates.downloadPdf}
                  </button>
                )}
                <button className={styles.secondaryButton} type="button" onClick={() => openTemplatePrintWindow(templateRecord)}>
                  <Printer size={17} aria-hidden />
                  {messages.templates.printPreview}
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => {
                    onEditTemplate(templateRecord);
                    onOpenChange(false);
                  }}
                >
                  <LayoutTemplate size={17} aria-hidden />
                  {isBuiltIn ? messages.templates.useTemplate : messages.templates.editTemplate}
                </button>
                <Drawer.Close className={styles.iconButton} aria-label="Close template preview">
                  <X size={18} aria-hidden />
                </Drawer.Close>
              </div>
            </div>

            <div className={styles.previewModalStage} data-template-print-preview="true">
              <TemplatePaperPreview
                accentColor={templateRecord.accentColor}
                addressFormat={templateRecord.addressFormat}
                brandName={templateRecord.brandName}
                dateFormat={templateRecord.dateFormat}
                defaultLanguage={templateRecord.defaultLanguage}
                density={templateRecord.density}
                documentType={templateRecord.documentType}
                footerContact={templateRecord.footerContact}
                footerWebsite={templateRecord.footerWebsite}
                labelOverrides={templateRecord.labelOverrides}
                layoutPreset={templateRecord.layoutPreset}
                logoImageUrl={templateRecord.logoImageUrl}
                logoFont={templateRecord.logoFont}
                logoFontSize={templateRecord.logoFontSize}
                logoSource={templateRecord.logoSource}
                logoText={templateRecord.logoText}
                paperSize={templateRecord.paperSize}
                showBillTo={templateRecord.showBillTo}
                showContactFooter={templateRecord.showContactFooter}
                showInvoiceMeta={templateRecord.showInvoiceMeta}
                showItemOptions={templateRecord.showItemOptions}
                showLogoText={templateRecord.showLogoText}
                showNotes={templateRecord.showNotes}
                showOrderBarcode={templateRecord.showOrderBarcode}
                showPaymentMethod={templateRecord.showPaymentMethod}
                showProductImages={templateRecord.showProductImages}
                showShipTo={templateRecord.showShipTo}
                showShippingMethod={templateRecord.showShippingMethod}
                showSocialFooter={templateRecord.showSocialFooter}
                showSku={templateRecord.showSku}
                showStoreName={templateRecord.showStoreName}
                showThankYou={templateRecord.showThankYou}
                showTotals={templateRecord.showTotals}
                customAccentColor={templateRecord.customAccentColor}
                socialLinks={templateRecord.socialLinks}
                socialProfiles={templateRecord.socialProfiles}
                thankYouText={templateRecord.thankYouText}
                variant="editor"
                visualStyle={templateRecord.visualStyle}
              />
            </div>

            <div className={styles.previewModalFooter}>
              <div className={styles.templateSpecGrid}>
                <Spec label={messages.templates.document} value={localizedTemplate.documentType} />
                <Spec label={messages.templates.paper} value={templateRecord.paperSize} />
                <Spec label={messages.templates.audience} value={localizedTemplate.audience} />
                <Spec label={messages.templates.scenario} value={templateRecord.scenario} />
              </div>
              <div className={styles.validationBox} data-tone={templateRecord.validation.tone}>
                <div>
                  {templateRecord.validation.tone === "ok" ? <CheckCircle2 size={18} aria-hidden /> : <AlertTriangle size={18} aria-hidden />}
                  <strong>{localizedTemplate.validationLabel}</strong>
                </div>
                <p>{templateRecord.validation.tone === "ok" ? messages.templates.canPrint : messages.templates.needsMapping}</p>
              </div>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

type TemplateEditorSectionId = "brand" | "format" | "text" | "template" | "test";

function localizeTemplateLabelGroup(group: TemplateLabelGroup, editorCopy: PrintOpsMessages["templateEditor"]) {
  const groupLabels: Record<TemplateLabelGroup, string> = {
    Address: editorCopy.labelGroupAddress,
    Custom: editorCopy.labelGroupCustom,
    Customer: editorCopy.labelGroupCustomer,
    Fulfillment: editorCopy.labelGroupFulfillment,
    Items: editorCopy.labelGroupItems,
    Order: editorCopy.labelGroupOrder,
    Payment: editorCopy.labelGroupPayment,
    Store: editorCopy.labelGroupStore,
    Template: editorCopy.labelGroupTemplate,
  };

  return groupLabels[group] ?? group;
}

function TemplateEditorDrawer({
  draft,
  messages,
  mode,
  onDraftChange,
  onOpenChange,
  onSave,
  open,
  printLanguageOptions,
  siteLocale,
  storeProfile,
  storeProfileStatus,
}: {
  draft: TemplateDraft;
  messages: PrintOpsMessages;
  mode: TemplateEditorMode;
  onDraftChange: (patch: Partial<TemplateDraft>) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  open: boolean;
  printLanguageOptions: { label: string; value: string }[];
  siteLocale: SiteLocale;
  storeProfile: PrintOpsStoreProfileSummary | null;
  storeProfileStatus: StoreProfileStatus;
}) {
  const editorCopy = messages.templateEditor;
  const visibleFieldGroups = useMemo(() => getVisibleFieldGroups(editorCopy), [editorCopy]);
  const title = mode === "edit" ? editorCopy.editTitle : mode === "duplicate" ? editorCopy.duplicateTitle : editorCopy.createTitle;
  const description =
    mode === "duplicate"
      ? editorCopy.duplicateDescription
      : editorCopy.createDescription;
  const parsedRequirements = parseDataRequirements(draft.dataRequirements);
  const canSave = draft.name.trim().length > 0 && draft.description.trim().length > 0;
  const [activeSection, setActiveSection] = useState<TemplateEditorSectionId>("brand");
  const [socialPlatformToAdd, setSocialPlatformToAdd] = useState<SocialPlatform>("instagram");
  const [isExportingTestPdf, setIsExportingTestPdf] = useState(false);
  const localizedLogoSourceOptions = [
    { label: editorCopy.logoSourceGenerated, value: "generated-svg" },
    { label: editorCopy.logoSourceUploaded, value: "uploaded-image" },
  ];
  const localizedLogoFontOptions = [
    { label: editorCopy.logoFontSans, value: "sans" },
    { label: editorCopy.logoFontSerif, value: "serif" },
    { label: editorCopy.logoFontMono, value: "mono" },
  ];
  const localizedAccentOptions = [
    { label: editorCopy.accentCharcoal, value: "charcoal" },
    { label: editorCopy.accentForest, value: "forest" },
    { label: editorCopy.accentSlate, value: "slate" },
    { label: editorCopy.accentCustom, value: "custom" },
  ];
  const localizedSocialModeOptions = [
    { label: editorCopy.socialLinkModeUsername, value: "username" },
    { label: editorCopy.socialLinkModeUrl, value: "url" },
  ];
  const activeSocialOptions = socialPlatformOptions.filter((option) => draft.socialProfiles[option.platform]);
  const addableSocialOptions = socialPlatformOptions.filter((option) => !draft.socialProfiles[option.platform]);
  const selectedSocialPlatformToAdd = addableSocialOptions.some((option) => option.platform === socialPlatformToAdd)
    ? socialPlatformToAdd
    : addableSocialOptions[0]?.platform;
  const localizedSocialPlatformOptions = addableSocialOptions.map((option) => ({
    label: option.label,
    value: option.platform,
  }));
  const localizedDensityOptions = [
    { label: editorCopy.densityBalanced, value: "balanced" },
    { label: editorCopy.densityCompact, value: "compact" },
    { label: editorCopy.densitySpacious, value: "spacious" },
  ];
  const localizedDocumentTypeOptions = [{ label: editorCopy.documentInvoice, value: "Invoice" }];
  const localizedAudienceOptions = [
    { label: editorCopy.audienceCustomer, value: "Customer" },
    { label: editorCopy.audienceWarehouse, value: "Warehouse" },
    { label: editorCopy.audienceProduction, value: "Production" },
    { label: editorCopy.audienceFinance, value: "Finance" },
    { label: editorCopy.audienceStoreStaff, value: "Store staff" },
  ];
  const templateSettingsSummary = editorCopy.templateSettingsDescription;
  const drawerStateLabel = mode === "duplicate" ? editorCopy.draftCopy : mode === "create" ? editorCopy.draft : editorCopy.ready;
  const editorSections = [
    {
      id: "brand",
      icon: LayoutTemplate,
      title: editorCopy.brandTitle,
      description: editorCopy.brandDescription,
    },
    {
      id: "format",
      icon: Settings,
      title: editorCopy.optionsTitle,
      description: editorCopy.optionsDescription,
    },
    {
      id: "text",
      icon: Languages,
      title: editorCopy.textTitle,
      description: editorCopy.textDescription,
    },
    {
      id: "template",
      icon: FileText,
      title: editorCopy.templateSettingsTitle,
      description: templateSettingsSummary,
    },
    {
      id: "test",
      icon: Printer,
      title: editorCopy.printTestTitle,
      description: editorCopy.printTestDescription,
    },
  ] satisfies Array<{
    id: TemplateEditorSectionId;
    icon: typeof LayoutTemplate;
    title: string;
    description: string;
  }>;
  const activeEditorSection = editorSections.find((section) => section.id === activeSection) ?? editorSections[0];
  const labelDefinitionGroups = useMemo(
    () =>
      templateLabelGroupOrder
        .map((group) => ({
          group,
          items: templateLabelDefinitions.filter((definition) => definition.group === group),
        }))
        .filter((group) => group.items.length > 0),
    [],
  );
  const logoPreview =
    draft.logoSource === "uploaded-image" && draft.logoImageUrl ? (
      <img alt={`${draft.brandName || "Store"} logo`} src={draft.logoImageUrl} />
    ) : (
      draft.logoText || defaultTemplateBrandSettings.logoText
    );
  const showMissingLogoHint = storeProfileStatus.status === "loaded" && !storeProfile?.logoUrl && draft.logoSource !== "uploaded-image";
  const showMissingEmailHint = storeProfileStatus.status === "loaded" && !storeProfile?.businessEmail;

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/") && !file.name.toLowerCase().endsWith(".svg")) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        onDraftChange({
          logoImageUrl: reader.result,
          logoSource: "uploaded-image",
        });
      }
    });
    reader.readAsDataURL(file);
  }

  function getDefaultSocialProfile(platform: SocialPlatform) {
    const platformOption = socialPlatformOptions.find((option) => option.platform === platform);
    const mode: SocialLinkMode = platform === "website" ? "url" : "username";
    const value =
      platform === "website"
        ? draft.footerWebsite || defaultTemplateBrandSettings.footerWebsite
        : platformOption?.placeholder || "";

    return createSocialProfile(platform, mode, value);
  }

  function commitSocialProfiles(nextProfiles: TemplateSocialProfiles) {
    onDraftChange({
      socialProfiles: nextProfiles,
      socialLinks: serializeSocialProfiles(nextProfiles),
    });
  }

  function updateSocialProfile(platform: SocialPlatform, patch: Partial<Pick<SocialProfile, "mode" | "value">>) {
    const currentProfile = draft.socialProfiles[platform] ?? getDefaultSocialProfile(platform);
    const nextProfile = createSocialProfile(platform, patch.mode ?? currentProfile.mode, patch.value ?? currentProfile.value);
    const nextProfiles = {
      ...draft.socialProfiles,
      [platform]: nextProfile,
    };

    commitSocialProfiles(nextProfiles);
  }

  function addSocialProfile(platform: SocialPlatform) {
    if (draft.socialProfiles[platform]) {
      return;
    }

    commitSocialProfiles({
      ...draft.socialProfiles,
      [platform]: getDefaultSocialProfile(platform),
    });
  }

  function removeSocialProfile(platform: SocialPlatform) {
    if (platform === "website") {
      return;
    }

    const nextProfiles = { ...draft.socialProfiles };
    delete nextProfiles[platform];
    commitSocialProfiles(normalizeSocialProfiles(nextProfiles));
  }

  function getDraftPreviewRecord() {
    return createTemplateRecordFromDraft({
      ...draft,
      description: draft.description.trim() || editorCopy.sampleOrderPreviewDescription,
      name: draft.name.trim() || editorCopy.untitledTemplate,
    });
  }

  async function handleTestDownloadPdf() {
    if (isExportingTestPdf) {
      return;
    }

    setIsExportingTestPdf(true);

    try {
      const templateRecord = getDraftPreviewRecord();
      const pdfBlob = await createTemplatePdfBlob(templateRecord);

      if (pdfBlob) {
        downloadPdfBlob(pdfBlob, getTemplateFileName(templateRecord));
      }
    } finally {
      setIsExportingTestPdf(false);
    }
  }

  function handleTestPrintPreview() {
    openTemplatePrintWindow(getDraftPreviewRecord());
  }

  function renderEditorSettings() {
    if (activeSection === "brand") {
      return (
        <>
          <div className={styles.editorSettingsHeader}>
            <span>{activeEditorSection.title}</span>
            <small>{activeEditorSection.description}</small>
          </div>

          <div className={styles.brandSettingsPanel}>
            <div className={styles.brandSettingsHeader}>
              <span className={styles.orderLogoMark}>{logoPreview}</span>
              <span>
                <strong>{editorCopy.brandCardTitle}</strong>
                <small>{editorCopy.brandCardDescription}</small>
              </span>
            </div>
            <span className={styles.settingsGroupTitle}>{editorCopy.brandIdentity}</span>
            <div className={styles.formOneColumn}>
              <label className={styles.fieldGroup}>
                <span>{editorCopy.storeName}</span>
                <input
                  className={styles.textInput}
                  value={draft.brandName}
                  onChange={(event) => onDraftChange({ brandName: event.target.value })}
                />
              </label>
            </div>

            <span className={styles.settingsGroupTitle}>{editorCopy.logoAsset}</span>
            <div className={styles.logoConfigPanel}>
              <div className={styles.logoConfigPreview}>
                <span className={styles.orderLogoMark}>{logoPreview}</span>
                <span>
                  <strong>{draft.logoSource === "uploaded-image" ? editorCopy.logoImageSettings : editorCopy.logoTextSettings}</strong>
                  <small>{draft.logoSource === "uploaded-image" ? editorCopy.logoSourceUploaded : editorCopy.logoSourceGenerated}</small>
                </span>
              </div>
              <SelectField
                label={editorCopy.logoType}
                options={localizedLogoSourceOptions}
                value={draft.logoSource}
                onValueChange={(value) => onDraftChange({ logoSource: value as OrderTemplateLogoSource })}
              />
              {draft.logoSource === "uploaded-image" ? (
                <>
                  <label className={styles.logoUploadField}>
                    <span>{draft.logoImageUrl ? editorCopy.replaceLogoImage : editorCopy.uploadLogoImage}</span>
                    <input accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" type="file" onChange={handleLogoUpload} />
                  </label>
                  {draft.logoImageUrl ? (
                    <div className={styles.uploadedLogoPreview}>
                      <img alt={`${draft.brandName || "Store"} uploaded logo`} src={draft.logoImageUrl} />
                      <button type="button" onClick={() => onDraftChange({ logoImageUrl: "", logoSource: "generated-svg" })}>
                        {editorCopy.removeUploadedLogo}
                      </button>
                    </div>
                  ) : null}
                  {showMissingLogoHint ? <small className={styles.labelKey}>{editorCopy.missingLogoHint}</small> : null}
                </>
              ) : (
                <div className={styles.formTwoColumns}>
                  <label className={styles.fieldGroup}>
                    <span>{editorCopy.heroWordmark}</span>
                    <input
                      className={styles.textInput}
                      maxLength={18}
                      value={draft.logoText}
                      onChange={(event) => onDraftChange({ logoText: event.target.value })}
                    />
                  </label>
                  <SelectField
                    label={editorCopy.logoFont}
                    options={localizedLogoFontOptions}
                    value={draft.logoFont}
                    onValueChange={(value) => onDraftChange({ logoFont: value as OrderTemplateLogoFont })}
                  />
                  <label className={styles.fieldGroup}>
                    <span>{editorCopy.logoFontSize}</span>
                    <input
                      className={styles.textInput}
                      min={28}
                      max={96}
                      type="number"
                      value={draft.logoFontSize}
                      onChange={(event) => onDraftChange({ logoFontSize: Number(event.target.value) })}
                    />
                  </label>
                </div>
              )}
            </div>

            <span className={styles.settingsGroupTitle}>{editorCopy.socialFooter}</span>
            <div className={styles.formOneColumn}>
              <label className={styles.fieldGroup}>
                <span>{editorCopy.footerWebsite}</span>
                <input
                  className={styles.textInput}
                  value={draft.footerWebsite}
                  onChange={(event) => onDraftChange({ footerWebsite: event.target.value })}
                />
              </label>
            </div>
            <label className={styles.fieldGroup}>
              <span>{editorCopy.footerContactLine}</span>
              <input
                className={styles.textInput}
                value={draft.footerContact}
                onChange={(event) => onDraftChange({ footerContact: event.target.value })}
              />
            </label>
            {showMissingEmailHint ? <small className={styles.labelKey}>{editorCopy.missingEmailHint}</small> : null}
            <div className={styles.socialConfigList}>
              {activeSocialOptions.map((option) => {
                const profile = draft.socialProfiles[option.platform] ?? getDefaultSocialProfile(option.platform);

                return (
                  <div className={styles.socialConfigRow} key={option.platform}>
                    <div className={styles.socialConfigHeader}>
                      <span className={styles.socialConfigIdentity}>
                        <span className={styles.socialConfigIcon}>
                          <SocialIcon platform={option.platform} />
                        </span>
                        <strong>{option.label}</strong>
                      </span>
                      {option.platform === "website" ? null : (
                        <button className={styles.socialConfigRemove} type="button" onClick={() => removeSocialProfile(option.platform)}>
                          {editorCopy.removeSocialLink}
                        </button>
                      )}
                    </div>
                    <div className={styles.socialConfigFields}>
                      <SelectField
                        compact
                        label={profile.mode === "url" || option.platform === "website" ? editorCopy.socialLinkModeUrl : editorCopy.socialLinkModeUsername}
                        options={localizedSocialModeOptions}
                        value={profile.mode}
                        onValueChange={(value) => updateSocialProfile(option.platform, { mode: value as SocialLinkMode })}
                      />
                      <label className={styles.socialConfigValueField}>
                        <span>{profile.mode === "url" || option.platform === "website" ? editorCopy.socialLinkModeUrl : editorCopy.socialLinkModeUsername}</span>
                        <input
                          className={styles.textInput}
                          placeholder={option.placeholder}
                          value={profile.value}
                          onChange={(event) => updateSocialProfile(option.platform, { value: event.target.value })}
                        />
                      </label>
                    </div>
                    <small className={styles.socialConfigSavedUrl}>
                      {editorCopy.socialLinkSavedUrl}: {profile.url || "-"}
                    </small>
                  </div>
                );
              })}
              <div className={styles.socialConfigAdd}>
                {selectedSocialPlatformToAdd ? (
                  <>
                    <SelectField
                      compact
                      label={editorCopy.socialPlatform}
                      options={localizedSocialPlatformOptions}
                      value={selectedSocialPlatformToAdd}
                      onValueChange={(value) => setSocialPlatformToAdd(value as SocialPlatform)}
                    />
                    <button className={styles.secondaryButton} type="button" onClick={() => addSocialProfile(selectedSocialPlatformToAdd)}>
                      {editorCopy.addSocialLink}
                    </button>
                  </>
                ) : (
                  <small className={styles.labelKey}>{editorCopy.allSocialLinksAdded}</small>
                )}
              </div>
            </div>

            <span className={styles.settingsGroupTitle}>{editorCopy.styleBasics}</span>
            <div className={styles.formTwoColumns}>
              <SelectField
                label={editorCopy.accent}
                options={localizedAccentOptions}
                value={draft.accentColor}
                onValueChange={(value) => onDraftChange({ accentColor: value as OrderTemplateAccent })}
              />
              <label className={styles.fieldGroup}>
                <span>{editorCopy.customAccentHex}</span>
                <span className={styles.colorInputRow}>
                  <input
                    aria-label={editorCopy.customAccent}
                    className={styles.colorInput}
                    type="color"
                    value={isValidHexColor(draft.customAccentColor) ? draft.customAccentColor : defaultTemplateBrandSettings.customAccentColor}
                    onChange={(event) => onDraftChange({ accentColor: "custom", customAccentColor: event.target.value })}
                  />
                  <input
                    className={styles.textInput}
                    placeholder="#087A46"
                    value={draft.customAccentColor}
                    onChange={(event) => onDraftChange({ accentColor: "custom", customAccentColor: event.target.value })}
                  />
                </span>
              </label>
              <SelectField
                label={editorCopy.density}
                options={localizedDensityOptions}
                value={draft.density}
                onValueChange={(value) => onDraftChange({ density: value as OrderTemplateDensity })}
              />
            </div>
          </div>
        </>
      );
    }

    if (activeSection === "format") {
      return (
        <>
          <div className={styles.editorSettingsHeader}>
            <span>{activeEditorSection.title}</span>
            <small>{activeEditorSection.description}</small>
          </div>

          <div className={styles.optionSettingsPanel}>
            <div className={styles.optionSettingsIntro}>
              <span className={styles.settingsGroupTitle}>{editorCopy.formatSettings}</span>
              <small>{editorCopy.formatSettingsDescription}</small>
            </div>
            <div className={styles.formTwoColumns}>
              <SelectField
                label={editorCopy.addressFormat}
                options={templateAddressFormatOptions[siteLocale]}
                value={draft.addressFormat}
                onValueChange={(value) => onDraftChange({ addressFormat: value as TemplateAddressFormat })}
              />
              <SelectField
                label={editorCopy.dateFormat}
                options={getTemplateDateFormatOptions(siteLocale)}
                value={draft.dateFormat}
                onValueChange={(value) => onDraftChange({ dateFormat: value as TemplateDateFormat })}
              />
            </div>
          </div>

          <div className={styles.optionSettingsPanel}>
            <div className={styles.optionSettingsIntro}>
              <span className={styles.settingsGroupTitle}>{editorCopy.fieldDisplay}</span>
              <small>{editorCopy.fieldDisplayDescription}</small>
            </div>
            {visibleFieldGroups.map((group) => (
              <section className={styles.optionFieldGroup} key={group.title}>
                <div className={styles.optionFieldGroupHeader}>
                  <strong>{group.title}</strong>
                  <small>{group.description}</small>
                </div>
                <div className={styles.toggleRows}>
                  {group.items.map((item) => (
                    <TemplateToggleRow
                      checked={draft[item.key]}
                      description={item.description}
                      key={item.key}
                      label={item.label}
                      onCheckedChange={(checked) => onDraftChange({ [item.key]: checked } as Partial<TemplateDraft>)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (activeSection === "text") {
      return (
        <>
          <div className={styles.editorSettingsHeader}>
            <span>{activeEditorSection.title}</span>
            <small>{activeEditorSection.description}</small>
          </div>

          <SelectField
            label={editorCopy.defaultLanguage}
            options={printLanguageOptions}
            value={draft.defaultLanguage}
            onValueChange={(value) => isPrintLocale(value) && onDraftChange({ defaultLanguage: value })}
          />

          <label className={styles.fieldGroup}>
            <span>{editorCopy.thankYouText}</span>
            <input
              className={styles.textInput}
              value={draft.thankYouText}
              onChange={(event) => onDraftChange({ thankYouText: event.target.value })}
            />
          </label>

          <div className={styles.labelSettingsPanel}>
            <div className={styles.optionSettingsIntro}>
              <span className={styles.settingsGroupTitle}>{editorCopy.labelCustomization}</span>
              <small>{editorCopy.labelCustomizationDescription}</small>
            </div>

            {labelDefinitionGroups.map((group) => (
              <section className={styles.labelOverrideGroup} key={group.group}>
                <div className={styles.labelOverrideGroupHeader}>
                  <strong>{localizeTemplateLabelGroup(group.group, editorCopy)}</strong>
                  <small>{group.items.length} {editorCopy.labelsCount}</small>
                </div>
                <div className={styles.labelOverrideGrid}>
                  {group.items.map((definition) => (
                    <label className={styles.fieldGroup} key={definition.key}>
                      <span>{resolveLocalizedText(definition.label, draft.defaultLanguage)}</span>
                      <input
                        className={styles.textInput}
                        value={getTemplateLabelInputValue(draft.labelOverrides, definition.key, draft.defaultLanguage)}
                        onChange={(event) =>
                          onDraftChange({
                            labelOverrides: setTemplateLabelOverrideValue(draft.labelOverrides, definition.key, draft.defaultLanguage, event.target.value),
                          })
                        }
                      />
                      <small className={styles.labelKey}>{definition.key}</small>
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (activeSection === "template") {
      return (
        <>
          <div className={styles.editorSettingsHeader}>
            <span>{activeEditorSection.title}</span>
            <small>{activeEditorSection.description}</small>
          </div>

          <div className={styles.optionSettingsPanel}>
            <div className={styles.optionSettingsIntro}>
              <span className={styles.settingsGroupTitle}>{editorCopy.templateSettingsTitle}</span>
              <small>{editorCopy.templateSettingsDescription}</small>
            </div>

            <label className={styles.fieldGroup}>
              <span>{editorCopy.templateName}</span>
              <input className={styles.textInput} value={draft.name} onChange={(event) => onDraftChange({ name: event.target.value })} />
            </label>

            <label className={styles.fieldGroup}>
              <span>{editorCopy.description}</span>
              <textarea
                className={styles.textarea}
                rows={3}
                value={draft.description}
                onChange={(event) => onDraftChange({ description: event.target.value })}
              />
            </label>

            <div className={styles.formTwoColumns}>
              <SelectField
                label={editorCopy.document}
                options={localizedDocumentTypeOptions}
                value={draft.documentType}
                onValueChange={(value) => onDraftChange({ documentType: value, category: getDefaultCategory(value) })}
              />
              <SelectField
                label={editorCopy.audience}
                options={localizedAudienceOptions}
                value={draft.audience}
                onValueChange={(value) => onDraftChange({ audience: value as TemplateRecord["audience"] })}
              />
              <label className={styles.fieldGroup}>
                <span>{editorCopy.scenario}</span>
                <input className={styles.textInput} value={draft.scenario} onChange={(event) => onDraftChange({ scenario: event.target.value })} />
              </label>
              <label className={styles.fieldGroup}>
                <span>{editorCopy.paperSize}</span>
                <input className={styles.textInput} readOnly value="A4" />
              </label>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className={styles.editorSettingsHeader}>
          <span>{activeEditorSection.title}</span>
          <small>{activeEditorSection.description}</small>
        </div>

        <div className={styles.testSettingsPanel}>
          <span className={styles.editorOptionIcon}>
            <Printer size={20} aria-hidden />
          </span>
          <span>
            <strong>{editorCopy.sampleOrderPreview}</strong>
            <small>{editorCopy.sampleOrderPreviewDescription}</small>
          </span>
        </div>
        <div className={styles.testActionGrid}>
          <button className={styles.secondaryButton} disabled={isExportingTestPdf} type="button" onClick={handleTestDownloadPdf}>
            <Download size={17} aria-hidden />
            {messages.templates.downloadPdf}
          </button>
          <button className={styles.secondaryButton} type="button" onClick={handleTestPrintPreview}>
            <Printer size={17} aria-hidden />
            {messages.templates.printPreview}
          </button>
        </div>
      </>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className={styles.drawerBackdrop} />
        <Drawer.Viewport className={styles.drawerViewport}>
          <Drawer.Popup className={styles.drawerPopup}>
            <div className={styles.editorSaveBar}>
              <span>
                <AlertTriangle size={16} aria-hidden />
                {editorCopy.unsavedChanges}
              </span>
              <div>
                <Drawer.Close className={styles.editorGhostButton}>{editorCopy.discard}</Drawer.Close>
                <button className={styles.editorSaveButton} type="button" disabled={!canSave} onClick={onSave}>
                  {editorCopy.save}
                </button>
              </div>
            </div>
            <div className={styles.drawerHeader}>
              <div>
                <Drawer.Title className={styles.drawerTitle}>
                  <span>{title}</span>
                  <small>{drawerStateLabel}</small>
                </Drawer.Title>
                <Drawer.Description className={styles.drawerDescription}>{description}</Drawer.Description>
              </div>
              <Drawer.Close className={styles.iconButton} aria-label={editorCopy.close}>
                <X size={18} aria-hidden />
              </Drawer.Close>
            </div>

            <div className={styles.templateEditorGrid}>
              <section className={styles.templateForm}>
                <div className={styles.editorOptionCard}>
                  {editorSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        type="button"
                        key={section.id}
                        data-active={activeSection === section.id}
                        aria-pressed={activeSection === section.id}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <span className={styles.editorOptionIcon}>
                          <Icon size={20} aria-hidden />
                        </span>
	                        <span>
	                          <strong>{section.title}</strong>
	                        </span>
                        <ChevronRight size={19} aria-hidden />
                      </button>
                    );
                  })}
                  <div className={styles.editorHelpBlock}>
                    <strong>{editorCopy.needHelpTitle}</strong>
                    <span>{editorCopy.openHelpCenter}</span>
                  </div>
                </div>

                <div className={styles.editorSettingsCard}>
                  {renderEditorSettings()}
                </div>

                {activeSection === "test" ? null : (
                  <div className={styles.validationBox} data-tone={parsedRequirements.length > 0 ? "ok" : "warning"}>
                    <div>
                      {parsedRequirements.length > 0 ? <CheckCircle2 size={18} aria-hidden /> : <AlertTriangle size={18} aria-hidden />}
                      <strong>{parsedRequirements.length} {editorCopy.readyFields}</strong>
                    </div>
                    <p>{parsedRequirements.length > 0 ? editorCopy.canSave : editorCopy.needsRequiredField}</p>
                  </div>
                )}

                <div className={styles.drawerActions}>
                  <button className={styles.primaryButton} type="button" disabled={!canSave} onClick={onSave}>
                    <LayoutTemplate size={17} aria-hidden />
                    {mode === "duplicate" ? editorCopy.addToMyTemplates : editorCopy.saveTemplate}
                  </button>
                  <Drawer.Close className={styles.secondaryButton}>{editorCopy.cancel}</Drawer.Close>
                </div>
              </section>

              <aside className={styles.templateEditorPreview}>
                <div className={styles.previewHeader}>
                  <div>
                    <span>{draft.paperSize}</span>
                    <strong>{draft.name || editorCopy.untitledTemplate}</strong>
                  </div>
                </div>
                <div className={styles.templatePreviewShell} data-template-print-preview="true">
                  <TemplatePaperPreview
                    accentColor={draft.accentColor}
                    addressFormat={draft.addressFormat}
                    brandName={draft.brandName}
                    dateFormat={draft.dateFormat}
                    defaultLanguage={draft.defaultLanguage}
                    density={draft.density}
                    documentType={draft.documentType}
                    footerContact={draft.footerContact}
                    footerWebsite={draft.footerWebsite}
                    labelOverrides={draft.labelOverrides}
                    layoutPreset={draft.layoutPreset}
                    logoImageUrl={draft.logoImageUrl}
                    logoFont={draft.logoFont}
                    logoFontSize={draft.logoFontSize}
                    logoSource={draft.logoSource}
                    logoText={draft.logoText}
                    paperSize={draft.paperSize}
                    showBillTo={draft.showBillTo}
                    showContactFooter={draft.showContactFooter}
                    showInvoiceMeta={draft.showInvoiceMeta}
                    showItemOptions={draft.showItemOptions}
                    showLogoText={draft.showLogoText}
                    showNotes={draft.showNotes}
                    showOrderBarcode={draft.showOrderBarcode}
                    showPaymentMethod={draft.showPaymentMethod}
                    showProductImages={draft.showProductImages}
                    showShipTo={draft.showShipTo}
                    showShippingMethod={draft.showShippingMethod}
                    showSocialFooter={draft.showSocialFooter}
                    showSku={draft.showSku}
                    showStoreName={draft.showStoreName}
                    showThankYou={draft.showThankYou}
                    showTotals={draft.showTotals}
                    customAccentColor={draft.customAccentColor}
                    socialLinks={draft.socialLinks}
                    socialProfiles={draft.socialProfiles}
                    thankYouText={draft.thankYouText}
                    variant="editor"
                    visualStyle={draft.visualStyle}
                  />
                </div>
              </aside>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function TemplatePaperPreview({
  accentColor = defaultTemplateBrandSettings.accentColor,
  addressFormat = defaultTemplateBrandSettings.addressFormat,
  brandName = defaultTemplateBrandSettings.brandName,
  dateFormat = defaultTemplateBrandSettings.dateFormat,
  defaultLanguage = defaultPrintLocale,
  density = defaultTemplateBrandSettings.density,
  documentType,
  footerContact = defaultTemplateBrandSettings.footerContact,
  footerWebsite = defaultTemplateBrandSettings.footerWebsite,
  labelOverrides = {},
  layoutPreset,
  logoImageUrl = defaultTemplateBrandSettings.logoImageUrl,
  logoFont = defaultTemplateBrandSettings.logoFont,
  logoFontSize = defaultTemplateBrandSettings.logoFontSize,
  logoSource = defaultTemplateBrandSettings.logoSource,
  logoText = defaultTemplateBrandSettings.logoText,
  order,
  paperSize,
  showBillTo = true,
  showContactFooter = true,
  showInvoiceMeta = true,
  showItemOptions = true,
  showLogoText = true,
  showNotes = true,
  showOrderBarcode = true,
  showPaymentMethod = true,
  showProductImages = true,
  showShipTo = true,
  showShippingMethod = true,
  showSocialFooter = true,
  showSku = true,
  showStoreName = true,
  showThankYou = true,
  showTotals = true,
  customAccentColor = defaultTemplateBrandSettings.customAccentColor,
  socialLinks = defaultTemplateBrandSettings.socialLinks,
  socialProfiles,
  thankYouText = defaultTemplateBrandSettings.thankYouText,
  variant = "detail",
  visualStyle,
}: {
  accentColor?: OrderTemplateAccent;
  addressFormat?: TemplateAddressFormat;
  brandName?: string;
  dateFormat?: TemplateDateFormat;
  defaultLanguage?: PrintLocale;
  density?: OrderTemplateDensity;
  documentType: string;
  footerContact?: string;
  footerWebsite?: string;
  labelOverrides?: TemplateLabelOverrides;
  layoutPreset: TemplateRecord["layoutPreset"];
  logoImageUrl?: string;
  logoFont?: OrderTemplateLogoFont;
  logoFontSize?: number;
  logoSource?: OrderTemplateLogoSource;
  logoText?: string;
  order?: Order | null;
  paperSize: TemplateRecord["paperSize"];
  showBillTo?: boolean;
  showContactFooter?: boolean;
  showInvoiceMeta?: boolean;
  showItemOptions?: boolean;
  showLogoText?: boolean;
  showNotes?: boolean;
  showOrderBarcode?: boolean;
  showPaymentMethod?: boolean;
  showProductImages?: boolean;
  showShipTo?: boolean;
  showShippingMethod?: boolean;
  showSocialFooter?: boolean;
  showSku?: boolean;
  showStoreName?: boolean;
  showThankYou?: boolean;
  showTotals?: boolean;
  customAccentColor?: string;
  socialLinks?: string;
  socialProfiles?: TemplateSocialProfiles;
  thankYouText?: string;
  variant?: "card" | "detail" | "editor";
  visualStyle?: OrderTemplateVisualStyle;
}) {
  const isThermal = layoutPreset === "Thermal" || paperSize === "80mm";
  const isInvoice = documentType === "Invoice";
  const isTableFirst = layoutPreset === "Table-first";

  if (isThermal) {
    return (
      <span className={styles.templatePaper} data-layout={layoutPreset} data-size={paperSize} data-variant={variant}>
        <span className={styles.thermalBrand}>GREEN STUDIO</span>
        <span className={styles.thermalTitle}>Pickup receipt</span>
        <span className={styles.thermalDivider} />
        <span className={styles.thermalLine}>
          <span>Order</span>
          <strong>#1005</strong>
        </span>
        <span className={styles.thermalLine}>
          <span>Customer</span>
          <strong>Avery Wu</strong>
        </span>
        <span className={styles.thermalDivider} />
        <span className={styles.thermalItem}>
          <strong>Pickup bouquet</strong>
          <span>1 x $42.90</span>
        </span>
        <span className={styles.thermalTotal}>
          <span>Total</span>
          <strong>$42.90</strong>
        </span>
        <span className={styles.thermalFooter}>Paid - ready for pickup</span>
      </span>
    );
  }

  if (isInvoice) {
    return (
      <OrderPaperPreview
        accentColor={accentColor}
        addressFormat={addressFormat}
        brandName={brandName}
        dateFormat={dateFormat}
        defaultLanguage={defaultLanguage}
        density={density}
        footerContact={footerContact}
        footerWebsite={footerWebsite}
        labelOverrides={labelOverrides}
        layoutPreset={layoutPreset}
        logoImageUrl={logoImageUrl}
        logoFont={logoFont}
        logoFontSize={logoFontSize}
        logoSource={logoSource}
        logoText={logoText}
        order={order}
        paperSize={paperSize}
        showBillTo={showBillTo}
        showContactFooter={showContactFooter}
        showInvoiceMeta={showInvoiceMeta}
        showItemOptions={showItemOptions}
        showLogoText={showLogoText}
        showNotes={showNotes}
        showOrderBarcode={showOrderBarcode}
        showPaymentMethod={showPaymentMethod}
        showProductImages={showProductImages}
        showShipTo={showShipTo}
        showShippingMethod={showShippingMethod}
        showSocialFooter={showSocialFooter}
        showSku={showSku}
        showStoreName={showStoreName}
        showThankYou={showThankYou}
        showTotals={showTotals}
        customAccentColor={customAccentColor}
        socialLinks={socialLinks}
        socialProfiles={socialProfiles}
        thankYouText={thankYouText}
        variant={variant}
        visualStyle={visualStyle ?? (layoutPreset === "Compact" ? "market" : "atelier")}
      />
    );
  }

  if (isTableFirst) {
    return (
      <span className={styles.templatePaper} data-layout={layoutPreset} data-size={paperSize} data-variant={variant}>
        <span className={styles.paperTitleBar}>
          <strong>{documentType}</strong>
          <small>Batch #240526</small>
        </span>
        <span className={styles.paperDenseStats}>
          <span>
            <small>Orders</small>
            <strong>3</strong>
          </span>
          <span>
            <small>Items</small>
            <strong>12</strong>
          </span>
          <span>
            <small>Missing</small>
            <strong>1</strong>
          </span>
        </span>
        <span className={styles.paperPickTable}>
          <span>
            <strong>SKU</strong>
            <strong>Item</strong>
            <strong>Qty</strong>
          </span>
          <span>
            <small>HD-240</small>
            <small>Custom hoodie</small>
            <strong>2</strong>
          </span>
          <span>
            <small>BOX-12</small>
            <small>Gift box</small>
            <strong>1</strong>
          </span>
          <span>
            <small>KIT-04</small>
            <small>Event kit</small>
            <strong>4</strong>
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={styles.templatePaper} data-layout={layoutPreset} data-size={paperSize} data-variant={variant}>
      <span className={styles.paperHeaderLine}>
        <span className={styles.paperBrandBlock}>
          <span className={styles.paperLogoMark}>ZI</span>
          <span>
            <strong>{printOpsSystemBrandName}</strong>
            <small>{printOpsSystemSiteUrl}</small>
          </span>
        </span>
        <span className={styles.paperDocBlock}>
          <strong>{documentType}</strong>
          <small>Invoice #1004</small>
          <small>May 25, 2026</small>
        </span>
      </span>

      <span className={styles.paperAddressGrid}>
        <span>
          <small>Ship to</small>
          <strong>Chris Young</strong>
          <span>812 Market Street</span>
          <span>San Francisco, CA</span>
        </span>
        <span>
          <small>From</small>
          <strong>{printOpsSystemBrandName}</strong>
          <span>zider.ink</span>
          <span>Workspace</span>
        </span>
      </span>

      <span className={styles.paperOrderStrip}>
        <span>
          <small>Status</small>
          <strong>Paid</strong>
        </span>
        <span>
          <small>Fulfillment</small>
          <strong>Partial</strong>
        </span>
        <span>
          <small>Items</small>
          <strong>4</strong>
        </span>
      </span>

      <span className={styles.paperItemsTable}>
        <span className={styles.paperItemsHead}>
          <strong>Item</strong>
          <strong>SKU</strong>
          <strong>Qty</strong>
        </span>
        <span className={styles.paperItemRow}>
          <span className={styles.paperItemThumb} />
          <span>
            <strong>Event kit</strong>
            <small>Sage / medium bundle</small>
          </span>
          <small>KIT-04</small>
          <strong>4</strong>
        </span>
        <span className={styles.paperItemRow}>
          <span className={styles.paperItemThumb} />
          <span>
            <strong>Gift card insert</strong>
            <small>Custom message included</small>
          </span>
          <small>INS-20</small>
          <strong>1</strong>
        </span>
      </span>

      <span className={styles.paperNoteBlock}>
        <small>Buyer note</small>
        <span>Please pack the kits together and include the return card.</span>
      </span>
      <span className={styles.paperFooterLine}>Thank you for your order. Returns accepted within 30 days.</span>
    </span>
  );
}

function getOrderTemplateAccentStyle(accentColor: OrderTemplateAccent, customAccentColor = defaultTemplateBrandSettings.customAccentColor): CSSProperties {
  if (accentColor === "custom") {
    const customColor = isValidHexColor(customAccentColor) ? customAccentColor : defaultTemplateBrandSettings.customAccentColor;

    return {
      "--order-accent": customColor,
      "--order-accent-2": customColor,
      "--order-ink": "#151817",
      "--order-line": "#d9dfdb",
      "--order-muted": "#65706d",
      "--order-soft": "#f4f6f4",
    } as CSSProperties;
  }

  const palettes: Record<OrderTemplateAccent, Record<string, string>> = {
    charcoal: {
      "--order-accent": "#151817",
      "--order-accent-2": "#303234",
      "--order-ink": "#151817",
      "--order-line": "#d9dfdb",
      "--order-muted": "#65706d",
      "--order-soft": "#f4f6f4",
    },
    forest: {
      "--order-accent": "#087a46",
      "--order-accent-2": "#046137",
      "--order-ink": "#10211a",
      "--order-line": "#cbdcd2",
      "--order-muted": "#5c6d65",
      "--order-soft": "#edf7f1",
    },
    slate: {
      "--order-accent": "#273d65",
      "--order-accent-2": "#151817",
      "--order-ink": "#161b24",
      "--order-line": "#d5dce6",
      "--order-muted": "#647084",
      "--order-soft": "#f2f5f8",
    },
    custom: {
      "--order-accent": defaultTemplateBrandSettings.customAccentColor,
      "--order-accent-2": defaultTemplateBrandSettings.customAccentColor,
      "--order-ink": "#151817",
      "--order-line": "#d9dfdb",
      "--order-muted": "#65706d",
      "--order-soft": "#f4f6f4",
    },
  };

  return palettes[accentColor] as CSSProperties;
}

function formatTemplateDate(format: TemplateDateFormat, locale: PrintLocale | SiteLocale) {
  const month = "05";
  const day = "30";
  const year = "2026";
  const shortMonthByLocale: Partial<Record<PrintLocale | SiteLocale, string>> = {
    ar: "مايو",
    de: "Mai",
    en: "May",
    es: "may",
    fr: "mai",
    it: "mag",
    ja: "5月",
    ko: "5월",
    nl: "mei",
    pt: "mai",
    "zh-Hans": "五月",
    "zh-Hant": "五月",
  };
  const shortMonth = shortMonthByLocale[locale] ?? "May";
  const isCjkDate = locale === "zh-Hant" || locale === "zh-Hans" || locale === "ja" || locale === "ko";

	  const values: Record<TemplateDateFormat, string> = {
	    "MM-DD-YYYY": `${month}-${day}-${year}`,
	    "DD-MM-YYYY": `${day}-${month}-${year}`,
	    "YYYY-MM-DD": `${year}-${month}-${day}`,
	    "MM/DD/YYYY": `${month}/${day}/${year}`,
	    "DD/MM/YYYY": `${day}/${month}/${year}`,
	    "YYYY/MM/DD": `${year}/${month}/${day}`,
	    "MMM D, YYYY": isCjkDate ? `${shortMonth} ${day}, ${year}` : `${shortMonth} ${Number(day)}, ${year}`,
	    "D MMM, YYYY": isCjkDate ? `${year} ${shortMonth} ${Number(day)}` : `${Number(day)} ${shortMonth}, ${year}`,
	    "MM.DD.YYYY": `${month}.${day}.${year}`,
	    "DD.MM.YYYY": `${day}.${month}.${year}`,
	    "YYYY.MM.DD": `${year}.${month}.${day}`,
	    "YYYY MMM D": isCjkDate ? `${year} ${shortMonth} ${Number(day)}` : `${year} ${shortMonth} ${Number(day)}`,
	  };

  return values[format];
}

function getTemplateDateFormatOptions(locale: SiteLocale): Array<{ label: string; value: TemplateDateFormat }> {
  return templateDateFormatOptions.map((option) => ({
    ...option,
    label: formatTemplateDate(option.value, locale),
  }));
}

function getSampleAddressLines(addressFormat: TemplateAddressFormat, type: "billing" | "shipping") {
  const name = type === "billing" ? "Yancy Tien" : "Yancy Tien";
  const street = type === "billing" ? "150 Elgin Street, 8th Floor" : "10018 Xuhui Road";
  const city = type === "billing" ? "Ottawa" : "Shanghai";
  const region = type === "billing" ? "ON K2P 1L4" : "Shanghai";
  const country = type === "billing" ? "Canada" : "China";
  const phone = "18516526365";

  if (addressFormat === "single-line") {
    return [`${name}, ${street}, ${city}, ${region}, ${country}, ${phone}`];
  }

  if (addressFormat === "compact") {
    return [name, `${street}, ${city}, ${region}`, `${country} / ${phone}`];
  }

  if (addressFormat === "china") {
    return [country, region, city, street, name, phone];
  }

  return [name, street, city, region, country, phone];
}

function getOrderPrintDetails(
  order: Order | null | undefined,
  options: {
    addressFormat: TemplateAddressFormat;
    dateFormat: TemplateDateFormat;
    locale: PrintLocale;
  },
): OrderPrintDetails {
  const rawOrder = order?.rawOrder;
  const customerRecord = getRecord(rawOrder?.customer);
  const customerName = order?.customer ?? getString(customerRecord?.name) ?? getString(customerRecord?.fullName) ?? "Yancy Tien";
  const customerContact = order?.email ?? getString(customerRecord?.email) ?? getString(customerRecord?.phone) ?? "18516526365";
  const billAddressLines = getOrderAddressLines(rawOrder?.billingAddress, {
    addressFormat: options.addressFormat,
    fallbackContact: customerContact,
    fallbackLines: getSampleAddressLines(options.addressFormat, "billing"),
    fallbackName: customerName,
  });
  const shipAddressLines = getOrderAddressLines(rawOrder?.shippingAddress, {
    addressFormat: options.addressFormat,
    fallbackContact: customerContact,
    fallbackLines: getSampleAddressLines(options.addressFormat, "shipping"),
    fallbackName: customerName,
  });
  const lineItems = getOrderPrintLineItems(order);
  const totals = getOrderPrintTotals(rawOrder, order?.total);

  return {
    billAddressLines,
    customFields: order?.customFields ?? [],
    date: formatTemplateDateFromValue(rawOrder?.createdAt ?? rawOrder?.updatedAt ?? null, options.dateFormat, options.locale),
    deliveryMethod: rawOrder?.deliveryMethod ?? order?.fulfillment ?? "Delivery method 3232",
    lineItems,
    note: rawOrder?.note?.trim() ?? "",
    number: order?.number ?? formatOrderNumber(rawOrder?.orderNumber ?? rawOrder?.sourceOrderId ?? "#10059"),
    paymentMethod: rawOrder?.paymentMethod ?? order?.payment ?? "Gift card",
    shipAddressLines,
    totals,
  };
}

function getOrderAddressLines(
  address: unknown,
  options: {
    addressFormat: TemplateAddressFormat;
    fallbackContact: string;
    fallbackLines: string[];
    fallbackName: string;
  },
) {
  const record = getRecord(address);
  const formatted = Array.isArray(record?.formatted) ? record.formatted.map((line) => getString(line)).filter((line): line is string => Boolean(line)) : [];
  const fieldLines =
    record && options.addressFormat === "china"
      ? [
          getString(record.country),
          getString(record.subdivision),
          getString(record.city),
          getString(record.addressLine1),
          getString(record.addressLine2),
          getString(record.name),
          getString(record.phone),
        ].filter((line): line is string => Boolean(line))
      : [
          getString(record?.name),
          getString(record?.company),
          getString(record?.addressLine1),
          getString(record?.addressLine2),
          [getString(record?.city), getString(record?.subdivision), getString(record?.postalCode)].filter(Boolean).join(", "),
          getString(record?.country),
          getString(record?.phone),
        ].filter((line): line is string => Boolean(line));
  const lines = fieldLines.length > 0 ? fieldLines : formatted.length > 0 ? formatted : [options.fallbackName, options.fallbackContact].filter(Boolean);
  const resolvedLines = lines.length > 0 ? lines : options.fallbackLines;

  if (options.addressFormat === "single-line") {
    return [resolvedLines.join(", ")];
  }

  if (options.addressFormat === "compact" && resolvedLines.length > 3) {
    return [resolvedLines[0], resolvedLines.slice(1, -1).join(", "), resolvedLines[resolvedLines.length - 1]].filter(Boolean);
  }

  return resolvedLines;
}

function getOrderPrintLineItems(order: Order | null | undefined): OrderPrintLineItem[] {
  const rawOrder = order?.rawOrder;
  const currency = rawOrder?.currency ?? null;
  const lineItems =
    rawOrder?.lineItems
      .map((lineItem, index) => {
        const title = lineItem.title ?? order?.items ?? `Line item ${index + 1}`;
        const quantity = lineItem.quantity ?? 1;
        const price = formatMoneyValue(lineItem.price, currency, "");
        const total = formatMoneyValue(lineItem.totalPrice, currency, price || order?.total || "$1.00");

        return {
          barcode: lineItem.barcode,
          imageUrl: lineItem.imageUrl,
          optionsText: formatLineItemOptions(lineItem),
          price: price || total,
          quantity,
          sku: lineItem.sku,
          title,
          total,
        };
      })
      .filter((lineItem) => lineItem.title) ?? [];

  if (lineItems.length > 0) {
    return lineItems.slice(0, 4);
  }

  return [
    {
      barcode: order?.barcode,
      imageUrl: null,
      optionsText: "",
      price: order?.total ?? "$1.00",
      quantity: 1,
      sku: order?.sku,
      title: order?.items ?? "示例商品A",
      total: order?.total ?? "$1.00",
    },
  ];
}

function getOrderPrintTotals(rawOrder: WixSyncOrderSummary | undefined, fallbackTotal: string | undefined): OrderPrintDetails["totals"] {
  const totals = getRecord(rawOrder?.totals);
  const currency = rawOrder?.currency ?? null;
  const subtotal = formatMoneyValue(totals?.subtotal, currency, fallbackTotal ?? "$1.00");
  const shipping = formatMoneyValue(totals?.shipping, currency, "$0.00");
  const tax = formatMoneyValue(totals?.tax, currency, "$0.00");
  const total = formatMoneyValue(totals?.total, currency, fallbackTotal ?? subtotal);

  return {
    items: subtotal,
    shipping,
    tax,
    total,
  };
}

function formatMoneyValue(value: unknown, fallbackCurrency: string | null, fallback: string) {
  const record = getRecord(value);
  const formatted = getString(record?.formatted) ?? getString(record?.formattedAmount) ?? getString(record?.displayValue);
  const amount = getNumber(record?.amount ?? record?.value);
  const currency = getString(record?.currency) ?? fallbackCurrency;

  return formatted ?? (amount !== null ? formatMoney(amount, currency) : fallback);
}

function formatLineItemOptions(lineItem: WixSyncOrderSummary["lineItems"][number]) {
  return [...lineItem.options, ...lineItem.customFields]
    .map((field) => formatWixCustomField(field))
    .filter((field): field is { label: string; value: string } => Boolean(field))
    .map((field) => (isGenericWixOptionLabel(field.label) ? field.value : `${field.label}: ${field.value}`))
    .join(" / ");
}

function formatTemplateDateFromValue(value: string | null, format: TemplateDateFormat, locale: PrintLocale) {
  if (!value) {
    return formatTemplateDate(format, locale);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());
  const shortMonthByLocale: Partial<Record<PrintLocale, string[]>> = {
    ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    de: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    fr: ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"],
    ja: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    ko: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    "zh-Hans": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    "zh-Hant": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  };
  const shortMonth = (shortMonthByLocale[locale] ?? shortMonthByLocale.en ?? [])[date.getMonth()] ?? "May";
  const isCjkDate = locale === "zh-Hant" || locale === "zh-Hans" || locale === "ja" || locale === "ko";
  const values: Record<TemplateDateFormat, string> = {
    "MM-DD-YYYY": `${month}-${day}-${year}`,
    "DD-MM-YYYY": `${day}-${month}-${year}`,
    "YYYY-MM-DD": `${year}-${month}-${day}`,
    "MM/DD/YYYY": `${month}/${day}/${year}`,
    "DD/MM/YYYY": `${day}/${month}/${year}`,
    "YYYY/MM/DD": `${year}/${month}/${day}`,
    "MMM D, YYYY": isCjkDate ? `${shortMonth} ${Number(day)}, ${year}` : `${shortMonth} ${Number(day)}, ${year}`,
    "D MMM, YYYY": isCjkDate ? `${year} ${shortMonth} ${Number(day)}` : `${Number(day)} ${shortMonth}, ${year}`,
    "MM.DD.YYYY": `${month}.${day}.${year}`,
    "DD.MM.YYYY": `${day}.${month}.${year}`,
    "YYYY.MM.DD": `${year}.${month}.${day}`,
    "YYYY MMM D": `${year} ${shortMonth} ${Number(day)}`,
  };

  return values[format];
}

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return <span className={styles.orderSocialIcon} data-platform={platform} aria-hidden="true" />;
}

function BrandLogoAsset({
  brandName,
  font,
  fontSize,
  logoImageUrl,
  logoSource,
  wordmark,
}: {
  brandName: string;
  font?: OrderTemplateLogoFont;
  fontSize?: number;
  logoImageUrl: string;
  logoSource: OrderTemplateLogoSource;
  wordmark: string;
}) {
  const displayBrandName = brandName.trim() || defaultTemplateBrandSettings.brandName;
  const displayWordmark = wordmark.trim() || defaultTemplateBrandSettings.logoText;
  const uploadedLogo = logoImageUrl.trim();
  const fontFamilyByType: Record<OrderTemplateLogoFont, string> = {
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    sans: "Inter, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
  };
  const logoFontFamily = fontFamilyByType[font ?? "sans"];
  const logoFontSize = Math.min(Math.max(fontSize ?? defaultTemplateBrandSettings.logoFontSize, 28), 96);

  if (logoSource === "uploaded-image" && uploadedLogo) {
    return <img className={styles.orderClassicLogoImage} alt={`${displayBrandName} logo`} src={uploadedLogo} />;
  }

  return (
    <span
      className={styles.orderClassicLogoText}
      role="img"
      aria-label={`${displayWordmark} logo`}
      style={{
        fontFamily: logoFontFamily,
        fontSize: `${logoFontSize}px`,
      }}
    >
      {displayWordmark}
    </span>
  );
}

function OrderPaperPreview({
  accentColor,
  addressFormat,
  brandName,
  dateFormat,
  defaultLanguage,
  density,
  footerContact,
  footerWebsite,
  labelOverrides,
  layoutPreset,
  logoImageUrl,
  logoFont,
  logoFontSize,
  logoSource,
  logoText,
  order,
  paperSize,
  showBillTo,
  showContactFooter,
  showInvoiceMeta,
  showItemOptions,
  showLogoText,
  showNotes,
  showOrderBarcode,
  showPaymentMethod,
  showProductImages,
  showShipTo,
  showShippingMethod,
  showSocialFooter,
  showSku,
  showStoreName,
  showThankYou,
  showTotals,
  customAccentColor,
  socialLinks,
  socialProfiles,
  thankYouText,
  variant,
  visualStyle,
}: {
  accentColor: OrderTemplateAccent;
  addressFormat: TemplateAddressFormat;
  brandName: string;
  dateFormat: TemplateDateFormat;
  defaultLanguage: PrintLocale;
  density: OrderTemplateDensity;
  footerContact: string;
  footerWebsite: string;
  labelOverrides: TemplateLabelOverrides;
  layoutPreset: TemplateRecord["layoutPreset"];
  logoImageUrl: string;
  logoFont: OrderTemplateLogoFont;
  logoFontSize: number;
  logoSource: OrderTemplateLogoSource;
  logoText: string;
  order?: Order | null;
  paperSize: TemplateRecord["paperSize"];
  showBillTo: boolean;
  showContactFooter: boolean;
  showInvoiceMeta: boolean;
  showItemOptions: boolean;
  showLogoText: boolean;
  showNotes: boolean;
  showOrderBarcode: boolean;
  showPaymentMethod: boolean;
  showProductImages: boolean;
  showShipTo: boolean;
  showShippingMethod: boolean;
  showSocialFooter: boolean;
  showSku: boolean;
  showStoreName: boolean;
  showThankYou: boolean;
  showTotals: boolean;
  customAccentColor: string;
  socialLinks: string;
  socialProfiles?: TemplateSocialProfiles;
  thankYouText: string;
  variant: "card" | "detail" | "editor";
  visualStyle: OrderTemplateVisualStyle;
}) {
  const normalizedSocialProfiles = normalizeSocialProfiles(socialProfiles, socialLinks);
  const socialItems = socialPlatformOptions
    .map((option) => {
      const profile = normalizedSocialProfiles[option.platform];

      if (!profile?.url) {
        return null;
      }

      return {
        label: option.label,
        platform: option.platform,
        url: profile.url,
      };
    })
    .filter((item): item is { label: string; platform: SocialPlatform; url: string } => Boolean(item))
    .slice(0, 4);
  const rawLogo = logoText.trim();
  const displayWordmark = rawLogo || printOpsSystemBrandName;
  const displayBrandName = brandName.trim() || defaultTemplateBrandSettings.brandName;
  const displayFooterWebsite = footerWebsite.trim();
  const displayFooterContact = footerContact.trim();
  const displayThankYou = thankYouText.trim() || defaultTemplateBrandSettings.thankYouText;
  const orderDetails = getOrderPrintDetails(order, {
    addressFormat,
    dateFormat,
    locale: defaultLanguage,
  });
  const displayDate = orderDetails.date;
  const billAddressLines = orderDetails.billAddressLines;
  const shipAddressLines = orderDetails.shipAddressLines;
  const label = (key: string) => resolveTemplateLabel(key, defaultLanguage, labelOverrides);
  const labels = {
    additionalDetails: label("template.additional_details"),
    billTo: label("template.bill_to"),
    invoiceDate: label("template.invoice_date"),
    invoiceNo: label("template.invoice_no"),
    invoiceTitle: label("template.invoice_title"),
    itemDescription: label("template.item_description"),
    items: label("template.items"),
    notes: label("template.notes"),
    orderBarcode: label("template.order_barcode"),
    orderDate: label("template.order_date"),
    payment: label("template.payment"),
    price: label("template.price"),
    questions: label("template.questions"),
    qty: label("template.qty"),
    shipTo: label("template.ship_to"),
    shipping: label("template.shipping"),
    sku: label("template.sku"),
    tax: label("template.tax"),
    total: label("template.total"),
    totalItems: label("template.total_items"),
  };

  const paperProps = {
    className: styles.templatePaper,
    "data-document": "order",
    "data-density": density,
    "data-images": showProductImages ? "visible" : "hidden",
    "data-layout": layoutPreset,
    "data-size": paperSize,
    "data-social": showSocialFooter ? "visible" : "hidden",
    "data-style": visualStyle,
    "data-variant": variant,
    dir: getLocaleDirection(defaultLanguage),
    lang: defaultLanguage,
    style: getOrderTemplateAccentStyle(accentColor, customAccentColor),
  };
  const renderProductImage = (lineItem: OrderPrintLineItem) =>
    showProductImages ? (
      <span className={styles.orderProductPhoto} aria-hidden="true">
        {lineItem.imageUrl ? (
          <img alt="" src={lineItem.imageUrl} />
        ) : (
          <svg className={styles.orderProductPhotoIcon} viewBox="0 0 64 64" focusable="false">
            <path className={styles.orderProductPhotoHandle} d="M19 29c0-9 5.8-15 13-15s13 6 13 15" />
            <path className={styles.orderProductPhotoBody} d="M11 30h42l4 22H7l4-22Z" />
            <path className={styles.orderProductPhotoShine} d="M13 31h38l-3 7H16l-3-7Z" />
          </svg>
        )}
      </span>
    ) : null;
  const renderSkuLine = (lineItem: OrderPrintLineItem) =>
    showSku && lineItem.sku ? (
      <small>
        <b>{labels.sku}</b> {lineItem.sku}
      </small>
    ) : null;
  const renderOptionsLine = (lineItem: OrderPrintLineItem) => (showItemOptions && lineItem.optionsText ? <small>{lineItem.optionsText}</small> : null);
  const orderBarcode = showOrderBarcode ? (
    <span className={styles.orderBarcodeBlock}>
      <small>{labels.orderBarcode}</small>
      <i aria-hidden="true" />
      <em>{orderDetails.lineItems.find((lineItem) => lineItem.barcode)?.barcode ?? orderDetails.number}</em>
    </span>
  ) : null;
  const additionalDetailsBlock =
    orderDetails.customFields.length > 0 ? (
      <span className={styles.orderCustomFieldsBlock}>
        <strong>{labels.additionalDetails}</strong>
        {orderDetails.customFields.slice(0, 4).map((field) => (
          <span key={`${field.label}-${field.value}`}>
            <small>{field.label}</small>
            <b>{field.value}</b>
          </span>
        ))}
      </span>
    ) : null;
  const orderNote = orderDetails.note.trim();
  const hasOrderNote = showNotes && orderNote.length > 0;
  const hasOrderDetails = hasOrderNote || Boolean(additionalDetailsBlock);
  const orderNotesBlock = hasOrderDetails ? (
    <span className={styles.orderNotesBlock}>
      {hasOrderNote ? (
        <>
          <strong>{labels.notes}</strong>
          <span>{orderNote}</span>
        </>
      ) : null}
      {additionalDetailsBlock}
    </span>
  ) : null;
  const hasContactFooter = showContactFooter && Boolean(displayFooterWebsite || displayFooterContact);
  const hasSocialFooter = showSocialFooter && socialItems.length > 0;
  const socialFooter = hasContactFooter || hasSocialFooter ? (
    <span className={styles.orderSocialFooter}>
      {hasContactFooter ? (
        <span>
          <strong>{displayFooterWebsite}</strong>
          <small>{displayFooterContact}</small>
        </span>
      ) : null}
      {hasSocialFooter ? (
        <span className={styles.orderSocialLinks}>
          {socialItems.map((item) => (
            <a aria-label={item.label} href={item.url} key={item.platform} rel="noreferrer" target="_blank" title={item.url}>
              <SocialIcon platform={item.platform} />
            </a>
          ))}
        </span>
      ) : null}
    </span>
  ) : null;
  const heroSocialFooter = hasContactFooter || hasSocialFooter ? (
    <span className={styles.orderHeroSocialFooter}>
      {hasContactFooter ? (
        <span>
          <strong>{displayFooterWebsite}</strong>
          <small>{displayFooterContact}</small>
        </span>
      ) : null}
      {hasSocialFooter ? (
        <span className={styles.orderHeroSocialIcons} aria-label="Social links">
          {socialItems.map((item) => {
            return (
              <a aria-label={item.label} href={item.url} key={item.platform} rel="noreferrer" target="_blank" title={item.url}>
                <SocialIcon platform={item.platform} />
              </a>
            );
          })}
        </span>
      ) : null}
    </span>
  ) : null;

  if (visualStyle === "atelier") {
    return (
      <span {...paperProps}>
        {showLogoText || showInvoiceMeta ? (
          <span className={styles.orderHeroHeader}>
            {showInvoiceMeta ? (
              <span className={styles.orderHeroMeta}>
                {showStoreName ? <strong>{displayBrandName}</strong> : null}
                <span>
                  <b>{labels.invoiceNo}</b> {orderDetails.number}
                </span>
                <span>
                  <b>{labels.invoiceDate}</b> {displayDate}
                </span>
                {showPaymentMethod ? (
                  <span>
                    <b>{labels.payment}</b> {orderDetails.paymentMethod}
                  </span>
                ) : null}
                {showShippingMethod ? (
                  <span>
                    <b>{labels.shipping}</b> {orderDetails.deliveryMethod}
                  </span>
                ) : null}
                {orderBarcode}
              </span>
            ) : null}
            {showLogoText ? (
              <span className={styles.orderHeroLogoSlot}>
                <BrandLogoAsset
                  brandName={displayBrandName}
                  font={logoFont}
                  fontSize={logoFontSize}
                  logoImageUrl={logoImageUrl}
                  logoSource={logoSource}
                  wordmark={displayWordmark}
                />
              </span>
            ) : null}
          </span>
        ) : null}

        {showBillTo || showShipTo ? (
          <span className={styles.orderHeroAddressGrid} data-columns={showBillTo && showShipTo ? "two" : "one"}>
            {showBillTo ? (
              <span>
                <strong>{labels.billTo}</strong>
                {billAddressLines.map((line, index) => (
                  <span key={`${line}-${index}`}>{line}</span>
                ))}
              </span>
            ) : null}
            {showShipTo ? (
              <span>
                <strong>{labels.shipTo}</strong>
                {shipAddressLines.map((line, index) => (
                  <span key={`${line}-${index}`}>{line}</span>
                ))}
              </span>
            ) : null}
          </span>
        ) : null}

        <span className={styles.orderHeroTable}>
          <span className={styles.orderHeroTableHead}>
            <strong>{labels.itemDescription}</strong>
            <strong>{labels.qty}</strong>
            <strong>{labels.price}</strong>
            <strong>{labels.total}</strong>
          </span>
          {orderDetails.lineItems.map((lineItem, index) => (
            <span className={styles.orderHeroRow} key={`${lineItem.title}-${index}`}>
              <span className={styles.orderHeroItem}>
                {renderProductImage(lineItem)}
                <span>
                  <strong>{lineItem.title}</strong>
                  {renderSkuLine(lineItem)}
                  {renderOptionsLine(lineItem)}
                </span>
              </span>
              <strong>x{lineItem.quantity}</strong>
              <span>{lineItem.price}</span>
              <strong>{lineItem.total}</strong>
            </span>
          ))}
        </span>

        {hasOrderDetails || showTotals ? (
          <span className={styles.orderHeroSummary} data-columns={hasOrderDetails && showTotals ? "two" : "one"}>
            {orderNotesBlock}
            {showTotals ? (
              <span className={styles.orderHeroTotals}>
                <span>
                  <small>{labels.items}</small>
                  <strong>{orderDetails.totals.items}</strong>
                </span>
                <span>
                  <small>{labels.shipping}</small>
                  <strong>{orderDetails.totals.shipping}</strong>
                </span>
                <span>
                  <small>{labels.tax}</small>
                  <strong>{orderDetails.totals.tax}</strong>
                </span>
                <span data-emphasis="true">
                  <small>{labels.total}</small>
                  <strong>{orderDetails.totals.total}</strong>
                </span>
              </span>
            ) : null}
          </span>
        ) : null}

        {showThankYou ? (
          <span className={styles.orderHeroThanks}>
            <span>{labels.questions}</span>
            <strong>{displayThankYou}</strong>
          </span>
        ) : null}
        {heroSocialFooter}
      </span>
    );
  }

  if (visualStyle === "market") {
    return (
      <span {...paperProps}>
        <span className={styles.orderClassicHeader}>
          <span>
            <strong>{labels.invoiceTitle}</strong>
            <small>{labels.invoiceNo} {orderDetails.number}</small>
            <small>{labels.orderDate} {displayDate}</small>
            <small>{labels.payment} {orderDetails.paymentMethod}</small>
            <small>{labels.shipping} {orderDetails.deliveryMethod}</small>
            {orderBarcode}
          </span>
          <span className={styles.orderClassicLogo}>
            <BrandLogoAsset brandName={displayBrandName} font={logoFont} fontSize={logoFontSize} logoImageUrl={logoImageUrl} logoSource={logoSource} wordmark={displayWordmark} />
          </span>
        </span>

        <span className={styles.orderClassicAddresses}>
          <span>
            <strong>{labels.billTo}</strong>
            {billAddressLines.map((line, index) => (
              <span key={`${line}-${index}`}>{line}</span>
            ))}
          </span>
          <span>
            <strong>{labels.shipTo}</strong>
            {shipAddressLines.map((line, index) => (
              <span key={`${line}-${index}`}>{line}</span>
            ))}
          </span>
        </span>

        <span className={styles.orderClassicTable}>
          <span className={styles.orderClassicTableHead}>
            <strong>{labels.itemDescription}</strong>
            <strong>{labels.qty}</strong>
            <strong>{labels.price}</strong>
            <strong>{labels.total}</strong>
          </span>
          {orderDetails.lineItems.map((lineItem, index) => (
            <span className={styles.orderClassicRow} key={`${lineItem.title}-${index}`}>
              <span className={styles.orderClassicItem}>
                {renderProductImage(lineItem)}
                <span>
                  <strong>{lineItem.title}</strong>
                  {renderSkuLine(lineItem)}
                  {renderOptionsLine(lineItem)}
                </span>
              </span>
              <strong>x{lineItem.quantity}</strong>
              <span>{lineItem.price}</span>
              <strong>{lineItem.total}</strong>
            </span>
          ))}
        </span>

        {hasOrderDetails || showTotals ? (
          <span className={styles.orderClassicLower} data-columns={hasOrderDetails && showTotals ? "two" : "one"}>
            {orderNotesBlock}
            {showTotals ? (
              <span className={styles.orderClassicTotals}>
                <span>
                  <strong>{labels.items}</strong>
                  <small>{orderDetails.totals.items}</small>
                </span>
                <span>
                  <strong>{labels.shipping}</strong>
                  <small>{orderDetails.totals.shipping}</small>
                </span>
                <span>
                  <strong>{labels.tax}</strong>
                  <small>{orderDetails.totals.tax}</small>
                </span>
                <span data-emphasis="true">
                  <strong>{labels.total}</strong>
                  <small>{orderDetails.totals.total}</small>
                </span>
              </span>
            ) : null}
            </span>
        ) : null}

        <span className={styles.orderCenteredFooter}>
          <strong>{displayThankYou}</strong>
          <span>{displayFooterContact || printOpsSystemSiteUrl}</span>
        </span>
        {socialFooter}
      </span>
    );
  }

  return (
    <span
      {...paperProps}
    >
      <span className={styles.orderSlipHeader}>
        <span>
          <strong>{labels.invoiceTitle}</strong>
          <small>{labels.invoiceNo} {orderDetails.number}</small>
          <small>{labels.orderDate} {displayDate}</small>
          <small>{labels.totalItems} {orderDetails.lineItems.reduce((total, lineItem) => total + lineItem.quantity, 0)}</small>
          {orderBarcode}
        </span>
        <span className={styles.orderClassicLogo}>
          <BrandLogoAsset brandName={displayBrandName} font={logoFont} fontSize={logoFontSize} logoImageUrl={logoImageUrl} logoSource={logoSource} wordmark={displayWordmark} />
        </span>
      </span>

      <span className={styles.orderSlipAddresses}>
        <span>
          <strong>{labels.billTo}</strong>
          {billAddressLines.map((line, index) => (
            <span key={`${line}-${index}`}>{line}</span>
          ))}
        </span>
        <span>
          <strong>{labels.shipTo}</strong>
          {shipAddressLines.map((line, index) => (
            <span key={`${line}-${index}`}>{line}</span>
          ))}
        </span>
      </span>

      <span className={styles.orderSlipTable}>
        <span className={styles.orderSlipTableHead}>
          <strong>{labels.itemDescription}</strong>
          <strong>{labels.qty}</strong>
        </span>
        {orderDetails.lineItems.map((lineItem, index) => (
          <span key={`${lineItem.title}-${index}`}>
            <span className={styles.orderClassicItem}>
              {renderProductImage(lineItem)}
              <span>
                <strong>{lineItem.title}</strong>
                {renderSkuLine(lineItem)}
                {renderOptionsLine(lineItem)}
              </span>
            </span>
            <strong>x{lineItem.quantity}</strong>
          </span>
        ))}
      </span>

      {hasOrderDetails ? <span className={styles.orderSlipNotes}>{orderNotesBlock}</span> : null}

      <span className={styles.orderSlipThanks}>
        <strong>{displayThankYou}</strong>
        <span>{labels.questions}</span>
        <span>{displayFooterContact || printOpsSystemSiteUrl}</span>
      </span>

      {socialFooter}
    </span>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.specItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OrderTemplatePrintDocument({
  order,
  printLocale,
  templateRecord,
}: {
  order: Order;
  printLocale: PrintLocale;
  templateRecord: TemplateRecord;
}) {
  return (
    <TemplatePaperPreview
      accentColor={templateRecord.accentColor}
      addressFormat={templateRecord.addressFormat}
      brandName={templateRecord.brandName}
      dateFormat={templateRecord.dateFormat}
      defaultLanguage={printLocale}
      density={templateRecord.density}
      documentType={templateRecord.documentType}
      footerContact={templateRecord.footerContact}
      footerWebsite={templateRecord.footerWebsite}
      labelOverrides={templateRecord.labelOverrides}
      layoutPreset={templateRecord.layoutPreset}
      logoImageUrl={templateRecord.logoImageUrl}
      logoFont={templateRecord.logoFont}
      logoFontSize={templateRecord.logoFontSize}
      logoSource={templateRecord.logoSource}
      logoText={templateRecord.logoText}
      order={order}
      paperSize={templateRecord.paperSize}
      showBillTo={templateRecord.showBillTo}
      showContactFooter={templateRecord.showContactFooter}
      showInvoiceMeta={templateRecord.showInvoiceMeta}
      showItemOptions={templateRecord.showItemOptions}
      showLogoText={templateRecord.showLogoText}
      showNotes={templateRecord.showNotes}
      showOrderBarcode={templateRecord.showOrderBarcode}
      showPaymentMethod={templateRecord.showPaymentMethod}
      showProductImages={templateRecord.showProductImages}
      showShipTo={templateRecord.showShipTo}
      showShippingMethod={templateRecord.showShippingMethod}
      showSocialFooter={templateRecord.showSocialFooter}
      showSku={templateRecord.showSku}
      showStoreName={templateRecord.showStoreName}
      showThankYou={templateRecord.showThankYou}
      showTotals={templateRecord.showTotals}
      customAccentColor={templateRecord.customAccentColor}
      socialLinks={templateRecord.socialLinks}
      socialProfiles={templateRecord.socialProfiles}
      thankYouText={templateRecord.thankYouText}
      variant="detail"
      visualStyle={templateRecord.visualStyle}
    />
  );
}

function PrintPreview({
  selectedOrders,
  compact,
  previewId,
  printLocale,
  templateRecord,
}: {
  selectedOrders: Order[];
  compact?: boolean;
  previewId: string;
  printLocale: PrintLocale;
  templateRecord: TemplateRecord;
}) {
  const paperRef = useRef<HTMLDivElement | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const firstOrder = selectedOrders[0] ?? null;
  const copy = getPrintTemplateCopy(printLocale);

  const handleDownloadPdf = async () => {
    const paperNode = getOrderPreviewPaperNode(paperRef.current);

    if (!firstOrder || !paperNode || isExportingPdf) {
      return;
    }

    setIsExportingPdf(true);

    try {
      const fileName = getOrderFileName(firstOrder);
      const pdfBlob = await createOrderPdfBlob(paperNode, fileName);

      downloadPdfBlob(pdfBlob, fileName);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    const paperNode = getOrderPreviewPaperNode(paperRef.current);

    if (!firstOrder || !paperNode) {
      return;
    }

    openOrderPrintWindow(paperNode, `${copy.title} ${firstOrder.number}`);
  };

  if (!firstOrder) {
    return (
      <div className={styles.previewStack} data-compact={compact}>
        <div className={styles.emptyPreviewState}>
          <FileText size={22} aria-hidden />
          <strong>{copy.title}</strong>
          <span>{copy.emptySelection}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.previewStack} data-compact={compact}>
      <div className={styles.previewHeader}>
        <div>
          <span>{templateRecord.name}</span>
          <strong>{firstOrder.number}</strong>
        </div>
        <span>{templateRecord.paperSize}</span>
      </div>
      <div className={styles.orderTemplateStage} data-compact={compact} ref={paperRef}>
        <OrderTemplatePrintDocument order={firstOrder} printLocale={printLocale} templateRecord={templateRecord} />
      </div>
      <div className={styles.previewFooter}>
        <span>{selectedOrders.length || 1} orders in batch</span>
        <div className={styles.previewFooterActions}>
          <button
            className={styles.iconTextButton}
            data-preview-action="download"
            data-preview-id={previewId}
            type="button"
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
          >
            <Download size={16} aria-hidden />
            {copy.pdf}
          </button>
          <button className={styles.iconTextButton} data-preview-action="print" data-preview-id={previewId} type="button" onClick={handlePrint}>
            <Printer size={16} aria-hidden />
            {copy.print}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderExportController({
  actionRequest,
  onActionHandled,
  printLocale,
  selectedOrders,
  templateRecord,
}: {
  actionRequest?: OrderActionRequest | null;
  onActionHandled?: () => void;
  printLocale: PrintLocale;
  selectedOrders: Order[];
  templateRecord: TemplateRecord;
}) {
  const paperRef = useRef<HTMLDivElement | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const activeOrders = actionRequest?.orders.length ? actionRequest.orders : selectedOrders;
  const firstOrder = activeOrders[0] ?? null;
  const copy = getPrintTemplateCopy(printLocale);

  const handleDownloadPdf = async () => {
    const paperNode = getOrderPreviewPaperNode(paperRef.current);

    if (!firstOrder || !paperNode || isExportingPdf) {
      return;
    }

    setIsExportingPdf(true);

    try {
      const fileName = getOrderFileName(firstOrder);
      const pdfBlob = await createOrderPdfBlob(paperNode, fileName);

      downloadPdfBlob(pdfBlob, fileName);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    const paperNode = getOrderPreviewPaperNode(paperRef.current);

    if (!firstOrder || !paperNode) {
      return;
    }

    openOrderPrintWindow(paperNode, `${copy.title} ${firstOrder.number}`);
  };

  useEffect(() => {
    if (!actionRequest) {
      return;
    }

    const currentRequest = actionRequest;
    let cancelled = false;

    async function runActionRequest() {
      try {
        if (currentRequest.action === "download") {
          await handleDownloadPdf();
        } else {
          handlePrint();
        }
      } finally {
        if (!cancelled) {
          onActionHandled?.();
        }
      }
    }

    void runActionRequest();

    return () => {
      cancelled = true;
    };
  }, [actionRequest?.id]);

  if (!firstOrder) {
    return null;
  }

  return (
    <div aria-hidden className={styles.exportOnlyStage} ref={paperRef}>
      <OrderTemplatePrintDocument order={firstOrder} printLocale={printLocale} templateRecord={templateRecord} />
    </div>
  );
}
