import type { LocalizedText, PrintLocale } from "./i18n";

export type SourcePlatform = "wix" | "woocommerce" | "shopify" | "csv" | "api";

export type FieldScope =
  | "store"
  | "order"
  | "customer"
  | "address"
  | "line_item"
  | "payment"
  | "fulfillment"
  | "shipment"
  | "custom"
  | "computed"
  | "template";

export type FieldType = "text" | "number" | "money" | "date" | "datetime" | "url" | "image" | "file" | "boolean" | "enum" | "json" | "array";

export type FieldPrivacy = "public" | "business" | "customer_personal" | "sensitive";

export type FieldRegistryItem = {
  key: string;
  label: LocalizedText;
  scope: FieldScope;
  type: FieldType;
  source: "standard" | SourcePlatform | "product_print_field" | "computed" | "template";
  printable: boolean;
  required?: boolean;
  nullable?: boolean;
  sampleValue?: string | number | boolean | null;
  fallback?: LocalizedText;
  privacy: FieldPrivacy;
};

export type TemplateRenderContext = {
  locale: PrintLocale;
  store: {
    name: string;
    logoUrl?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    brandColor?: string;
    policyText?: LocalizedText;
  };
  order: {
    displayOrderNumber: string;
    barcode?: string;
    orderDate: string;
    status: string;
    tags: string[];
    note?: string;
    customerLocale?: PrintLocale;
  };
  customer: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    taxId?: string;
  };
  addresses: {
    shipping?: string;
    billing?: string;
    pickup?: string;
    delivery?: string;
  };
  lineItems: Array<{
    id: string;
    title: string;
    sku?: string;
    variant?: string;
    barcode?: string;
    quantity: number;
    price?: string;
    totalPrice?: string;
    imageUrl?: string;
    options?: Record<string, string>;
    customFields?: Record<string, string>;
    productPrintFields?: Record<string, string>;
  }>;
  payment: {
    subtotal?: string;
    shipping?: string;
    discount?: string;
    tax?: string;
    total: string;
    status: string;
    method?: string;
  };
  fulfillment: {
    method: "shipping" | "pickup" | "delivery" | "pos" | "restaurant" | "custom";
    status: string;
    pickupTime?: string;
    deliveryWindow?: string;
    trackingInfo?: string;
  };
  customFields: Record<string, string>;
  computed: {
    isGiftOrder: boolean;
    isB2bOrder: boolean;
    hasCustomProduct: boolean;
    totalItemQuantity: number;
    missingRequiredFields: string[];
    shouldHidePrices: boolean;
  };
  template: {
    documentType: string;
    paperSize: "A4" | "Letter" | "4x6" | "80mm";
    fontPreset: "latin" | "cjk" | "mono-number";
    marginPreset: "Normal" | "Compact" | "Narrow";
  };
};

export type TemplateComponentBase = {
  id: string;
  label: LocalizedText;
  visible: boolean;
  style?: Record<string, string | number | boolean>;
};

export type AddressBlockComponent = TemplateComponentBase & {
  type: "address_block";
  dataBinding: "addresses.shipping" | "addresses.billing" | "addresses.pickup" | "addresses.delivery";
  props: {
    title: LocalizedText;
    showPhone?: boolean;
    showCompany?: boolean;
    hideWhenEmpty?: boolean;
  };
};

export type LineItemsTableComponent = TemplateComponentBase & {
  type: "line_items_table";
  dataScope: "lineItems";
  columns: Array<{
    field: "imageUrl" | "title" | "sku" | "variant" | "barcode" | "quantity" | "price" | "totalPrice" | `customFields.${string}` | `productPrintFields.${string}`;
    label: LocalizedText;
    visible: boolean;
  }>;
};

export type TemplateComponent = AddressBlockComponent | LineItemsTableComponent;

