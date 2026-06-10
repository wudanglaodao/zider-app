import { normalizeWixOrder, type WixRawOrder } from "@zider/platform-plugins/wix";
import { persistPrintOpsWixOrders, type PrintOpsOrderCachePersistenceResult } from "@/lib/printops/order-cache";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { AppRegistryEntry } from "./app-registry";
import { createDedupeKey } from "./dedupe";
import type { WixDecodedWebhook } from "./wix";

export type PersistPrintOpsWixBusinessWebhookInput = {
  app: AppRegistryEntry;
  platform: "wix";
  appKey: string;
  rawBody: string;
  rawHeaders: Record<string, string>;
  wix: WixDecodedWebhook;
};

export type PrintOpsWixForwardedEvent = {
  source?: unknown;
  eventType?: unknown;
  rawEventType?: unknown;
  eventId?: unknown;
  eventTime?: unknown;
  instanceId?: unknown;
  entityId?: unknown;
  entityFqdn?: unknown;
  orderId?: unknown;
  orderNumber?: unknown;
  order?: unknown;
  data?: unknown;
  metadata?: unknown;
  event?: unknown;
};

export type PersistPrintOpsWixForwardedBusinessEventInput = {
  app: AppRegistryEntry;
  platform: "wix";
  appKey: string;
  rawBody: string;
  rawHeaders: Record<string, string>;
  forwarded: PrintOpsWixForwardedEvent;
};

type BusinessEventDetails = {
  businessDomain: "orders" | "products" | "fulfillment" | "business";
  eventType: string;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  sourceEntityNumber: string | null;
};

