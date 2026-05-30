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

export type PrintOpsNormalizedLineItem = {
  sourceLineItemId: string | null;
  title: string | null;
  sku: string | null;
  quantity: number | null;
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
  raw: WixRawOrder;
  customFields: PrintOpsCustomField[];
  lineItems: PrintOpsNormalizedLineItem[];
};
