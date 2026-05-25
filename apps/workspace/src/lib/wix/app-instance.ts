import { createHmac, timingSafeEqual } from "crypto";
import { CURSOR_APP_KEY } from "@/cursor/core";
import { getAppPlatformSecret } from "@/lib/platform-secrets";

export type WixInstanceContext = {
  instanceId: string | null;
  siteOwnerId: string | null;
  siteMemberId: string | null;
  rawPayload: Record<string, unknown>;
  verified: boolean;
};

export function getInteractiveCursorWixSecret() {
  return process.env.WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET ?? process.env.WIX_APP_SECRET ?? "";
}

export async function getInteractiveCursorWixSecretFromDatabase() {
  const databaseSecret = await getAppPlatformSecret(CURSOR_APP_KEY, "wix");

  return databaseSecret?.appSecret || databaseSecret?.oauthClientSecret || getInteractiveCursorWixSecret();
}

export function parseWixInstance(instance: string | null | undefined, secret = getInteractiveCursorWixSecret()): WixInstanceContext | null {
  if (!instance) {
    return null;
  }

  const [signature, payload] = instance.split(".");

  if (!signature || !payload) {
    return null;
  }

  const verified = secret ? verifySignature(signature, payload, secret) : false;
  const rawPayload = parsePayload(payload);

  if (!rawPayload) {
    return null;
  }

  return {
    instanceId: getString(rawPayload.instanceId ?? rawPayload.instance_id),
    siteOwnerId: getString(rawPayload.uid ?? rawPayload.siteOwnerId),
    siteMemberId: getString(rawPayload.siteMemberId),
    rawPayload,
    verified,
  };
}

export async function resolveWixInstanceId(searchParams: Record<string, string | string[] | undefined>) {
  const instance = getParam(searchParams.instance);
  const parsed = parseWixInstance(instance, await getInteractiveCursorWixSecretFromDatabase());

  if (parsed?.instanceId && (parsed.verified || process.env.NODE_ENV !== "production")) {
    return {
      instanceId: parsed.instanceId,
      instance,
      verified: parsed.verified,
      source: "instance" as const,
    };
  }

  const devInstanceId = getParam(searchParams.instanceId);

  if (devInstanceId && process.env.NODE_ENV !== "production") {
    return {
      instanceId: devInstanceId,
      instance,
      verified: false,
      source: "dev-instance-id" as const,
    };
  }

  return {
    instanceId: null,
    instance,
    verified: false,
    source: "missing" as const,
  };
}

export function getParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function verifySignature(signature: string, payload: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = decodeBase64Url(signature);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

function parsePayload(payload: string) {
  try {
    return JSON.parse(decodeBase64Url(payload).toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  return Buffer.from(padded, "base64");
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