export async function persistPrintOpsWixBusinessWebhook(input: PersistPrintOpsWixBusinessWebhookInput) {
  const supabase = getSupabaseAdmin();
  const app = await upsertApp(input.app);
  const appPlatform = await upsertAppPlatform(input.app, app.id);
  const details = getBusinessEventDetails(input.wix);
  const dedupeKey = createDedupeKey([input.wix.dedupeKey, details.eventType, details.sourceEntityId]);

  const payload = {
    app_id: app.id,
    app_key: input.appKey,
    app_platform_id: appPlatform.id,
    platform: input.platform,
    business_domain: details.businessDomain,
    instance_id: input.wix.instanceId,
    event_type: details.eventType,
    event_id: input.wix.eventId,
    event_time: input.wix.eventTime,
    source_entity_type: details.sourceEntityType,
    source_entity_id: details.sourceEntityId,
    source_entity_number: details.sourceEntityNumber,
    dedupe_key: dedupeKey,
    raw_body: input.rawBody,
    raw_jwt: input.wix.token,
    raw_headers: input.rawHeaders,
    decoded_payload: input.wix.decodedPayload,
    event_data: input.wix.eventData,
    event_source: "live",
    is_test_event: false,
    test_reason: null,
    verification_status: "verified",
    processing_status: "received",
    processing_error: null,
    processed_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("app_business_event_logs")
    .insert(payload)
    .select("id")
    .single();

  if (!error && data) {
    const orderCache = await persistOrderCacheFromWixWebhook({
      appKey: input.appKey,
      eventType: details.eventType,
      instanceId: input.wix.instanceId,
      order: getWixWebhookOrder(input.wix),
    });

    return {
      status: "received" as const,
      eventId: data.id as string,
      eventType: details.eventType,
      orderCache,
    };
  }

  if (error && isDuplicateError(error)) {
    const { data: existing, error: lookupError } = await supabase
      .from("app_business_event_logs")
      .select("id")
      .eq("dedupe_key", dedupeKey)
      .single();

    if (lookupError) {
      throw lookupError;
    }

    return {
      status: "duplicate" as const,
      eventId: existing.id as string,
      eventType: details.eventType,
    };
  }

  throw error ?? new Error("Inserted PrintOps business event did not return an id");
}

export async function persistPrintOpsWixForwardedBusinessEvent(input: PersistPrintOpsWixForwardedBusinessEventInput) {
  const supabase = getSupabaseAdmin();
  const app = await upsertApp(input.app);
  const appPlatform = await upsertAppPlatform(input.app, app.id);
  const details = getForwardedBusinessEventDetails(input.forwarded);
  const eventId = getString(input.forwarded.eventId) ?? getString(getForwardedMetadata(input.forwarded).id);
  const eventTime =
    getTimestampString(input.forwarded.eventTime) ??
    getTimestampString(getForwardedMetadata(input.forwarded).eventTime) ??
    getTimestampString(getForwardedMetadata(input.forwarded).createdDate);
  const instanceId = getString(input.forwarded.instanceId) ?? getString(getForwardedMetadata(input.forwarded).instanceId);
  const eventData = getForwardedEventData(input.forwarded);
  const forwardedDedupeParts = [
    input.appKey,
    input.platform,
    instanceId,
    details.eventType,
    eventId,
    details.sourceEntityId,
  ];
  const dedupeKey = createDedupeKey(eventId ? forwardedDedupeParts : [...forwardedDedupeParts, input.rawBody]);

  const payload = {
    app_id: app.id,
    app_key: input.appKey,
    app_platform_id: appPlatform.id,
    platform: input.platform,
    business_domain: details.businessDomain,
    instance_id: instanceId,
    event_type: details.eventType,
    event_id: eventId,
    event_time: eventTime,
    source_entity_type: details.sourceEntityType,
    source_entity_id: details.sourceEntityId,
    source_entity_number: details.sourceEntityNumber,
    dedupe_key: dedupeKey,
    raw_body: input.rawBody,
    raw_jwt: null,
    raw_headers: input.rawHeaders,
    decoded_payload: input.forwarded,
    event_data: eventData,
    event_source: "live",
    is_test_event: false,
    test_reason: null,
    verification_status: "trusted_forward",
    processing_status: "received",
    processing_error: null,
    processed_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("app_business_event_logs")
    .insert(payload)
    .select("id")
    .single();

  if (!error && data) {
    const orderCache = await persistOrderCacheFromWixWebhook({
      appKey: input.appKey,
      eventType: details.eventType,
      instanceId,
      order: getForwardedOrder(input.forwarded),
    });

    return {
      status: "received" as const,
      eventId: data.id as string,
      eventType: details.eventType,
      orderCache,
    };
  }

  if (error && isDuplicateError(error)) {
    const { data: existing, error: lookupError } = await supabase
      .from("app_business_event_logs")
      .select("id")
      .eq("dedupe_key", dedupeKey)
      .single();

    if (lookupError) {
      throw lookupError;
    }

    return {
      status: "duplicate" as const,
      eventId: existing.id as string,
      eventType: details.eventType,
    };
  }

  throw error ?? new Error("Inserted forwarded PrintOps business event did not return an id");
}

function getBusinessEventDetails(wix: WixDecodedWebhook): BusinessEventDetails {
  const rawEventType = wix.rawEventType ?? "";
  const eventType = normalizeBusinessEventType(rawEventType);
  const eventData = wix.eventData;
  const order = getRecord(eventData.order) ?? getRecord(eventData.entity) ?? getRecord(eventData.data) ?? eventData;
  const sourceEntityId = getString(
    eventData.orderId ??
      eventData.entityId ??
      eventData.order_id ??
      order.id ??
      order._id ??
      order.orderId ??
      order.entityId,
  );
  const sourceEntityNumber = getString(order.number ?? order.orderNumber ?? eventData.orderNumber ?? eventData.number);

  return {
    businessDomain: inferBusinessDomain(eventType, rawEventType),
    eventType,
    sourceEntityType: inferSourceEntityType(eventType, rawEventType),
    sourceEntityId,
    sourceEntityNumber,
  };
}

function getForwardedBusinessEventDetails(forwarded: PrintOpsWixForwardedEvent): BusinessEventDetails {
  const rawEventType = getString(forwarded.eventType) ?? getString(forwarded.rawEventType) ?? "";
  const eventType = normalizeBusinessEventType(rawEventType);
  const eventData = getForwardedEventData(forwarded);
  const metadata = getForwardedMetadata(forwarded);
  const order = getForwardedOrder(forwarded) ?? {};
  const sourceEntityId = getString(
    forwarded.orderId ??
      forwarded.entityId ??
      metadata.entityId ??
      metadata.entityIdBeforeUpdate ??
      order.id ??
      order._id ??
      order.orderId ??
      order.entityId,
  );
  const sourceEntityNumber = getString(forwarded.orderNumber ?? order.number ?? order.orderNumber ?? eventData.orderNumber);

  return {
    businessDomain: inferBusinessDomain(eventType, rawEventType),
    eventType,
    sourceEntityType: inferSourceEntityType(eventType, rawEventType),
    sourceEntityId,
    sourceEntityNumber,
  };
}

function normalizeBusinessEventType(rawEventType: string) {
  const raw = rawEventType.trim();

  if (/order[._\-\s]?created|created[._\-\s]?order/i.test(raw)) {
    return "order_created";
  }

  if (/order[._\-\s]?updated|updated[._\-\s]?order/i.test(raw)) {
    return "order_updated";
  }

  if (/order[._\-\s]?cancel|cancelled[._\-\s]?order|canceled[._\-\s]?order/i.test(raw)) {
    return "order_canceled";
  }

  if (/order[._\-\s]?approved|approved[._\-\s]?order/i.test(raw)) {
    return "order_approved";
  }

  if (/order[._\-\s]?committed|committed[._\-\s]?order/i.test(raw)) {
    return "order_committed";
  }

  if (/order[._\-\s]?fulfilled|fulfilled[._\-\s]?order|fulfillment/i.test(raw)) {
    return "order_fulfilled";
  }

  if (/order[._\-\s]?payment[._\-\s]?status[._\-\s]?updated|payment[._\-\s]?status/i.test(raw)) {
    return "order_payment_status_updated";
  }

  if (/order/i.test(raw)) {
    return "order_event";
  }

  if (/product/i.test(raw)) {
    return "product_event";
  }

  if (/fulfill|shipping|delivery/i.test(raw)) {
    return "fulfillment_event";
  }

  return slugify(raw) || "business_event";
}

function inferBusinessDomain(eventType: string, rawEventType: string): BusinessEventDetails["businessDomain"] {
  if (eventType.startsWith("order_") || /order/i.test(rawEventType)) {
    return "orders";
  }

  if (eventType.startsWith("product_") || /product/i.test(rawEventType)) {
    return "products";
  }

  if (eventType.startsWith("fulfillment_") || /fulfill|shipping|delivery/i.test(rawEventType)) {
    return "fulfillment";
  }

  return "business";
}

function inferSourceEntityType(eventType: string, rawEventType: string) {
  if (eventType.startsWith("order_") || /order/i.test(rawEventType)) {
    return "order";
  }

  if (eventType.startsWith("product_") || /product/i.test(rawEventType)) {
    return "product";
  }

  return null;
}

async function persistOrderCacheFromWixWebhook(input: {
  appKey: string;
  eventType: string;
  instanceId: string | null;
  order: Record<string, unknown> | null;
}): Promise<PrintOpsOrderCachePersistenceResult> {
  if (!input.order || !looksLikePrintableOrder(input.order)) {
    return {
      status: "skipped",
      persistedCount: 0,
      reason: "Wix event did not include a full printable order payload",
    };
  }

  const normalizedOrder = normalizeWixOrder(input.order as WixRawOrder);

  if (!normalizedOrder.sourceOrderId) {
    return {
      status: "skipped",
      persistedCount: 0,
      reason: "Wix order payload did not include an order id",
    };
  }

  const result = await persistPrintOpsWixOrders({
    appKey: input.appKey,
    eventType: input.eventType,
    instanceId: input.instanceId,
    orders: [normalizedOrder],
  });

  if (result.status === "error") {
    console.warn("Failed to update PrintOps order cache from Wix webhook", {
      appKey: input.appKey,
      eventType: input.eventType,
      instanceId: input.instanceId,
      reason: result.reason,
    });
  }

  return result;
}

async function upsertApp(app: AppRegistryEntry) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("zider_apps")
    .upsert(
      {
        app_key: app.appKey,
        app_name: app.appName,
        app_category: app.appCategory ?? "wix_existing_app",
        status: app.status,
      },
      { onConflict: "app_key" },
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertAppPlatform(app: AppRegistryEntry, appId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_platforms")
    .upsert(
      {
        app_id: appId,
        app_key: app.appKey,
        platform: app.platform,
        platform_app_id: app.platformAppId ?? null,
        platform_app_name: app.appName,
        status: app.status,
        default_billing_provider: app.billingProvider,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "app_key,platform" },
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function getRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try {
      return getRecord(JSON.parse(value) as unknown);
    } catch {
      return null;
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function getForwardedEventData(forwarded: PrintOpsWixForwardedEvent) {
  const event = getRecord(forwarded.event) ?? {};
  const data = getRecord(forwarded.data) ?? getRecord(event.data) ?? {};
  const metadata = getForwardedMetadata(forwarded);
  const order = getForwardedOrder(forwarded);

  return {
    source: getString(forwarded.source) ?? "wix_event_extension",
    eventType: getString(forwarded.eventType) ?? getString(forwarded.rawEventType),
    eventId: getString(forwarded.eventId) ?? getString(metadata.id),
    eventTime: getTimestampString(forwarded.eventTime) ?? getTimestampString(metadata.eventTime),
    instanceId: getString(forwarded.instanceId) ?? getString(metadata.instanceId),
    entityId: getString(forwarded.entityId) ?? getString(metadata.entityId),
    entityFqdn: getString(forwarded.entityFqdn) ?? getString(metadata.entityFqdn),
    orderId: getString(forwarded.orderId) ?? getString(order?.id ?? order?._id ?? order?.orderId),
    orderNumber: getString(forwarded.orderNumber) ?? getString(order?.number ?? order?.orderNumber),
    data,
    metadata,
    order,
    event,
  };
}

function getForwardedMetadata(forwarded: PrintOpsWixForwardedEvent) {
  const event = getRecord(forwarded.event) ?? {};
  return getRecord(forwarded.metadata) ?? getRecord(event.metadata) ?? {};
}

function getForwardedOrder(forwarded: PrintOpsWixForwardedEvent) {
  const event = getRecord(forwarded.event) ?? {};
  const data = getRecord(forwarded.data) ?? getRecord(event.data) ?? {};
  return getRecord(forwarded.order) ?? getRecord(data.order) ?? getRecord(data.entity) ?? getRecord(event.entity);
}

function getWixWebhookOrder(wix: WixDecodedWebhook) {
  const eventData = wix.eventData;
  const order =
    getRecord(eventData.order) ??
    getRecord(eventData.entity) ??
    getRecord(eventData.data) ??
    getRecord(eventData.orderData) ??
    (looksLikePrintableOrder(eventData) ? eventData : null);

  return order && looksLikePrintableOrder(order) ? order : null;
}

function looksLikePrintableOrder(value: unknown): value is Record<string, unknown> {
  const record = getRecord(value);

  if (!record) {
    return false;
  }

  return Boolean(
    Array.isArray(record.lineItems) ||
      getRecord(record.billingInfo) ||
      getRecord(record.shippingInfo) ||
      getRecord(record.priceSummary) ||
      getRecord(record.totals) ||
      getRecord(record.buyerInfo),
  );
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

function getTimestampString(value: unknown) {
  if (typeof value === "string") {
    const numeric = Number(value);

    if (Number.isFinite(numeric) && value.trim() !== "") {
      return timestampFromNumber(numeric);
    }

    return value;
  }

  if (typeof value === "number") {
    return timestampFromNumber(value);
  }

  return null;
}

function timestampFromNumber(value: number) {
  const milliseconds = value > 10_000_000_000 ? value : value * 1000;
  return new Date(milliseconds).toISOString();
}

function slugify(value: string) {
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function isDuplicateError(error: { code?: string }) {
  return error.code === "23505";
}
