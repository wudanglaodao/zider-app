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
  Mail,
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
  UserRound,
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
  channel: string;
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
  fulfillment: "Unfulfilled" | "Pickup" | "Partial" | "Ready" | "Unknown";
  payment: "Paid" | "Unpaid" | "Partially paid" | "Unknown";
  print: "Unprinted" | "Generated" | "Printed" | "Failed";
  template: string;
  language: string;
  store?: {
    id: string;
    name: string | null;
    platformSiteId: string | null;
    siteUrl: string | null;
  } | null;
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

type PrintOpsSubscriptionUpgradeAction = {
  href: string;
  provider: "wix" | "support";
  targetPlanId: string | null;
};

type PrintOpsPluginContext = {
  accountBindingEndpoint?: string;
  appKey: string;
  appName: string;
  dashboardHref?: string;
  instanceId: string | null;
  ordersEndpoint: string;
  platform: "wix";
  settingsEndpoint?: string;
  source: "instance" | "dev-instance-id" | "missing";
  storeProfileEndpoint?: string;
  subscriptionUpgrade?: PrintOpsSubscriptionUpgradeAction;
  syncEndpoint: string;
  templatesEndpoint?: string;
  viewLinks?: Record<PrintOpsView, string>;
  verified: boolean;
};

type WixSyncMessages = Record<keyof PrintOpsMessages["wixSync"], string>;

