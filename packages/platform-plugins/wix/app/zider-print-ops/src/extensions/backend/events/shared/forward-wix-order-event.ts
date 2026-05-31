const DEFAULT_INGEST_URL = "https://app.zider.ink/webhooks/printops/wix";
const APP_KEY = "zider_printops";

export type WixOrderEventType =
  | "wix.ecom.v1.order_created"
  | "wix.ecom.v1.order_updated"
  | "wix.ecom.v1.order_approved"
  | "wix.ecom.v1.order_canceled"
  | "wix.ecom.v1.order_fulfilled"
  | "wix.ecom.v1.order_payment_status_updated"
  | "wix.ecom.v1.order_committed";

type JsonRecord = Record<string, unknown>;

export async function forwardWixOrderEvent(eventType: WixOrderEventType, event: unknown) {
  const secret = readEnv("PRINTOPS_WIX_EVENT_FORWARD_SECRET");

  if (!secret) {
    throw new Error("Missing PRINTOPS_WIX_EVENT_FORWARD_SECRET");
  }

  const endpoint = readEnv("PRINTOPS_WIX_EVENT_INGEST_URL") ?? DEFAULT_INGEST_URL;
  const payload = createForwardPayload(eventType, event);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
      "x-zider-event-source": "wix-event-extension",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`PrintOps Wix event ingest failed with ${response.status}: ${await readResponseText(response)}`);
  }
}

export async function forwardWixOrderEventSafely(eventType: WixOrderEventType, event: unknown) {
  try {
    await forwardWixOrderEvent(eventType, event);
  } catch (error) {
    console.error("Failed to forward Wix order event to PrintOps", {
      eventType,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}

function createForwardPayload(eventType: WixOrderEventType, event: unknown) {
  const eventRecord = asRecord(event) ?? {};
  const data = asRecord(eventRecord.data) ?? {};
  const metadata = asRecord(eventRecord.metadata) ?? {};
  const order = asRecord(data.order) ?? asRecord(data.entity) ?? asRecord(eventRecord.entity);
  const entityId = getString(metadata.entityId ?? metadata.entityIdBeforeUpdate ?? eventRecord.entityId);
  const orderId = getString(order?._id ?? order?.id ?? order?.orderId ?? data.orderId ?? entityId);

  return {
    appKey: APP_KEY,
    platform: "wix",
    source: "wix_event_extension",
    eventType,
    eventId: getString(metadata.id ?? metadata.eventId ?? eventRecord.id),
    eventTime: getString(metadata.eventTime ?? metadata.createdDate ?? eventRecord.createdDate),
    instanceId: getString(metadata.instanceId ?? eventRecord.instanceId ?? data.instanceId),
    entityId,
    entityFqdn: getString(metadata.entityFqdn ?? eventRecord.entityFqdn),
    orderId,
    orderNumber: getString(order?.number ?? order?.orderNumber ?? data.orderNumber),
    order,
    data,
    metadata,
    event: eventRecord,
  };
}

function readEnv(name: string) {
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }

  const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
  return meta.env?.[name];
}

function asRecord(value: unknown): JsonRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
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

async function readResponseText(response: Response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
