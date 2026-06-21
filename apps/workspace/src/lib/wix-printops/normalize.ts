import type {
  PrintOpsCustomField,
  PrintOpsCustomFieldScope,
  PrintOpsCustomFieldType,
  PrintOpsNormalizedAddress,
  PrintOpsNormalizedCustomer,
  PrintOpsNormalizedLineItem,
  PrintOpsNormalizedMoney,
  PrintOpsNormalizedOrder,
  WixRawOrder,
} from "./types";

const orderCustomFieldContainers = [
  "customFields",
  "additionalInfo",
  "buyerInfo.customFields",
  "billingInfo.customFields",
  "checkoutCustomFields",
  "checkoutFields",
  "customFieldValues",
  "buyerNote",
  "note",
];

const lineItemCustomFieldContainers = ["customFields", "options", "additionalInfo"];

export function normalizeWixOrder(raw: WixRawOrder): PrintOpsNormalizedOrder {
  const lineItems = readArray(readPath(raw, "lineItems")).map((item) => normalizeWixLineItem(asRecord(item) ?? {}));
  const currency = firstString([
    raw.currency,
    readPath(raw, "priceSummary.total.currency"),
    readPath(raw, "totals.total.currency"),
    readPath(raw, "total.currency"),
  ]);
  const billingAddress = normalizeAddress(
    firstRecord([readPath(raw, "billingInfo.address"), readPath(raw, "billingInfo.contactDetails.address"), readPath(raw, "billingAddress"), readPath(raw, "addresses.billing")]),
    firstRecord([readPath(raw, "billingInfo.contactDetails"), readPath(raw, "buyerInfo"), readPath(raw, "billingInfo")]),
  );
  const shippingAddress = normalizeAddress(
    firstRecord([
      readPath(raw, "shippingInfo.logistics.shippingDestination.address"),
      readPath(raw, "shippingInfo.shippingDestination.address"),
      readPath(raw, "deliveryInfo.address"),
      readPath(raw, "shippingAddress"),
      readPath(raw, "deliveryAddress"),
      readPath(raw, "addresses.shipping"),
    ]),
    firstRecord([
      readPath(raw, "shippingInfo.logistics.shippingDestination.contactDetails"),
      readPath(raw, "shippingInfo.shippingDestination.contactDetails"),
      readPath(raw, "recipientInfo"),
      readPath(raw, "buyerInfo"),
    ]),
  );

  return {
    sourcePlatform: "wix",
    sourceOrderId: firstString([raw.id, raw._id, raw.orderId, raw.entityId]) ?? "",
    orderNumber: firstString([raw.number, raw.orderNumber, raw.displayOrderNumber, raw.orderNo]),
    createdAt: readString(raw.createdDate ?? raw.createdAt),
    updatedAt: readString(raw.updatedDate ?? raw.updatedAt),
    paymentStatus: readString(readPath(raw, "paymentStatus") ?? readPath(raw, "payment.status")),
    fulfillmentStatus: readString(readPath(raw, "fulfillmentStatus") ?? readPath(raw, "fulfillment.status")),
    currency,
    customer: normalizeCustomer(raw),
    billingAddress,
    shippingAddress,
    deliveryMethod: firstString([
      readPath(raw, "shippingInfo.title"),
      readPath(raw, "shippingInfo.deliveryOption"),
      readPath(raw, "shippingInfo.logistics.deliveryTimeSlot.method"),
      readPath(raw, "deliveryInfo.method"),
      readPath(raw, "fulfillment.deliveryMethod"),
      readPath(raw, "shippingMethod"),
    ]),
    paymentMethod: firstString([
      readPath(raw, "billingInfo.paymentMethod"),
      readPath(raw, "payment.method"),
      readPath(raw, "paymentDetails.paymentMethod"),
      readPath(raw, "payments.0.paymentMethod"),
      readPath(raw, "transactions.0.paymentMethod"),
    ]),
    note: firstString([raw.buyerNote, raw.note, raw.customerNote, readPath(raw, "additionalInfo.note")]),
    tags: normalizeTags(raw.tags),
    totalItemQuantity: lineItems.reduce((total, item) => total + (item.quantity ?? 0), 0),
    totals: {
      subtotal: readMoney(firstValue([readPath(raw, "priceSummary.subtotal"), readPath(raw, "totals.subtotal"), raw.subtotal]), currency),
      shipping: readMoney(firstValue([readPath(raw, "priceSummary.shipping"), readPath(raw, "totals.shipping"), readPath(raw, "shippingInfo.cost"), raw.shipping]), currency),
      discount: readMoney(firstValue([readPath(raw, "priceSummary.discount"), readPath(raw, "totals.discount"), raw.discount]), currency),
      tax: readMoney(firstValue([readPath(raw, "priceSummary.tax"), readPath(raw, "totals.tax"), raw.tax]), currency),
      total: readMoney(firstValue([readPath(raw, "priceSummary.total"), readPath(raw, "totals.total"), raw.total]), currency),
    },
    raw,
    customFields: extractCustomFields(raw, orderCustomFieldContainers, "order"),
    lineItems,
  };
}

