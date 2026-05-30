"use client";

import { Checkbox } from "@base-ui/react/checkbox";
import { Drawer } from "@base-ui/react/drawer";
import { Menu } from "@base-ui/react/menu";
import { Select } from "@base-ui/react/select";
import { Switch } from "@base-ui/react/switch";
import {
  AlertTriangle,
  AtSign,
  Bell,
  BookOpen,
  Camera,
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
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  Search,
  Settings,
  X,
} from "lucide-react";
import { type ChangeEvent, type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
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
  fulfillment: "Unfulfilled" | "Pickup" | "Partial" | "Ready";
  payment: "Paid" | "Unpaid" | "Partially paid";
  print: "Unprinted" | "Generated" | "Sent" | "Printed" | "Failed";
  template: string;
  language: string;
  warning?: string;
  items: string;
};

type PrintOpsView = "orders" | "templates" | "settings";
type PrintOpsPluginContext = {
  appKey: string;
  appName: string;
  instanceId: string | null;
  platform: "wix";
  source: "instance" | "dev-instance-id" | "missing";
  syncEndpoint: string;
  verified: boolean;
};
type WixSyncOrderSummary = {
  orderNumber: string | null;
  sourceOrderId: string;
  updatedAt: string | null;
  lineItems: Array<{
    title: string | null;
    sku: string | null;
    quantity: number | null;
    customFields: unknown[];
  }>;
  customFields: unknown[];
};
type WixSyncStatus = {
  customFieldCount: number;
  error: string | null;
  mode: "latest" | "history" | null;
  orderCount: number;
  orders: WixSyncOrderSummary[];
  status: "idle" | "syncing" | "success" | "error";
  window: { from: string; to: string } | null;
};
type OrderTemplateVisualStyle = "atelier" | "market" | "mono";
type OrderTemplateAccent = "charcoal" | "forest" | "slate";
type WorkspaceAccent = "forest" | "blue" | "violet" | "red" | "amber";
type OrderTemplateDensity = "balanced" | "compact" | "spacious";
type OrderTemplateLogoSource = "generated-svg" | "uploaded-image";
type TemplateDateFormat = "MM-DD-YYYY" | "DD-MM-YYYY" | "YYYY-MM-DD" | "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY/MM/DD" | "MMM D, YYYY" | "D MMM, YYYY";
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
  logoSource: OrderTemplateLogoSource;
  logoImageUrl: string;
  footerWebsite: string;
  footerContact: string;
  thankYouText: string;
  accentColor: OrderTemplateAccent;
  density: OrderTemplateDensity;
  socialLinks: string;
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
  logoSource: OrderTemplateLogoSource;
  logoImageUrl: string;
  footerWebsite: string;
  footerContact: string;
  thankYouText: string;
  accentColor: OrderTemplateAccent;
  density: OrderTemplateDensity;
  socialLinks: string;
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

const templateStorageKey = "printops-templates-v10";
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

const orders: Order[] = [
  {
    id: "1008",
    number: "#1008",
    customer: "Mika Chen",
    email: "mika@example.com",
    total: "$128.40",
    date: "May 26, 09:42",
    fulfillment: "Unfulfilled",
    payment: "Paid",
    print: "Generated",
    template: "Invoice",
    language: "English",
    warning: "2 custom fields missing",
    items: "Custom hoodie x 2",
  },
  {
    id: "1007",
    number: "#1007",
    customer: "Noah Lee",
    email: "noah@example.com",
    total: "$74.00",
    date: "May 26, 08:17",
    fulfillment: "Pickup",
    payment: "Paid",
    print: "Sent",
    template: "Invoice",
    language: "English",
    items: "Gift box x 1",
  },
  {
    id: "1006",
    number: "#1006",
    customer: "Sofia Martin",
    email: "sofia@example.com",
    total: "€212.10",
    date: "May 25, 18:04",
    fulfillment: "Unfulfilled",
    payment: "Partially paid",
    print: "Unprinted",
    template: "Invoice",
    language: "German",
    warning: "VAT ID empty",
    items: "Wholesale sample pack x 6",
  },
  {
    id: "1005",
    number: "#1005",
    customer: "Avery Wu",
    email: "avery@example.com",
    total: "$42.90",
    date: "May 25, 16:31",
    fulfillment: "Ready",
    payment: "Paid",
    print: "Printed",
    template: "Invoice",
    language: "Traditional Chinese",
    items: "Pickup bouquet x 1",
  },
  {
    id: "1004",
    number: "#1004",
    customer: "Chris Young",
    email: "chris@example.com",
    total: "$318.60",
    date: "May 25, 11:22",
    fulfillment: "Partial",
    payment: "Paid",
    print: "Unprinted",
    template: "Invoice",
    language: "English",
    items: "Event kit x 4",
  },
];

const templates = [
  { label: "Invoice", value: "invoice" },
];

