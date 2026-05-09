import { importSPKI, jwtVerify } from "jose";
import { createDedupeKey } from "./dedupe";

export type WixDecodedWebhook = {
  token: string;
  decodedPayload: Record<string, unknown>;
  rawEventType: string | null;
  eventType: string;
  eventId: string | null;
  eventTime: string | null;
  instanceId: string | null;
  eventData: Record<string, unknown>;
  dedupeKey: string;
};

export class WixWebhookVerificationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "WixWebhookVerificationError";
  }
}

type WixWebhookName =
  | "app_instance_installed"
  | "app_instance_removed"
  | "paid_plan_purchased"
  | "paid_plan_changed"
  | "paid_plan_auto_renewal_cancelled"
  | "plan_converted_to_paid"
  | "plan_reactivated"
  | "plan_transferred"
  | "unknown";

const WIX_EVENT_ALIASES: Array<[RegExp, WixWebhookName]> = [
  [/app[._-]?instance[._-]?installed|app[._-]?installed|installation/i, "app_instance_installed"],
  [/app[._-]?instance[._-]?removed|app[._-]?removed|uninstall|removal/i, "app_instance_removed"],
  [/paid[._-]?plan[._-]?purchased|plan[._-]?purchased|purchase/i, "paid_plan_purchased"],
  [/paid[._-]?plan[._-]?changed|plan[._-]?changed|upgrade|downgrade/i, "paid_plan_changed"],
  [/auto[._-]?renewal[._-]?cancel/i, "paid_plan_auto_renewal_cancelled"],
  [/converted[._-]?to[._-]?paid/i, "plan_converted_to_paid"],
  [/reactivat/i, "plan_reactivated"],
  [/transfer/i, "plan_transferred"],
];

export function normalizeWixEventType(value: unknown): WixWebhookName {
  const raw = typeof value === "string" ? value : "";

  for (const [pattern, eventName] of WIX_EVENT_ALIASES) {
    if (pattern.test(raw)) {
      return eventName;
    }
  }

  return "unknown";
}

export function getWixPublicKey(appKey: string) {
  const byAppJson = process.env.WIX_WEBHOOK_PUBLIC_KEYS;

  if (byAppJson) {
    try {
      const parsed = JSON.parse(byAppJson) as Record<string, string>;
      const key = parsed[appKey];

      if (key) {
        return normalizePem(key);
      }
    } catch {
      throw new WixWebhookVerificationError("Invalid WIX_WEBHOOK_PUBLIC_KEYS JSON", 500);
    }
  }

  const singleKey = process.env.WIX_WEBHOOK_PUBLIC_KEY;

  if (singleKey) {
    return normalizePem(singleKey);
  }

  throw new WixWebhookVerificationError(`Missing Wix webhook public key for app_key=${appKey}`, 500);
}

export async function verifyWixWebhook(rawBody: string, appKey: string): Promise<WixDecodedWebhook> {
  const token = extractJwt(rawBody);
  const publicKey = await importSPKI(getWixPublicKey(appKey), "RS256");
  const verified = await verifyJwt(token, publicKey);
  const decodedPayload = verified.payload as Record<string, unknown>;

  // Wix sends a JWT whose `data` field is a JSON string. That parsed event
  // has its own `data` field containing the event-specific JSON string.
  const dataEnvelope = getRecord(decodedPayload.data) ?? decodedPayload;
  const nestedEventData = getRecord(dataEnvelope.data) ?? getRecord(decodedPayload.eventData) ?? {};
  const eventTypeRaw = dataEnvelope.eventType ?? decodedPayload.eventType ?? dataEnvelope.eventName ?? decodedPayload.eventName;
  const rawEventType = getString(eventTypeRaw);
  const eventType = normalizeWixEventType(eventTypeRaw);
  const instanceId = getString(dataEnvelope.instanceId ?? decodedPayload.instanceId ?? nestedEventData.instanceId);
  const eventId = getString(dataEnvelope.id ?? dataEnvelope.eventId ?? decodedPayload.id ?? decodedPayload.eventId);
  const eventTime = getTimestampString(dataEnvelope.eventTime ?? dataEnvelope.createdDate ?? decodedPayload.iat);

  return {
    token,
    decodedPayload,
    rawEventType,
    eventType,
    eventId,
    eventTime,
    instanceId,
    eventData: nestedEventData,
    dedupeKey: createDedupeKey([appKey, instanceId, eventId, eventType, rawBody]),
  };
}

function extractJwt(rawBody: string) {
  const trimmed = rawBody.trim();

  if (looksLikeJwt(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const candidate = parsed.token ?? parsed.jwt ?? parsed.body ?? parsed.data;

    if (typeof candidate === "string" && looksLikeJwt(candidate.trim())) {
      return candidate.trim();
    }
  } catch {
    // The body is not JSON. Fall through to the consistent error below.
  }

  throw new WixWebhookVerificationError("Wix webhook body did not contain a JWT");
}

async function verifyJwt(token: string, publicKey: Awaited<ReturnType<typeof importSPKI>>) {
  try {
    return await jwtVerify(token, publicKey, {
      algorithms: ["RS256"],
    });
  } catch (error) {
    throw new WixWebhookVerificationError(error instanceof Error ? error.message : "Wix JWT verification failed");
  }
}

function looksLikeJwt(value: string) {
  return value.split(".").length === 3;
}

function normalizePem(value: string) {
  const normalized = value.replace(/\\n/g, "\n").trim();

  if (normalized.includes("BEGIN PUBLIC KEY")) {
    return normalized;
  }

  return `-----BEGIN PUBLIC KEY-----\n${normalized}\n-----END PUBLIC KEY-----`;
}

function getString(value: unknown) {
  if (typeof value === "string") {
    return value;
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

function getRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return getRecord(parsed);
    } catch {
      return null;
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}