export const coreFieldRegistry: FieldRegistryItem[] = [
  {
    key: "store.name",
    label: { default: "Store name", "zh-Hant": "店鋪名稱" },
    scope: "store",
    type: "text",
    source: "standard",
    printable: true,
    sampleValue: "Green Studio",
    privacy: "business",
  },
  {
    key: "order.display_order_number",
    label: { default: "Order number", "zh-Hant": "訂單號" },
    scope: "order",
    type: "text",
    source: "standard",
    printable: true,
    required: true,
    sampleValue: "#1008",
    privacy: "business",
  },
  {
    key: "order.order_date",
    label: { default: "Order date", "zh-Hant": "訂單日期" },
    scope: "order",
    type: "datetime",
    source: "standard",
    printable: true,
    required: true,
    sampleValue: "May 30, 2026",
    privacy: "business",
  },
  {
    key: "order.barcode",
    label: { default: "Order barcode", "zh-Hant": "訂單條形碼" },
    scope: "order",
    type: "text",
    source: "computed",
    printable: true,
    nullable: true,
    sampleValue: "1008",
    privacy: "business",
  },
  {
    key: "order.note",
    label: { default: "Order note", "zh-Hant": "訂單備註" },
    scope: "order",
    type: "text",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "Please gift wrap if possible",
    privacy: "customer_personal",
  },
  {
    key: "customer.name",
    label: { default: "Customer name", "zh-Hant": "客戶姓名" },
    scope: "customer",
    type: "text",
    source: "standard",
    printable: true,
    sampleValue: "Mika Chen",
    privacy: "customer_personal",
  },
  {
    key: "customer.email",
    label: { default: "Customer email", "zh-Hant": "客戶電郵" },
    scope: "customer",
    type: "text",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "mika@example.com",
    privacy: "customer_personal",
  },
  {
    key: "customer.phone",
    label: { default: "Customer phone", "zh-Hant": "客戶電話" },
    scope: "customer",
    type: "text",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "+1 555 100 1008",
    privacy: "customer_personal",
  },
  {
    key: "addresses.shipping",
    label: { default: "Shipping address", "zh-Hant": "收貨地址" },
    scope: "address",
    type: "text",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "150 Elgin Street, Ottawa, ON",
    fallback: { default: "No shipping address", "zh-Hant": "沒有收貨地址" },
    privacy: "customer_personal",
  },
  {
    key: "addresses.billing",
    label: { default: "Billing address", "zh-Hant": "帳單地址" },
    scope: "address",
    type: "text",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "150 Elgin Street, Ottawa, ON",
    fallback: { default: "No billing address", "zh-Hant": "沒有帳單地址" },
    privacy: "customer_personal",
  },
  {
    key: "lineItems.title",
    label: { default: "Product title", "zh-Hant": "商品名稱" },
    scope: "line_item",
    type: "text",
    source: "standard",
    printable: true,
    required: true,
    sampleValue: "Custom hoodie",
    privacy: "business",
  },
  {
    key: "lineItems.sku",
    label: { default: "SKU", "zh-Hant": "SKU" },
    scope: "line_item",
    type: "text",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "HD-240",
    privacy: "business",
  },
  {
    key: "lineItems.quantity",
    label: { default: "Quantity", "zh-Hant": "數量" },
    scope: "line_item",
    type: "number",
    source: "standard",
    printable: true,
    required: true,
    sampleValue: 2,
    privacy: "business",
  },
  {
    key: "lineItems.price",
    label: { default: "Unit price", "zh-Hant": "單價" },
    scope: "line_item",
    type: "money",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "$64.20",
    privacy: "business",
  },
  {
    key: "lineItems.totalPrice",
    label: { default: "Line total", "zh-Hant": "商品小計" },
    scope: "line_item",
    type: "money",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "$128.40",
    privacy: "business",
  },
  {
    key: "lineItems.imageUrl",
    label: { default: "Product image", "zh-Hant": "商品圖片" },
    scope: "line_item",
    type: "image",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "https://example.com/product.png",
    privacy: "business",
  },
  {
    key: "lineItems.barcode",
    label: { default: "Product barcode", "zh-Hant": "商品條形碼" },
    scope: "line_item",
    type: "text",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "069000000001",
    privacy: "business",
  },
  {
    key: "lineItems.customFields.production_note",
    label: { default: "Production note", "zh-Hant": "生產備註" },
    scope: "line_item",
    type: "text",
    source: "wix",
    printable: true,
    nullable: true,
    sampleValue: "Keep front text centered",
    privacy: "business",
  },
  {
    key: "payment.subtotal",
    label: { default: "Subtotal", "zh-Hant": "商品小計" },
    scope: "payment",
    type: "money",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "$128.40",
    privacy: "business",
  },
  {
    key: "payment.shipping",
    label: { default: "Shipping", "zh-Hant": "運費" },
    scope: "payment",
    type: "money",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "$10.00",
    privacy: "business",
  },
  {
    key: "payment.tax",
    label: { default: "Tax", "zh-Hant": "稅金" },
    scope: "payment",
    type: "money",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "$8.79",
    privacy: "business",
  },
  {
    key: "payment.total",
    label: { default: "Total", "zh-Hant": "總計" },
    scope: "payment",
    type: "money",
    source: "standard",
    printable: true,
    required: true,
    sampleValue: "$147.19",
    privacy: "business",
  },
  {
    key: "payment.method",
    label: { default: "Payment method", "zh-Hant": "付款方式" },
    scope: "payment",
    type: "text",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "Gift card",
    privacy: "business",
  },
  {
    key: "fulfillment.method",
    label: { default: "Delivery method", "zh-Hant": "配送方式" },
    scope: "fulfillment",
    type: "text",
    source: "standard",
    printable: true,
    nullable: true,
    sampleValue: "Delivery method 3232",
    privacy: "business",
  },
  {
    key: "computed.totalItemQuantity",
    label: { default: "Total item quantity", "zh-Hant": "商品總數" },
    scope: "computed",
    type: "number",
    source: "computed",
    printable: true,
    nullable: true,
    sampleValue: 2,
    privacy: "business",
  },
  {
    key: "computed.shouldHidePrices",
    label: { default: "Hide prices", "zh-Hant": "隱藏價格" },
    scope: "computed",
    type: "boolean",
    source: "computed",
    printable: false,
    sampleValue: false,
    privacy: "business",
  },
];