const defaultTemplateBrandSettings = {
  brandName: "Green Studio",
  logoText: "Hello",
  logoSource: "generated-svg",
  logoImageUrl: "",
  footerWebsite: "greenstudio.com",
  footerContact: "150 Elgin Street, 8th Floor / support@wixcn.net",
  thankYouText: "Thanks for your business!",
  accentColor: "charcoal",
  density: "balanced",
  socialLinks: "@greenstudio / instagram / facebook / x",
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
  | "logoSource"
  | "logoText"
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
  | "thankYouText"
>;

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
    default: "Questions? Please contact support@wixcn.net.",
    es: "¿Preguntas? Contacta con support@wixcn.net.",
    de: "Fragen? Bitte kontaktiere support@wixcn.net.",
    ja: "ご不明点は support@wixcn.net までお問い合わせください。",
    fr: "Questions ? Contactez support@wixcn.net.",
    pt: "Dúvidas? Fale com support@wixcn.net.",
    "zh-Hans": "如有问题，请联系 support@wixcn.net。",
    "zh-Hant": "如有問題，請聯絡 support@wixcn.net。",
    ar: "هل لديك أسئلة؟ تواصل مع support@wixcn.net.",
    nl: "Vragen? Neem contact op met support@wixcn.net.",
    it: "Domande? Contatta support@wixcn.net.",
    ko: "문의 사항은 support@wixcn.net 으로 연락해 주세요.",
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
    logoText: "Hello",
    socialLinks: "@greenstudio / instagram / facebook / x",
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
    logoText: "GS",
    socialLinks: "@greenstudio / instagram / pinterest",
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
    logoText: "GS",
    socialLinks: "greenstudio.com / instagram / facebook",
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
    logoText: "Hello",
    socialLinks: "@greenstudio / instagram / facebook / x",
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
    logoText: "GS",
    socialLinks: "@greenstudio / instagram / pinterest",
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
    logoText: "GS",
    logoSource: defaultTemplateBrandSettings.logoSource,
    logoImageUrl: defaultTemplateBrandSettings.logoImageUrl,
    footerWebsite: defaultTemplateBrandSettings.footerWebsite,
    footerContact: defaultTemplateBrandSettings.footerContact,
    thankYouText: defaultTemplateBrandSettings.thankYouText,
    accentColor: defaultTemplateBrandSettings.accentColor,
    density: defaultTemplateBrandSettings.density,
    socialLinks: "@greenstudio / instagram / facebook / x",
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
  return {
    id: mode === "edit" ? templateRecord.id : undefined,
    name: mode === "duplicate" ? `${templateRecord.name} Copy` : templateRecord.name,
    description: templateRecord.description,
    documentType: templateRecord.documentType,
    category: templateRecord.category,
    scenario: templateRecord.scenario,
    audience: templateRecord.audience,
    paperSize: templateRecord.paperSize,
    orientation: templateRecord.orientation,
    marginPreset: templateRecord.marginPreset,
    layoutPreset: templateRecord.layoutPreset,
    dateFormat: templateRecord.dateFormat ?? defaultTemplateBrandSettings.dateFormat,
    addressFormat: templateRecord.addressFormat ?? defaultTemplateBrandSettings.addressFormat,
    visualStyle: templateRecord.visualStyle ?? "atelier",
    defaultLanguage: templateRecord.defaultLanguage,
    labelOverrides: normalizeLabelOverrides(templateRecord.labelOverrides),
    brandName: templateRecord.brandName ?? defaultTemplateBrandSettings.brandName,
    logoText: templateRecord.logoText ?? "GS",
    logoSource: templateRecord.logoSource ?? defaultTemplateBrandSettings.logoSource,
    logoImageUrl: templateRecord.logoImageUrl ?? defaultTemplateBrandSettings.logoImageUrl,
    footerWebsite: templateRecord.footerWebsite ?? defaultTemplateBrandSettings.footerWebsite,
    footerContact: templateRecord.footerContact ?? defaultTemplateBrandSettings.footerContact,
    thankYouText: templateRecord.thankYouText ?? defaultTemplateBrandSettings.thankYouText,
    accentColor: templateRecord.accentColor ?? defaultTemplateBrandSettings.accentColor,
    density: templateRecord.density ?? defaultTemplateBrandSettings.density,
    socialLinks: templateRecord.socialLinks ?? "@greenstudio / instagram / facebook",
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

  return {
    id: existing?.id ?? createTemplateId(draft.name),
    name: draft.name.trim(),
    description: draft.description.trim(),
    documentType: draft.documentType,
    category: draft.category,
    scenario: draft.scenario.trim() || "custom",
    audience: draft.audience,
    paperSize: draft.paperSize,
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
    logoText: draft.logoText.trim() || "GS",
    logoSource: draft.logoSource,
    logoImageUrl: draft.logoImageUrl.trim(),
    footerWebsite: draft.footerWebsite.trim() || defaultTemplateBrandSettings.footerWebsite,
    footerContact: draft.footerContact.trim() || defaultTemplateBrandSettings.footerContact,
    thankYouText: draft.thankYouText.trim() || defaultTemplateBrandSettings.thankYouText,
    accentColor: draft.accentColor,
    density: draft.density,
    socialLinks: draft.socialLinks.trim() || "@greenstudio / instagram / facebook",
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
  const [selectedIds, setSelectedIds] = useState<string[]>(["1008", "1007", "1006"]);
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
    status: "idle",
    window: null,
  });

  const activeView = initialView;
  const messages = getPrintOpsMessages(siteLocale);
  const printLanguageOptions = useMemo(() => getPrintLocaleOptions(siteLocale), [siteLocale]);
  const navigationSections = useMemo(
    () => [
      {
        label: messages.nav.menu,
        items: [
          { icon: Package, label: messages.nav.orders, href: "/apps/printops", view: "orders", count: "128" },
          { icon: LayoutTemplate, label: messages.nav.templates, href: "/apps/printops/templates", view: "templates", count: "6" },
        ],
      },
      {
        label: messages.nav.general,
        items: [
          { icon: Settings, label: messages.nav.settings, href: "/apps/printops/settings", view: "settings", count: "" },
          { icon: BookOpen, label: messages.nav.help, href: "#", view: "help", count: "" },
        ],
      },
    ],
    [messages],
  );
  const selectedOrders = useMemo(() => orders.filter((order) => selectedIds.includes(order.id)), [selectedIds]);
  const selectedCount = selectedOrders.length;
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
  }, [templateDocumentFilter, templateSearch, templateTab]);

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
  const pageMetrics =
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
          { label: messages.metrics.unprinted, value: "128" },
          { label: messages.metrics.generated, value: "43" },
          { label: messages.metrics.sent, value: "16" },
          { label: messages.metrics.failed, value: "2", tone: "warning" as const },
        ];

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

  function toggleOrder(orderId: string, checked: boolean) {
    setSelectedIds((current) => (checked ? [...new Set([...current, orderId])] : current.filter((id) => id !== orderId)));
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? orders.map((order) => order.id) : []);
  }

  function patchTemplateDraft(patch: Partial<TemplateDraft>) {
    setTemplateDraft((current) => ({ ...current, ...patch }));
  }

  function openCreateTemplate() {
    setTemplateEditorMode("create");
    setTemplateDraft(createBlankTemplateDraft());
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
        sync?: {
          customFieldCount?: number;
          orderCount?: number;
          window?: { from: string; to: string };
        };
      } | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? `Wix sync request failed with ${response.status}`);
      }

      setWixSyncStatus({
        customFieldCount: payload.sync?.customFieldCount ?? 0,
        error: null,
        mode,
        orderCount: payload.sync?.orderCount ?? 0,
        orders: payload.orders ?? [],
        status: "success",
        window: payload.sync?.window ?? null,
      });
    } catch (error) {
      setWixSyncStatus((current) => ({
        ...current,
        error: error instanceof Error ? error.message : messages.wixSync.failed,
        mode,
        status: "error",
      }));
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
                    onClick={() => setMobileSidebarOpen(false)}
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
            <button className={styles.roundAction} type="button" aria-label={messages.topbar.messages}>
              <Mail size={18} aria-hidden />
              <span />
            </button>
            <button className={styles.roundAction} type="button" aria-label={messages.topbar.notifications}>
              <Bell size={18} aria-hidden />
              <span />
            </button>
            <button className={styles.profileButton} type="button">
              <span className={styles.avatar}>GS</span>
              <span>
                <strong>Green Studio Wix</strong>
                <small>Wix Stores</small>
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
            onEditTemplate={openTemplateEditor}
            messages={messages}
            search={templateSearch}
            selectedTemplate={selectedTemplate}
            tab={templateTab}
          />
        ) : (
          <>
            {pluginContext ? (
              <WixSyncPanel context={pluginContext} messages={messages} onSync={syncWixOrders} status={wixSyncStatus} />
            ) : null}
            <div className={styles.mainGrid}>
          <section className={styles.ordersPanel}>
            <div className={styles.filterBar}>
            <label className={styles.search}>
              <Search size={17} aria-hidden />
              <input aria-label="Search orders, customer, or SKU" placeholder="Search orders, customer, SKU" />
            </label>
              <FilterChip label="30 days" active />
              <FilterChip label="Unfulfilled" />
              <FilterChip label="Unprinted" />
              <FilterChip label="Failed" />
            </div>

            <div className={styles.tableToolbar}>
              <div className={styles.bulkState}>
                <BaseCheckbox
                  checked={selectedCount === orders.length}
                  indeterminate={selectedCount > 0 && selectedCount < orders.length}
                  label="Select all"
                  onCheckedChange={toggleAll}
                />
                <span>{selectedCount} selected</span>
              </div>
              <button className={styles.secondaryButton} type="button" onClick={() => setDrawerOpen(true)}>
                <Eye size={16} aria-hidden />
                Preview batch
              </button>
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
                  {orders.map((order) => (
                    <tr data-selected={selectedIds.includes(order.id)} key={order.id}>
                      <td>
                        <BaseCheckbox
                          checked={selectedIds.includes(order.id)}
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
                        <OrderMenu />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className={styles.previewPanel}>
            <div className={styles.tabPanel}>
              <PrintPreview printLocale={language} selectedOrders={selectedOrders} />
            </div>
          </aside>
        </div>
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

                  <div className={styles.validationBox}>
                    <div>
                      <AlertTriangle size={18} aria-hidden />
                      <strong>{messages.drawer.reviewRequired}</strong>
                    </div>
                    <p>{messages.drawer.reviewBody}</p>
                  </div>

                  <div className={styles.drawerActions}>
                    <button className={styles.primaryButton} type="button">
                      <FileText size={17} aria-hidden />
                      {messages.drawer.generatePdf}
                    </button>
                    <button className={styles.secondaryButton} type="button">
                      <Printer size={17} aria-hidden />
                      {messages.drawer.browserPrint}
                    </button>
                  </div>
                </section>

                <section className={styles.drawerPreview}>
                  <PrintPreview compact printLocale={language} selectedOrders={selectedOrders} />
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
              {messages.wixSync.sampleOrders}: {status.orders.slice(0, 3).map(formatSyncedOrder).join(", ")}
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function formatSyncedOrder(order: WixSyncOrderSummary) {
  const itemCount = order.lineItems.reduce((total, lineItem) => total + (lineItem.quantity ?? 0), 0);
  const customFieldCount = order.customFields.length + order.lineItems.reduce((total, lineItem) => total + lineItem.customFields.length, 0);

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

function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button className={styles.filterChip} data-active={active} type="button">
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
        <CheckCircle2 size={14} aria-hidden />
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
      : value === "Generated" || value === "Sent" || value === "Partially paid" || value === "Partial"
        ? "warn"
        : "neutral";

  return (
    <span className={styles.statusPill} data-tone={tone}>
      {label ?? value}
    </span>
  );
}

function OrderMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger className={styles.iconButton} aria-label="Order actions">
        <MoreHorizontal size={18} aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6}>
          <Menu.Popup className={styles.menuPopup}>
            <Menu.Item className={styles.menuItem}>Preview</Menu.Item>
            <Menu.Item className={styles.menuItem}>Change template</Menu.Item>
            <Menu.Item className={styles.menuItem}>Mark as printed</Menu.Item>
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
  onEditTemplate,
  messages,
  search,
  selectedTemplate,
  tab,
}: {
  documentFilter: string;
  filteredTemplates: TemplateRecord[];
  onDocumentFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSelectedTemplateChange: (id: string) => void;
  onTabChange: (value: "mine" | "library") => void;
  onCreateTemplate: () => void;
  onEditTemplate: (templateRecord: TemplateRecord) => void;
  messages: PrintOpsMessages;
  search: string;
  selectedTemplate: TemplateRecord;
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

              return (
                <button
                  className={styles.templateCard}
                  data-mode={tab}
                  data-selected={templateRecord.id === selectedTemplate.id}
                  key={templateRecord.id}
                  type="button"
                  onClick={() => {
                    onSelectedTemplateChange(templateRecord.id);
                    setPreviewTemplate(templateRecord);
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
                        socialLinks={templateRecord.socialLinks}
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
                      <span className={styles.templateCardAction}>{messages.templates.preview}</span>
                    </span>
                  </span>
                </button>
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
const A4_EXPORT_HEIGHT_PX = 1123;

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

function getTemplatePreviewNode() {
  const previewNode = document.querySelector<HTMLElement>('[data-template-print-preview="true"]');
  const paperNode = previewNode?.querySelector<HTMLElement>('[class*="templatePaper"]');

  return paperNode ?? previewNode;
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
                socialLinks={templateRecord.socialLinks}
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
              <div className={styles.requirementList}>
                <strong>{messages.templates.requiredData}</strong>
                <div>
                  {templateRecord.dataRequirements.map((requirement) => (
                    <span key={requirement}>{requirement}</span>
                  ))}
                </div>
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
  const localizedLogoSourceOptions = [
    { label: editorCopy.logoSourceGenerated, value: "generated-svg" },
    { label: editorCopy.logoSourceUploaded, value: "uploaded-image" },
  ];
  const localizedAccentOptions = [
    { label: editorCopy.accentCharcoal, value: "charcoal" },
    { label: editorCopy.accentForest, value: "forest" },
    { label: editorCopy.accentSlate, value: "slate" },
  ];
  const localizedDensityOptions = [
    { label: editorCopy.densityBalanced, value: "balanced" },
    { label: editorCopy.densityCompact, value: "compact" },
    { label: editorCopy.densitySpacious, value: "spacious" },
  ];
  const localizedDocumentTypeOptions = [{ label: editorCopy.documentInvoice, value: "Invoice" }];
  const localizedCategoryOptions = [
    { label: editorCopy.categoryFulfillment, value: "Fulfillment" },
    { label: editorCopy.categoryPicking, value: "Picking" },
    { label: editorCopy.categoryProduction, value: "Production" },
    { label: editorCopy.categoryCustomerDocuments, value: "Customer Documents" },
    { label: editorCopy.categoryFinanceHelper, value: "Finance Helper" },
    { label: editorCopy.categoryStorePos, value: "Store / POS" },
  ];
  const localizedAudienceOptions = [
    { label: editorCopy.audienceCustomer, value: "Customer" },
    { label: editorCopy.audienceWarehouse, value: "Warehouse" },
    { label: editorCopy.audienceProduction, value: "Production" },
    { label: editorCopy.audienceFinance, value: "Finance" },
    { label: editorCopy.audienceStoreStaff, value: "Store staff" },
  ];
  const localizedOrientationOptions = [
    { label: editorCopy.orientationPortrait, value: "Portrait" },
    { label: editorCopy.orientationLandscape, value: "Landscape" },
  ];
  const localizedMarginOptions = [
    { label: editorCopy.marginNormal, value: "Normal" },
    { label: editorCopy.marginCompact, value: "Compact" },
    { label: editorCopy.marginNarrow, value: "Narrow" },
  ];
  const localizedLayoutOptions = [
    { label: editorCopy.layoutBranded, value: "Branded" },
    { label: editorCopy.layoutCompact, value: "Compact" },
    { label: editorCopy.layoutTableFirst, value: "Table-first" },
    { label: editorCopy.layoutThermal, value: "Thermal" },
  ];
  const localizedDraftMargin = localizedMarginOptions.find((option) => option.value === draft.marginPreset)?.label ?? draft.marginPreset;
  const localizedMarginSummary = editorCopy.margin === "Margin" ? `${localizedDraftMargin} ${editorCopy.margin}` : `${localizedDraftMargin}${editorCopy.margin}`;
  const templateSettingsSummary = `${draft.paperSize}, ${
    localizedOrientationOptions.find((option) => option.value === draft.orientation)?.label ?? draft.orientation
  }, ${localizedMarginSummary}`;
  const drawerStateLabel = mode === "duplicate" ? editorCopy.draftCopy : mode === "create" ? editorCopy.draft : editorCopy.ready;
  const localizedDraftOrientation = localizedOrientationOptions.find((option) => option.value === draft.orientation)?.label ?? draft.orientation;
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
      draft.logoText || "GS"
    );

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
            <div className={styles.formTwoColumns}>
              <label className={styles.fieldGroup}>
                <span>{editorCopy.storeName}</span>
                <input
                  className={styles.textInput}
                  value={draft.brandName}
                  onChange={(event) => onDraftChange({ brandName: event.target.value })}
                />
              </label>
              <label className={styles.fieldGroup}>
                <span>{editorCopy.heroWordmark}</span>
                <input
                  className={styles.textInput}
                  maxLength={18}
                  value={draft.logoText}
                  onChange={(event) => onDraftChange({ logoText: event.target.value })}
                />
              </label>
              <label className={styles.fieldGroup}>
                <span>{editorCopy.footerWebsite}</span>
                <input
                  className={styles.textInput}
                  value={draft.footerWebsite}
                  onChange={(event) => onDraftChange({ footerWebsite: event.target.value })}
                />
              </label>
              <label className={styles.fieldGroup}>
                <span>{editorCopy.socialFooter}</span>
                <input
                  className={styles.textInput}
                  value={draft.socialLinks}
                  onChange={(event) => onDraftChange({ socialLinks: event.target.value })}
                />
              </label>
            </div>
            <span className={styles.settingsGroupTitle}>{editorCopy.logoAsset}</span>
            <div className={styles.formTwoColumns}>
              <SelectField
                label={editorCopy.logoType}
                options={localizedLogoSourceOptions}
                value={draft.logoSource}
                onValueChange={(value) => onDraftChange({ logoSource: value as OrderTemplateLogoSource })}
              />
              <label className={styles.logoUploadField}>
                <span>{draft.logoImageUrl ? editorCopy.replaceLogoImage : editorCopy.uploadLogoImage}</span>
                <input accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" type="file" onChange={handleLogoUpload} />
              </label>
            </div>
            {draft.logoSource === "uploaded-image" && draft.logoImageUrl ? (
              <div className={styles.uploadedLogoPreview}>
                <img alt={`${draft.brandName || "Store"} uploaded logo`} src={draft.logoImageUrl} />
                <button type="button" onClick={() => onDraftChange({ logoImageUrl: "", logoSource: "generated-svg" })}>
                  {editorCopy.removeUploadedLogo}
                </button>
              </div>
            ) : null}
            <label className={styles.fieldGroup}>
              <span>{editorCopy.footerContactLine}</span>
              <input
                className={styles.textInput}
                value={draft.footerContact}
                onChange={(event) => onDraftChange({ footerContact: event.target.value })}
              />
            </label>

            <span className={styles.settingsGroupTitle}>{editorCopy.styleBasics}</span>
            <div className={styles.formTwoColumns}>
              <SelectField
                label={editorCopy.accent}
                options={localizedAccentOptions}
                value={draft.accentColor}
                onValueChange={(value) => onDraftChange({ accentColor: value as OrderTemplateAccent })}
              />
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
                label={editorCopy.category}
                options={localizedCategoryOptions}
                value={draft.category}
                onValueChange={(value) => onDraftChange({ category: value as TemplateRecord["category"] })}
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
                <input className={styles.textInput} readOnly value={editorCopy.fixedA4} />
              </label>
              <SelectField
                label={editorCopy.orientation}
                options={localizedOrientationOptions}
                value={draft.orientation}
                onValueChange={(value) => onDraftChange({ orientation: value as TemplateRecord["orientation"] })}
              />
              <SelectField
                label={editorCopy.margin}
                options={localizedMarginOptions}
                value={draft.marginPreset}
                onValueChange={(value) => onDraftChange({ marginPreset: value as TemplateRecord["marginPreset"] })}
              />
              <SelectField
                label={editorCopy.layout}
                options={localizedLayoutOptions}
                value={draft.layoutPreset}
                onValueChange={(value) => onDraftChange({ layoutPreset: value as TemplateRecord["layoutPreset"] })}
              />
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
        <label className={styles.fieldGroup}>
          <span>{editorCopy.requiredData}</span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={draft.dataRequirements}
            onChange={(event) => onDraftChange({ dataRequirements: event.target.value })}
          />
          <small className={styles.helperText}>{editorCopy.requiredDataHelp}</small>
        </label>
        <div className={styles.requirementList}>
          <strong>{editorCopy.currentRequiredData}</strong>
          <div>
            {parsedRequirements.length > 0 ? parsedRequirements.map((requirement) => <span key={requirement}>{requirement}</span>) : <span>{editorCopy.noFieldsYet}</span>}
          </div>
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
                          <small>{section.description}</small>
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

                <div className={styles.validationBox} data-tone={parsedRequirements.length > 0 ? "ok" : "warning"}>
                  <div>
                    {parsedRequirements.length > 0 ? <CheckCircle2 size={18} aria-hidden /> : <AlertTriangle size={18} aria-hidden />}
                    <strong>{parsedRequirements.length} {editorCopy.readyFields}</strong>
                  </div>
                  <p>{parsedRequirements.length > 0 ? editorCopy.canSave : editorCopy.needsRequiredField}</p>
                </div>

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
                  <span>{localizedDraftOrientation}</span>
                </div>
                <div className={styles.templatePreviewShell}>
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
                    socialLinks={draft.socialLinks}
                    thankYouText={draft.thankYouText}
                    variant="editor"
                    visualStyle={draft.visualStyle}
                  />
                </div>
                <div className={styles.requirementList}>
                  <strong>{editorCopy.requiredData}</strong>
                  <div>
                    {parsedRequirements.length > 0 ? parsedRequirements.map((requirement) => <span key={requirement}>{requirement}</span>) : <span>{editorCopy.noFieldsYet}</span>}
                  </div>
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
  logoSource = defaultTemplateBrandSettings.logoSource,
  logoText = "GS",
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
  socialLinks = "@greenstudio / instagram / facebook / x",
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
  logoSource?: OrderTemplateLogoSource;
  logoText?: string;
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
  socialLinks?: string;
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
        logoSource={logoSource}
        logoText={logoText}
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
        socialLinks={socialLinks}
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
          <span className={styles.paperLogoMark}>GS</span>
          <span>
            <strong>Green Studio</strong>
            <small>hello@greenstudio.example</small>
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
          <strong>Green Studio</strong>
          <span>24 Linden Ave</span>
          <span>Portland, OR</span>
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

function getOrderTemplateAccentStyle(accentColor: OrderTemplateAccent): CSSProperties {
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
  const name = type === "billing" ? "Yancy tien" : "Yancy tien";
  const street = "10018";
  const city = "Shanghai";
  const region = "Shanghai";
  const country = "Taiwan";
  const phone = "18516526365";

  if (addressFormat === "single-line") {
    return [`${name}, ${street}, ${city}, ${region}, ${country}, ${phone}`];
  }

  if (addressFormat === "compact") {
    return [name, `${street}, ${city}, ${region}`, `${country} / ${phone}`];
  }

  if (addressFormat === "china") {
    return [country, `${region}${city}`, street, name, phone];
  }

  return [name, street, city, region, country, phone];
}

function BrandLogoAsset({
  brandName,
  logoImageUrl,
  logoSource,
  mark,
  tagline = "Premium",
}: {
  brandName: string;
  logoImageUrl: string;
  logoSource: OrderTemplateLogoSource;
  mark: string;
  tagline?: string;
}) {
  const displayMark = mark.trim().slice(0, 4).toUpperCase() || "GS";
  const displayBrandName = brandName.trim().toUpperCase() || "GREEN STUDIO";
  const uploadedLogo = logoImageUrl.trim();

  if (logoSource === "uploaded-image" && uploadedLogo) {
    return <img className={styles.orderClassicLogoImage} alt={`${displayBrandName} logo`} src={uploadedLogo} />;
  }

  return (
    <svg className={styles.orderClassicLogoAsset} viewBox="0 0 286 68" role="img" aria-label={`${displayBrandName} logo`}>
      <rect x="1" y="1" width="284" height="66" fill="#ffffff" stroke="#151817" strokeWidth="2" />
      <rect x="1" y="1" width="74" height="44" fill="#151817" />
      <line x1="75" y1="1" x2="75" y2="67" stroke="#151817" strokeWidth="2" />
      <line x1="75" y1="45" x2="285" y2="45" stroke="#151817" strokeWidth="2" />
      <text x="38" y="31" textAnchor="middle" fill="#ffffff" fontFamily="Inter, Arial, sans-serif" fontSize="24" fontWeight="800" letterSpacing="0">
        {displayMark}
      </text>
      <text x="180" y="28" textAnchor="middle" fill="#151817" fontFamily="Inter, Arial, sans-serif" fontSize="18" fontWeight="900" letterSpacing="7">
        {displayBrandName}
      </text>
      {tagline ? (
        <text x="180" y="60" textAnchor="middle" fill="#151817" fontFamily="Georgia, serif" fontSize="10" fontStyle="italic" letterSpacing="1.2">
          {tagline}
        </text>
      ) : null}
    </svg>
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
  logoSource,
  logoText,
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
  socialLinks,
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
  logoSource: OrderTemplateLogoSource;
  logoText: string;
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
  socialLinks: string;
  thankYouText: string;
  variant: "card" | "detail" | "editor";
  visualStyle: OrderTemplateVisualStyle;
}) {
  const socialItems = socialLinks
    .split(/[,/]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
  const rawLogo = logoText.trim();
  const displayLogo = rawLogo.slice(0, 4) || "GS";
  const displayWordmark = rawLogo || "Hello";
  const displayBrandName = brandName.trim() || defaultTemplateBrandSettings.brandName;
  const displayFooterWebsite = footerWebsite.trim() || defaultTemplateBrandSettings.footerWebsite;
  const displayFooterContact = footerContact.trim() || defaultTemplateBrandSettings.footerContact;
  const displayThankYou = thankYouText.trim() || defaultTemplateBrandSettings.thankYouText;
  const displayDate = formatTemplateDate(dateFormat, defaultLanguage);
  const billAddressLines = getSampleAddressLines(addressFormat, "billing");
  const shipAddressLines = getSampleAddressLines(addressFormat, "shipping");
  const label = (key: string) => resolveTemplateLabel(key, defaultLanguage, labelOverrides);
  const labels = {
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
    style: getOrderTemplateAccentStyle(accentColor),
  };
  const productImage = showProductImages ? (
    <span className={styles.orderProductPhoto} aria-hidden="true">
      <svg className={styles.orderProductPhotoIcon} viewBox="0 0 64 64" focusable="false">
        <path className={styles.orderProductPhotoHandle} d="M19 29c0-9 5.8-15 13-15s13 6 13 15" />
        <path className={styles.orderProductPhotoBody} d="M11 30h42l4 22H7l4-22Z" />
        <path className={styles.orderProductPhotoShine} d="M13 31h38l-3 7H16l-3-7Z" />
      </svg>
    </span>
  ) : null;
  const skuLine = showSku ? (
    <small>
      <b>{labels.sku}</b> GS-BAG-001
    </small>
  ) : null;
  const orderBarcode = showOrderBarcode ? (
    <span className={styles.orderBarcodeBlock}>
      <small>{labels.orderBarcode}</small>
      <i aria-hidden="true" />
      <em>#10059</em>
    </span>
  ) : null;
  const socialFooter = showContactFooter || showSocialFooter ? (
    <span className={styles.orderSocialFooter}>
      {showContactFooter ? (
        <span>
          <strong>{displayFooterWebsite}</strong>
          <small>{displayFooterContact}</small>
        </span>
      ) : null}
      {showSocialFooter ? (
        <span className={styles.orderSocialLinks}>
          {socialItems.map((item) => (
            <small key={item}>{item}</small>
          ))}
        </span>
      ) : null}
    </span>
  ) : null;
  const heroSocialFooter = showContactFooter || showSocialFooter ? (
    <span className={styles.orderHeroSocialFooter}>
      {showContactFooter ? (
        <span>
          <strong>{displayFooterWebsite}</strong>
          <small>{displayFooterContact}</small>
        </span>
      ) : null}
      {showSocialFooter ? (
        <span className={styles.orderHeroSocialIcons} aria-label="Social links">
          {socialItems.map((item) => {
            const normalizedItem = item.toLowerCase();
            let icon: ReactNode = <Globe size={13} strokeWidth={2.4} aria-hidden />;

            if (normalizedItem.includes("instagram")) {
              icon = <Camera size={13} strokeWidth={2.4} aria-hidden />;
            } else if (normalizedItem.startsWith("@")) {
              icon = <AtSign size={13} strokeWidth={2.4} aria-hidden />;
            } else if (normalizedItem.includes("facebook")) {
              icon = <span className={styles.orderHeroSocialLetter}>f</span>;
            } else if (normalizedItem === "x" || normalizedItem.includes("twitter")) {
              icon = <span className={styles.orderHeroSocialLetter}>x</span>;
            }

            return (
              <small aria-label={item} key={item} title={item}>
                {icon}
              </small>
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
            {showLogoText ? <span className={styles.orderHeroLogoText}>{displayWordmark}</span> : null}
            {showInvoiceMeta ? (
              <span className={styles.orderHeroMeta}>
                {showStoreName ? <strong>{displayBrandName}</strong> : null}
                <span>
                  <b>{labels.invoiceNo}</b> #10059
                </span>
                <span>
                  <b>{labels.invoiceDate}</b> {displayDate}
                </span>
                {showPaymentMethod ? (
                  <span>
                    <b>{labels.payment}</b> Gift card
                  </span>
                ) : null}
                {showShippingMethod ? (
                  <span>
                    <b>{labels.shipping}</b> Delivery method 3232
                  </span>
                ) : null}
                {orderBarcode}
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
          <span className={styles.orderHeroRow}>
            <span className={styles.orderHeroItem}>
              {productImage}
              <span>
                <strong>示例商品A</strong>
                {skuLine}
                {showItemOptions ? <small>Size: 12 / Color: orange</small> : null}
              </span>
            </span>
            <strong>x1</strong>
            <span>$1.00</span>
            <strong>$1.00</strong>
          </span>
        </span>

        {showNotes || showTotals ? (
          <span className={styles.orderHeroSummary} data-columns={showNotes && showTotals ? "two" : "one"}>
            {showNotes ? (
              <span className={styles.orderNotesBlock}>
                <strong>{labels.notes}</strong>
                <span>Please gift wrap and include the printed order summary.</span>
              </span>
            ) : null}
            {showTotals ? (
              <span className={styles.orderHeroTotals}>
                <span>
                  <small>{labels.items}</small>
                  <strong>$1.00</strong>
                </span>
                <span>
                  <small>{labels.shipping}</small>
                  <strong>$1.00</strong>
                </span>
                <span>
                  <small>{labels.tax}</small>
                  <strong>$0.00</strong>
                </span>
                <span data-emphasis="true">
                  <small>{labels.total}</small>
                  <strong>$2.00</strong>
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
            <small>{labels.invoiceNo} #10059</small>
            <small>{labels.orderDate} {displayDate}</small>
            <small>{labels.payment} Gift card</small>
            <small>{labels.shipping} Delivery method 3232</small>
            {orderBarcode}
          </span>
          <span className={styles.orderClassicLogo}>
            <BrandLogoAsset brandName={displayBrandName} logoImageUrl={logoImageUrl} logoSource={logoSource} mark={displayLogo} />
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
          <span className={styles.orderClassicRow}>
            <span className={styles.orderClassicItem}>
              {productImage}
              <span>
                <strong>示例商品A</strong>
                {skuLine}
                {showItemOptions ? <small>Size: 12 / Color: orange</small> : null}
              </span>
            </span>
            <strong>x1</strong>
            <span>$1.00</span>
            <strong>$1.00</strong>
          </span>
        </span>

        <span className={styles.orderClassicLower}>
          <span className={styles.orderNotesBlock}>
            <strong>{labels.notes}</strong>
            <span>Please gift wrap and include the printed order summary.</span>
          </span>
          <span className={styles.orderClassicTotals}>
            <span>
              <strong>{labels.items}</strong>
              <small>$1.00</small>
            </span>
            <span>
              <strong>{labels.shipping}</strong>
              <small>$1.00</small>
            </span>
            <span>
              <strong>{labels.tax}</strong>
              <small>$0.00</small>
            </span>
            <span data-emphasis="true">
              <strong>{labels.total}</strong>
              <small>$2.00</small>
            </span>
          </span>
        </span>

        <span className={styles.orderCenteredFooter}>
          <strong>{displayThankYou}</strong>
          <span>Green Studio / Shanghai, Hong Kong / support@wixcn.net</span>
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
          <small>{labels.invoiceNo} #10059</small>
          <small>{labels.orderDate} {displayDate}</small>
          <small>{labels.totalItems} 1</small>
          {orderBarcode}
        </span>
        <span className={styles.orderClassicLogo}>
          <BrandLogoAsset brandName={displayBrandName} logoImageUrl={logoImageUrl} logoSource={logoSource} mark={displayLogo} />
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
        <span>
          <span className={styles.orderClassicItem}>
            {productImage}
            <span>
              <strong>示例商品A</strong>
              {skuLine}
              {showItemOptions ? <small>Size: 12 / Color: orange</small> : null}
            </span>
          </span>
          <strong>x1</strong>
        </span>
      </span>

      <span className={styles.orderSlipNotes}>
        <strong>{labels.notes}</strong>
        <span>Please gift wrap and include the printed order summary.</span>
      </span>

      <span className={styles.orderSlipThanks}>
        <strong>{displayThankYou}</strong>
        <span>{labels.questions}</span>
        <span>Green Studio / Shanghai, Hong Kong / 18516526365</span>
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

function PrintPreview({ selectedOrders, compact, printLocale }: { selectedOrders: Order[]; compact?: boolean; printLocale: PrintLocale }) {
  const firstOrder = selectedOrders[0] ?? orders[0];
  const copy = getPrintTemplateCopy(printLocale);

  return (
    <div className={styles.previewStack} data-compact={compact}>
      <div className={styles.previewHeader}>
        <div>
          <span>{copy.title}</span>
          <strong>{firstOrder.number}</strong>
        </div>
        <span>A4</span>
      </div>
      <div className={styles.paper}>
        <header>
          <div className={styles.paperLogo}>GS</div>
          <div>
            <h2>Green Studio</h2>
            <p>{copy.title}</p>
          </div>
        </header>
        <section className={styles.paperGrid}>
          <div>
            <span>{copy.order}</span>
            <strong>{firstOrder.number}</strong>
          </div>
          <div>
            <span>{copy.customer}</span>
            <strong>{firstOrder.customer}</strong>
          </div>
          <div>
            <span>{copy.due}</span>
            <strong>{firstOrder.date}</strong>
          </div>
          <div>
            <span>{copy.language}</span>
            <strong>{printLocale}</strong>
          </div>
        </section>
        <section className={styles.lineItems}>
          <div>
            <Package size={18} aria-hidden />
            <strong>{firstOrder.items}</strong>
            <span>SKU HD-240 / color: sage / size: M</span>
          </div>
          <div>
            <Languages size={18} aria-hidden />
            <strong>{copy.customText}</strong>
            <span>Delivery method 3232 / 12. Billing address follows delivery address.</span>
          </div>
          <div data-warning="true">
            <AlertTriangle size={18} aria-hidden />
            <strong>{copy.missingUpload}</strong>
            <span>Items $1.00, shipping $1.00, tax $0.00, paid with gift card.</span>
          </div>
        </section>
      </div>
      <div className={styles.previewFooter}>
        <span>{selectedOrders.length || 1} orders in batch</span>
        <button className={styles.iconTextButton} type="button">
          <Download size={16} aria-hidden />
          {copy.pdf}
        </button>
      </div>
    </div>
  );
}