function normalizeWixLineItem(raw: Record<string, unknown>): PrintOpsNormalizedLineItem {
  const currency = firstString([
    readPath(raw, "price.currency"),
    readPath(raw, "priceData.price.currency"),
    readPath(raw, "totalPrice.currency"),
    readPath(raw, "priceData.totalPrice.currency"),
  ]);
  const options = extractCustomFields(raw, ["options", "lineItemOptions", "selectedOptions", "catalogReference.options"], "line_item");

  return {
    sourceLineItemId: readString(raw.id ?? raw._id),
    title: firstString([
      raw.name,
      raw.productName,
      raw.title,
      readPath(raw, "productName.original"),
      readPath(raw, "productName.translated"),
      readPath(raw, "productName.value"),
      readPath(raw, "product.name"),
      readPath(raw, "product.title"),
      readPath(raw, "catalogReference.name"),
      readPath(raw, "catalogReference.catalogItemName"),
    ]),
    sku: firstString([raw.sku, readPath(raw, "catalogReference.sku"), readPath(raw, "product.sku"), readPath(raw, "physicalProperties.sku")]),
    barcode: firstString([raw.barcode, raw.productBarcode, readPath(raw, "catalogReference.barcode"), readPath(raw, "product.barcode"), readPath(raw, "physicalProperties.barcode")]),
    variant: firstString([raw.variant, raw.variantName, readPath(raw, "catalogReference.variantId"), readPath(raw, "product.variant")]),
    quantity: readNumber(raw.quantity),
    imageUrl: firstString([raw.image, readPath(raw, "image.url"), readPath(raw, "media.url"), readPath(raw, "productImage.url"), readPath(raw, "product.image.url")]),
    price: readMoney(firstValue([raw.price, readPath(raw, "priceData.price"), readPath(raw, "priceData.discountedPrice"), raw.unitPrice]), currency),
    totalPrice: readMoney(firstValue([raw.totalPrice, readPath(raw, "priceData.totalPrice"), readPath(raw, "priceData.lineItemTotal"), raw.lineItemTotal]), currency),
    options,
    customFields: extractCustomFields(raw, lineItemCustomFieldContainers, "line_item"),
    raw,
  };
}

