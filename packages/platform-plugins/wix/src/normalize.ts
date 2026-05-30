import type {
  PrintOpsCustomField,
  PrintOpsCustomFieldScope,
  PrintOpsCustomFieldType,
  PrintOpsNormalizedLineItem,
  PrintOpsNormalizedOrder,
  WixRawOrder,
} from "./types";

const orderCustomFieldContainers = [
  "customFields",
  "additionalInfo",
  "buyerInfo.customFields",
  "billingInfo.customFields",
  "checkoutCustomFields",
];

const lineItemCustomFieldContainers = ["customFields", "options", "additionalInfo"];

export function normalizeWixOrder(raw: WixRawOrder): PrintOpsNormalizedOrder {
  const lineItems = readArray(readPath(raw, "lineItems")).map((item) => normalizeWixLineItem(asRecord(item) ?? {}));

  return {
    sourcePlatform: "wix",
    sourceOrderId: readString(raw.id ?? raw._id) ?? "",
    orderNumber: readString(raw.number ?? raw.orderNumber),
    createdAt: readString(raw.createdDate ?? raw.createdAt),
    updatedAt: readString(raw.updatedDate ?? raw.updatedAt),
    paymentStatus: readString(readPath(raw, "paymentStatus") ?? readPath(raw, "payment.status")),
    fulfillmentStatus: readString(readPath(raw, "fulfillmentStatus") ?? readPath(raw, "fulfillment.status")),
    raw,
    customFields: extractCustomFields(raw, orderCustomFieldContainers, "order"),
    lineItems,
  };
}

function normalizeWixLineItem(raw: Record<string, unknown>): PrintOpsNormalizedLineItem {
  return {
    sourceLineItemId: readString(raw.id ?? raw._id),
    title: readString(raw.name ?? raw.productName ?? raw.title),
    sku: readString(raw.sku ?? readPath(raw, "catalogReference.sku")),
    quantity: readNumber(raw.quantity),
    customFields: extractCustomFields(raw, lineItemCustomFieldContainers, "line_item"),
    raw,
  };
}

function extractCustomFields(
  raw: Record<string, unknown>,
  containerPaths: string[],
  scope: PrintOpsCustomFieldScope,
): PrintOpsCustomField[] {
  return containerPaths.flatMap((path) => normalizeCustomFieldContainer(readPath(raw, path), scope, path));
}

function normalizeCustomFieldContainer(value: unknown, scope: PrintOpsCustomFieldScope, path: string): PrintOpsCustomField[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => normalizeCustomField(item, scope, `${path}.${index}`));
  }

  const record = asRecord(value);

  if (!record) {
    return [];
  }

  return Object.entries(record).map(([key, fieldValue]) => ({
    key,
    label: labelize(key),
    value: fieldValue,
    type: inferFieldType(fieldValue),
    scope,
    source: "wix",
    path: `${path}.${key}`,
  }));
}

function normalizeCustomField(value: unknown, scope: PrintOpsCustomFieldScope, path: string): PrintOpsCustomField[] {
  const record = asRecord(value);

  if (!record) {
    return [];
  }

  const key = readString(record.key ?? record.name ?? record.id ?? record.fieldKey) ?? path;
  const fieldValue = record.value ?? record.text ?? record.label ?? record.name ?? record;

  return [
    {
      key,
      label: readString(record.label ?? record.title ?? record.name) ?? labelize(key),
      value: fieldValue,
      type: inferFieldType(fieldValue),
      scope,
      source: "wix",
      path,
    },
  ];
}

function readPath(record: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    const currentRecord = asRecord(current);

    return currentRecord ? currentRecord[segment] : undefined;
  }, record);
}

function inferFieldType(value: unknown): PrintOpsCustomFieldType {
  if (typeof value === "number") {
    return "number";
  }

  if (typeof value === "boolean") {
    return "boolean";
  }

  if (typeof value === "string") {
    if (/^https?:\/\//.test(value)) {
      return "url";
    }

    if (!Number.isNaN(Date.parse(value)) && /\d{4}-\d{1,2}-\d{1,2}/.test(value)) {
      return "date";
    }

    return "text";
  }

  return "json";
}

function labelize(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function readNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