type PrintOpsStoreProfileSummary = {
  address?: Record<string, unknown>;
  businessEmail: string | null;
  businessName: string | null;
  currency: string | null;
  language: string | null;
  locale: string | null;
  logoMediaPath: string | null;
  logoUrl: string | null;
  ownerEmail: string | null;
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
type TemplateStoreStatus = {
  error: string | null;
  status: "idle" | "loading" | "loaded" | "saving" | "saved" | "skipped" | "error";
};
type PrintOpsSettingsSnapshot = {
  darkTheme: boolean;
  language: PrintLocale;
  siteLocale: SiteLocale;
  timezone: string;
  workspaceAccent: WorkspaceAccent;
};

type AccountBindingSnapshot = {
  bindingEmail: string | null;
  bindingStatus: "pending" | "verified" | "revoked";
  developmentCode?: string | null;
  memberEmail: string | null;
  ownerEmail: string | null;
  suggestedEmail: string | null;
  workspaceName: string | null;
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
  installationId: string | null;
  platformStoreProfileId: string | null;
  workspaceId: string | null;
  store: {
    id: string;
    name: string | null;
    platformSiteId: string | null;
    siteUrl: string | null;
  } | null;
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
  lastSyncedAt: string | null;
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
type PrintOpsSubscriptionSummary = {
  plan: {
    id: "free" | "starter" | "pro" | "business" | string;
    monthlyOrderLimit: number;
    name: string;
  };
  reason?: string;
  status: "loaded" | "skipped" | "error";
  upgrade?: PrintOpsSubscriptionUpgradeAction;
  usage: {
    limit?: number;
    metric?: string;
    periodEnd: string;
    periodStart: string;
    remaining: number;
    used: number;
  };
};
const fallbackPrintOpsSubscription: PrintOpsSubscriptionSummary = {
  plan: {
    id: "free",
    monthlyOrderLimit: 50,
    name: "Free",
  },
  status: "skipped",
  upgrade: {
    href: "mailto:support@zider.ink?subject=Upgrade%20PrintOps%20plan",
    provider: "support",
    targetPlanId: "starter",
  },
  usage: {
    limit: 50,
    metric: "monthlyOrders",
    periodEnd: "",
    periodStart: "",
    remaining: 50,
    used: 0,
  },
};
type OrderTemplateVisualStyle = "atelier" | "market" | "mono";
type OrderTemplateAccent = "charcoal" | "forest" | "slate" | "custom";
type WorkspaceAccent = "forest" | "blue" | "violet" | "red" | "amber";
type OrderTemplateDensity = "balanced" | "compact" | "spacious";
type OrderTemplateLogoSource = "generated-svg" | "uploaded-image";
type OrderTemplateLogoFont = "sans" | "serif" | "mono";
type SocialPlatform =
  | "instagram"
  | "facebook"
  | "x"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "pinterest"
  | "threads"
  | "snapchat"
  | "whatsapp"
  | "line"
  | "telegram"
  | "messenger"
  | "discord"
  | "website";
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
  | "showItemsTotal"
  | "showShippingTotal"
  | "showTaxTotal"
  | "showGrandTotal"
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
  schemaVersion: number;
  rendererKey: PrintOpsTemplateRendererKey;
  baseBlueprintKey?: PrintOpsTemplateBlueprintKey;
  baseBlueprintVersion?: number;
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
  documentTitleFont: OrderTemplateLogoFont;
  documentTitleFontSize: number;
  thankYouFontSize: number;
  bodyFont: OrderTemplateLogoFont;
  bodyFontSize: number;
  footerWebsite: string;
  footerContact: string;
  contactPromptText: string;
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
  showItemsTotal?: boolean;
  showShippingTotal?: boolean;
  showTaxTotal?: boolean;
  showGrandTotal?: boolean;
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

type PrintOpsTemplateBlueprintKey = "invoice_big_brand" | "invoice_minimal";

type PrintOpsTemplateRendererKey = "invoice_big_brand_v1" | "invoice_minimal_v1";

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
  documentTitleFont: OrderTemplateLogoFont;
  documentTitleFontSize: number;
  thankYouFontSize: number;
  bodyFont: OrderTemplateLogoFont;
  bodyFontSize: number;
  footerWebsite: string;
  footerContact: string;
  contactPromptText: string;
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
  showItemsTotal: boolean;
  showShippingTotal: boolean;
  showTaxTotal: boolean;
  showGrandTotal: boolean;
  showPaymentMethod: boolean;
  showShippingMethod: boolean;
  showThankYou: boolean;
  showContactFooter: boolean;
  showSocialFooter: boolean;
  dataRequirements: string;
};

const templateStorageKey = "printops-templates-v12";
const selectedTemplateStorageKey = "printops-selected-template-v1";
const siteLocaleStorageKey = "printops-site-locale-v1";
const printLocaleStorageKey = "printops-print-locale-v1";
const timezoneStorageKey = "printops-timezone-v1";
const workspaceAccentStorageKey = "printops-accent-v1";
const initialOrderSyncStorageKey = "printops-initial-order-sync-v1";
const lastOrderSyncStorageKey = "printops-last-order-sync-v1";
const orderAutoRefreshIntervalMs = 3 * 60 * 1000;
const deprecatedTemplateIds = new Set(["library-order-field-map"]);
const legacyDefaultLogoFontSize = 68;
const printOpsTemplateSchemaVersion = 1;
const printOpsTemplateBlueprintVersion = 1;
const systemTemplateIds = new Set([
  "store-order-clean",
  "store-order-compact",
  "store-order-payment-check",
  "library-order-modern",
  "library-order-minimal",
]);
const templateLibraryPreviewImages: Record<string, string> = {
  "library-order-modern": "/printops/template-previews/invoice-big-brand.jpg",
  "library-order-minimal": "/printops/template-previews/invoice-minimal.jpg",
};
const templateBlueprintRegistry: Record<
  PrintOpsTemplateBlueprintKey,
  {
    defaultVisualStyle: OrderTemplateVisualStyle;
    rendererKey: PrintOpsTemplateRendererKey;
  }
> = {
  invoice_big_brand: {
    defaultVisualStyle: "atelier",
    rendererKey: "invoice_big_brand_v1",
  },
  invoice_minimal: {
    defaultVisualStyle: "market",
    rendererKey: "invoice_minimal_v1",
  },
};
const templateBlueprintIdMap: Record<string, PrintOpsTemplateBlueprintKey> = {
  "library-order-modern": "invoice_big_brand",
  "library-order-minimal": "invoice_minimal",
  "store-order-clean": "invoice_big_brand",
  "store-order-compact": "invoice_minimal",
  "store-order-payment-check": "invoice_big_brand",
};

function getInitialOrderSyncStorageKey(instanceId: string | null | undefined) {
  return `${initialOrderSyncStorageKey}:${instanceId || "local"}`;
}

function getLastOrderSyncStorageKey(instanceId: string | null | undefined) {
  return `${lastOrderSyncStorageKey}:${instanceId || "local"}`;
}

function getTemplateLibraryPreviewImage(templateId: string) {
  return templateLibraryPreviewImages[templateId] ?? templateLibraryPreviewImages["library-order-minimal"];
}

function resolveTemplateBlueprintKey(templateRecord: Partial<TemplateRecord>): PrintOpsTemplateBlueprintKey {
  if (templateRecord.baseBlueprintKey && templateRecord.baseBlueprintKey in templateBlueprintRegistry) {
    return templateRecord.baseBlueprintKey;
  }

  if (templateRecord.id && templateBlueprintIdMap[templateRecord.id]) {
    return templateBlueprintIdMap[templateRecord.id];
  }

  return templateRecord.visualStyle === "market" || templateRecord.layoutPreset === "Compact" ? "invoice_minimal" : "invoice_big_brand";
}

function getTemplateRendererKey(blueprintKey: PrintOpsTemplateBlueprintKey): PrintOpsTemplateRendererKey {
  return templateBlueprintRegistry[blueprintKey].rendererKey;
}

function isBuiltInTemplateRecord(templateRecord: Partial<TemplateRecord>) {
  return templateRecord.source === "Built-in" || Boolean(templateRecord.id && templateRecord.id.startsWith("library-"));
}

function isStoreTemplateRecord(templateRecord: Partial<TemplateRecord>) {
  return !isBuiltInTemplateRecord(templateRecord) && templateRecord.source === "Store copy";
}

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

type InterfaceCopyLocale = "en" | "zh-Hant";

function getInterfaceCopyLocale(locale: SiteLocale): InterfaceCopyLocale {
  return locale === "zh-Hans" || locale === "zh-Hant" ? "zh-Hant" : "en";
}

const templateAddressFormatOptions: Record<InterfaceCopyLocale, Array<{ label: string; value: TemplateAddressFormat }>> = {
  en: [
    { label: "Name-first multi-line", value: "western" },
    { label: "Region-first multi-line", value: "china" },
    { label: "Compact", value: "compact" },
    { label: "Single line", value: "single-line" },
  ],
  "zh-Hant": [
    { label: "姓名優先多行", value: "western" },
    { label: "地區優先多行", value: "china" },
    { label: "緊湊格式", value: "compact" },
    { label: "單行格式", value: "single-line" },
  ],
};

function getTemplateAddressFormatOptions(locale: SiteLocale) {
  return templateAddressFormatOptions[getInterfaceCopyLocale(locale)];
}

const printOpsSystemBrandName = "ZIDER";
const printOpsSystemSiteUrl = "https://www.zider.ink/";
const printOpsSystemSupportEmail = "support@zider.ink";
const printOpsSystemFooterAddress = "150 Elgin Street, 8th Floor";
const printOpsSystemFooterContact = `${printOpsSystemFooterAddress} / ${printOpsSystemSupportEmail}`;
const printOpsBarcodeFeatureEnabled = false;

const legacyTemplateDefaults = {
  brandName: "Green Studio",
  footerContact: printOpsSystemFooterContact,
  footerWebsite: "Zider.ink",
  logoText: "Hello",
  socialUsername: "greenstudio",
  websiteUrl: "https://www.zider.ink/",
};

const socialPlatformOptions = [
  { label: "Instagram", platform: "instagram", baseUrl: "https://instagram.com/", placeholder: "zider" },
  { label: "Facebook", platform: "facebook", baseUrl: "https://facebook.com/", placeholder: "zider" },
  { label: "X", platform: "x", baseUrl: "https://x.com/", placeholder: "zider" },
  { label: "TikTok", platform: "tiktok", baseUrl: "https://tiktok.com/@", placeholder: "zider" },
  { label: "YouTube", platform: "youtube", baseUrl: "https://youtube.com/@", placeholder: "zider" },
  { label: "LinkedIn", platform: "linkedin", baseUrl: "https://linkedin.com/company/", placeholder: "zider" },
  { label: "Pinterest", platform: "pinterest", baseUrl: "https://pinterest.com/", placeholder: "zider" },
  { label: "Threads", platform: "threads", baseUrl: "https://threads.net/@", placeholder: "zider" },
  { label: "Snapchat", platform: "snapchat", baseUrl: "https://snapchat.com/add/", placeholder: "zider" },
  { label: "WhatsApp", platform: "whatsapp", baseUrl: "https://wa.me/", placeholder: "+15551234567" },
  { label: "LINE", platform: "line", baseUrl: "https://line.me/R/ti/p/", placeholder: "@zider" },
  { label: "Telegram", platform: "telegram", baseUrl: "https://t.me/", placeholder: "zider" },
  { label: "Messenger", platform: "messenger", baseUrl: "https://m.me/", placeholder: "zider" },
  { label: "Discord", platform: "discord", baseUrl: "https://discord.gg/", placeholder: "zider" },
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

function normalizeSocialHandle(platform: SocialPlatform, value: string) {
  const cleanValue = value.trim();

  if (platform === "whatsapp") {
    return cleanValue.replace(/[^\d]/g, "");
  }

  if (platform === "line") {
    return cleanValue.replace(/^\/+|\/+$/g, "");
  }

  if (platform === "discord") {
    return normalizeSocialUsername(cleanValue)
      .replace(/^discord(?:app)?\.com\/invite\//i, "")
      .replace(/^discord\.gg\//i, "");
  }

  return normalizeSocialUsername(cleanValue);
}

function buildSocialUrl(platform: SocialPlatform, mode: SocialLinkMode, value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return "";
  }

  if (mode === "url" || platform === "website" || /^https?:\/\//i.test(cleanValue)) {
    return ensureUrlProtocol(cleanValue);
  }

  const platformOption = socialPlatformOptions.find((option) => option.platform === platform);
  const username = normalizeSocialHandle(platform, cleanValue);

  if (!username) {
    return "";
  }

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

  if (lowerValue.includes("tiktok")) {
    return "tiktok";
  }

  if (lowerValue.includes("youtube") || lowerValue.includes("youtu.be")) {
    return "youtube";
  }

  if (lowerValue.includes("linkedin")) {
    return "linkedin";
  }

  if (lowerValue.includes("pinterest")) {
    return "pinterest";
  }

  if (lowerValue.includes("threads")) {
    return "threads";
  }

  if (lowerValue.includes("snapchat")) {
    return "snapchat";
  }

  if (lowerValue.includes("whatsapp") || lowerValue.includes("wa.me")) {
    return "whatsapp";
  }

  if (lowerValue.includes("line.me") || lowerValue.includes("lin.ee")) {
    return "line";
  }

  if (lowerValue.includes("telegram") || lowerValue.includes("t.me")) {
    return "telegram";
  }

  if (lowerValue.includes("messenger") || lowerValue.includes("m.me")) {
    return "messenger";
  }

  if (lowerValue.includes("discord")) {
    return "discord";
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
  logoFontSize: 56,
  logoSource: "generated-svg",
  logoImageUrl: "",
  documentTitleFont: "sans",
  documentTitleFontSize: 32,
  thankYouFontSize: 24,
  bodyFont: "sans",
  bodyFontSize: 14,
  footerWebsite: printOpsSystemSiteUrl,
  footerContact: printOpsSystemFooterContact,
  contactPromptText: "Questions? Please contact us.",
  thankYouText: "Thanks for your business!",
  accentColor: "charcoal",
  customAccentColor: "#087a46",
  density: "balanced",
  socialLinks: serializeSocialProfiles(defaultTemplateSocialProfiles),
  socialProfiles: defaultTemplateSocialProfiles,
  showLogoText: true,
  showStoreName: true,
  showInvoiceMeta: true,
  showOrderBarcode: false,
  showBillTo: true,
  showShipTo: true,
  showProductImages: true,
  showSku: true,
  showItemOptions: true,
  showNotes: true,
  showTotals: true,
  showItemsTotal: true,
  showShippingTotal: true,
  showTaxTotal: true,
  showGrandTotal: true,
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
  | "contactPromptText"
  | "addressFormat"
  | "dateFormat"
  | "bodyFont"
  | "bodyFontSize"
  | "documentTitleFont"
  | "documentTitleFontSize"
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
  | "showItemsTotal"
  | "showShippingTotal"
  | "showTaxTotal"
  | "showGrandTotal"
  | "socialLinks"
  | "socialProfiles"
  | "thankYouFontSize"
  | "thankYouText"
>;

function normalizeStoredTemplateRecord(templateRecord: TemplateRecord): TemplateRecord {
  const blueprintKey = resolveTemplateBlueprintKey(templateRecord);
  const normalizedTemplateRecord = {
    ...templateRecord,
    schemaVersion: Number.isFinite(templateRecord.schemaVersion) ? templateRecord.schemaVersion : printOpsTemplateSchemaVersion,
    rendererKey: templateRecord.rendererKey ?? getTemplateRendererKey(blueprintKey),
    baseBlueprintKey: blueprintKey,
    baseBlueprintVersion: templateRecord.baseBlueprintVersion ?? printOpsTemplateBlueprintVersion,
    source: isBuiltInTemplateRecord(templateRecord) ? ("Built-in" as const) : ("Store copy" as const),
    contactPromptText: templateRecord.contactPromptText ?? defaultTemplateBrandSettings.contactPromptText,
    showItemsTotal: templateRecord.showItemsTotal ?? templateRecord.showTotals ?? defaultTemplateBrandSettings.showItemsTotal,
    showShippingTotal: templateRecord.showShippingTotal ?? templateRecord.showTotals ?? defaultTemplateBrandSettings.showShippingTotal,
    showTaxTotal: templateRecord.showTaxTotal ?? templateRecord.showTotals ?? defaultTemplateBrandSettings.showTaxTotal,
    showGrandTotal: templateRecord.showGrandTotal ?? templateRecord.showTotals ?? defaultTemplateBrandSettings.showGrandTotal,
    footerContact: normalizeStoredTemplateFooterContact(templateRecord.footerContact),
    footerWebsite: normalizeStoredTemplateFooterWebsite(templateRecord.footerWebsite),
  };

  if (
    systemTemplateIds.has(normalizedTemplateRecord.id) &&
    normalizedTemplateRecord.logoSource === "generated-svg" &&
    normalizedTemplateRecord.logoFontSize === legacyDefaultLogoFontSize
  ) {
    return {
      ...normalizedTemplateRecord,
      logoFontSize: defaultTemplateBrandSettings.logoFontSize,
    };
  }

  return normalizedTemplateRecord;
}

function getBuiltInTemplateRecords() {
  return initialTemplateRecords.filter((templateRecord) => templateRecord.source === "Built-in").map(normalizeStoredTemplateRecord);
}

function mergeStoreTemplatesWithBuiltIns(templates: TemplateRecord[]) {
  const storeTemplates = templates.filter(isStoreTemplateRecord).map(normalizeStoredTemplateRecord);
  const builtInTemplates = getBuiltInTemplateRecords();
  const storeIds = new Set(storeTemplates.map((templateRecord) => templateRecord.id));

  return [...storeTemplates, ...builtInTemplates.filter((templateRecord) => !storeIds.has(templateRecord.id))];
}

function getStoreTemplatesForPersistence(templates: TemplateRecord[]) {
  return templates.filter(isStoreTemplateRecord).map(normalizeStoredTemplateRecord);
}

function resolvePersistedSelectedTemplateId(templates: TemplateRecord[], selectedTemplateId: string) {
  const storeTemplates = getStoreTemplatesForPersistence(templates);

  return (
    storeTemplates.find((templateRecord) => templateRecord.id === selectedTemplateId)?.id ??
    storeTemplates.find((templateRecord) => templateRecord.isDefault)?.id ??
    storeTemplates[0]?.id ??
    selectedTemplateId
  );
}

function readTemplateRecordsFromPayload(value: unknown): TemplateRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((templateRecord): templateRecord is TemplateRecord => {
      if (!templateRecord || typeof templateRecord !== "object" || Array.isArray(templateRecord)) {
        return false;
      }

      const candidate = templateRecord as Partial<TemplateRecord>;

      return typeof candidate.id === "string" && typeof candidate.name === "string" && typeof candidate.documentType === "string";
    })
    .map(normalizeStoredTemplateRecord);
}

function persistTemplateState(templates: TemplateRecord[], selectedTemplateId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(templateStorageKey, JSON.stringify(templates));
  window.localStorage.setItem(selectedTemplateStorageKey, selectedTemplateId);
}

function persistSettingsState(settings: PrintOpsSettingsSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("printops-theme", settings.darkTheme ? "dark" : "light");
  window.localStorage.setItem(workspaceAccentStorageKey, settings.workspaceAccent);
  window.localStorage.setItem(siteLocaleStorageKey, settings.siteLocale);
  window.localStorage.setItem(printLocaleStorageKey, settings.language);
  window.localStorage.setItem(timezoneStorageKey, settings.timezone);
}

function readSettingsSnapshotFromPayload(value: unknown): Partial<PrintOpsSettingsSnapshot> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const snapshot: Partial<PrintOpsSettingsSnapshot> = {};

  if (record.theme === "dark" || record.theme === "light") {
    snapshot.darkTheme = record.theme === "dark";
  }

  const workspaceAccent = typeof record.workspaceAccent === "string" ? record.workspaceAccent : null;
  const siteLocale = typeof record.siteLocale === "string" ? record.siteLocale : null;
  const printLocale = typeof record.printLocale === "string" ? record.printLocale : null;

  if (isWorkspaceAccent(workspaceAccent)) {
    snapshot.workspaceAccent = workspaceAccent;
  }

  if (isSiteLocale(siteLocale)) {
    snapshot.siteLocale = siteLocale;
  }

  if (isPrintLocale(printLocale)) {
    snapshot.language = printLocale;
  }

  if (typeof record.timezone === "string" && timezoneOptions.some((option) => option.value === record.timezone)) {
    snapshot.timezone = record.timezone;
  }

  return snapshot;
}

function readAccountBindingSnapshotFromPayload(value: unknown): AccountBindingSnapshot | null {
  const record = getRecord(value);

  if (!record) {
    return null;
  }

  const binding = getRecord(record.binding);

  if (!binding) {
    return null;
  }

  const member = getRecord(binding.member);
  const workspace = getRecord(binding.workspace);
  const bindingStatus = getString(binding.bindingStatus);

  return {
    bindingEmail: getString(binding.bindingEmail),
    bindingStatus: bindingStatus === "verified" || bindingStatus === "revoked" ? bindingStatus : "pending",
    developmentCode: getString(record.developmentCode),
    memberEmail: getString(member?.email),
    ownerEmail: getString(binding.ownerEmail),
    suggestedEmail: getString(binding.suggestedEmail),
    workspaceName: getString(workspace?.name),
  };
}

function readAccountBindingError(payload: { accountBinding?: unknown; error?: string } | null) {
  const directError = getString(payload?.error);
  const accountBinding = getRecord(payload?.accountBinding);
  const reason = getString(accountBinding?.reason);

  return directError ?? reason;
}

function applyStoreProfileDefaultsToTemplates(
  templates: TemplateRecord[],
  profile: PrintOpsStoreProfileSummary | null,
  options: { includeNewDrafts?: boolean } = {},
) {
  const businessName = cleanProfileString(profile?.businessName) ?? printOpsSystemBrandName;
  const profileSiteUrl = normalizeProfileSiteUrl(profile?.siteUrl);
  const siteDisplay = profileSiteUrl ? (getWebsiteDisplay(profileSiteUrl) ?? profileSiteUrl) : defaultTemplateBrandSettings.footerWebsite;
  const footerContact = profile ? createStoreContactLine(profile) : null;
  const brandSamples = [defaultTemplateBrandSettings.brandName, legacyTemplateDefaults.brandName];
  const footerContactSamples = [
    defaultTemplateBrandSettings.footerContact,
    legacyTemplateDefaults.footerContact,
    printOpsSystemFooterAddress,
    printOpsSystemSupportEmail,
  ];
  const footerWebsiteSamples = [defaultTemplateBrandSettings.footerWebsite, legacyTemplateDefaults.footerWebsite, printOpsSystemSupportEmail];
  const logoTextSamples = [defaultTemplateBrandSettings.logoText, legacyTemplateDefaults.logoText];
  const websiteProfileSamples = [
    defaultTemplateSocialProfiles.website?.url ?? "",
    legacyTemplateDefaults.websiteUrl,
    legacyTemplateDefaults.footerWebsite,
    printOpsSystemSupportEmail,
  ];

  return templates.map((templateRecord) => {
    if (!isProfileDefaultSeedTemplate(templateRecord) && !(options.includeNewDrafts && templateRecord.source === "Store copy")) {
      return templateRecord;
    }

    const nextSocialProfiles = normalizeSocialProfiles(templateRecord.socialProfiles, templateRecord.socialLinks);

    if (profileSiteUrl && shouldReplaceProfileValue(nextSocialProfiles.website?.url, websiteProfileSamples)) {
      nextSocialProfiles.website = createSocialProfile("website", "url", profileSiteUrl);
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
      defaultLanguage: templateRecord.defaultLanguage,
      footerContact: patchProfileText(templateRecord.footerContact, footerContact ?? defaultTemplateBrandSettings.footerContact, footerContactSamples),
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
  const seededTemplate = applyStoreProfileDefaultsToTemplates([createTemplateRecordFromDraft(blankDraft)], profile, { includeNewDrafts: true })[0];
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

function normalizeProfileSiteUrl(value: string | null | undefined) {
  const siteUrl = cleanProfileString(value);

  if (!siteUrl || siteUrl.includes("@")) {
    return null;
  }

  return siteUrl;
}

function normalizeStoredTemplateFooterContact(value: string | null | undefined) {
  const cleanValue = cleanProfileString(value);

  if (!cleanValue || cleanValue === printOpsSystemFooterAddress || cleanValue === printOpsSystemSupportEmail) {
    return defaultTemplateBrandSettings.footerContact;
  }

  return cleanValue;
}

function normalizeStoredTemplateFooterWebsite(value: string | null | undefined) {
  const cleanValue = cleanProfileString(value);

  if (!cleanValue || cleanValue.includes("@")) {
    return defaultTemplateBrandSettings.footerWebsite;
  }

  return cleanValue;
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
  const businessEmail = cleanProfileString(profile.businessEmail);
  const phone = cleanProfileString(profile.phone);

  if (!businessEmail && !phone) {
    return null;
  }

  const addressLine = formatStoreAddress(profile.address);
  const segments = [addressLine, businessEmail, phone].filter(Boolean);

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

const fixedTemplateThankYouText = {
  default: "Thanks for your business!",
  es: "Gracias por tu compra.",
  de: "Vielen Dank fuer deinen Einkauf.",
  ja: "ご利用ありがとうございます。",
  fr: "Merci pour votre achat.",
  pt: "Obrigado pela preferencia.",
  "zh-Hans": "感谢您的惠顾！",
  "zh-Hant": "感謝您的惠顧！",
  ar: "شكرًا لتعاملك معنا!",
  nl: "Bedankt voor je bestelling.",
  it: "Grazie per il tuo acquisto.",
  ko: "이용해 주셔서 감사합니다.",
} satisfies LocalizedText;

const fixedTemplateSampleText = {
  deliveryMethod: {
    default: "Delivery method 3232",
    es: "Metodo de entrega 3232",
    de: "Liefermethode 3232",
    ja: "配送方法 3232",
    fr: "Mode de livraison 3232",
    pt: "Metodo de entrega 3232",
    "zh-Hans": "配送方式 3232",
    "zh-Hant": "配送方式 3232",
    ar: "طريقة التوصيل 3232",
    nl: "Bezorgmethode 3232",
    it: "Metodo di consegna 3232",
    ko: "배송 방법 3232",
  },
  giftCard: {
    default: "Gift card",
    es: "Tarjeta de regalo",
    de: "Geschenkkarte",
    ja: "ギフトカード",
    fr: "Carte cadeau",
    pt: "Cartao-presente",
    "zh-Hans": "礼品卡",
    "zh-Hant": "禮品卡",
    ar: "بطاقة هدايا",
    nl: "Cadeaubon",
    it: "Carta regalo",
    ko: "기프트 카드",
  },
  lineItem: {
    default: "Line item",
    es: "Linea",
    de: "Position",
    ja: "明細",
    fr: "Ligne",
    pt: "Item",
    "zh-Hans": "明细",
    "zh-Hant": "明細",
    ar: "عنصر",
    nl: "Regelitem",
    it: "Riga",
    ko: "품목",
  },
  sampleProduct: {
    default: "Sample product A",
    es: "Producto de ejemplo A",
    de: "Beispielprodukt A",
    ja: "サンプル商品A",
    fr: "Produit exemple A",
    pt: "Produto de exemplo A",
    "zh-Hans": "示例商品A",
    "zh-Hant": "範例商品A",
    ar: "منتج تجريبي A",
    nl: "Voorbeeldproduct A",
    it: "Prodotto di esempio A",
    ko: "샘플 상품 A",
  },
  batch: {
    default: "Batch",
    es: "Lote",
    de: "Stapel",
    ja: "バッチ",
    fr: "Lot",
    pt: "Lote",
    "zh-Hans": "批次",
    "zh-Hant": "批次",
    ar: "دفعة",
    nl: "Batch",
    it: "Lotto",
    ko: "배치",
  },
  buyerNote: {
    default: "Buyer note",
    es: "Nota del comprador",
    de: "Kaeufernotiz",
    ja: "購入者メモ",
    fr: "Note acheteur",
    pt: "Nota do comprador",
    "zh-Hans": "买家备注",
    "zh-Hant": "買家備註",
    ar: "ملاحظة المشتري",
    nl: "Kopersnotitie",
    it: "Nota acquirente",
    ko: "구매자 메모",
  },
  buyerNoteMessage: {
    default: "Please pack the kits together and include the return card.",
    es: "Empaca los kits juntos e incluye la tarjeta de devolucion.",
    de: "Bitte die Kits zusammen verpacken und die Ruecksendekarte beilegen.",
    ja: "キットをまとめて梱包し、返品カードを同梱してください。",
    fr: "Veuillez emballer les kits ensemble et ajouter la carte de retour.",
    pt: "Embale os kits juntos e inclua o cartao de devolucao.",
    "zh-Hans": "请将套装一起打包，并放入退货卡。",
    "zh-Hant": "請將套組一起打包，並放入退貨卡。",
    ar: "يرجى تغليف المجموعات معا وإرفاق بطاقة الإرجاع.",
    nl: "Verpak de kits samen en voeg de retourkaart toe.",
    it: "Imballa i kit insieme e includi la scheda di reso.",
    ko: "키트를 함께 포장하고 반품 카드를 넣어 주세요.",
  },
  customHoodie: {
    default: "Custom hoodie",
    es: "Sudadera personalizada",
    de: "Individueller Hoodie",
    ja: "カスタムパーカー",
    fr: "Sweat a capuche personnalise",
    pt: "Moletom personalizado",
    "zh-Hans": "定制连帽衫",
    "zh-Hant": "客製連帽衫",
    ar: "هودي مخصص",
    nl: "Hoodie op maat",
    it: "Felpa personalizzata",
    ko: "맞춤 후디",
  },
  customMessageIncluded: {
    default: "Custom message included",
    es: "Mensaje personalizado incluido",
    de: "Eigene Nachricht enthalten",
    ja: "カスタムメッセージ入り",
    fr: "Message personnalise inclus",
    pt: "Mensagem personalizada incluida",
    "zh-Hans": "含定制留言",
    "zh-Hant": "含客製訊息",
    ar: "تتضمن رسالة مخصصة",
    nl: "Aangepast bericht inbegrepen",
    it: "Messaggio personalizzato incluso",
    ko: "맞춤 메시지 포함",
  },
  customer: {
    default: "Customer",
    es: "Cliente",
    de: "Kunde",
    ja: "顧客",
    fr: "Client",
    pt: "Cliente",
    "zh-Hans": "客户",
    "zh-Hant": "客戶",
    ar: "العميل",
    nl: "Klant",
    it: "Cliente",
    ko: "고객",
  },
  eventKit: {
    default: "Event kit",
    es: "Kit para evento",
    de: "Event-Kit",
    ja: "イベントキット",
    fr: "Kit evenement",
    pt: "Kit de evento",
    "zh-Hans": "活动套装",
    "zh-Hant": "活動套組",
    ar: "مجموعة فعالية",
    nl: "Eventkit",
    it: "Kit evento",
    ko: "이벤트 키트",
  },
  footerPolicy: {
    default: "Thank you for your order. Returns accepted within 30 days.",
    es: "Gracias por tu pedido. Se aceptan devoluciones dentro de 30 dias.",
    de: "Vielen Dank fuer deine Bestellung. Rueckgaben sind innerhalb von 30 Tagen moeglich.",
    ja: "ご注文ありがとうございます。返品は30日以内に承ります。",
    fr: "Merci pour votre commande. Les retours sont acceptes sous 30 jours.",
    pt: "Obrigado pelo pedido. Devolucoes aceitas em ate 30 dias.",
    "zh-Hans": "感谢您的订单。支持 30 天内退货。",
    "zh-Hant": "感謝您的訂單。支援 30 天內退貨。",
    ar: "شكرا لطلبك. نقبل الإرجاع خلال 30 يوما.",
    nl: "Bedankt voor je bestelling. Retouren worden binnen 30 dagen geaccepteerd.",
    it: "Grazie per il tuo ordine. Resi accettati entro 30 giorni.",
    ko: "주문해 주셔서 감사합니다. 30일 이내 반품 가능합니다.",
  },
  from: {
    default: "From",
    es: "Desde",
    de: "Von",
    ja: "差出人",
    fr: "De",
    pt: "De",
    "zh-Hans": "发件方",
    "zh-Hant": "寄件方",
    ar: "من",
    nl: "Van",
    it: "Da",
    ko: "보낸 곳",
  },
  fulfillment: {
    default: "Fulfillment",
    es: "Cumplimiento",
    de: "Erfuellung",
    ja: "フルフィルメント",
    fr: "Traitement",
    pt: "Atendimento",
    "zh-Hans": "履约",
    "zh-Hant": "履約",
    ar: "التنفيذ",
    nl: "Verwerking",
    it: "Evasione",
    ko: "처리",
  },
  giftBox: {
    default: "Gift box",
    es: "Caja de regalo",
    de: "Geschenkbox",
    ja: "ギフトボックス",
    fr: "Coffret cadeau",
    pt: "Caixa de presente",
    "zh-Hans": "礼品盒",
    "zh-Hant": "禮品盒",
    ar: "صندوق هدايا",
    nl: "Geschenkdoos",
    it: "Scatola regalo",
    ko: "선물 상자",
  },
  giftCardInsert: {
    default: "Gift card insert",
    es: "Tarjeta de regalo incluida",
    de: "Geschenkkarten-Beileger",
    ja: "ギフトカード同梱",
    fr: "Encart carte cadeau",
    pt: "Cartao-presente incluso",
    "zh-Hans": "礼品卡插页",
    "zh-Hant": "禮品卡插頁",
    ar: "إدراج بطاقة هدايا",
    nl: "Cadeaubonbijlage",
    it: "Inserto carta regalo",
    ko: "기프트 카드 동봉",
  },
  item: {
    default: "Item",
    es: "Articulo",
    de: "Artikel",
    ja: "商品",
    fr: "Article",
    pt: "Item",
    "zh-Hans": "商品",
    "zh-Hant": "商品",
    ar: "العنصر",
    nl: "Artikel",
    it: "Articolo",
    ko: "상품",
  },
  missing: {
    default: "Missing",
    es: "Faltante",
    de: "Fehlt",
    ja: "不足",
    fr: "Manquant",
    pt: "Faltando",
    "zh-Hans": "缺失",
    "zh-Hant": "缺少",
    ar: "مفقود",
    nl: "Ontbreekt",
    it: "Mancante",
    ko: "누락",
  },
  order: {
    default: "Order",
    es: "Pedido",
    de: "Bestellung",
    ja: "注文",
    fr: "Commande",
    pt: "Pedido",
    "zh-Hans": "订单",
    "zh-Hant": "訂單",
    ar: "الطلب",
    nl: "Bestelling",
    it: "Ordine",
    ko: "주문",
  },
  orders: {
    default: "Orders",
    es: "Pedidos",
    de: "Bestellungen",
    ja: "注文",
    fr: "Commandes",
    pt: "Pedidos",
    "zh-Hans": "订单",
    "zh-Hant": "訂單",
    ar: "الطلبات",
    nl: "Bestellingen",
    it: "Ordini",
    ko: "주문",
  },
  paidReadyForPickup: {
    default: "Paid - ready for pickup",
    es: "Pagado - listo para recoger",
    de: "Bezahlt - bereit zur Abholung",
    ja: "支払い済み - 受け取り準備完了",
    fr: "Paye - pret pour retrait",
    pt: "Pago - pronto para retirada",
    "zh-Hans": "已付款 - 可自提",
    "zh-Hant": "已付款 - 可自取",
    ar: "مدفوع - جاهز للاستلام",
    nl: "Betaald - klaar om af te halen",
    it: "Pagato - pronto per il ritiro",
    ko: "결제 완료 - 픽업 준비 완료",
  },
  pickupBouquet: {
    default: "Pickup bouquet",
    es: "Ramo para recoger",
    de: "Abholstrauss",
    ja: "受け取り用ブーケ",
    fr: "Bouquet a retirer",
    pt: "Buque para retirada",
    "zh-Hans": "自提花束",
    "zh-Hant": "自取花束",
    ar: "باقة للاستلام",
    nl: "Afhaalboeket",
    it: "Bouquet da ritirare",
    ko: "픽업 부케",
  },
  pickupReceipt: {
    default: "Pickup receipt",
    es: "Recibo de recogida",
    de: "Abholbeleg",
    ja: "受け取りレシート",
    fr: "Recu de retrait",
    pt: "Recibo de retirada",
    "zh-Hans": "自提收据",
    "zh-Hant": "自取收據",
    ar: "إيصال الاستلام",
    nl: "Afhaalbon",
    it: "Ricevuta di ritiro",
    ko: "픽업 영수증",
  },
  sageMediumBundle: {
    default: "Sage / medium bundle",
    es: "Salvia / paquete mediano",
    de: "Salbei / mittleres Bundle",
    ja: "セージ / ミディアムセット",
    fr: "Sauge / lot moyen",
    pt: "Verde sage / pacote medio",
    "zh-Hans": "鼠尾草色 / 中号组合",
    "zh-Hant": "鼠尾草色 / 中號組合",
    ar: "سيج / حزمة متوسطة",
    nl: "Sage / medium bundel",
    it: "Salvia / bundle medio",
    ko: "세이지 / 중형 번들",
  },
  status: {
    default: "Status",
    es: "Estado",
    de: "Status",
    ja: "ステータス",
    fr: "Statut",
    pt: "Status",
    "zh-Hans": "状态",
    "zh-Hant": "狀態",
    ar: "الحالة",
    nl: "Status",
    it: "Stato",
    ko: "상태",
  },
} satisfies Record<string, LocalizedText>;

const fixedOrderPaymentStatusLabels = {
  Unknown: {
    default: "Unknown",
    es: "Desconocido",
    de: "Unbekannt",
    ja: "不明",
    fr: "Inconnu",
    pt: "Desconhecido",
    "zh-Hans": "未知",
    "zh-Hant": "未知",
    ar: "غير معروف",
    nl: "Onbekend",
    it: "Sconosciuto",
    ko: "알 수 없음",
  },
  Paid: {
    default: "Paid",
    es: "Pagado",
    de: "Bezahlt",
    ja: "支払い済み",
    fr: "Paye",
    pt: "Pago",
    "zh-Hans": "已付款",
    "zh-Hant": "已付款",
    ar: "مدفوع",
    nl: "Betaald",
    it: "Pagato",
    ko: "결제 완료",
  },
  "Partially paid": {
    default: "Partially paid",
    es: "Parcialmente pagado",
    de: "Teilweise bezahlt",
    ja: "一部支払い済み",
    fr: "Partiellement paye",
    pt: "Parcialmente pago",
    "zh-Hans": "部分付款",
    "zh-Hant": "部分付款",
    ar: "مدفوع جزئيا",
    nl: "Gedeeltelijk betaald",
    it: "Parzialmente pagato",
    ko: "부분 결제",
  },
  Unpaid: {
    default: "Unpaid",
    es: "Sin pagar",
    de: "Unbezahlt",
    ja: "未払い",
    fr: "Impaye",
    pt: "Nao pago",
    "zh-Hans": "未付款",
    "zh-Hant": "未付款",
    ar: "غير مدفوع",
    nl: "Onbetaald",
    it: "Non pagato",
    ko: "미결제",
  },
} satisfies Record<Order["payment"], LocalizedText>;

const fixedOrderFulfillmentStatusLabels = {
  Unknown: {
    default: "Unknown",
    es: "Desconocido",
    de: "Unbekannt",
    ja: "不明",
    fr: "Inconnu",
    pt: "Desconhecido",
    "zh-Hans": "未知",
    "zh-Hant": "未知",
    ar: "غير معروف",
    nl: "Onbekend",
    it: "Sconosciuto",
    ko: "알 수 없음",
  },
  Partial: {
    default: "Partial",
    es: "Parcial",
    de: "Teilweise",
    ja: "一部",
    fr: "Partiel",
    pt: "Parcial",
    "zh-Hans": "部分",
    "zh-Hant": "部分",
    ar: "جزئي",
    nl: "Gedeeltelijk",
    it: "Parziale",
    ko: "부분",
  },
  Pickup: {
    default: "Pickup",
    es: "Recogida",
    de: "Abholung",
    ja: "受け取り",
    fr: "Retrait",
    pt: "Retirada",
    "zh-Hans": "自提",
    "zh-Hant": "自取",
    ar: "استلام",
    nl: "Afhalen",
    it: "Ritiro",
    ko: "픽업",
  },
  Ready: {
    default: "Ready",
    es: "Listo",
    de: "Bereit",
    ja: "準備完了",
    fr: "Pret",
    pt: "Pronto",
    "zh-Hans": "就绪",
    "zh-Hant": "準備完成",
    ar: "جاهز",
    nl: "Gereed",
    it: "Pronto",
    ko: "준비 완료",
  },
  Unfulfilled: {
    default: "Unfulfilled",
    es: "No gestionado",
    de: "Nicht erfuellt",
    ja: "未処理",
    fr: "Non traite",
    pt: "Nao atendido",
    "zh-Hans": "未履行",
    "zh-Hant": "未完成",
    ar: "غير منفذ",
    nl: "Niet verwerkt",
    it: "Non evaso",
    ko: "미처리",
  },
} satisfies Record<Order["fulfillment"], LocalizedText>;

const templateFixedLabelDefinitions: TemplateLabelDefinition[] = [
  { key: "template.invoice_title", group: "Template", label: fixedTemplateLabels.invoiceTitle, helper: "Document title in the header." },
  { key: "template.invoice_no", group: "Template", label: fixedTemplateLabels.invoiceNo, helper: "Invoice number prefix." },
  { key: "template.invoice_date", group: "Template", label: fixedTemplateLabels.invoiceDate, helper: "Invoice date label." },
  { key: "template.order_date", group: "Template", label: fixedTemplateLabels.orderDate, helper: "Order date label for compact layouts." },
  { key: "template.payment", group: "Template", label: fixedTemplateLabels.payment, helper: "Payment method label." },
  { key: "template.shipping", group: "Template", label: fixedTemplateLabels.shipping, helper: "Shipping method label." },
  ...(printOpsBarcodeFeatureEnabled
    ? [{ key: "template.order_barcode", group: "Order" as const, label: fixedTemplateLabels.orderBarcode, helper: "Order barcode label." }]
    : []),
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
        ...(printOpsBarcodeFeatureEnabled
          ? [{ key: "showOrderBarcode" as const, label: editorCopy.visibleOrderBarcode, description: editorCopy.visibleOrderBarcodeDescription }]
          : []),
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
        { key: "showItemsTotal", label: editorCopy.visibleItemsTotal, description: editorCopy.visibleItemsTotalDescription },
        { key: "showShippingTotal", label: editorCopy.visibleShippingTotal, description: editorCopy.visibleShippingTotalDescription },
        { key: "showTaxTotal", label: editorCopy.visibleTaxTotal, description: editorCopy.visibleTaxTotalDescription },
        { key: "showGrandTotal", label: editorCopy.visibleGrandTotal, description: editorCopy.visibleGrandTotalDescription },
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
    schemaVersion: printOpsTemplateSchemaVersion,
    rendererKey: "invoice_big_brand_v1",
    baseBlueprintKey: "invoice_big_brand",
    baseBlueprintVersion: printOpsTemplateBlueprintVersion,
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
    dataRequirements: ["order_number", "customer_contact", "line_items", "sku", "item_options", "totals", "payment", "delivery_address", "billing_address", "delivery_method", "store_contact"],
    validation: { tone: "ok", label: "Ready to print" },
  },
  {
    id: "store-order-compact",
    schemaVersion: printOpsTemplateSchemaVersion,
    rendererKey: "invoice_minimal_v1",
    baseBlueprintKey: "invoice_minimal",
    baseBlueprintVersion: printOpsTemplateBlueprintVersion,
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
    dataRequirements: ["order_number", "customer_contact", "line_items", "sku", "item_options", "totals", "delivery_method"],
    validation: { tone: "ok", label: "Ready to print" },
  },
  {
    id: "store-order-payment-check",
    schemaVersion: printOpsTemplateSchemaVersion,
    rendererKey: "invoice_big_brand_v1",
    baseBlueprintKey: "invoice_big_brand",
    baseBlueprintVersion: printOpsTemplateBlueprintVersion,
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
    dataRequirements: ["order_number", "payment_status", "payment_method", "totals", "tax", "product_image", "sku", "store_social_links"],
    validation: { tone: "ok", label: "Ready to print" },
  },
  {
    id: "library-order-modern",
    schemaVersion: printOpsTemplateSchemaVersion,
    rendererKey: "invoice_big_brand_v1",
    baseBlueprintKey: "invoice_big_brand",
    baseBlueprintVersion: printOpsTemplateBlueprintVersion,
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
    dataRequirements: ["order_number", "customer_contact", "line_items", "sku", "item_options", "totals", "store_contact"],
    validation: { tone: "ok", label: "Built-in template" },
  },
  {
    id: "library-order-minimal",
    schemaVersion: printOpsTemplateSchemaVersion,
    rendererKey: "invoice_minimal_v1",
    baseBlueprintKey: "invoice_minimal",
    baseBlueprintVersion: printOpsTemplateBlueprintVersion,
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
    dataRequirements: ["order_number", "customer_contact", "line_items", "sku", "totals", "payment"],
    validation: { tone: "ok", label: "Built-in template" },
  },
];

function isProfileDefaultSeedTemplate(templateRecord: TemplateRecord) {
  if (templateRecord.source !== "Store copy") {
    return false;
  }

  const seedTemplate = initialTemplateRecords.find((seed) => seed.id === templateRecord.id);

  return Boolean(seedTemplate && seedTemplate.source === "Store copy" && seedTemplate.updatedAt === templateRecord.updatedAt);
}

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
    documentTitleFont: defaultTemplateBrandSettings.documentTitleFont,
    documentTitleFontSize: defaultTemplateBrandSettings.documentTitleFontSize,
    thankYouFontSize: defaultTemplateBrandSettings.thankYouFontSize,
    bodyFont: defaultTemplateBrandSettings.bodyFont,
    bodyFontSize: defaultTemplateBrandSettings.bodyFontSize,
    footerWebsite: defaultTemplateBrandSettings.footerWebsite,
    footerContact: defaultTemplateBrandSettings.footerContact,
    contactPromptText: defaultTemplateBrandSettings.contactPromptText,
    thankYouText: defaultTemplateBrandSettings.thankYouText,
    accentColor: defaultTemplateBrandSettings.accentColor,
    customAccentColor: defaultTemplateBrandSettings.customAccentColor,
    density: defaultTemplateBrandSettings.density,
    socialProfiles: normalizeSocialProfiles(defaultTemplateBrandSettings.socialProfiles),
    socialLinks: defaultTemplateBrandSettings.socialLinks,
    showLogoText: true,
    showStoreName: true,
    showInvoiceMeta: true,
    showOrderBarcode: printOpsBarcodeFeatureEnabled,
    showBillTo: true,
    showShipTo: true,
    showProductImages: true,
    showSku: true,
    showItemOptions: true,
    showNotes: true,
    showTotals: true,
    showItemsTotal: true,
    showShippingTotal: true,
    showTaxTotal: true,
    showGrandTotal: true,
    showPaymentMethod: true,
    showShippingMethod: true,
    showThankYou: true,
    showContactFooter: true,
    showSocialFooter: true,
    dataRequirements: "order_number, customer_contact, line_items, sku, item_options, totals, payment, delivery_address, billing_address, delivery_method, store_contact",
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
    documentTitleFont: templateRecord.documentTitleFont ?? defaultTemplateBrandSettings.documentTitleFont,
    documentTitleFontSize: templateRecord.documentTitleFontSize ?? defaultTemplateBrandSettings.documentTitleFontSize,
    thankYouFontSize: templateRecord.thankYouFontSize ?? defaultTemplateBrandSettings.thankYouFontSize,
    bodyFont: templateRecord.bodyFont ?? defaultTemplateBrandSettings.bodyFont,
    bodyFontSize: templateRecord.bodyFontSize ?? defaultTemplateBrandSettings.bodyFontSize,
    footerWebsite: templateRecord.footerWebsite ?? defaultTemplateBrandSettings.footerWebsite,
    footerContact: templateRecord.footerContact ?? defaultTemplateBrandSettings.footerContact,
    contactPromptText: templateRecord.contactPromptText ?? defaultTemplateBrandSettings.contactPromptText,
    thankYouText: templateRecord.thankYouText ?? defaultTemplateBrandSettings.thankYouText,
    accentColor: templateRecord.accentColor ?? defaultTemplateBrandSettings.accentColor,
    customAccentColor: templateRecord.customAccentColor ?? defaultTemplateBrandSettings.customAccentColor,
    density: templateRecord.density ?? defaultTemplateBrandSettings.density,
    socialProfiles: normalizedSocialProfiles,
    socialLinks: serializeSocialProfiles(normalizedSocialProfiles),
    showLogoText: templateRecord.showLogoText ?? true,
    showStoreName: templateRecord.showStoreName ?? true,
    showInvoiceMeta: templateRecord.showInvoiceMeta ?? true,
    showOrderBarcode: printOpsBarcodeFeatureEnabled ? (templateRecord.showOrderBarcode ?? false) : false,
    showBillTo: templateRecord.showBillTo ?? true,
    showShipTo: templateRecord.showShipTo ?? true,
    showProductImages: templateRecord.showProductImages ?? true,
    showSku: templateRecord.showSku ?? true,
    showItemOptions: templateRecord.showItemOptions ?? true,
    showNotes: templateRecord.showNotes ?? true,
    showTotals: templateRecord.showTotals ?? true,
    showItemsTotal: templateRecord.showItemsTotal ?? templateRecord.showTotals ?? true,
    showShippingTotal: templateRecord.showShippingTotal ?? templateRecord.showTotals ?? true,
    showTaxTotal: templateRecord.showTaxTotal ?? templateRecord.showTotals ?? true,
    showGrandTotal: templateRecord.showGrandTotal ?? templateRecord.showTotals ?? true,
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

function clampTemplateNumber(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
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

function resolveDefaultTemplateText(value: string, defaultValue: string, localizedFallback: string) {
  const cleanValue = value.trim();

  if (!cleanValue || cleanValue === defaultValue) {
    return localizedFallback;
  }

  return cleanValue;
}

function resolveTemplateSampleText(key: keyof typeof fixedTemplateSampleText, locale: PrintLocale) {
  return resolveLocalizedText(fixedTemplateSampleText[key], locale);
}

function resolveOrderPaymentStatusLabel(status: Order["payment"], locale: PrintLocale) {
  return resolveLocalizedText(fixedOrderPaymentStatusLabels[status], locale);
}

function resolveOrderFulfillmentStatusLabel(status: Order["fulfillment"], locale: PrintLocale) {
  return resolveLocalizedText(fixedOrderFulfillmentStatusLabels[status], locale);
}

function createTemplateRecordFromDraft(draft: TemplateDraft, existing?: TemplateRecord): TemplateRecord {
  const dataRequirements = parseDataRequirements(draft.dataRequirements);
  const normalizedSocialProfiles = normalizeSocialProfiles(draft.socialProfiles, draft.socialLinks);
  const baseBlueprintKey = existing?.baseBlueprintKey ?? resolveTemplateBlueprintKey({
    layoutPreset: draft.layoutPreset,
    visualStyle: draft.visualStyle,
  });

  return {
    id: existing?.id ?? createTemplateId(draft.name),
    schemaVersion: printOpsTemplateSchemaVersion,
    rendererKey: existing?.rendererKey ?? getTemplateRendererKey(baseBlueprintKey),
    baseBlueprintKey,
    baseBlueprintVersion: existing?.baseBlueprintVersion ?? printOpsTemplateBlueprintVersion,
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
    logoFontSize: clampTemplateNumber(Number(draft.logoFontSize), 28, 96, defaultTemplateBrandSettings.logoFontSize),
    logoSource: draft.logoSource,
    logoImageUrl: draft.logoImageUrl.trim(),
    documentTitleFont: draft.documentTitleFont,
    documentTitleFontSize: clampTemplateNumber(Number(draft.documentTitleFontSize), 18, 72, defaultTemplateBrandSettings.documentTitleFontSize),
    thankYouFontSize: clampTemplateNumber(Number(draft.thankYouFontSize), 14, 40, defaultTemplateBrandSettings.thankYouFontSize),
    bodyFont: draft.bodyFont,
    bodyFontSize: clampTemplateNumber(Number(draft.bodyFontSize), 10, 18, defaultTemplateBrandSettings.bodyFontSize),
    footerWebsite: draft.footerWebsite.trim(),
    footerContact: draft.footerContact.trim(),
    contactPromptText: draft.contactPromptText.trim() || defaultTemplateBrandSettings.contactPromptText,
    thankYouText: draft.thankYouText.trim() || defaultTemplateBrandSettings.thankYouText,
    accentColor: draft.accentColor,
    customAccentColor: draft.customAccentColor.trim() || defaultTemplateBrandSettings.customAccentColor,
    density: draft.density,
    socialProfiles: normalizedSocialProfiles,
    socialLinks: serializeSocialProfiles(normalizedSocialProfiles),
    showLogoText: draft.showLogoText,
    showStoreName: draft.showStoreName,
    showInvoiceMeta: draft.showInvoiceMeta,
    showOrderBarcode: printOpsBarcodeFeatureEnabled && draft.showOrderBarcode,
    showBillTo: draft.showBillTo,
    showShipTo: draft.showShipTo,
    showProductImages: draft.showProductImages,
    showSku: draft.showSku,
    showItemOptions: draft.showItemOptions,
    showNotes: draft.showNotes,
    showTotals: draft.showItemsTotal || draft.showShippingTotal || draft.showTaxTotal || draft.showGrandTotal,
    showItemsTotal: draft.showItemsTotal,
    showShippingTotal: draft.showShippingTotal,
    showTaxTotal: draft.showTaxTotal,
    showGrandTotal: draft.showGrandTotal,
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
    printed: false,
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
  const [templatesLoadedFromDatabase, setTemplatesLoadedFromDatabase] = useState(false);
  const [templateStoreStatus, setTemplateStoreStatus] = useState<TemplateStoreStatus>({
    error: null,
    status: "idle",
  });
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [templateEditorMode, setTemplateEditorMode] = useState<TemplateEditorMode>("create");
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft>(() => createBlankTemplateDraft());
  const [language, setLanguage] = useState<PrintLocale>(defaultPrintLocale);
  const [timezone, setTimezone] = useState("Asia/Shanghai");
  const [wixSyncStatus, setWixSyncStatus] = useState<WixSyncStatus>({
    customFieldCount: 0,
    error: null,
    lastSyncedAt: null,
    mode: null,
    orderCount: 0,
    orders: [],
    persistence: null,
    status: "idle",
    window: null,
  });
  const [subscriptionSummary, setSubscriptionSummary] = useState<PrintOpsSubscriptionSummary | null>(null);
  const [initialOrderSyncComplete, setInitialOrderSyncComplete] = useState(false);
  const [storeProfile, setStoreProfile] = useState<PrintOpsStoreProfileSummary | null>(null);
  const [storeProfileStatus, setStoreProfileStatus] = useState<StoreProfileStatus>({
    error: null,
    source: null,
    status: "idle",
  });
  const [accountBinding, setAccountBinding] = useState<AccountBindingSnapshot | null>(null);
  const [accountBindingStatus, setAccountBindingStatus] = useState<{
    error: string | null;
    status: "idle" | "loading" | "sending" | "code_sent" | "verifying" | "loaded" | "bound" | "error";
  }>({
    error: null,
    status: "idle",
  });
  const [storeProfileDefaultsApplied, setStoreProfileDefaultsApplied] = useState(false);
  const templateStoreInitializedRef = useRef(false);
  const settingsStoreInitializedRef = useRef(false);
  const templateRecordsRef = useRef(templateRecords);
  const selectedTemplateIdRef = useRef(selectedTemplateId);
  const settingsSnapshotRef = useRef<PrintOpsSettingsSnapshot>({
    darkTheme,
    language,
    siteLocale,
    timezone,
    workspaceAccent,
  });
  const messages = getPrintOpsMessages(siteLocale);
  const printLanguageOptions = useMemo(() => getPrintLocaleOptions(siteLocale), [siteLocale]);
  const defaultOrderTemplate =
    templateRecords.find((templateRecord) => templateRecord.isDefault && templateRecord.documentType === "Invoice") ??
    templateRecords.find((templateRecord) => templateRecord.id === "store-order-clean") ??
    templateRecords.find((templateRecord) => templateRecord.documentType === "Invoice") ??
    templateRecords[0];
  const defaultOrderTemplateDisplay = getLocalizedTemplateRecord(defaultOrderTemplate, messages);
  const defaultOrderTemplateLanguage = defaultOrderTemplate?.defaultLanguage ?? language;
  const defaultOrderTemplateLanguageLabel = printLanguageOptions.find((option) => option.value === defaultOrderTemplateLanguage)?.label ?? defaultOrderTemplateLanguage;
  const displayOrders = useMemo(() => {
    const normalizedSearch = orderSearch.trim().toLowerCase();

    return cachedOrders.filter((order) => {
      const matchesSearch = !normalizedSearch || orderMatchesSearch(order, normalizedSearch, [defaultOrderTemplateDisplay.name, defaultOrderTemplateLanguageLabel]);
      const hasPrintFilter = orderFilters.printed || orderFilters.unprinted;
      const matchesPrint =
        !hasPrintFilter ||
        (orderFilters.printed && order.print === "Printed") ||
        (orderFilters.unprinted && order.print !== "Printed");

      return matchesSearch && matchesPrint;
    });
  }, [cachedOrders, defaultOrderTemplateDisplay.name, defaultOrderTemplateLanguageLabel, orderFilters.printed, orderFilters.unprinted, orderSearch]);
  const selectedOrders = useMemo(() => displayOrders.filter((order) => selectedIds.includes(order.id)), [displayOrders, selectedIds]);
  const selectedCount = selectedOrders.length;
  const orderMetrics = useMemo(
    () => ({
      printed: cachedOrders.filter((order) => order.print === "Printed").length,
      unprinted: cachedOrders.filter((order) => order.print !== "Printed").length,
    }),
    [cachedOrders],
  );
  const viewLinks = useMemo(
    () =>
      pluginContext?.viewLinks ?? {
        orders: "/apps/printops/wix",
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
          { icon: Package, label: messages.nav.orders, href: viewLinks.orders, view: "orders", count: String(orderMetrics.unprinted) },
          { icon: LayoutTemplate, label: messages.nav.templates, href: viewLinks.templates, view: "templates", count: "" },
        ],
      },
      {
        label: messages.nav.general,
        items: [
          { icon: Settings, label: messages.nav.settings, href: viewLinks.settings, view: "settings", count: "" },
          { icon: BookOpen, label: messages.nav.help, href: "https://zider.ink/forum/apps/printops", view: "help", count: "" },
          { icon: Mail, label: messages.nav.support, href: "https://www.zider.ink/contact", view: "support", count: "" },
        ],
      },
    ],
    [messages, orderMetrics.unprinted, viewLinks],
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
  const pageDescription =
    activeView === "templates"
      ? messages.pages.templatesDescription
      : activeView === "settings"
        ? messages.pages.settingsDescription
        : messages.pages.ordersDescription;
  const workspaceStoreName = storeProfile?.businessName?.trim() || printOpsSystemBrandName;
  const workspaceStoreInitials = getAvatarInitials(workspaceStoreName);
  const hasUnreadProductUpdates = false;
  const pageMetrics: PageMetric[] =
    activeView === "templates"
      ? [
          { label: messages.metrics.myTemplates, value: String(templateStats.mine) },
          { label: messages.metrics.builtIn, value: String(templateStats.library) },
        ]
      : activeView === "settings"
        ? []
      : [
          { label: messages.metrics.printed, value: String(orderMetrics.printed) },
          { label: messages.metrics.unprinted, value: String(orderMetrics.unprinted) },
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
    const savedSelectedTemplateId = window.localStorage.getItem(selectedTemplateStorageKey);

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
          ? mergeStoreTemplatesWithBuiltIns(parsedTemplates.filter((templateRecord) => !deprecatedTemplateIds.has(templateRecord.id)).map(normalizeStoredTemplateRecord))
          : [];

        if (supportedTemplates.length > 0) {
          setTemplateRecords(supportedTemplates);

          if (savedSelectedTemplateId && supportedTemplates.some((templateRecord) => templateRecord.id === savedSelectedTemplateId)) {
            setSelectedTemplateId(savedSelectedTemplateId);
          }
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
    settingsSnapshotRef.current = {
      darkTheme,
      language,
      siteLocale,
      timezone,
      workspaceAccent,
    };
  }, [darkTheme, language, siteLocale, timezone, workspaceAccent]);

  useEffect(() => {
    if (templatesHydrated) {
      window.localStorage.setItem(templateStorageKey, JSON.stringify(templateRecords));
    }
  }, [templateRecords, templatesHydrated]);

  useEffect(() => {
    templateRecordsRef.current = templateRecords;
  }, [templateRecords]);

  useEffect(() => {
    if (templatesHydrated) {
      window.localStorage.setItem(selectedTemplateStorageKey, selectedTemplateId);
    }
  }, [selectedTemplateId, templatesHydrated]);

  useEffect(() => {
    selectedTemplateIdRef.current = selectedTemplateId;
  }, [selectedTemplateId]);

  useEffect(() => {
    if (!templatesHydrated || !pluginContext?.templatesEndpoint || templateStoreInitializedRef.current) {
      return;
    }

    templateStoreInitializedRef.current = true;
    void loadTemplatesFromDatabase();
  }, [pluginContext?.templatesEndpoint, templatesHydrated]);

  useEffect(() => {
    if (!pluginContext?.settingsEndpoint || settingsStoreInitializedRef.current) {
      return;
    }

    settingsStoreInitializedRef.current = true;
    void loadSettingsFromDatabase();
  }, [pluginContext?.settingsEndpoint]);

  useEffect(() => {
    if (!pluginContext?.accountBindingEndpoint) {
      return;
    }

    void loadAccountBinding();
  }, [pluginContext?.accountBindingEndpoint]);

  useEffect(() => {
    if (!pluginContext?.accountBindingEndpoint || !storeProfile) {
      return;
    }

    void loadAccountBinding();
  }, [pluginContext?.accountBindingEndpoint, storeProfile?.ownerEmail]);

  useEffect(() => {
    if (!pluginContext?.instanceId || !pluginContext.storeProfileEndpoint) {
      return;
    }

    void loadStoreProfile("refresh");
  }, [pluginContext?.instanceId, pluginContext?.storeProfileEndpoint]);

  useEffect(() => {
    if (!pluginContext) {
      setInitialOrderSyncComplete(false);
      setWixSyncStatus((current) => ({
        ...current,
        lastSyncedAt: null,
      }));
      return;
    }

    setInitialOrderSyncComplete(window.localStorage.getItem(getInitialOrderSyncStorageKey(pluginContext.instanceId)) === "complete");
    setWixSyncStatus((current) => ({
      ...current,
      lastSyncedAt: window.localStorage.getItem(getLastOrderSyncStorageKey(pluginContext.instanceId)),
    }));
  }, [pluginContext?.instanceId]);

  useEffect(() => {
    if (!pluginContext?.instanceId || orderCacheStatus.status !== "loaded" || orderCacheStatus.orderCount <= 0 || initialOrderSyncComplete) {
      return;
    }

    window.localStorage.setItem(getInitialOrderSyncStorageKey(pluginContext.instanceId), "complete");
    setInitialOrderSyncComplete(true);
  }, [initialOrderSyncComplete, orderCacheStatus.orderCount, orderCacheStatus.status, pluginContext?.instanceId]);

  useEffect(() => {
    if (!templatesHydrated || !storeProfile || storeProfileDefaultsApplied || templatesLoadedFromDatabase) {
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
  }, [language, storeProfile, storeProfileDefaultsApplied, templatesHydrated, templatesLoadedFromDatabase, timezone]);

  useEffect(() => {
    if (!pluginContext) {
      return;
    }

    if (pluginContext.instanceId) {
      void loadCachedOrders();
    }
  }, [pluginContext?.instanceId, pluginContext?.ordersEndpoint]);

  useEffect(() => {
    if (!pluginContext?.instanceId || activeView !== "orders") {
      return;
    }

    const canRefreshOrders = () => document.visibilityState === "visible";
    const refreshOrders = () => {
      if (canRefreshOrders()) {
        void loadCachedOrders();
      }
    };
    const intervalId = window.setInterval(refreshOrders, orderAutoRefreshIntervalMs);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", refreshOrders);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", refreshOrders);
    };
  }, [activeView, pluginContext?.instanceId, pluginContext?.ordersEndpoint]);

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

  function openOrderPreview(order: Order) {
    setSelectedIds([order.id]);
    setDrawerOpen(true);
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
    setTemplateStoreStatus({ error: null, status: "idle" });
    setTemplateEditorMode("create");
    setTemplateDraft(createTemplateDraftWithStoreProfile(storeProfile));
    setTemplateEditorOpen(true);
  }

  function openTemplateEditor(templateRecord: TemplateRecord) {
    const mode: TemplateEditorMode = templateRecord.source === "Built-in" ? "duplicate" : "edit";

    setTemplateStoreStatus({ error: null, status: "idle" });
    setTemplateEditorMode(mode);
    setTemplateDraft(createDraftFromTemplate(templateRecord, mode));
    setTemplateEditorOpen(true);
  }

  async function loadTemplatesFromDatabase() {
    if (!pluginContext?.templatesEndpoint) {
      return;
    }

    setTemplateStoreStatus({ error: null, status: "loading" });

    try {
      const response = await fetch(pluginContext.templatesEndpoint, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as {
        selectedTemplateId?: unknown;
        templateStore?: {
          reason?: string | null;
          status?: "loaded" | "skipped" | "error";
          templateCount?: number;
        };
        templates?: unknown;
      } | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.templateStore?.reason ?? `Template store request failed with ${response.status}`);
      }

      const databaseTemplates = readTemplateRecordsFromPayload(payload.templates);

      if (payload.templateStore?.status === "loaded" && databaseTemplates.length > 0) {
        const selectedId = typeof payload.selectedTemplateId === "string" ? payload.selectedTemplateId : null;
        const nextTemplateRecords = mergeStoreTemplatesWithBuiltIns(databaseTemplates);

        setTemplatesLoadedFromDatabase(true);
        setTemplateRecords(nextTemplateRecords);
        templateRecordsRef.current = nextTemplateRecords;

        if (selectedId && nextTemplateRecords.some((templateRecord) => templateRecord.id === selectedId)) {
          setSelectedTemplateId(selectedId);
          selectedTemplateIdRef.current = selectedId;
          persistTemplateState(nextTemplateRecords, selectedId);
        } else {
          const fallbackSelectedId =
            nextTemplateRecords.find((templateRecord) => isStoreTemplateRecord(templateRecord) && templateRecord.isDefault)?.id ??
            nextTemplateRecords.find(isStoreTemplateRecord)?.id ??
            nextTemplateRecords[0]?.id ??
            selectedTemplateIdRef.current;

          setSelectedTemplateId(fallbackSelectedId);
          selectedTemplateIdRef.current = fallbackSelectedId;
          persistTemplateState(nextTemplateRecords, fallbackSelectedId);
        }

        setTemplateStoreStatus({ error: null, status: "loaded" });
        return;
      }

      if (payload.templateStore?.status === "loaded" && databaseTemplates.length === 0) {
        const nextTemplateRecords = mergeStoreTemplatesWithBuiltIns(templateRecordsRef.current);

        setTemplatesLoadedFromDatabase(false);
        setTemplateRecords(nextTemplateRecords);
        templateRecordsRef.current = nextTemplateRecords;
        await persistTemplatesToDatabase(nextTemplateRecords, selectedTemplateIdRef.current);
        setTemplateStoreStatus({ error: null, status: "saved" });
        return;
      }

      setTemplateStoreStatus({
        error: payload.templateStore?.reason ?? null,
        status: payload.templateStore?.status === "skipped" ? "skipped" : "loaded",
      });
    } catch (error) {
      setTemplateStoreStatus({
        error: error instanceof Error ? error.message : "Failed to load PrintOps templates",
        status: "error",
      });
    }
  }

  async function persistTemplatesToDatabase(templates: TemplateRecord[], nextSelectedTemplateId: string): Promise<TemplateStoreStatus> {
    if (!pluginContext?.templatesEndpoint) {
      const nextStatus: TemplateStoreStatus = {
        error: "Template database endpoint is not available.",
        status: "skipped",
      };

      setTemplateStoreStatus(nextStatus);

      return nextStatus;
    }

    setTemplateStoreStatus({ error: null, status: "saving" });

    try {
      const persistedTemplates = getStoreTemplatesForPersistence(templates);
      const persistedSelectedTemplateId = resolvePersistedSelectedTemplateId(persistedTemplates, nextSelectedTemplateId);
      const response = await fetch(pluginContext.templatesEndpoint, {
        body: JSON.stringify({
          selectedTemplateId: persistedSelectedTemplateId,
          templates: persistedTemplates,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      });
      const payload = (await response.json().catch(() => null)) as {
        templateStore?: {
          reason?: string | null;
          status?: "persisted" | "skipped" | "error";
        };
      } | null;

      if (!response.ok || payload?.templateStore?.status === "error") {
        throw new Error(payload?.templateStore?.reason ?? `Template save failed with ${response.status}`);
      }

      const nextStatus: TemplateStoreStatus = {
        error: payload?.templateStore?.reason ?? null,
        status: payload?.templateStore?.status === "skipped" ? "skipped" : "saved",
      };

      setTemplateStoreStatus(nextStatus);

      return nextStatus;
    } catch (error) {
      const nextStatus: TemplateStoreStatus = {
        error: error instanceof Error ? error.message : "Failed to save PrintOps templates",
        status: "error",
      };

      setTemplateStoreStatus(nextStatus);

      return nextStatus;
    }
  }

  async function loadSettingsFromDatabase() {
    if (!pluginContext?.settingsEndpoint) {
      return;
    }

    try {
      const response = await fetch(pluginContext.settingsEndpoint, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as {
        settings?: unknown;
        settingsStore?: {
          reason?: string | null;
          status?: "loaded" | "skipped" | "error";
        };
      } | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.settingsStore?.reason ?? `Settings request failed with ${response.status}`);
      }

      const databaseSettings = readSettingsSnapshotFromPayload(payload.settings);

      if (payload.settingsStore?.status === "loaded" && Object.keys(databaseSettings).length > 0) {
        const nextSettings = {
          ...settingsSnapshotRef.current,
          ...databaseSettings,
        };

        applySettingsSnapshot(nextSettings, { persist: true });
        return;
      }

      if (payload.settingsStore?.status === "loaded") {
        await persistSettingsToDatabase(settingsSnapshotRef.current);
      }
    } catch {
      // Local storage remains the fallback when the settings store is unavailable.
    }
  }

  async function persistSettingsToDatabase(settings: PrintOpsSettingsSnapshot) {
    if (!pluginContext?.settingsEndpoint) {
      return;
    }

    try {
      await fetch(pluginContext.settingsEndpoint, {
        body: JSON.stringify({
          settings: {
            printLocale: settings.language,
            siteLocale: settings.siteLocale,
            theme: settings.darkTheme ? "dark" : "light",
            timezone: settings.timezone,
            workspaceAccent: settings.workspaceAccent,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      });
    } catch {
      // Settings still persist locally; database persistence can retry on the next change.
    }
  }

  async function loadAccountBinding() {
    if (!pluginContext?.accountBindingEndpoint) {
      return;
    }

    setAccountBindingStatus({ error: null, status: "loading" });

    try {
      const response = await fetch(pluginContext.accountBindingEndpoint, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as {
        accountBinding?: unknown;
        error?: string;
      } | null;

      if (!response.ok || !payload) {
        throw new Error(readAccountBindingError(payload) ?? `Account binding request failed with ${response.status}`);
      }

      const snapshot = readAccountBindingSnapshotFromPayload(payload.accountBinding);

      setAccountBinding(snapshot);
      setAccountBindingStatus({
        error: null,
        status: snapshot?.bindingStatus === "verified" ? "bound" : "loaded",
      });
    } catch (error) {
      setAccountBindingStatus({
        error: error instanceof Error ? error.message : "Account binding unavailable",
        status: "error",
      });
    }
  }

  async function requestAccountBindingCode(email: string) {
    if (!pluginContext?.accountBindingEndpoint) {
      return;
    }

    setAccountBindingStatus({ error: null, status: "sending" });

    try {
      const response = await fetch(pluginContext.accountBindingEndpoint, {
        body: JSON.stringify({
          action: "request_code",
          displayName: storeProfile?.businessName ?? printOpsSystemBrandName,
          email,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        accountBinding?: unknown;
        error?: string;
      } | null;

      if (!response.ok || !payload) {
        throw new Error(readAccountBindingError(payload) ?? `Verification request failed with ${response.status}`);
      }

      const snapshot = readAccountBindingSnapshotFromPayload(payload.accountBinding);

      setAccountBinding(snapshot);
      setAccountBindingStatus({
        error: null,
        status: "code_sent",
      });
    } catch (error) {
      setAccountBindingStatus({
        error: error instanceof Error ? error.message : "Verification request failed",
        status: "error",
      });
    }
  }

  async function verifyAccountBindingCode(email: string, code: string) {
    if (!pluginContext?.accountBindingEndpoint) {
      return;
    }

    setAccountBindingStatus({ error: null, status: "verifying" });

    try {
      const response = await fetch(pluginContext.accountBindingEndpoint, {
        body: JSON.stringify({
          action: "verify_code",
          code,
          displayName: storeProfile?.businessName ?? printOpsSystemBrandName,
          email,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        accountBinding?: unknown;
        error?: string;
      } | null;

      if (!response.ok || !payload) {
        throw new Error(readAccountBindingError(payload) ?? `Account binding failed with ${response.status}`);
      }

      const snapshot = readAccountBindingSnapshotFromPayload(payload.accountBinding);

      setAccountBinding(snapshot);
      setAccountBindingStatus({
        error: null,
        status: snapshot?.bindingStatus === "verified" ? "bound" : "loaded",
      });
    } catch (error) {
      setAccountBindingStatus({
        error: error instanceof Error ? error.message : "Account binding failed",
        status: "error",
      });
    }
  }

  function applySettingsSnapshot(settings: PrintOpsSettingsSnapshot, options: { persist?: boolean } = {}) {
    setDarkTheme(settings.darkTheme);
    setLanguage(settings.language);
    setSiteLocale(settings.siteLocale);
    setTimezone(settings.timezone);
    setWorkspaceAccent(settings.workspaceAccent);
    settingsSnapshotRef.current = settings;

    if (options.persist) {
      persistSettingsState(settings);
    }
  }

  function updateSettingsSnapshot(patch: Partial<PrintOpsSettingsSnapshot>) {
    const nextSettings = {
      ...settingsSnapshotRef.current,
      ...patch,
    };

    applySettingsSnapshot(nextSettings, { persist: true });
    void persistSettingsToDatabase(nextSettings);
  }

  async function saveTemplateDraft() {
    const existingTemplate = templateRecords.find((templateRecord) => templateRecord.id === templateDraft.id);
    const savedTemplate = createTemplateRecordFromDraft(templateDraft, templateEditorMode === "edit" ? existingTemplate : undefined);
    const shouldUseSavedTemplateByDefault = savedTemplate.status === "Ready";
    const nextSavedTemplate = shouldUseSavedTemplateByDefault ? { ...savedTemplate, isDefault: true } : savedTemplate;
    const nextTemplateRecords = (() => {
      if (templateEditorMode === "edit" && existingTemplate) {
        return templateRecords.map((templateRecord) => {
          if (templateRecord.id === existingTemplate.id) {
            return nextSavedTemplate;
          }

          if (shouldUseSavedTemplateByDefault && templateRecord.documentType === savedTemplate.documentType) {
            return { ...templateRecord, isDefault: false };
          }

          return templateRecord;
        });
      }

      return [
        nextSavedTemplate,
        ...templateRecords.map((templateRecord) =>
          shouldUseSavedTemplateByDefault && templateRecord.documentType === savedTemplate.documentType ? { ...templateRecord, isDefault: false } : templateRecord,
        ),
      ];
    })();

    const saveStatus = await persistTemplatesToDatabase(nextTemplateRecords, nextSavedTemplate.id);

    if (saveStatus.status === "error" || saveStatus.status === "skipped") {
      return;
    }

    setTemplateRecords(nextTemplateRecords);
    setTemplateTab("mine");
    setSelectedTemplateId(nextSavedTemplate.id);
    persistTemplateState(nextTemplateRecords, nextSavedTemplate.id);
    setTemplateEditorOpen(false);
  }

  function setDefaultTemplate(templateId: string) {
    const targetTemplate = templateRecords.find((templateRecord) => templateRecord.id === templateId);

    if (!targetTemplate || !isStoreTemplateRecord(targetTemplate)) {
      return;
    }

    const nextTemplateRecords = templateRecords.map((templateRecord) => ({
      ...templateRecord,
      isDefault: isStoreTemplateRecord(templateRecord) && templateRecord.id === templateId,
    }));

    setTemplateRecords(nextTemplateRecords);
    setSelectedTemplateId(templateId);
    persistTemplateState(nextTemplateRecords, templateId);
    void persistTemplatesToDatabase(nextTemplateRecords, templateId);
  }

  function deleteTemplate(templateId: string) {
    let nextSelectedTemplateId = selectedTemplateId;
    const nextTemplateRecords = (() => {
      const targetTemplate = templateRecords.find((templateRecord) => templateRecord.id === templateId);

      if (!targetTemplate || targetTemplate.source === "Built-in") {
        return templateRecords;
      }

      const storeTemplates = templateRecords.filter((templateRecord) => templateRecord.source === "Store copy");

      if (storeTemplates.length <= 1) {
        return templateRecords;
      }

      const remainingTemplates = templateRecords.filter((templateRecord) => templateRecord.id !== templateId);

      if (remainingTemplates.some((templateRecord) => templateRecord.isDefault)) {
        if (nextSelectedTemplateId === templateId) {
          nextSelectedTemplateId =
            remainingTemplates.find((templateRecord) => templateRecord.source === "Store copy")?.id ??
            remainingTemplates[0]?.id ??
            nextSelectedTemplateId;
        }

        return remainingTemplates;
      }

      const nextDefault =
        remainingTemplates.find((templateRecord) => templateRecord.source === "Store copy" && templateRecord.documentType === targetTemplate.documentType) ??
        remainingTemplates.find((templateRecord) => templateRecord.source === "Store copy");
      nextSelectedTemplateId = nextDefault?.id ?? remainingTemplates[0]?.id ?? nextSelectedTemplateId;

      return remainingTemplates.map((templateRecord) => ({
        ...templateRecord,
        isDefault: templateRecord.id === nextDefault?.id,
      }));
    })();

    setTemplateRecords(nextTemplateRecords);
    setSelectedTemplateId(nextSelectedTemplateId);
    persistTemplateState(nextTemplateRecords, nextSelectedTemplateId);
    void persistTemplatesToDatabase(nextTemplateRecords, nextSelectedTemplateId);
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

      if (!persistence) {
        setWixSyncStatus((current) => ({
          customFieldCount: payload.sync?.customFieldCount ?? 0,
          error: messages.wixSync.cacheUnavailable,
          lastSyncedAt: current.lastSyncedAt,
          mode,
          orderCount: payload.sync?.orderCount ?? 0,
          orders: payload.orders ?? [],
          persistence,
          status: "error",
          window: payload.sync?.window ?? null,
        }));
        void loadCachedOrders();
        return;
      }

      const persistenceError =
        persistence.status !== "persisted" ? `${messages.wixSync.cacheNotPersisted}: ${persistence.reason ?? persistence.status}` : null;

      if (persistenceError) {
        setWixSyncStatus((current) => ({
          customFieldCount: payload.sync?.customFieldCount ?? 0,
          error: persistenceError,
          lastSyncedAt: current.lastSyncedAt,
          mode,
          orderCount: payload.sync?.orderCount ?? 0,
          orders: payload.orders ?? [],
          persistence,
          status: "error",
          window: payload.sync?.window ?? null,
        }));
        void loadCachedOrders();
        return;
      }

      const syncedAt = new Date().toISOString();

      setWixSyncStatus({
        customFieldCount: payload.sync?.customFieldCount ?? 0,
        error: null,
        lastSyncedAt: syncedAt,
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

      if (persistence.status === "persisted") {
        window.localStorage.setItem(getInitialOrderSyncStorageKey(pluginContext.instanceId), "complete");
        window.localStorage.setItem(getLastOrderSyncStorageKey(pluginContext.instanceId), syncedAt);
        setInitialOrderSyncComplete(true);
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
      const response = await fetch(pluginContext.ordersEndpoint, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as {
        cache?: {
          orderCount?: number;
          reason?: string | null;
          status?: "loaded" | "skipped" | "error";
        };
        error?: string;
        orders?: PrintOpsCachedOrderSummary[];
        subscription?: PrintOpsSubscriptionSummary;
      } | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? `PrintOps order cache request failed with ${response.status}`);
      }

      const mappedOrders = (payload.orders ?? []).map(mapCachedPrintOpsOrderToOrder);
      const latestSyncedAt = payload.orders?.[0]?.syncedAt ?? null;

      setCachedOrders(mappedOrders);
      setSubscriptionSummary(payload.subscription ?? null);
      if (latestSyncedAt) {
        window.localStorage.setItem(getLastOrderSyncStorageKey(pluginContext.instanceId), latestSyncedAt);
        setWixSyncStatus((current) => ({
          ...current,
          lastSyncedAt: latestSyncedAt,
        }));
      }
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
      dir="ltr"
      lang={siteLocale}
    >
      <aside className={styles.sidebar} aria-label="PrintOps">
        <div className={styles.brandRow}>
          <div className={styles.logo} aria-hidden="true">
            <Printer size={19} strokeWidth={2.15} aria-hidden />
          </div>
          <div className={styles.brandCopy}>
            <strong>{messages.app.name}</strong>
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
                const isExternalLink = item.href.startsWith("http");

                return (
                  <a
                    aria-current={isActive ? "page" : undefined}
                    className={styles.navItem}
                    data-active={isActive}
                    href={item.href}
                    key={item.label}
                    rel={isExternalLink ? "noreferrer" : undefined}
                    target={isExternalLink ? "_blank" : undefined}
                    onClick={(event) => {
                      if (isExternalLink) {
                        setMobileSidebarOpen(false);
                        return;
                      }

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
          </div>
          <div className={styles.topbarActions}>
            <SubscriptionPlanControl messages={messages} summary={subscriptionSummary} initialUpgrade={pluginContext?.subscriptionUpgrade} />
            <button className={styles.roundAction} type="button" aria-label={messages.topbar.notifications} title={messages.topbar.notifications}>
              <BellRing size={18} aria-hidden />
              {hasUnreadProductUpdates ? <span aria-hidden /> : null}
            </button>
            <details className={styles.profileMenu}>
              <summary className={styles.profileButton} aria-label={messages.nav.settings} title={messages.nav.settings}>
                <span className={styles.avatar}>{workspaceStoreInitials}</span>
              </summary>
              <div className={styles.profileMenuPanel}>
                <button
                  className={styles.profileMenuItem}
                  type="button"
                  onClick={() => {
                    updateWorkspaceView("settings", viewLinks.settings);
                  }}
                >
                  <Settings size={16} aria-hidden />
                  <span>{messages.nav.settings}</span>
                </button>
              </div>
            </details>
          </div>
        </header>

        <section className={styles.titleRow}>
          <div>
            <p className={styles.kicker}>Zider PrintOps</p>
            <h1>{pageTitle}</h1>
            <span className={styles.titleDescription}>{pageDescription}</span>
          </div>
          {pageMetrics.length > 0 ? (
            <div className={styles.metrics} data-view={activeView} aria-label="PrintOps summary">
              {pageMetrics.map((metric) => (
                <Metric key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
              ))}
            </div>
          ) : null}
        </section>

        {activeView === "settings" ? (
          <SettingsCenter
            accountBinding={accountBinding}
            accountBindingAvailable={Boolean(pluginContext?.accountBindingEndpoint)}
            accountBindingError={accountBindingStatus.error}
            accountBindingStatus={accountBindingStatus.status}
            accentColor={workspaceAccent}
            darkTheme={darkTheme}
            messages={messages}
            onAccentColorChange={(value) => updateSettingsSnapshot({ workspaceAccent: value })}
            onPrintLanguageChange={(value) => updateSettingsSnapshot({ language: value })}
            onRequestAccountBindingCode={requestAccountBindingCode}
            onSiteLocaleChange={(value) => updateSettingsSnapshot({ siteLocale: value })}
            onThemeChange={(value) => updateSettingsSnapshot({ darkTheme: value })}
            onTimezoneChange={(value) => updateSettingsSnapshot({ timezone: value })}
            onVerifyAccountBindingCode={verifyAccountBindingCode}
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
                <WixSyncPanel
                  context={pluginContext}
                  initialSyncComplete={initialOrderSyncComplete}
                  messages={messages}
                  onSync={syncWixOrders}
                  siteLocale={siteLocale}
                  status={wixSyncStatus}
                />
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
                  <FilterChip label={messages.metrics.printed} active={orderFilters.printed} onClick={() => toggleOrderFilter("printed")} />
                  <FilterChip label={messages.metrics.unprinted} active={orderFilters.unprinted} onClick={() => toggleOrderFilter("unprinted")} />
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
                            <strong>{defaultOrderTemplateDisplay.name}</strong>
                            <span>{defaultOrderTemplateLanguageLabel}</span>
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
                              </button>
                              <button
                                aria-label={`${messages.orderPanel.printPreview}: ${order.number}`}
                                className={styles.rowActionButton}
                                title={messages.orderPanel.printPreview}
                                type="button"
                                onClick={() => requestOrderExport("print", [order])}
                              >
                                <Printer size={15} aria-hidden />
                              </button>
                              <button
                                aria-label={`${messages.orderPanel.openPreview}: ${order.number}`}
                                className={styles.iconButton}
                                title={messages.orderPanel.openPreview}
                                type="button"
                                onClick={() => openOrderPreview(order)}
                              >
                                <Eye size={16} aria-hidden />
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
                      <td colSpan={10}>
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
              printLocale={defaultOrderTemplateLanguage}
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
        templateStoreStatus={templateStoreStatus}
      />

      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Backdrop className={styles.drawerBackdrop} />
          <Drawer.Viewport className={styles.drawerViewport}>
            <Drawer.Popup className={styles.drawerPopup}>
              <div className={styles.drawerHeader}>
                <div>
                  <Drawer.Title className={styles.drawerTitle}>{messages.orderPanel.printPreview}</Drawer.Title>
                  <Drawer.Description className={styles.drawerDescription}>
                    {selectedCount} {messages.drawer.selectedOrders}
                  </Drawer.Description>
                </div>
                <Drawer.Close className={styles.iconButton} aria-label="Close print preview">
                  <X size={18} aria-hidden />
                </Drawer.Close>
              </div>

              <div className={styles.drawerGrid}>
                <section className={styles.drawerPreview}>
                  <PrintPreview previewId="drawer" printLocale={defaultOrderTemplateLanguage} selectedOrders={selectedOrders} templateRecord={defaultOrderTemplate} />
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
  accountBinding,
  accountBindingAvailable,
  accountBindingError,
  accountBindingStatus,
  accentColor,
  darkTheme,
  messages,
  onAccentColorChange,
  onPrintLanguageChange,
  onRequestAccountBindingCode,
  onSiteLocaleChange,
  onThemeChange,
  onTimezoneChange,
  onVerifyAccountBindingCode,
  printLanguage,
  printLanguageOptions,
  siteLocale,
  timezone,
}: {
  accountBinding: AccountBindingSnapshot | null;
  accountBindingAvailable: boolean;
  accountBindingError: string | null;
  accountBindingStatus: "idle" | "loading" | "sending" | "code_sent" | "verifying" | "loaded" | "bound" | "error";
  accentColor: WorkspaceAccent;
  darkTheme: boolean;
  messages: PrintOpsMessages;
  onAccentColorChange: (value: WorkspaceAccent) => void;
  onPrintLanguageChange: (value: PrintLocale) => void;
  onRequestAccountBindingCode: (email: string) => void | Promise<void>;
  onSiteLocaleChange: (value: SiteLocale) => void;
  onThemeChange: (value: boolean) => void;
  onTimezoneChange: (value: string) => void;
  onVerifyAccountBindingCode: (email: string, code: string) => void | Promise<void>;
  printLanguage: PrintLocale;
  printLanguageOptions: { label: string; value: string }[];
  siteLocale: SiteLocale;
  timezone: string;
}) {
  const [activeSettingsTab, setActiveSettingsTab] = useState<"appearance" | "preferences" | "account">("appearance");
  const isAppearanceSettings = activeSettingsTab === "appearance";
  const isPreferencesSettings = activeSettingsTab === "preferences";
  const isAccountSettings = activeSettingsTab === "account";
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
  const settingsHeader = isAppearanceSettings
    ? {
        description: messages.settings.appearanceLanguageDescription,
        icon: <Settings size={20} aria-hidden />,
        title: messages.settings.appearanceLanguage,
      }
    : isAccountSettings
      ? {
          description: messages.settings.accountBindingDescription,
          icon: <UserRound size={20} aria-hidden />,
          title: messages.settings.accountBinding,
        }
      : {
          description: messages.settings.preferencesDescription,
          icon: <Globe size={20} aria-hidden />,
          title: messages.settings.preferences,
        };

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
          data-active={isPreferencesSettings}
          onClick={() => setActiveSettingsTab("preferences")}
          type="button"
        >
          <Globe size={18} aria-hidden />
          <strong>{messages.settings.preferences}</strong>
        </button>
        <button
          className={styles.settingsMenuItem}
          data-active={isAccountSettings}
          onClick={() => setActiveSettingsTab("account")}
          type="button"
        >
          <UserRound size={18} aria-hidden />
          <strong>{messages.settings.accountBinding}</strong>
        </button>
      </aside>

      <section className={styles.settingsContent}>
        <div className={styles.settingsCard}>
          <div className={styles.settingsCardHeader}>
            <span className={styles.settingsIconBubble}>{settingsHeader.icon}</span>
            <div>
              <h2>{settingsHeader.title}</h2>
              <p>{settingsHeader.description}</p>
            </div>
          </div>

          {isAccountSettings ? (
            <AccountBindingSettings
              binding={accountBinding}
              bindingAvailable={accountBindingAvailable}
              error={accountBindingError}
              onRequestCode={onRequestAccountBindingCode}
              onVerifyCode={onVerifyAccountBindingCode}
              messages={messages}
              status={accountBindingStatus}
            />
          ) : isAppearanceSettings ? (
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

function AccountBindingSettings({
  binding,
  bindingAvailable,
  error,
  messages,
  onRequestCode,
  onVerifyCode,
  status,
}: {
  binding: AccountBindingSnapshot | null;
  bindingAvailable: boolean;
  error: string | null;
  messages: PrintOpsMessages;
  onRequestCode: (email: string) => void | Promise<void>;
  onVerifyCode: (email: string, code: string) => void | Promise<void>;
  status: "idle" | "loading" | "sending" | "code_sent" | "verifying" | "loaded" | "bound" | "error";
}) {
  const [email, setEmail] = useState(binding?.suggestedEmail ?? binding?.ownerEmail ?? "");
  const [code, setCode] = useState("");
  const isVerified = binding?.bindingStatus === "verified";
  const isCodeSent = status === "code_sent" || Boolean(binding?.developmentCode);
  const displayEmail = binding?.memberEmail ?? binding?.bindingEmail ?? binding?.suggestedEmail ?? binding?.ownerEmail ?? "";
  const suggestedEmail = binding?.suggestedEmail ?? binding?.ownerEmail ?? "";

  useEffect(() => {
    setEmail((currentEmail) => (currentEmail.trim() ? currentEmail : suggestedEmail));
  }, [suggestedEmail]);

  return (
    <div className={styles.settingsSection}>
      <div className={styles.settingsSectionHeader}>
        <strong>{messages.settings.ziderMember}</strong>
        <span>{messages.settings.accountBindingMemberDescription}</span>
      </div>

      <div className={styles.accountBindingCard}>
        <div>
          <span className={styles.accountBindingStatus} data-status={isVerified ? "verified" : "pending"}>
            {isVerified ? messages.settings.verified : status === "loading" ? messages.settings.checking : messages.settings.pending}
          </span>
          <strong>{displayEmail || messages.settings.noOwnerEmailDetected}</strong>
          <small>
            {isVerified
              ? `${binding?.workspaceName ?? "Workspace"} ${messages.settings.accountBindingVerifiedDescription}`
              : isCodeSent
                ? messages.settings.accountBindingCodeSentDescription
                : messages.settings.accountBindingPendingDescription}
          </small>
        </div>
      </div>

      {!bindingAvailable ? (
        <p className={styles.helperText}>{messages.settings.accountBindingOpenFromWix}</p>
      ) : isVerified ? null : (
        <div className={styles.accountBindingForm}>
          <label>
            <span>{messages.settings.ownerEmail}</span>
            <input
              className={styles.textInput}
              disabled={status === "sending" || status === "verifying"}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="site-owner@example.com"
              type="email"
              value={email}
            />
          </label>
          <button
            className={styles.primaryButton}
            disabled={status === "sending" || status === "verifying" || !email.trim()}
            onClick={() => onRequestCode(email)}
            type="button"
          >
            {status === "sending" ? messages.settings.sending : isCodeSent ? messages.settings.resendCode : messages.settings.sendCode}
          </button>
          {isCodeSent ? (
            <>
              <label>
                <span>{messages.settings.verificationCode}</span>
                <input
                  className={styles.textInput}
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  value={code}
                />
              </label>
              <button
                className={styles.primaryButton}
                disabled={status === "verifying" || code.length !== 6 || !email.trim()}
                onClick={() => onVerifyCode(email, code)}
                type="button"
              >
                {status === "verifying" ? messages.settings.verifying : messages.settings.verifyAndBind}
              </button>
            </>
          ) : null}
        </div>
      )}

      {error ? <p className={styles.accountBindingError}>{error}</p> : null}
      {binding?.developmentCode ? (
        <p className={styles.helperText}>
          {messages.settings.developmentCode}: {binding.developmentCode}
        </p>
      ) : null}
    </div>
  );
}

function WixSyncPanel({
  context,
  initialSyncComplete,
  messages,
  onSync,
  siteLocale,
  status,
}: {
  context: PrintOpsPluginContext;
  initialSyncComplete: boolean;
  messages: PrintOpsMessages;
  onSync: (mode: "latest" | "history") => Promise<void>;
  siteLocale: SiteLocale;
  status: WixSyncStatus;
}) {
  const hasInstance = Boolean(context.instanceId);
  const syncMessages = getLocalizedWixSyncMessages(messages, siteLocale);
  const statusLabel = hasInstance ? (context.verified ? syncMessages.connected : syncMessages.devMode) : syncMessages.missingInstance;
  const statusTone = hasInstance ? (context.verified ? "good" : "warn") : "warn";
  const showCompact = initialSyncComplete;
  const syncMessage =
    status.status === "syncing"
      ? syncMessages.syncing
      : status.status === "success"
        ? syncMessages.synced
        : status.status === "error"
          ? syncMessages.failed
          : syncMessages.ready;
  const compactMessage =
    status.error ??
    (status.status === "syncing" ? syncMessages.syncing : formatLastSyncedAt(status.lastSyncedAt, syncMessages, siteLocale));

  if (showCompact) {
    return (
      <section className={styles.syncPanel} data-tone={status.status === "error" ? "warn" : statusTone} data-variant="compact">
        <div className={styles.syncCompactMain}>
          <span className={styles.syncStatusDot} aria-hidden />
          <strong>{status.status === "error" ? syncMessages.failed : statusLabel}</strong>
          <small data-state={status.status}>{compactMessage}</small>
        </div>
        <div className={styles.syncActions}>
          <button className={styles.secondaryButton} type="button" disabled={!hasInstance || status.status === "syncing"} onClick={() => onSync("latest")}>
            {syncMessages.syncLatest}
          </button>
          <Menu.Root>
            <Menu.Trigger className={`${styles.iconButton} ${styles.syncMoreButton}`} aria-label={syncMessages.moreActions}>
              <MoreHorizontal size={18} aria-hidden />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="end" className={styles.menuPositioner} collisionPadding={12} side="bottom" sideOffset={8}>
                <Menu.Popup className={styles.menuPopup}>
                  <Menu.Item className={styles.menuItem} disabled={!hasInstance || status.status === "syncing"} onClick={() => void onSync("history")}>
                    {syncMessages.syncHistory}
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.syncPanel} data-tone={statusTone}>
      <div className={styles.syncMain}>
        <span className={styles.syncIcon}>
          {status.status === "error" ? <AlertTriangle size={18} aria-hidden /> : <CheckCircle2 size={18} aria-hidden />}
        </span>
        <div>
          <div className={styles.syncTitle}>
            <strong>{syncMessages.title}</strong>
            <span>{statusLabel}</span>
          </div>
          <p>{syncMessages.firstRunDescription}</p>
          <small data-state={status.status}>{status.error ?? syncMessage}</small>
        </div>
      </div>

      <div className={styles.syncActions}>
        <button className={styles.secondaryButton} type="button" disabled={!hasInstance || status.status === "syncing"} onClick={() => onSync("latest")}>
          {syncMessages.syncLatest}
        </button>
        <button className={styles.primaryButton} type="button" disabled={!hasInstance || status.status === "syncing"} onClick={() => onSync("history")}>
          {syncMessages.syncHistory}
        </button>
      </div>

      {status.status === "success" ? (
        <div className={styles.syncResult}>
          <span>
            <strong>{status.orderCount}</strong> {syncMessages.ordersSynced}
          </span>
          <span>
            <strong>{status.customFieldCount}</strong> {syncMessages.customFieldsFound}
          </span>
          {status.window ? (
            <span>
              {syncMessages.window}: {formatSyncDate(status.window.from)} - {formatSyncDate(status.window.to)}
            </span>
          ) : null}
          {status.orders.length > 0 ? (
            <span>
              {syncMessages.syncedOrders}: {status.orders.slice(0, 3).map(formatSyncedOrder).join(", ")}
            </span>
          ) : null}
          {status.persistence?.status === "persisted" ? (
            <span data-tone="good">
              <strong>{status.persistence.persistedCount ?? status.orderCount}</strong> {syncMessages.cachePersisted}
            </span>
          ) : null}
          {status.persistence && status.persistence.status !== "persisted" ? (
            <span data-tone="warning">
              {syncMessages.cacheNotPersisted}: {status.persistence.reason ?? status.persistence.status}
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

function orderMatchesSearch(order: Order, normalizedSearch: string, templateValues: string[] = []) {
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
    ...templateValues,
    ...(order.customFields ?? []).flatMap((field) => [field.label, field.value]),
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedSearch));
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
      store: order.store,
      total: order.totalFormatted ?? mappedOrder.total,
      updatedAt: order.updatedAt ?? mappedOrder.updatedAt,
      warning: mappedOrder.warning,
    };
  }

  return {
    channel: "WIX",
    createdAt: order.createdAt,
    customer: order.customerName ?? getDisplayNameFromContact(order.customerEmail) ?? "—",
    date: formatOrderDate(order.updatedAt ?? order.createdAt ?? order.syncedAt),
    email: order.customerEmail ?? order.customerPhone ?? "—",
    fulfillment: mapFulfillmentStatus(order.fulfillmentStatus),
    id: order.sourceOrderId,
    items: formatItemCount(order.totalItemQuantity || order.lineItemCount),
    language: "English",
    number: formatOrderNumber(order.orderNumber ?? order.sourceOrderId),
    payment: mapPaymentStatus(order.paymentStatus),
    print: printStatus,
    printedAt: order.printedAt,
    printUpdatedAt: order.printUpdatedAt,
    source: "cache",
    store: order.store,
    template: "Invoice",
    total: order.totalFormatted ?? formatOptionalMoney(order.totalAmount, order.currency),
    updatedAt: order.updatedAt,
    warning: undefined,
  };
}

function mapWixSyncOrderToOrder(order: WixSyncOrderSummary, source: Order["source"] = "sync"): Order {
  const firstLineItem = order.lineItems[0];
  const customerRecord = getRecord(order.customer);
  const billingAddressRecord = getRecord(order.billingAddress);
  const shippingAddressRecord = getRecord(order.shippingAddress);
  const customerEmail = getString(customerRecord?.email) ?? getString(customerRecord?.phone) ?? "—";
  const customerName =
    getString(customerRecord?.name) ??
    getString(customerRecord?.fullName) ??
    getString(billingAddressRecord?.name) ??
    getString(shippingAddressRecord?.name) ??
    getDisplayNameFromContact(customerEmail) ??
    "—";
  const itemCount = order.totalItemQuantity || order.lineItems.reduce((total, lineItem) => total + (lineItem.quantity ?? 0), 0) || order.lineItems.length;
  const firstItemTitle = getLineItemDisplayTitle(firstLineItem);
  const firstItemQuantity = firstLineItem?.quantity ?? 1;
  const customFields = collectWixOrderCustomFields(order);

  return {
    barcode: firstLineItem?.barcode ?? undefined,
    channel: "WIX",
    createdAt: order.createdAt,
    customFields,
    customer: customerName,
    date: formatOrderDate(order.updatedAt ?? order.createdAt),
    email: customerEmail,
    fulfillment: mapFulfillmentStatus(order.fulfillmentStatus ?? order.deliveryMethod),
    id: order.sourceOrderId,
    items: formatOrderItemsSummary(firstItemTitle, itemCount, firstItemQuantity),
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

function collectWixOrderCustomFields(order: WixSyncOrderSummary, locale: PrintLocale = defaultPrintLocale) {
  const fields: Array<{ label: string; value: string }> = [];

  order.customFields.forEach((field) => {
    const formatted = formatWixCustomField(field);

    if (formatted) {
      fields.push(formatted);
    }
  });

  order.lineItems.forEach((lineItem, index) => {
    const itemLabel = lineItem.title ?? `${resolveTemplateSampleText("lineItem", locale)} ${index + 1}`;

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
    return "—";
  }

  return value.startsWith("#") ? value : `#${value}`;
}

function formatOrderDate(value: string | null) {
  if (!value) {
    return "—";
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

function formatLastSyncedAt(value: string | null, messages: WixSyncMessages, siteLocale: SiteLocale) {
  if (!value) {
    return messages.ready;
  }

  return `${messages.lastUpdated}: ${formatOrderDateForLocale(value, siteLocale)}`;
}

function formatOrderDateForLocale(value: string, siteLocale: SiteLocale) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(getDateTimeLocale(siteLocale), {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function getDateTimeLocale(siteLocale: SiteLocale) {
  if (siteLocale === "zh-Hans") {
    return "zh-CN";
  }

  if (siteLocale === "zh-Hant") {
    return "zh-HK";
  }

  return "en-US";
}

function getLocalizedWixSyncMessages(messages: PrintOpsMessages, siteLocale: SiteLocale): WixSyncMessages {
  if (siteLocale !== "zh-Hans") {
    return messages.wixSync as WixSyncMessages;
  }

  return {
    ...messages.wixSync,
    cacheNotPersisted: "订单缓存未写入",
    cachePersisted: "笔订单已缓存",
    connected: "已连接",
    customFieldsFound: "个自定义字段",
    devMode: "开发实例",
    failed: "同步失败",
    firstRunDescription: "拉取最近 7 天的 Wix 订单，PrintOps 会立即准备可打印的发票预览。后续手动同步默认拉取最近 3 天。",
    lastUpdated: "上次更新",
    missingInstance: "请从 Wix 打开，或在本地开发时传入 instanceId。",
    moreActions: "更多同步操作",
    ordersSynced: "笔订单已同步",
    ready: "可以开始同步",
    syncHistory: "同步最近 7 天",
    syncLatest: "同步最新订单",
    synced: "同步完成",
    syncedOrders: "已同步订单",
    syncing: "正在同步订单...",
    title: "Wix 订单连接",
    window: "同步范围",
  };
}

function mapPaymentStatus(value: string | null): Order["payment"] {
  const normalized = value?.toLowerCase() ?? "";

  if (!normalized) {
    return "Unknown";
  }

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

  if (!normalized) {
    return "Unknown";
  }

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

function formatOptionalMoney(amount: number | null, currency: string | null) {
  if (amount === null) {
    return "—";
  }

  return formatMoney(amount, currency);
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

function getDisplayNameFromContact(value: string | null | undefined) {
  const contact = getString(value);

  if (!contact?.includes("@")) {
    return null;
  }

  return contact
    .split("@")[0]
    ?.replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim() || null;
}

function getLineItemDisplayTitle(lineItem: WixSyncOrderSummary["lineItems"][number] | undefined) {
  const lineItemRecord = getRecord(lineItem);
  const rawLineItemRecord = getRecord(lineItemRecord?.raw);
  const productNameRecord = getRecord(rawLineItemRecord?.productName);
  const productRecord = getRecord(rawLineItemRecord?.product);
  const catalogReferenceRecord = getRecord(rawLineItemRecord?.catalogReference);

  return (
    getString(lineItem?.title) ??
    getString(rawLineItemRecord?.name) ??
    getString(rawLineItemRecord?.productName) ??
    getString(rawLineItemRecord?.title) ??
    getString(productNameRecord?.original) ??
    getString(productNameRecord?.translated) ??
    getString(productNameRecord?.value) ??
    getString(productRecord?.name) ??
    getString(productRecord?.title) ??
    getString(catalogReferenceRecord?.name) ??
    getString(catalogReferenceRecord?.catalogItemName)
  );
}

function formatItemCount(count: number) {
  if (count <= 0) {
    return "—";
  }

  return count === 1 ? "1 item" : `${count} items`;
}

function formatOrderItemsSummary(title: string | null, itemCount: number, firstItemQuantity: number) {
  if (!title) {
    return formatItemCount(itemCount);
  }

  if (itemCount > firstItemQuantity) {
    return `${title} + ${Math.max(itemCount - firstItemQuantity, 0)} more`;
  }

  return `${title} x ${firstItemQuantity}`;
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

function SubscriptionPlanControl({
  initialUpgrade,
  messages,
  summary,
}: {
  initialUpgrade?: PrintOpsSubscriptionUpgradeAction;
  messages: PrintOpsMessages;
  summary: PrintOpsSubscriptionSummary | null;
}) {
  const resolvedSummary = summary ?? fallbackPrintOpsSubscription;
  const limit = resolvedSummary.plan.monthlyOrderLimit;
  const remaining = resolvedSummary.usage.remaining;
  const usageRatio = limit > 0 ? resolvedSummary.usage.used / limit : 0;
  const usagePercent = Math.min(100, Math.max(0, Math.round(usageRatio * 100)));
  const tone = resolvedSummary.status === "error" || usageRatio >= 0.9 ? "warning" : "default";
  const title = `${messages.subscription.currentPlan}: ${resolvedSummary.plan.name} · ${resolvedSummary.usage.used}/${limit} ${messages.subscription.ordersUsed}`;
  const upgradeAction = resolvedSummary.upgrade ?? initialUpgrade ?? fallbackPrintOpsSubscription.upgrade;

  return (
    <div className={styles.subscriptionPlanGroup} data-tone={tone} title={title}>
      <div className={styles.subscriptionBadge}>
        <span>{messages.subscription.currentPlan}</span>
        <strong>{resolvedSummary.plan.name}</strong>
      </div>
      <div className={styles.subscriptionUsageCard}>
        <div className={styles.subscriptionUsageHeader}>
          <span>{messages.subscription.usageTitle}</span>
          <strong>{resolvedSummary.plan.name}</strong>
        </div>
        <div className={styles.subscriptionUsageMeter} aria-hidden="true">
          <span style={{ width: `${usagePercent}%` }} />
        </div>
        <div className={styles.subscriptionUsageRows}>
          <span>{remaining} {messages.subscription.ordersLeft}</span>
          <span>{resolvedSummary.usage.used}/{limit} {messages.subscription.ordersUsed}</span>
        </div>
      </div>
      <a
        className={styles.subscriptionUpgradeButton}
        href={upgradeAction?.href ?? "mailto:support@zider.ink?subject=Upgrade%20PrintOps%20plan"}
        rel={upgradeAction?.provider === "wix" ? "noreferrer" : undefined}
        target={upgradeAction?.provider === "wix" ? "_blank" : undefined}
      >
        {messages.subscription.upgrade}
      </a>
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

  useEffect(() => {
    setPreviewTemplate((currentTemplate) => {
      if (!currentTemplate) {
        return currentTemplate;
      }

      return filteredTemplates.find((templateRecord) => templateRecord.id === currentTemplate.id) ?? null;
    });
  }, [filteredTemplates]);

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
              const previewImageSrc = getTemplateLibraryPreviewImage(templateRecord.id);
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
                      <span className={styles.templateCardPreviewFrame}>
                        <img className={styles.templateCardPreviewImage} src={previewImageSrc} alt="" loading="lazy" />
                      </span>
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

function getOrderBatchFileName(orders: Order[]) {
  if (orders.length === 1 && orders[0]) {
    return getOrderFileName(orders[0]);
  }

  return `printops-invoices-${orders.length || "selected"}-orders.pdf`;
}

function getTemplatePreviewNode(root: ParentNode = document) {
  const previewNode =
    root instanceof HTMLElement && root.matches('[data-template-print-preview="true"]')
      ? root
      : root.querySelector<HTMLElement>('[data-template-print-preview="true"]');
  const paperNode = previewNode?.querySelector<HTMLElement>('[class*="templatePaper"]');

  return paperNode ?? previewNode;
}

function getOrderPreviewPaperNodes(previewNode: HTMLElement | null) {
  if (!previewNode) {
    return [];
  }

  const paperNodes = Array.from(previewNode.querySelectorAll<HTMLElement>('[class*="templatePaper"]'));

  return paperNodes.length > 0 ? paperNodes : [previewNode];
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

function positionPdfExportHost(exportHost: HTMLElement) {
  exportHost.setAttribute("aria-hidden", "true");
  exportHost.setAttribute("data-printops-pdf-export", "true");
  exportHost.style.position = "fixed";
  exportHost.style.top = "0";
  exportHost.style.left = "0";
  exportHost.style.zIndex = "-2147483647";
  exportHost.style.width = `${A4_EXPORT_WIDTH_PX}px`;
  exportHost.style.boxSizing = "border-box";
  exportHost.style.background = "#ffffff";
  exportHost.style.pointerEvents = "none";
  exportHost.style.opacity = "1";
  exportHost.style.visibility = "visible";
}

function waitForPdfExportLayout() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

function getExportPaperTopBorder(sourceNode: HTMLElement) {
  const computedStyle = window.getComputedStyle(sourceNode);
  const topWidth = Number.parseFloat(computedStyle.borderTopWidth);

  if (!Number.isFinite(topWidth) || topWidth <= 1.5 || computedStyle.borderTopStyle === "none") {
    return null;
  }

  return `${computedStyle.borderTopWidth} ${computedStyle.borderTopStyle} ${computedStyle.borderTopColor}`;
}

function applyA4ExportPaperStyles(clonedPaper: HTMLElement, sourceNode: HTMLElement) {
  const topBorder = getExportPaperTopBorder(sourceNode);

  clonedPaper.style.width = `${A4_EXPORT_WIDTH_PX}px`;
  clonedPaper.style.maxWidth = "none";
  clonedPaper.style.minHeight = `${A4_EXPORT_HEIGHT_PX}px`;
  clonedPaper.style.height = `${A4_EXPORT_HEIGHT_PX}px`;
  clonedPaper.style.boxSizing = "border-box";
  clonedPaper.style.boxShadow = "none";
  clonedPaper.style.border = "0";
  if (topBorder) {
    clonedPaper.style.borderTop = topBorder;
  }
  clonedPaper.style.borderRadius = "0";
  clonedPaper.style.margin = "0";
  clonedPaper.style.overflow = "hidden";
  clonedPaper.style.padding = "64px";
  clonedPaper.style.setProperty("-webkit-print-color-adjust", "exact");
  clonedPaper.style.setProperty("print-color-adjust", "exact");
  clonedPaper.querySelectorAll<HTMLElement>("*").forEach((node) => {
    node.style.boxSizing = "border-box";
    node.style.setProperty("-webkit-print-color-adjust", "exact");
    node.style.setProperty("print-color-adjust", "exact");
  });
}

function prepareOrderPaperClone(sourceNode: HTMLElement, isLastPage: boolean) {
  const clonedPaper = sourceNode.cloneNode(true) as HTMLElement;

  clonedPaper.setAttribute("data-order-paper", "true");
  applyA4ExportPaperStyles(clonedPaper, sourceNode);
  clonedPaper.style.breakAfter = isLastPage ? "auto" : "page";
  clonedPaper.style.pageBreakAfter = isLastPage ? "auto" : "always";

  return clonedPaper;
}

async function createOrderPdfBlob(sourceNodes: HTMLElement[], fileName: string) {
  const { default: html2pdf } = await import("html2pdf.js");
  const exportHost = document.createElement("div");
  const pages = sourceNodes.map((sourceNode, index) => prepareOrderPaperClone(sourceNode, index === sourceNodes.length - 1));

  applyTemplateExportTokens(exportHost);
  positionPdfExportHost(exportHost);
  exportHost.style.minHeight = `${A4_EXPORT_HEIGHT_PX}px`;
  exportHost.style.overflow = "visible";
  exportHost.style.display = "block";

  pages.forEach((page) => exportHost.appendChild(page));
  document.body.appendChild(exportHost);

  try {
    await waitForPdfExportLayout();
    const exportHeight = Math.max(A4_EXPORT_HEIGHT_PX, A4_EXPORT_HEIGHT_PX * Math.max(1, pages.length));
    const pdfOptions = {
      margin: 0,
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        backgroundColor: "#ffffff",
        height: exportHeight,
        logging: false,
        scale: 3,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        width: A4_EXPORT_WIDTH_PX,
        windowHeight: exportHeight,
        windowWidth: A4_EXPORT_WIDTH_PX,
        x: 0,
        y: 0,
      },
      jsPDF: {
        format: "a4",
        orientation: "portrait",
        unit: "mm",
      },
      pagebreak: {
        mode: ["css", "legacy"],
      },
    };

    return (await html2pdf()
      .set(pdfOptions as never)
      .from(exportHost)
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

function openOrderPrintWindow(sourceNodes: HTMLElement[], title: string) {
  const printWindow = window.open("", "_blank", "width=980,height=1200");

  if (!printWindow || sourceNodes.length === 0) {
    return;
  }

  const pagesMarkup = sourceNodes
    .map((sourceNode, index) => prepareOrderPaperClone(sourceNode, index === sourceNodes.length - 1).outerHTML)
    .join("\n");
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
        --order-accent: #087a46;
        --order-accent-2: #046137;
        --order-soft: #eff6f1;
        --order-line: #dce5de;
        --order-ink: #111816;
        --order-muted: #65706d;
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
        gap: 24px;
        min-height: 100vh;
        padding: 32px;
      }

      .printops-order-print-preview [data-order-paper="true"] {
        width: ${A4_EXPORT_WIDTH_PX}px !important;
        max-width: none !important;
        min-height: ${A4_EXPORT_HEIGHT_PX}px !important;
        height: ${A4_EXPORT_HEIGHT_PX}px !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 64px !important;
      }

      .printops-order-print-preview [data-order-paper="true"]:not([data-style="market"]) {
        border-top: 0 !important;
      }

      .printops-order-print-preview [data-order-paper="true"][data-document="order"][data-style="market"] {
        border-top: 0.55em solid var(--order-accent-2) !important;
      }

      .printops-order-print-preview [data-order-paper="true"]:not(:last-child) {
        break-after: page;
        page-break-after: always;
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
          gap: 0;
        }

        .printops-order-print-preview [data-order-paper="true"] {
          width: 210mm !important;
          max-width: none !important;
          min-height: 297mm !important;
          height: 297mm !important;
          border-left: 0 !important;
          border-right: 0 !important;
          border-bottom: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          padding: 17mm !important;
        }

        .printops-order-print-preview [data-order-paper="true"]:not([data-style="market"]) {
          border-top: 0 !important;
        }

        .printops-order-print-preview [data-order-paper="true"][data-document="order"][data-style="market"] {
          border-top: 0.55em solid var(--order-accent-2) !important;
        }
      }
    </style>
  </head>
  <body>
    <main class="printops-order-print-preview">${pagesMarkup}</main>
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

async function createTemplatePdfBlob(templateRecord: TemplateRecord, previewRoot?: ParentNode | null) {
  const sourceNode = getTemplatePreviewNode(previewRoot ?? document);

  if (!sourceNode) {
    return null;
  }

  const { default: html2pdf } = await import("html2pdf.js");
  const exportHost = document.createElement("div");
  const clonedPaper = sourceNode.cloneNode(true) as HTMLElement;

  applyTemplateExportTokens(exportHost);
  positionPdfExportHost(exportHost);
  exportHost.style.height = `${A4_EXPORT_HEIGHT_PX}px`;
  exportHost.style.overflow = "hidden";

  applyTemplateExportTokens(clonedPaper);
  applyA4ExportPaperStyles(clonedPaper, sourceNode);

  exportHost.appendChild(clonedPaper);
  document.body.appendChild(exportHost);

  try {
    await waitForPdfExportLayout();
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
          scrollX: 0,
          scrollY: 0,
          useCORS: true,
          width: A4_EXPORT_WIDTH_PX,
          windowHeight: A4_EXPORT_HEIGHT_PX,
          windowWidth: A4_EXPORT_WIDTH_PX,
          x: 0,
          y: 0,
        },
        jsPDF: {
          format: "a4",
          orientation: "portrait",
          unit: "mm",
        },
      })
      .from(exportHost)
      .outputPdf("blob")) as Blob;
  } finally {
    exportHost.remove();
  }
}

function openTemplatePrintWindow(templateRecord: TemplateRecord, previewRoot?: ParentNode | null) {
  const previewNode = getTemplatePreviewNode(previewRoot ?? document);
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
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        border-radius: 0 !important;
        box-shadow: none;
        margin: 0;
        padding: 64px !important;
      }

      .printops-print-preview [class*="templatePaper"]:not([data-style="market"]) {
        border-top: 0 !important;
      }

      .printops-print-preview [class*="templatePaper"][data-document="order"][data-style="market"] {
        border-top: 0.55em solid var(--order-accent-2) !important;
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
          border-left: 0 !important;
          border-right: 0 !important;
          border-bottom: 0 !important;
          border-radius: 0 !important;
          box-shadow: none;
          padding: 17mm !important;
        }

        .printops-print-preview [class*="templatePaper"]:not([data-style="market"]) {
          border-top: 0 !important;
        }

        .printops-print-preview [class*="templatePaper"][data-document="order"][data-style="market"] {
          border-top: 0.55em solid var(--order-accent-2) !important;
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
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);
  const previewStageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!templateRecord) {
      setIsPreparingPdf(false);
    }
  }, [templateRecord]);

  if (!templateRecord) {
    return null;
  }

  const activeTemplate = templateRecord;
  const isBuiltIn = activeTemplate.source === "Built-in";
  const localizedTemplate = getLocalizedTemplateRecord(activeTemplate, messages);

  async function handleDownloadPdf() {
    setIsPreparingPdf(true);

    try {
      const pdfBlob = await createTemplatePdfBlob(activeTemplate, previewStageRef.current);

      if (pdfBlob) {
        downloadPdfBlob(pdfBlob, getTemplateFileName(activeTemplate));
      }
    } finally {
      setIsPreparingPdf(false);
    }
  }

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
                {activeTemplate.isDefault ? <strong className={styles.defaultBadge}>{messages.templates.default}</strong> : null}
                <button className={styles.secondaryButton} type="button" disabled={isPreparingPdf} aria-busy={isPreparingPdf} onClick={handleDownloadPdf}>
                  <Download size={17} aria-hidden />
                  {messages.templates.downloadPdf}
                </button>
                <button className={styles.secondaryButton} type="button" onClick={() => openTemplatePrintWindow(activeTemplate, previewStageRef.current)}>
                  <Printer size={17} aria-hidden />
                  {messages.templates.printPreview}
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => {
                    onEditTemplate(activeTemplate);
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

            <div ref={previewStageRef} className={styles.previewModalStage} data-template-print-preview="true">
              <TemplatePaperPreview
                accentColor={templateRecord.accentColor}
                addressFormat={templateRecord.addressFormat}
                brandName={templateRecord.brandName}
                dateFormat={templateRecord.dateFormat}
                defaultLanguage={templateRecord.defaultLanguage}
                density={templateRecord.density}
                documentTitleFont={templateRecord.documentTitleFont}
                documentTitleFontSize={templateRecord.documentTitleFontSize}
                bodyFont={templateRecord.bodyFont}
                bodyFontSize={templateRecord.bodyFontSize}
                documentType={templateRecord.documentType}
                contactPromptText={templateRecord.contactPromptText}
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
                showItemsTotal={templateRecord.showItemsTotal ?? templateRecord.showTotals}
                showShippingTotal={templateRecord.showShippingTotal ?? templateRecord.showTotals}
                showTaxTotal={templateRecord.showTaxTotal ?? templateRecord.showTotals}
                showGrandTotal={templateRecord.showGrandTotal ?? templateRecord.showTotals}
                customAccentColor={templateRecord.customAccentColor}
                socialLinks={templateRecord.socialLinks}
                socialProfiles={templateRecord.socialProfiles}
                thankYouFontSize={templateRecord.thankYouFontSize}
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
  templateStoreStatus,
}: {
  draft: TemplateDraft;
  messages: PrintOpsMessages;
  mode: TemplateEditorMode;
  onDraftChange: (patch: Partial<TemplateDraft>) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<void>;
  open: boolean;
  printLanguageOptions: { label: string; value: string }[];
  siteLocale: SiteLocale;
  storeProfile: PrintOpsStoreProfileSummary | null;
  storeProfileStatus: StoreProfileStatus;
  templateStoreStatus: TemplateStoreStatus;
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
  const isSavingTemplate = templateStoreStatus.status === "saving";
  const saveBarCopy =
    templateStoreStatus.status === "saving"
      ? "Saving template..."
      : templateStoreStatus.status === "error" || templateStoreStatus.status === "skipped"
        ? (templateStoreStatus.error ?? "Template database is not available.")
        : editorCopy.unsavedChanges;
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
    { label: editorCopy.accentForest, value: "forest" },
    { label: editorCopy.accentCharcoal, value: "charcoal" },
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
  const draftBlueprintKey = resolveTemplateBlueprintKey({
    id: draft.id,
    layoutPreset: draft.layoutPreset,
    visualStyle: draft.visualStyle,
  });
  const isBigBrandDraft = draftBlueprintKey === "invoice_big_brand";
  const supportsLogoTextColor = draftBlueprintKey === "invoice_big_brand" || draftBlueprintKey === "invoice_minimal";
  const draftAccentHexColor = getOrderTemplateAccentHex(draft.accentColor, draft.customAccentColor);
  const draftLogoHexColor = getOrderTemplateLogoTextColor(draft.accentColor, draft.customAccentColor);
  const draftLogoColorTextValue = draft.accentColor === "custom" ? draft.customAccentColor : draftLogoHexColor;
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
              {supportsLogoTextColor && draft.logoSource === "generated-svg" ? (
                <label className={styles.fieldGroup}>
                  <span>{editorCopy.logoColor}</span>
                  <span className={styles.colorInputRow}>
                    <input
                      aria-label={editorCopy.logoColor}
                      className={styles.colorInput}
                      type="color"
                      value={draftLogoHexColor}
                      onChange={(event) => onDraftChange({ accentColor: "custom", customAccentColor: event.target.value })}
                    />
                    <input
                      className={styles.textInput}
                      placeholder="#087A46"
                      value={draftLogoColorTextValue}
                      onChange={(event) => onDraftChange({ accentColor: "custom", customAccentColor: event.target.value })}
                    />
                  </span>
                </label>
              ) : null}
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

            <span className={styles.settingsGroupTitle}>{editorCopy.typography}</span>
            <div className={styles.formTwoColumns}>
              <SelectField
                label={editorCopy.documentTitleFont}
                options={localizedLogoFontOptions}
                value={draft.documentTitleFont}
                onValueChange={(value) => onDraftChange({ documentTitleFont: value as OrderTemplateLogoFont })}
              />
              <label className={styles.fieldGroup}>
                <span>{editorCopy.documentTitleSize}</span>
                <input
                  className={styles.textInput}
                  min={18}
                  max={72}
                  type="number"
                  value={draft.documentTitleFontSize}
                  onChange={(event) => onDraftChange({ documentTitleFontSize: Number(event.target.value) })}
                />
              </label>
              <SelectField
                label={editorCopy.bodyTextTypography}
                options={localizedLogoFontOptions}
                value={draft.bodyFont}
                onValueChange={(value) => onDraftChange({ bodyFont: value as OrderTemplateLogoFont })}
              />
              <label className={styles.fieldGroup}>
                <span>{editorCopy.bodyTextSize}</span>
                <input
                  className={styles.textInput}
                  min={10}
                  max={18}
                  type="number"
                  value={draft.bodyFontSize}
                  onChange={(event) => onDraftChange({ bodyFontSize: Number(event.target.value) })}
                />
              </label>
              <label className={styles.fieldGroup}>
                <span>{editorCopy.thankYouTextSize}</span>
                <input
                  className={styles.textInput}
                  min={14}
                  max={40}
                  type="number"
                  value={draft.thankYouFontSize}
                  onChange={(event) => onDraftChange({ thankYouFontSize: Number(event.target.value) })}
                />
              </label>
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
            <div className={isBigBrandDraft ? styles.formOneColumn : styles.formTwoColumns}>
              {isBigBrandDraft ? null : (
                <>
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
                        aria-label={editorCopy.customAccentHex}
                        className={styles.colorInput}
                        disabled={draft.accentColor !== "custom"}
                        type="color"
                        value={draftAccentHexColor}
                        onChange={(event) => onDraftChange({ customAccentColor: event.target.value })}
                      />
                      <input
                        className={styles.textInput}
                        disabled={draft.accentColor !== "custom"}
                        value={draft.customAccentColor}
                        onChange={(event) => onDraftChange({ customAccentColor: event.target.value })}
                      />
                    </span>
                  </label>
                </>
              )}
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
                options={getTemplateAddressFormatOptions(siteLocale)}
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
            <span>{editorCopy.contactPromptText}</span>
            <input
              className={styles.textInput}
              value={draft.contactPromptText}
              onChange={(event) => onDraftChange({ contactPromptText: event.target.value })}
            />
          </label>

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
              <span className={templateStoreStatus.status === "error" || templateStoreStatus.status === "skipped" ? styles.editorSaveError : undefined}>
                <AlertTriangle size={16} aria-hidden />
                {saveBarCopy}
              </span>
              <div>
                <Drawer.Close className={styles.editorGhostButton}>{editorCopy.discard}</Drawer.Close>
                <button className={styles.editorSaveButton} type="button" disabled={!canSave || isSavingTemplate} onClick={onSave}>
                  {isSavingTemplate ? "Saving" : editorCopy.save}
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
                  <button className={styles.primaryButton} type="button" disabled={!canSave || isSavingTemplate} onClick={onSave}>
                    <LayoutTemplate size={17} aria-hidden />
                    {isSavingTemplate ? "Saving" : mode === "duplicate" ? editorCopy.addToMyTemplates : editorCopy.saveTemplate}
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
                    documentTitleFont={draft.documentTitleFont}
                    documentTitleFontSize={draft.documentTitleFontSize}
                    bodyFont={draft.bodyFont}
                    bodyFontSize={draft.bodyFontSize}
                    documentType={draft.documentType}
                    contactPromptText={draft.contactPromptText}
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
                    showItemsTotal={draft.showItemsTotal}
                    showShippingTotal={draft.showShippingTotal}
                    showTaxTotal={draft.showTaxTotal}
                    showGrandTotal={draft.showGrandTotal}
                    customAccentColor={draft.customAccentColor}
                    socialLinks={draft.socialLinks}
                    socialProfiles={draft.socialProfiles}
                    thankYouFontSize={draft.thankYouFontSize}
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
  documentTitleFont = defaultTemplateBrandSettings.documentTitleFont,
  documentTitleFontSize = defaultTemplateBrandSettings.documentTitleFontSize,
  documentType,
  bodyFont = defaultTemplateBrandSettings.bodyFont,
  bodyFontSize = defaultTemplateBrandSettings.bodyFontSize,
  contactPromptText = defaultTemplateBrandSettings.contactPromptText,
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
  showOrderBarcode = false,
  showPaymentMethod = true,
  showProductImages = true,
  showShipTo = true,
  showShippingMethod = true,
  showSocialFooter = true,
  showSku = true,
  showStoreName = true,
  showThankYou = true,
  showTotals = true,
  showItemsTotal = true,
  showShippingTotal = true,
  showTaxTotal = true,
  showGrandTotal = true,
  customAccentColor = defaultTemplateBrandSettings.customAccentColor,
  socialLinks = defaultTemplateBrandSettings.socialLinks,
  socialProfiles,
  thankYouFontSize = defaultTemplateBrandSettings.thankYouFontSize,
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
  documentTitleFont?: OrderTemplateLogoFont;
  documentTitleFontSize?: number;
  documentType: string;
  bodyFont?: OrderTemplateLogoFont;
  bodyFontSize?: number;
  contactPromptText?: string;
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
  showItemsTotal?: boolean;
  showShippingTotal?: boolean;
  showTaxTotal?: boolean;
  showGrandTotal?: boolean;
  customAccentColor?: string;
  socialLinks?: string;
  socialProfiles?: TemplateSocialProfiles;
  thankYouFontSize?: number;
  thankYouText?: string;
  variant?: "card" | "detail" | "editor";
  visualStyle?: OrderTemplateVisualStyle;
}) {
  const isThermal = layoutPreset === "Thermal" || paperSize === "80mm";
  const isInvoice = documentType === "Invoice";
  const isTableFirst = layoutPreset === "Table-first";
  const displayBrandName = brandName.trim() || defaultTemplateBrandSettings.brandName;
  const sample = (key: keyof typeof fixedTemplateSampleText) => resolveTemplateSampleText(key, defaultLanguage);
  const previewLabel = (key: string) => resolveTemplateLabel(key, defaultLanguage, labelOverrides);
  const previewDate = formatTemplateDateFromValue("2026-05-25T00:00:00.000Z", dateFormat, defaultLanguage);

  if (isThermal) {
    return (
      <span className={styles.templatePaper} data-layout={layoutPreset} data-size={paperSize} data-variant={variant} dir={getLocaleDirection(defaultLanguage)} lang={defaultLanguage}>
        <span className={styles.thermalBrand}>{displayBrandName.toUpperCase()}</span>
        <span className={styles.thermalTitle}>{sample("pickupReceipt")}</span>
        <span className={styles.thermalDivider} />
        <span className={styles.thermalLine}>
          <span>{sample("order")}</span>
          <strong>#1005</strong>
        </span>
        <span className={styles.thermalLine}>
          <span>{sample("customer")}</span>
          <strong>Avery Wu</strong>
        </span>
        <span className={styles.thermalDivider} />
        <span className={styles.thermalItem}>
          <strong>{sample("pickupBouquet")}</strong>
          <span>1 x $42.90</span>
        </span>
        <span className={styles.thermalTotal}>
          <span>{previewLabel("template.total")}</span>
          <strong>$42.90</strong>
        </span>
        <span className={styles.thermalFooter}>{sample("paidReadyForPickup")}</span>
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
        documentTitleFont={documentTitleFont}
        documentTitleFontSize={documentTitleFontSize}
        bodyFont={bodyFont}
        bodyFontSize={bodyFontSize}
        contactPromptText={contactPromptText}
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
        showItemsTotal={showItemsTotal}
        showShippingTotal={showShippingTotal}
        showTaxTotal={showTaxTotal}
        showGrandTotal={showGrandTotal}
        customAccentColor={customAccentColor}
        socialLinks={socialLinks}
        socialProfiles={socialProfiles}
        thankYouFontSize={thankYouFontSize}
        thankYouText={thankYouText}
        variant={variant}
        visualStyle={visualStyle ?? (layoutPreset === "Compact" ? "market" : "atelier")}
      />
    );
  }

  if (isTableFirst) {
    return (
      <span className={styles.templatePaper} data-layout={layoutPreset} data-size={paperSize} data-variant={variant} dir={getLocaleDirection(defaultLanguage)} lang={defaultLanguage}>
        <span className={styles.paperTitleBar}>
          <strong>{documentType}</strong>
          <small>{sample("batch")} #240526</small>
        </span>
        <span className={styles.paperDenseStats}>
          <span>
            <small>{sample("orders")}</small>
            <strong>3</strong>
          </span>
          <span>
            <small>{previewLabel("template.items")}</small>
            <strong>12</strong>
          </span>
          <span>
            <small>{sample("missing")}</small>
            <strong>1</strong>
          </span>
        </span>
        <span className={styles.paperPickTable}>
          <span>
            <strong>{previewLabel("template.sku")}</strong>
            <strong>{sample("item")}</strong>
            <strong>{previewLabel("template.qty")}</strong>
          </span>
          <span>
            <small>HD-240</small>
            <small>{sample("customHoodie")}</small>
            <strong>2</strong>
          </span>
          <span>
            <small>BOX-12</small>
            <small>{sample("giftBox")}</small>
            <strong>1</strong>
          </span>
          <span>
            <small>KIT-04</small>
            <small>{sample("eventKit")}</small>
            <strong>4</strong>
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={styles.templatePaper} data-layout={layoutPreset} data-size={paperSize} data-variant={variant} dir={getLocaleDirection(defaultLanguage)} lang={defaultLanguage}>
      <span className={styles.paperHeaderLine}>
        <span className={styles.paperBrandBlock}>
          <span className={styles.paperLogoMark}>ZI</span>
          <span>
            <strong>{displayBrandName}</strong>
            <small>{printOpsSystemSiteUrl}</small>
          </span>
        </span>
        <span className={styles.paperDocBlock}>
          <strong>{documentType}</strong>
          <small>{previewLabel("template.invoice_no")} #1004</small>
          <small>{previewDate}</small>
        </span>
      </span>

      <span className={styles.paperAddressGrid}>
        <span>
          <small>{previewLabel("template.ship_to")}</small>
          <strong>Chris Young</strong>
          <span>812 Market Street</span>
          <span>San Francisco, CA</span>
        </span>
        <span>
          <small>{sample("from")}</small>
          <strong>{displayBrandName}</strong>
          <span>zider.ink</span>
          <span>Workspace</span>
        </span>
      </span>

      <span className={styles.paperOrderStrip}>
        <span>
          <small>{sample("status")}</small>
          <strong>{resolveOrderPaymentStatusLabel("Paid", defaultLanguage)}</strong>
        </span>
        <span>
          <small>{sample("fulfillment")}</small>
          <strong>{resolveOrderFulfillmentStatusLabel("Partial", defaultLanguage)}</strong>
        </span>
        <span>
          <small>{previewLabel("template.items")}</small>
          <strong>4</strong>
        </span>
      </span>

      <span className={styles.paperItemsTable}>
        <span className={styles.paperItemsHead}>
          <strong>{sample("item")}</strong>
          <strong>{previewLabel("template.sku")}</strong>
          <strong>{previewLabel("template.qty")}</strong>
        </span>
        <span className={styles.paperItemRow}>
          <span className={styles.paperItemThumb} />
          <span>
            <strong>{sample("eventKit")}</strong>
            <small>{sample("sageMediumBundle")}</small>
          </span>
          <small>KIT-04</small>
          <strong>4</strong>
        </span>
        <span className={styles.paperItemRow}>
          <span className={styles.paperItemThumb} />
          <span>
            <strong>{sample("giftCardInsert")}</strong>
            <small>{sample("customMessageIncluded")}</small>
          </span>
          <small>INS-20</small>
          <strong>1</strong>
        </span>
      </span>

      <span className={styles.paperNoteBlock}>
        <small>{sample("buyerNote")}</small>
        <span>{sample("buyerNoteMessage")}</span>
      </span>
      <span className={styles.paperFooterLine}>{sample("footerPolicy")}</span>
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

function getOrderTemplateAccentHex(accentColor: OrderTemplateAccent, customAccentColor = defaultTemplateBrandSettings.customAccentColor) {
  if (accentColor === "custom") {
    return isValidHexColor(customAccentColor) ? customAccentColor : defaultTemplateBrandSettings.customAccentColor;
  }

  const accentStyle = getOrderTemplateAccentStyle(accentColor, customAccentColor) as Record<string, string>;
  return accentStyle["--order-accent"] ?? defaultTemplateBrandSettings.customAccentColor;
}

function getOrderTemplateLogoTextColor(accentColor: OrderTemplateAccent, customAccentColor = defaultTemplateBrandSettings.customAccentColor) {
  const customLogoColor = customAccentColor.trim();
  if (isValidHexColor(customLogoColor)) {
    return customLogoColor;
  }

  return getOrderTemplateAccentHex(accentColor, customAccentColor);
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
  const phone = "180000000";

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
  const customerContact = order?.email ?? getString(customerRecord?.email) ?? getString(customerRecord?.phone) ?? "180000000";
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
  const lineItems = getOrderPrintLineItems(order, options.locale);
  const totals = getOrderPrintTotals(rawOrder, order?.total);
  const fallbackDeliveryMethod = order?.fulfillment ? resolveOrderFulfillmentStatusLabel(order.fulfillment, options.locale) : resolveTemplateSampleText("deliveryMethod", options.locale);
  const fallbackPaymentMethod = order?.payment ? resolveOrderPaymentStatusLabel(order.payment, options.locale) : resolveTemplateSampleText("giftCard", options.locale);

  return {
    billAddressLines,
    customFields: rawOrder ? collectWixOrderCustomFields(rawOrder, options.locale) : order?.customFields ?? [],
    date: formatTemplateDateFromValue(rawOrder?.createdAt ?? rawOrder?.updatedAt ?? null, options.dateFormat, options.locale),
    deliveryMethod: rawOrder?.deliveryMethod ?? fallbackDeliveryMethod,
    lineItems,
    note: rawOrder?.note?.trim() ?? "",
    number: order?.number ?? formatOrderNumber(rawOrder?.orderNumber ?? rawOrder?.sourceOrderId ?? "#10059"),
    paymentMethod: rawOrder?.paymentMethod ?? fallbackPaymentMethod,
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

function getOrderPrintLineItems(order: Order | null | undefined, locale: PrintLocale): OrderPrintLineItem[] {
  const rawOrder = order?.rawOrder;
  const currency = rawOrder?.currency ?? null;
  const lineItems =
    rawOrder?.lineItems
      .map((lineItem, index) => {
        const title = lineItem.title ?? order?.items ?? `${resolveTemplateSampleText("lineItem", locale)} ${index + 1}`;
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
      title: order?.items ?? resolveTemplateSampleText("sampleProduct", locale),
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
  const iconProps = {
    className: styles.orderSocialIcon,
    "data-platform": platform,
    "aria-hidden": true,
    focusable: "false",
    viewBox: "0 0 24 24",
  } as const;

  switch (platform) {
    case "instagram":
      return (
        <svg
          {...iconProps}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <rect height="18" rx="5" width="18" x="3" y="3" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" fill="currentColor" r="1.25" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...iconProps} fill="currentColor">
          <path d="M14 8.2h2.4V4.4c-.4-.1-1.8-.2-3.4-.2-3.3 0-5.5 2-5.5 5.7v3.2H4v4.3h3.5V24h4.4v-6.6h3.6l.6-4.3h-4.2V10.3c0-1.2.3-2.1 2.1-2.1Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1">
          <path d="M4 4l16 16" />
          <path d="M20 4 4 20" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <path d="M14 4v10.2a4.3 4.3 0 1 1-3.2-4.1" />
          <path d="M14 4c.8 2.8 2.7 4.5 5 4.8" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...iconProps} fill="currentColor">
          <path d="M21.5 7.1a3 3 0 0 0-2.1-2.1C17.6 4.5 12 4.5 12 4.5s-5.6 0-7.4.5a3 3 0 0 0-2.1 2.1A31.2 31.2 0 0 0 2 12a31.2 31.2 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.1c1.8.5 7.4.5 7.4.5s5.6 0 7.4-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 22 12a31.2 31.2 0 0 0-.5-4.9ZM10 15.3V8.7l5.6 3.3Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...iconProps} fill="currentColor">
          <path d="M5.3 8.4H2.1V22h3.2ZM3.7 2A1.85 1.85 0 1 0 3.7 5.7 1.85 1.85 0 0 0 3.7 2ZM22 14.4c0-4.1-2.2-6-5.1-6a4.4 4.4 0 0 0-4 2.2h-.1V8.4H9.7V22H13v-6.7c0-1.8.3-3.5 2.5-3.5s2.2 2 2.2 3.6V22H22Z" />
        </svg>
      );
    case "pinterest":
      return (
        <svg {...iconProps} fill="currentColor">
          <path d="M12.2 2C6.6 2 3.7 5.7 3.7 9.7c0 1.9 1.1 4.2 2.8 4.9.3.1.5 0 .6-.3l.3-1.2c.1-.4.1-.5-.2-.8a4.1 4.1 0 0 1-.9-2.5c0-3 2.3-5.9 6.1-5.9 3.3 0 5.6 2.3 5.6 5.5 0 3.6-1.8 6.1-4.2 6.1-1.3 0-2.3-1.1-2-2.4.4-1.6 1.1-3.3 1.1-4.4 0-1-.5-1.9-1.7-1.9-1.3 0-2.4 1.4-2.4 3.2 0 1.2.4 2 .4 2l-1.6 6.8c-.3 1.4-.2 3.3 0 4.6h.1c.7-1.1 1.5-2.8 1.8-4.1l.8-3.1a3.8 3.8 0 0 0 3.2 1.6c4.2 0 7.2-3.9 7.2-8.7C20.7 5.1 17.4 2 12.2 2Z" />
        </svg>
      );
    case "threads":
      return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <path d="M17.6 10.3c-.4-3.1-2.2-5.2-5.5-5.2-4.1 0-6.4 3-6.4 6.9s2.4 7 6.6 7c3.1 0 5.4-1.6 5.9-4.1.5-2.4-1.5-4.1-4.3-4.3-2.2-.1-3.7.9-3.7 2.4 0 1.4 1.1 2.3 2.6 2.3 1.9 0 3.2-1.2 3.2-3.3" />
        </svg>
      );
    case "snapchat":
      return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <path d="M7.1 18.4c2-.3 2.7-1.2 3.2-2.1" />
          <path d="M16.9 18.4c-2-.3-2.7-1.2-3.2-2.1" />
          <path d="M8 12.2c-1.1.3-1.8.1-2.2-.4" />
          <path d="M16 12.2c1.1.3 1.8.1 2.2-.4" />
          <path d="M12 3.7c-3 0-4.3 2.2-4.3 5.1v3.6c0 1.8-1 3.2-2.8 3.9 1.3.7 2.6.9 4 .8.7 1 1.8 1.6 3.1 1.6s2.4-.6 3.1-1.6c1.4.1 2.7-.1 4-.8-1.8-.7-2.8-2.1-2.8-3.9V8.8c0-2.9-1.3-5.1-4.3-5.1Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <path d="M4.5 19.6 5.7 16A7.8 7.8 0 1 1 8 18.3Z" />
          <path d="M9.2 8.5c.3 2.6 2 4.9 4.6 6.1l1.5-1.3 2 1" />
        </svg>
      );
    case "line":
      return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2">
          <path d="M4 11.6c0-4.2 3.6-7.2 8-7.2s8 3 8 7.2-3.6 7.2-8 7.2h-.7L7.6 21v-3.1A7.1 7.1 0 0 1 4 11.6Z" />
          <path d="M8.2 9.2v4.6h2.2" />
          <path d="M12 9.2v4.6" />
          <path d="M14 13.8V9.2l2.2 4.6V9.2" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <path d="M21 4 3 11.2l6.9 2.1L12 20l3.3-5.1 4.7 3.5Z" />
          <path d="m9.9 13.3 5.3-4.2" />
        </svg>
      );
    case "messenger":
      return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <path d="M4 11.6A7.8 7.8 0 1 1 8.6 19L4 20.7Z" />
          <path d="m8.5 13 2.4-2.5 2.4 2.4 2.7-2.8" />
        </svg>
      );
    case "discord":
      return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <path d="M7.2 18.2c-1.2-.4-2.2-.9-3.2-1.6.5-4.1 1.6-7.1 3.4-9.7 1.1-.5 2.1-.8 3.1-.9l.5 1.1a12.5 12.5 0 0 1 2 0l.5-1.1c1 .1 2 .4 3.1.9 1.8 2.6 2.9 5.6 3.4 9.7-1 .7-2 1.2-3.2 1.6l-1.1-1.6a11.5 11.5 0 0 1-7 0Z" />
          <path d="M9.2 12.2h.1" />
          <path d="M14.7 12.2h.1" />
        </svg>
      );
    case "website":
    default:
      return (
        <svg
          {...iconProps}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M10.5 13.5l3-3" />
          <path d="M8.7 15.3l-1.1 1.1a3.6 3.6 0 0 1-5.1-5.1l2.1-2.1a3.6 3.6 0 0 1 5.1 0" />
          <path d="M15.3 8.7l1.1-1.1a3.6 3.6 0 0 1 5.1 5.1l-2.1 2.1a3.6 3.6 0 0 1-5.1 0" />
        </svg>
      );
  }
}

const templateFontFamilyByType: Record<OrderTemplateLogoFont, string> = {
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  sans: "Inter, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
};

function getTemplateFontFamily(font: OrderTemplateLogoFont | undefined) {
  return templateFontFamilyByType[font ?? "sans"];
}

function getOrderTemplateTypographyStyle({
  bodyFont,
  bodyFontSize,
  documentTitleFont,
  documentTitleFontSize,
  thankYouFontSize,
}: {
  bodyFont: OrderTemplateLogoFont;
  bodyFontSize: number;
  documentTitleFont: OrderTemplateLogoFont;
  documentTitleFontSize: number;
  thankYouFontSize: number;
}) {
  return {
    "--order-body-font": getTemplateFontFamily(bodyFont),
    "--order-body-size": `${clampTemplateNumber(bodyFontSize, 10, 18, defaultTemplateBrandSettings.bodyFontSize)}px`,
    "--order-document-title-font": getTemplateFontFamily(documentTitleFont),
    "--order-document-title-size": `${clampTemplateNumber(documentTitleFontSize, 18, 72, defaultTemplateBrandSettings.documentTitleFontSize)}px`,
    "--order-thank-you-size": `${clampTemplateNumber(thankYouFontSize, 14, 40, defaultTemplateBrandSettings.thankYouFontSize)}px`,
  } as CSSProperties;
}

function createBarcodeBars(value: string) {
  const normalizedValue = value.replace(/\s+/g, "").toUpperCase() || "0";
  const modules: boolean[] = [true, false, true, true, false, true, false];
  let checksum = 0;

  normalizedValue.split("").forEach((character, index) => {
    const code = character.charCodeAt(0);
    checksum = (checksum + code * (index + 1)) % 251;

    for (let bit = 0; bit < 9; bit += 1) {
      const mixed = (code * 31 + index * 17 + bit * 13 + checksum) % 257;
      modules.push(((mixed >> (bit % 8)) & 1) === 1);
      if (bit % 4 === 3) {
        modules.push(false);
      }
    }
  });

  for (let bit = 0; bit < 12; bit += 1) {
    modules.push(((checksum * 19 + bit * 23) % 11) > 4);
  }

  while (modules.length < 96) {
    const currentLength = modules.length;
    for (let index = 0; index < currentLength && modules.length < 112; index += 1) {
      modules.push(index % 7 === 0 ? false : !modules[index]);
    }
  }

  modules.push(false, true, false, true, true, false, true);

  const moduleWidth = 160 / modules.length;
  const bars: Array<{ x: number; width: number }> = [];
  let runStart: number | null = null;

  modules.forEach((active, index) => {
    if (active && runStart === null) {
      runStart = index;
    }

    if ((!active || index === modules.length - 1) && runStart !== null) {
      const runEnd = active && index === modules.length - 1 ? index + 1 : index;
      bars.push({
        width: Math.max(0.65, Number(((runEnd - runStart) * moduleWidth).toFixed(2))),
        x: Number((runStart * moduleWidth).toFixed(2)),
      });
      runStart = null;
    }
  });

  return bars;
}

function BarcodeGraphic({ className, value }: { className: string; value: string }) {
  const bars = createBarcodeBars(value);

  return (
    <svg className={className} viewBox="0 0 160 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {bars.map((bar, index) => (
        <rect key={`${bar.x}-${bar.width}-${index}`} x={bar.x} y="0" width={bar.width} height="32" fill="currentColor" />
      ))}
    </svg>
  );
}

function BrandLogoAsset({
  brandName,
  color,
  font,
  fontSize,
  logoImageUrl,
  logoSource,
  wordmark,
}: {
  brandName: string;
  color?: string;
  font?: OrderTemplateLogoFont;
  fontSize?: number;
  logoImageUrl: string;
  logoSource: OrderTemplateLogoSource;
  wordmark: string;
}) {
  const displayBrandName = brandName.trim() || defaultTemplateBrandSettings.brandName;
  const displayWordmark = wordmark.trim() || defaultTemplateBrandSettings.logoText;
  const uploadedLogo = logoImageUrl.trim();
  const logoFontFamily = getTemplateFontFamily(font);
  const logoFontSize = Math.min(Math.max(fontSize ?? defaultTemplateBrandSettings.logoFontSize, 28), 96);
  const logoTextColor = color && isValidHexColor(color) ? color : undefined;

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
        ...(logoTextColor ? { color: logoTextColor } : {}),
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
  documentTitleFont,
  documentTitleFontSize,
  bodyFont,
  bodyFontSize,
  contactPromptText,
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
  showItemsTotal,
  showShippingTotal,
  showTaxTotal,
  showGrandTotal,
  customAccentColor,
  socialLinks,
  socialProfiles,
  thankYouFontSize,
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
  documentTitleFont: OrderTemplateLogoFont;
  documentTitleFontSize: number;
  bodyFont: OrderTemplateLogoFont;
  bodyFontSize: number;
  contactPromptText: string;
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
  showItemsTotal: boolean;
  showShippingTotal: boolean;
  showTaxTotal: boolean;
  showGrandTotal: boolean;
  customAccentColor: string;
  socialLinks: string;
  socialProfiles?: TemplateSocialProfiles;
  thankYouFontSize: number;
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
    .filter((item): item is { label: string; platform: SocialPlatform; url: string } => Boolean(item));
  const rawLogo = logoText.trim();
  const displayWordmark = rawLogo || printOpsSystemBrandName;
  const displayBrandName = brandName.trim() || defaultTemplateBrandSettings.brandName;
  const displayFooterWebsite = footerWebsite.trim();
  const displayFooterContact = footerContact.trim();
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
  const displayContactPrompt = resolveDefaultTemplateText(contactPromptText, defaultTemplateBrandSettings.contactPromptText, labels.questions);
  const displayThankYou = resolveDefaultTemplateText(thankYouText, defaultTemplateBrandSettings.thankYouText, resolveLocalizedText(fixedTemplateThankYouText, defaultLanguage));
  const logoTextColor = getOrderTemplateLogoTextColor(accentColor, customAccentColor);

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
    style: {
      ...getOrderTemplateAccentStyle(accentColor, customAccentColor),
      "--order-logo-color": logoTextColor,
      ...getOrderTemplateTypographyStyle({
        bodyFont,
        bodyFontSize,
        documentTitleFont,
        documentTitleFontSize,
        thankYouFontSize,
      }),
    } as CSSProperties,
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
      <span className={styles.orderSkuBarcodeBlock}>
        <small>{labels.sku}</small>
        {printOpsBarcodeFeatureEnabled ? <BarcodeGraphic className={styles.orderSkuBarcodeGraphic} value={lineItem.sku} /> : null}
        <em>{lineItem.sku}</em>
      </span>
    ) : null;
  const renderOptionsLine = (lineItem: OrderPrintLineItem) => (showItemOptions && lineItem.optionsText ? <small>{lineItem.optionsText}</small> : null);
  const orderBarcodeValue = printOpsBarcodeFeatureEnabled
    ? (orderDetails.lineItems.find((lineItem) => lineItem.barcode)?.barcode ?? orderDetails.number)
    : "";
  const orderBarcode = printOpsBarcodeFeatureEnabled && showOrderBarcode ? (
    <span className={styles.orderBarcodeBlock}>
      <small>{labels.orderBarcode}</small>
      <BarcodeGraphic className={styles.orderBarcodeGraphic} value={orderBarcodeValue} />
      <em>{orderBarcodeValue}</em>
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
  const totalRows = showTotals
    ? [
        showItemsTotal ? { key: "items", label: labels.items, value: orderDetails.totals.items, emphasis: false } : null,
        showShippingTotal ? { key: "shipping", label: labels.shipping, value: orderDetails.totals.shipping, emphasis: false } : null,
        showTaxTotal ? { key: "tax", label: labels.tax, value: orderDetails.totals.tax, emphasis: false } : null,
        showGrandTotal ? { key: "total", label: labels.total, value: orderDetails.totals.total, emphasis: true } : null,
      ].filter((row): row is { key: string; label: string; value: string; emphasis: boolean } => Boolean(row))
    : [];
  const hasTotals = totalRows.length > 0;
  const socialFooter = hasContactFooter || hasSocialFooter ? (
    <span className={styles.orderSocialFooter}>
      {hasContactFooter ? (
        <span>
          <strong dir="auto">{displayFooterWebsite}</strong>
          <small dir="auto">{displayFooterContact}</small>
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
          <strong dir="auto">{displayFooterWebsite}</strong>
          <small dir="auto">{displayFooterContact}</small>
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
  const hasFooterContent = showThankYou || hasContactFooter || hasSocialFooter;

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
            ) : (
              <span aria-hidden="true" className={styles.orderHeroMeta} data-placeholder="true" />
            )}
            {showLogoText ? (
              <span className={styles.orderHeroLogoSlot}>
                <BrandLogoAsset
                  brandName={displayBrandName}
                  color={logoTextColor}
                  font={logoFont}
                  fontSize={logoFontSize}
                  logoImageUrl={logoImageUrl}
                  logoSource={logoSource}
                  wordmark={displayWordmark}
                />
              </span>
            ) : (
              <span aria-hidden="true" className={styles.orderHeroLogoSlot} data-placeholder="true" />
            )}
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

        {hasOrderDetails || hasTotals ? (
          <span className={styles.orderHeroSummary} data-columns={hasOrderDetails && hasTotals ? "two" : "one"}>
            {orderNotesBlock}
            {hasTotals ? (
              <span className={styles.orderHeroTotals}>
                {totalRows.map((row) => (
                  <span data-emphasis={row.emphasis ? "true" : undefined} key={row.key}>
                    <small>{row.label}</small>
                    <strong>{row.value}</strong>
                  </span>
                ))}
              </span>
            ) : null}
          </span>
        ) : null}

        {hasFooterContent ? <span aria-hidden="true" className={styles.orderFooterDivider} /> : null}
        {showThankYou ? (
          <span className={styles.orderHeroThanks}>
            <span>{displayContactPrompt}</span>
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
        {showLogoText || showInvoiceMeta ? (
          <span className={styles.orderClassicHeader}>
            {showInvoiceMeta ? (
              <span>
                <strong>{labels.invoiceTitle}</strong>
                {showStoreName ? <small>{displayBrandName}</small> : null}
                <small>{labels.invoiceNo} {orderDetails.number}</small>
                <small>{labels.orderDate} {displayDate}</small>
                {showPaymentMethod ? <small>{labels.payment} {orderDetails.paymentMethod}</small> : null}
                {showShippingMethod ? <small>{labels.shipping} {orderDetails.deliveryMethod}</small> : null}
                {orderBarcode}
              </span>
            ) : (
              <span aria-hidden="true" data-placeholder="true" />
            )}
            {showLogoText ? (
              <span className={styles.orderClassicLogo}>
                <BrandLogoAsset
                  brandName={displayBrandName}
                  color={logoTextColor}
                  font={logoFont}
                  fontSize={logoFontSize}
                  logoImageUrl={logoImageUrl}
                  logoSource={logoSource}
                  wordmark={displayWordmark}
                />
              </span>
            ) : (
              <span aria-hidden="true" className={styles.orderClassicLogo} data-placeholder="true" />
            )}
          </span>
        ) : null}

        {showBillTo || showShipTo ? (
          <span className={styles.orderClassicAddresses} data-columns={showBillTo && showShipTo ? "two" : "one"}>
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

        {hasOrderDetails || hasTotals ? (
          <span className={styles.orderClassicLower} data-columns={hasOrderDetails && hasTotals ? "two" : "one"}>
            {orderNotesBlock}
            {hasTotals ? (
              <span className={styles.orderClassicTotals}>
                {totalRows.map((row) => (
                  <span data-emphasis={row.emphasis ? "true" : undefined} key={row.key}>
                    <strong>{row.label}</strong>
                    <small>{row.value}</small>
                  </span>
                ))}
              </span>
            ) : null}
            </span>
        ) : null}

        {hasFooterContent ? <span aria-hidden="true" className={styles.orderFooterDivider} /> : null}
        {showThankYou ? (
          <span className={styles.orderCenteredFooter}>
            <span>{displayContactPrompt}</span>
            <strong>{displayThankYou}</strong>
          </span>
        ) : null}
        {socialFooter}
      </span>
    );
  }

  return (
    <span
      {...paperProps}
    >
      {showLogoText || showInvoiceMeta ? (
        <span className={styles.orderSlipHeader}>
          {showInvoiceMeta ? (
            <span>
              <strong>{labels.invoiceTitle}</strong>
              {showStoreName ? <small>{displayBrandName}</small> : null}
              <small>{labels.invoiceNo} {orderDetails.number}</small>
              <small>{labels.orderDate} {displayDate}</small>
              {showPaymentMethod ? <small>{labels.payment} {orderDetails.paymentMethod}</small> : null}
              {showShippingMethod ? <small>{labels.shipping} {orderDetails.deliveryMethod}</small> : null}
              <small>{labels.totalItems} {orderDetails.lineItems.reduce((total, lineItem) => total + lineItem.quantity, 0)}</small>
              {orderBarcode}
            </span>
          ) : (
            <span aria-hidden="true" data-placeholder="true" />
          )}
          {showLogoText ? (
            <span className={styles.orderClassicLogo}>
              <BrandLogoAsset
                brandName={displayBrandName}
                color={logoTextColor}
                font={logoFont}
                fontSize={logoFontSize}
                logoImageUrl={logoImageUrl}
                logoSource={logoSource}
                wordmark={displayWordmark}
              />
            </span>
          ) : (
            <span aria-hidden="true" className={styles.orderClassicLogo} data-placeholder="true" />
          )}
        </span>
      ) : null}

      {showBillTo || showShipTo ? (
        <span className={styles.orderSlipAddresses} data-columns={showBillTo && showShipTo ? "two" : "one"}>
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

      {hasFooterContent ? <span aria-hidden="true" className={styles.orderFooterDivider} /> : null}
      {showThankYou || showContactFooter ? (
        <span className={styles.orderSlipThanks}>
          {showThankYou ? (
            <>
              <strong>{displayThankYou}</strong>
              <span>{displayContactPrompt}</span>
            </>
          ) : null}
          {showContactFooter ? <span>{displayFooterContact || printOpsSystemSiteUrl}</span> : null}
        </span>
      ) : null}

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
      documentTitleFont={templateRecord.documentTitleFont}
      documentTitleFontSize={templateRecord.documentTitleFontSize}
      bodyFont={templateRecord.bodyFont}
      bodyFontSize={templateRecord.bodyFontSize}
      documentType={templateRecord.documentType}
      contactPromptText={templateRecord.contactPromptText}
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
      showItemsTotal={templateRecord.showItemsTotal ?? templateRecord.showTotals}
      showShippingTotal={templateRecord.showShippingTotal ?? templateRecord.showTotals}
      showTaxTotal={templateRecord.showTaxTotal ?? templateRecord.showTotals}
      showGrandTotal={templateRecord.showGrandTotal ?? templateRecord.showTotals}
      customAccentColor={templateRecord.customAccentColor}
      socialLinks={templateRecord.socialLinks}
      socialProfiles={templateRecord.socialProfiles}
      thankYouFontSize={templateRecord.thankYouFontSize}
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
    const paperNodes = getOrderPreviewPaperNodes(paperRef.current);

    if (!firstOrder || paperNodes.length === 0 || isExportingPdf) {
      return;
    }

    setIsExportingPdf(true);

    try {
      const fileName = getOrderBatchFileName(selectedOrders);
      const pdfBlob = await createOrderPdfBlob(paperNodes, fileName);

      downloadPdfBlob(pdfBlob, fileName);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    const paperNodes = getOrderPreviewPaperNodes(paperRef.current);

    if (!firstOrder || paperNodes.length === 0) {
      return;
    }

    openOrderPrintWindow(paperNodes, selectedOrders.length > 1 ? `${copy.title} batch - ${selectedOrders.length} orders` : `${copy.title} ${firstOrder.number}`);
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
        {selectedOrders.map((order) => (
          <OrderTemplatePrintDocument key={order.id} order={order} printLocale={printLocale} templateRecord={templateRecord} />
        ))}
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
    const paperNodes = getOrderPreviewPaperNodes(paperRef.current);

    if (!firstOrder || paperNodes.length === 0 || isExportingPdf) {
      return;
    }

    setIsExportingPdf(true);

    try {
      const fileName = getOrderBatchFileName(activeOrders);
      const pdfBlob = await createOrderPdfBlob(paperNodes, fileName);

      downloadPdfBlob(pdfBlob, fileName);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    const paperNodes = getOrderPreviewPaperNodes(paperRef.current);

    if (!firstOrder || paperNodes.length === 0) {
      return;
    }

    openOrderPrintWindow(paperNodes, activeOrders.length > 1 ? `${copy.title} batch - ${activeOrders.length} orders` : `${copy.title} ${firstOrder.number}`);
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
      {activeOrders.map((order) => (
        <OrderTemplatePrintDocument key={order.id} order={order} printLocale={printLocale} templateRecord={templateRecord} />
      ))}
    </div>
  );
}