function normalizeCustomer(raw: Record<string, unknown>): PrintOpsNormalizedCustomer {
  const record = firstRecord([
    readPath(raw, "buyerInfo"),
    readPath(raw, "customer"),
    readPath(raw, "contact"),
    readPath(raw, "billingInfo.contactDetails"),
    readPath(raw, "shippingInfo.logistics.shippingDestination.contactDetails"),
  ]);

  return {
    sourceCustomerId: firstString([readPath(raw, "buyerInfo.id"), readPath(raw, "customer.id"), readPath(raw, "contact.id"), readPath(raw, "contactId")]),
    name: firstString([
      readPath(record ?? {}, "fullName"),
      joinName(readPath(record ?? {}, "firstName"), readPath(record ?? {}, "lastName")),
      readPath(raw, "buyerInfo.fullName"),
      readPath(raw, "billingInfo.contactDetails.fullName"),
      joinName(readPath(raw, "billingInfo.contactDetails.firstName"), readPath(raw, "billingInfo.contactDetails.lastName")),
      readPath(raw, "shippingInfo.logistics.shippingDestination.contactDetails.fullName"),
      joinName(readPath(raw, "shippingInfo.logistics.shippingDestination.contactDetails.firstName"), readPath(raw, "shippingInfo.logistics.shippingDestination.contactDetails.lastName")),
      readPath(raw, "shippingInfo.shippingDestination.contactDetails.fullName"),
      joinName(readPath(raw, "shippingInfo.shippingDestination.contactDetails.firstName"), readPath(raw, "shippingInfo.shippingDestination.contactDetails.lastName")),
      readPath(raw, "recipientInfo.fullName"),
      joinName(readPath(raw, "recipientInfo.firstName"), readPath(raw, "recipientInfo.lastName")),
    ]),
    email: firstString([
      readPath(record ?? {}, "email"),
      readPath(raw, "buyerInfo.email"),
      readPath(raw, "billingInfo.contactDetails.email"),
      readPath(raw, "shippingInfo.logistics.shippingDestination.contactDetails.email"),
      readPath(raw, "shippingInfo.shippingDestination.contactDetails.email"),
      readPath(raw, "recipientInfo.email"),
    ]),
    phone: firstString([
      readPath(record ?? {}, "phone"),
      readPath(record ?? {}, "phoneNumber"),
      readPath(raw, "buyerInfo.phone"),
      readPath(raw, "billingInfo.contactDetails.phone"),
      readPath(raw, "billingInfo.contactDetails.phoneNumber"),
      readPath(raw, "shippingInfo.logistics.shippingDestination.contactDetails.phone"),
      readPath(raw, "shippingInfo.logistics.shippingDestination.contactDetails.phoneNumber"),
      readPath(raw, "shippingInfo.shippingDestination.contactDetails.phone"),
      readPath(raw, "shippingInfo.shippingDestination.contactDetails.phoneNumber"),
      readPath(raw, "recipientInfo.phone"),
      readPath(raw, "recipientInfo.phoneNumber"),
    ]),
    company: firstString([readPath(record ?? {}, "company"), readPath(record ?? {}, "companyName"), readPath(raw, "billingInfo.contactDetails.company")]),
    taxId: firstString([readPath(record ?? {}, "taxId"), readPath(record ?? {}, "vatId"), readPath(raw, "billingInfo.vatId")]),
    raw: record,
  };
}

function normalizeAddress(addressRecord: Record<string, unknown> | null, contactRecord?: Record<string, unknown> | null): PrintOpsNormalizedAddress | null {
  if (!addressRecord && !contactRecord) {
    return null;
  }

  const address = addressRecord ?? {};
  const contact = contactRecord ?? {};
  const name = firstString([readPath(contact, "fullName"), joinName(readPath(contact, "firstName"), readPath(contact, "lastName")), readPath(address, "name")]);
  const normalized = {
    name,
    company: firstString([readPath(contact, "company"), readPath(contact, "companyName"), readPath(address, "company")]),
    phone: firstString([readPath(contact, "phone"), readPath(contact, "phoneNumber"), readPath(address, "phone")]),
    email: firstString([readPath(contact, "email"), readPath(address, "email")]),
    addressLine1: firstString([readPath(address, "addressLine1"), readPath(address, "streetAddress.name"), readPath(address, "streetAddress.number"), readPath(address, "line1")]),
    addressLine2: firstString([readPath(address, "addressLine2"), readPath(address, "line2"), readPath(address, "apartment")]),
    city: firstString([readPath(address, "city")]),
    subdivision: firstString([readPath(address, "subdivision"), readPath(address, "state"), readPath(address, "region")]),
    postalCode: firstString([readPath(address, "postalCode"), readPath(address, "zipCode"), readPath(address, "zip")]),
    country: firstString([readPath(address, "country"), readPath(address, "countryCode")]),
    formatted: [] as string[],
    raw: addressRecord,
  };

  normalized.formatted = [
    normalized.name,
    normalized.company,
    normalized.addressLine1,
    normalized.addressLine2,
    [normalized.city, normalized.subdivision, normalized.postalCode].filter(Boolean).join(", "),
    normalized.country,
    normalized.phone,
  ].filter((line): line is string => Boolean(line));

  return normalized.formatted.length > 0 ? normalized : null;
}

