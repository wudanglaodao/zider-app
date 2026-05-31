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
  const dedupeKey = createDedupeKey([
    input.appKey,
    input.platform,
    input.wix.instanceId,
    details.eventType,
    input.wix.eventId,
    details.sourceEntityId,
    input.rawBody,
  ]);

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
    return {
      status: "received" as const,
      eventId: data.id as string,
      eventType: details.eventType,
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

function getString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
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
