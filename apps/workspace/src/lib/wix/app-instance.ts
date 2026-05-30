import { createHmac, timingSafeEqual } from "crypto";
import { CURSOR_APP_KEY } from "@/cursor/core";
import { getAppPlatformSecret } from "@/lib/platform-secrets";

export const PRINTOPS_APP_KEY = "zider_printops";

export type WixInstanceContext = {
  instanceId: string | null;
  siteOwnerId: string | null;
  siteMemberId: string | null;
  rawPayload: Record<string, unknown>;
  verified: boolean;
};

export function getInteractiveCursorWixSecret() {
  return getWixSecretFromEnvironment(CURSOR_APP_KEY);
}

export async function getInteractiveCursorWixSecretFromDatabase() {
  return getWixSecretForApp(CURSOR_APP_KEY);
}

export async function getWixSecretForApp(appKey: string) {
  const databaseSecret = await getAppPlatformSecret(appKey, "wix");

  return databaseSecret?.appSecret || databaseSecret?.oauthClientSecret || getWixSecretFromEnvironment(appKey);
}

function getWixSecretFromEnvironment(appKey: string) {
  const envPrefix = getWixEnvironmentPrefix(appKey);

  return process.env[`${envPrefix}_APP_SECRET`] ?? process.env.WIX_APP_SECRET ?? "";
}

function getWixEnvironmentPrefix(appKey: string) {
  if (appKey === PRINTOPS_APP_KEY) {
    return "WIX_PRINTOPS";
  }

  if (appKey === CURSOR_APP_KEY) {
    return "WIX_INTERACTIVE_CUSTOM_CURSOR";
  }

  return `WIX_${appKey.toUpperCase()}`;
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
  return resolveWixInstanceIdForApp(CURSOR_APP_KEY, searchParams);
}

export async function resolveWixInstanceIdForApp(appKey: string, searchParams: Record<string, string | string[] | undefined>) {
  const instance = getParam(searchParams.instance);
  const parsed = parseWixInstance(instance, await getWixSecretForApp(appKey));

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
