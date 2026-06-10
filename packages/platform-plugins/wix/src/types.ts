export type WixOrderSyncMode = "latest" | "history";

export type WixOrderSyncWindow = {
  mode: WixOrderSyncMode;
  from: string;
  to: string;
  maxHistoryDays: number;
};

export type WixOrderSyncWindowInput = {
  mode: WixOrderSyncMode;
  now?: Date;
  lastSyncedAt?: Date | null;
  historyDays?: number;
};

export type WixOrdersQueryInput = {
  accessToken: string;
  window: WixOrderSyncWindow;
  cursor?: string | null;
  limit?: number;
};

export type WixOrdersQueryPayload = {
  search: {
    filter: Record<string, unknown>;
    sort: Array<{
      fieldName: string;
      order: "ASC" | "DESC";
    }>;
    cursorPaging: {
      limit: number;
      cursor?: string;
    };
  };
};

export type WixRawOrder = Record<string, unknown>;

export type PrintOpsCustomFieldType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "url"
  | "image"
  | "file"
  | "json";

export type PrintOpsCustomFieldScope = "order" | "line_item" | "customer" | "fulfillment";

export type PrintOpsCustomField = {
  key: string;
  label: string;
  value: unknown;
  type: PrintOpsCustomFieldType;
  scope: PrintOpsCustomFieldScope;
  source: "wix";
  path: string;
};

export type PrintOpsNormalizedMoney = {
  amount: number | null;
  currency: string | null;
  formatted: string | null;
};

export type PrintOpsNormalizedCustomer = {
  sourceCustomerId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  taxId: string | null;
  raw: Record<string, unknown> | null;
};

export type PrintOpsNormalizedAddress = {
  name: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  subdivision: string | null;
  postalCode: string | null;
  country: string | null;
  formatted: string[];
  raw: Record<string, unknown> | null;
};

export type PrintOpsNormalizedLineItem = {
  sourceLineItemId: string | null;
  title: string | null;
  sku: string | null;
  barcode: string | null;
  variant: string | null;
  quantity: number | null;
  imageUrl: string | null;
  price: PrintOpsNormalizedMoney;
  totalPrice: PrintOpsNormalizedMoney;
  options: PrintOpsCustomField[];
  customFields: PrintOpsCustomField[];
  raw: Record<string, unknown>;
};

export type PrintOpsNormalizedOrder = {
  sourcePlatform: "wix";
  sourceOrderId: string;
  orderNumber: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  paymentStatus: string | null;
  fulfillmentStatus: string | null;
  currency: string | null;
  customer: PrintOpsNormalizedCustomer;
  billingAddress: PrintOpsNormalizedAddress | null;
  shippingAddress: PrintOpsNormalizedAddress | null;
  deliveryMethod: string | null;
  paymentMethod: string | null;
  note: string | null;
  tags: string[];
  totalItemQuantity: number;
  totals: {
    subtotal: PrintOpsNormalizedMoney;
    shipping: PrintOpsNormalizedMoney;
    discount: PrintOpsNormalizedMoney;
    tax: PrintOpsNormalizedMoney;
    total: PrintOpsNormalizedMoney;
  };
  raw: WixRawOrder;
  customFields: PrintOpsCustomField[];
  lineItems: PrintOpsNormalizedLineItem[];
};