export const sampleTemplateRenderContext: TemplateRenderContext = {
  locale: "en",
  store: {
    name: "Green Studio",
    email: "support@zider.ink",
    phone: "+1 555 555 5555",
    address: "150 Elgin Street, Ottawa, ON",
    website: "Zider.ink",
    brandColor: "#087a46",
    policyText: {
      default: "Thanks for your business.",
      "zh-Hant": "感謝您的訂購。",
    },
  },
  order: {
    displayOrderNumber: "#1008",
    barcode: "1008",
    orderDate: "May 26, 09:42",
    status: "Unfulfilled",
    tags: ["custom", "production"],
    note: "Please confirm placement before production.",
    customerLocale: "en",
  },
  customer: {
    name: "Mika Chen",
    email: "mika@example.com",
    phone: "+1 555 100 1008",
  },
  addresses: {
    shipping: "150 Elgin Street, Ottawa, ON",
    billing: "150 Elgin Street, Ottawa, ON",
  },
  lineItems: [
    {
      id: "line-1",
      title: "Custom hoodie",
      sku: "HD-240",
      variant: "Sage / M",
      barcode: "069000000001",
      quantity: 2,
      price: "$64.20",
      totalPrice: "$128.40",
      customFields: {
        production_note: "Keep front text centered",
      },
      productPrintFields: {
        material: "Cotton fleece",
      },
    },
  ],
  payment: {
    subtotal: "$128.40",
    total: "$128.40",
    status: "Paid",
  },
  fulfillment: {
    method: "shipping",
    status: "Unfulfilled",
  },
  customFields: {
    buyer_note: "Gift wrap if possible",
  },
  computed: {
    isGiftOrder: false,
    isB2bOrder: false,
    hasCustomProduct: true,
    totalItemQuantity: 2,
    missingRequiredFields: ["product_image"],
    shouldHidePrices: false,
  },
  template: {
    documentType: "production_sheet",
    paperSize: "A4",
    fontPreset: "latin",
    marginPreset: "Normal",
  },
};