function extractCustomFields(raw: Record<string, unknown>, containerPaths: string[], scope: PrintOpsCustomFieldScope): PrintOpsCustomField[] {
  return containerPaths.flatMap((path) => normalizeCustomFieldContainer(readPath(raw, path), scope, path));
}

function normalizeCustomFieldContainer(value: unknown, scope: PrintOpsCustomFieldScope, path: string): PrintOpsCustomField[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => normalizeCustomField(item, scope, `${path}.${index}`));
  }

  const record = asRecord(value);

  if (!record) {
    if (value === undefined || value === null || value === "") {
      return [];
    }

    const key = path.split(".").at(-1) ?? path;

    return [
      {
        key,
        label: labelize(key),
        value,
        type: inferFieldType(value),
        scope,
        source: "wix",
        path,
      },
    ];
  }

  if (looksLikeSingleField(record)) {
    return normalizeCustomField(record, scope, path);
  }

  return Object.entries(record).flatMap(([key, fieldValue]) => {
    const nestedRecord = asRecord(fieldValue);

    if (nestedRecord && looksLikeSingleField(nestedRecord)) {
      return normalizeCustomField({ key, ...nestedRecord }, scope, `${path}.${key}`);
    }

    return {
      key,
      label: labelize(key),
      value: fieldValue,
      type: inferFieldType(fieldValue),
      scope,
      source: "wix",
      path: `${path}.${key}`,
    } satisfies PrintOpsCustomField;
  });
}

function normalizeCustomField(value: unknown, scope: PrintOpsCustomFieldScope, path: string): PrintOpsCustomField[] {
  const record = asRecord(value);

  if (!record) {
    return [];
  }

  const key = readString(record.key ?? record.name ?? record.id ?? record.fieldKey) ?? path;
  const fieldValue = record.value ?? record.text ?? record.displayValue ?? record.optionValue ?? record.label ?? record.name ?? record;

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

function readMoney(value: unknown, fallbackCurrency: string | null = null): PrintOpsNormalizedMoney {
  const record = asRecord(value);

  if (!record) {
    const amount = readNumber(value);
    const formatted = typeof value === "string" && amount === null ? value : null;

    return {
      amount,
      currency: fallbackCurrency,
      formatted: formatted ?? formatMoney(amount, fallbackCurrency),
    };
  }

  const amount = firstNumber([record.amount, record.value, record.price, readPath(record, "amount.value")]);
  const currency = firstString([record.currency, record.currencyCode, readPath(record, "amount.currency")]) ?? fallbackCurrency;
  const formatted = firstString([record.formattedAmount, record.formatted, record.displayValue, record.priceFormatted]) ?? formatMoney(amount, currency);

  return {
    amount,
    currency,
    formatted,
  };
}

function readPath(record: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (Array.isArray(current) && /^\d+$/.test(segment)) {
      return current[Number(segment)];
    }

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
      return /\.(gif|jpe?g|png|svg|webp)(\?|$)/i.test(value) ? "image" : "url";
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

function looksLikeSingleField(record: Record<string, unknown>) {
  return Boolean(record.value ?? record.text ?? record.displayValue ?? record.optionValue ?? record.fieldKey);
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((tag) => {
    const tagRecord = asRecord(tag);
    const normalized = readString(tagRecord?.name ?? tagRecord?.label ?? tag);

    return normalized ? [normalized] : [];
  });
}

function firstValue(values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function firstString(values: unknown[]) {
  for (const value of values) {
    const stringValue = readString(value);

    if (stringValue && stringValue.trim()) {
      return stringValue;
    }
  }

  return null;
}

function firstNumber(values: unknown[]) {
  for (const value of values) {
    const numberValue = readNumber(value);

    if (numberValue !== null) {
      return numberValue;
    }
  }

  return null;
}

function firstRecord(values: unknown[]) {
  for (const value of values) {
    const record = asRecord(value);

    if (record) {
      return record;
    }
  }

  return null;
}

function joinName(firstName: unknown, lastName: unknown) {
  const parts = [readString(firstName), readString(lastName)].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" ") : null;
}

function formatMoney(amount: number | null, currency: string | null) {
  if (amount === null) {
    return null;
  }

  return currency ? `${currency} ${amount.toFixed(2)}` : amount.toFixed(2);
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
