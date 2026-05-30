import { compactVerify, decodeJwt, importSPKI } from "jose";
import { getAppPlatformSecret } from "@/lib/platform-secrets";
import { getSupabaseAdmin } from "@/lib/supabase/server";
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

export type WixEventClassification = {
  eventSource: "live" | "wix_test";
  isTestEvent: boolean;
  testReason: string | null;
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

export type WixPublicKeySource = "database_secret" | "database" | "database_env_ref" | "env_json" | "env_fallback" | "missing";

export type WixPublicKeyResolution = {
  appKey: string;
  publicKey: string | null;
  source: WixPublicKeySource;
  databaseSecretPresent: boolean;
  databaseRef: string | null;
  envRef: string | null;
  error: string | null;
};

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

export async function resolveWixPublicKey(appKey: string): Promise<WixPublicKeyResolution> {
  const databaseSecret = await getAppPlatformSecret(appKey, "wix");

  if (databaseSecret?.webhookPublicKey) {
    return {
      appKey,
      publicKey: normalizePem(databaseSecret.webhookPublicKey),
      source: "database_secret",
      databaseSecretPresent: true,
      databaseRef: null,
      envRef: null,
      error: null,
    };
  }

  const databaseRef = await getDatabaseWixPublicKeyRef(appKey);
  const databaseResolved = resolvePublicKeyRef(databaseRef);

  if (databaseResolved.publicKey) {
    return {
      appKey,
      publicKey: databaseResolved.publicKey,
      source: databaseResolved.source,
      databaseSecretPresent: Boolean(databaseSecret),
      databaseRef,
      envRef: databaseResolved.envRef,
      error: null,
    };
  }

  const envResolved = resolveEnvWixPublicKey(appKey);

  return {
    appKey,
    ...envResolved,
    databaseSecretPresent: Boolean(databaseSecret),
    databaseRef,
  };
}

export async function getWixPublicKey(appKey: string) {
  const resolved = await resolveWixPublicKey(appKey);

  if (resolved.publicKey) {
    return resolved.publicKey;
  }

  if (resolved.error) {
    throw new WixWebhookVerificationError(resolved.error, 500);
  }

  throw new WixWebhookVerificationError(`Missing Wix webhook public key for app_key=${appKey}`, 500);
}

export function resolveEnvWixPublicKey(
  appKey: string,
): Omit<WixPublicKeyResolution, "appKey" | "databaseSecretPresent" | "databaseRef"> {
  const byAppJson = process.env.WIX_WEBHOOK_PUBLIC_KEYS;

  if (byAppJson) {
    const parsed = parseWixPublicKeysJson(byAppJson);

    if (!parsed.ok) {
      return {
        publicKey: null,
        source: "missing",
        envRef: null,
        error: parsed.error,
      };
    }

    const key = parsed.value[appKey];

    if (key) {
      return {
        publicKey: normalizePem(key),
        source: "env_json",
        envRef: "WIX_WEBHOOK_PUBLIC_KEYS",
        error: null,
      };
    }
  }

  const singleKey = process.env.WIX_WEBHOOK_PUBLIC_KEY;

  if (singleKey) {
    return {
      publicKey: normalizePem(singleKey),
      source: "env_fallback",
      envRef: "WIX_WEBHOOK_PUBLIC_KEY",
      error: null,
    };
  }

  return {
    publicKey: null,
    source: "missing",
    envRef: null,
    error: null,
  };
}

export async function verifyWixWebhook(rawBody: string, appKey: string): Promise<WixDecodedWebhook> {
  const token = extractJwt(rawBody);
  const publicKey = await importSPKI(await getWixPublicKey(appKey), "RS256");
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

export function classifyWixEvent(wix: WixDecodedWebhook): WixEventClassification {
  const sampleIndicators = [
    wix.eventData.operationTimeStamp === "2019-12-09T07:44:53.659Z" && "sample_operation_timestamp",
    wix.eventData.expiresOn === "2020-01-09T07:44:53Z" && "sample_expiration_timestamp",
    wix.eventData.vendorProductId === "e8f429d5-0a6a-468f-8044-87f519a53202" && "sample_vendor_product_id",
    wix.eventData.originInstanceId === "07864c16-3a6f-4dd2-9973-028705762b2c" && "sample_origin_instance_id",
    wix.eventData.appId === "5bc2062d-010b-448c-a62a-d6bb269c5a4c" && "sample_app_id",
    wix.eventType === "plan_converted_to_paid" &&
      wix.eventData.operationTimeStamp === "2025-05-06T21:50:23.963Z" &&
      wix.eventData.vendorProductId === "basic" &&
      "sample_plan_converted_to_paid",
  ].filter(Boolean) as string[];

  if (sampleIndicators.length > 0) {
    return {
      eventSource: "wix_test",
      isTestEvent: true,
      testReason: `wix_sample_payload:${sampleIndicators.join(",")}`,
    };
  }

  return {
    eventSource: "live",
    isTestEvent: false,
    testReason: null,
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
    // Use compactVerify (signature only) instead of jwtVerify so that Wix test
    // webhooks with stale `exp` claims are not rejected. Security still comes
    // from RS256 signature verification and dedupe_key replay protection.
    await compactVerify(token, publicKey, { algorithms: ["RS256"] });
    const payload = decodeJwt(token);
    return { payload };
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

function resolvePublicKeyRef(value: string | null): Pick<WixPublicKeyResolution, "publicKey" | "source" | "envRef"> {
  if (!value) {
    return {
      publicKey: null,
      source: "missing",
      envRef: null,
    };
  }

  const normalized = value.replace(/\\n/g, "\n").trim();

  if (normalized.includes("BEGIN PUBLIC KEY")) {
    return {
      publicKey: normalizePem(normalized),
      source: "database",
      envRef: null,
    };
  }

  const envRef = normalized.startsWith("env:") ? normalized.slice(4).trim() : normalized;
  const mappedEnvValue = resolveMappedEnvPublicKey(envRef);

  if (mappedEnvValue) {
    return {
      publicKey: normalizePem(mappedEnvValue),
      source: "database_env_ref",
      envRef,
    };
  }

  const envValue = process.env[envRef];

  if (!envValue) {
    return {
      publicKey: null,
      source: "missing",
      envRef,
    };
  }

  return {
    publicKey: normalizePem(envValue),
    source: "database_env_ref",
    envRef,
  };
}

function resolveMappedEnvPublicKey(envRef: string) {
  const separatorIndex = envRef.indexOf(".");

  if (separatorIndex <= 0 || separatorIndex === envRef.length - 1) {
    return null;
  }

  const envName = envRef.slice(0, separatorIndex);
  const mapKey = envRef.slice(separatorIndex + 1);
  const rawMap = process.env[envName];

  if (!rawMap) {
    return null;
  }

  const parsed = parseWixPublicKeysJson(rawMap);

  if (!parsed.ok) {
    console.warn("Failed to parse Wix webhook public key map ref", {
      envName,
      mapKey,
      error: parsed.error,
    });
    return null;
  }

  return parsed.value[mapKey] ?? null;
}

async function getDatabaseWixPublicKeyRef(appKey: string) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("app_platforms")
      .select("webhook_public_key_ref")
      .eq("platform", "wix")
      .eq("app_key", appKey)
      .maybeSingle();

    if (error) {
      console.warn("Failed to load Wix webhook public key ref", {
        appKey,
        error: error.message,
      });
      return null;
    }

    return typeof data?.webhook_public_key_ref === "string" && data.webhook_public_key_ref.trim()
      ? data.webhook_public_key_ref.trim()
      : null;
  } catch (error) {
    console.warn("Wix webhook public key DB lookup skipped", {
      appKey,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
}

function parseWixPublicKeysJson(raw: string):
  | {
      ok: true;
      value: Record<string, string>;
    }
  | {
      ok: false;
      error: string;
    } {
  try {
    return {
      ok: true,
      value: JSON.parse(raw) as Record<string, string>,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid WIX_WEBHOOK_PUBLIC_KEYS JSON",
    };
  }
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
