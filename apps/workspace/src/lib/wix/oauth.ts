import { getAppPlatformSecret } from "@/lib/platform-secrets";
import { PRINTOPS_APP_KEY } from "@/lib/wix/app-instance";

export type WixAccessTokenResponse = {
  accessToken: string;
  raw: unknown;
};

export async function createPrintOpsWixAccessToken(instanceId: string) {
  return createWixAccessTokenForApp(PRINTOPS_APP_KEY, instanceId);
}

export async function createWixAccessTokenForApp(appKey: string, instanceId: string): Promise<WixAccessTokenResponse> {
  const credentials = await getWixCredentials(appKey);

  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error(`Missing ${appKey} Wix OAuth credentials in app_platform_secrets or environment`);
  }

  const response = await fetch("https://www.wixapis.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      instance_id: instanceId,
    }),
  });
  const raw = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(`Wix access token request failed: ${response.status} ${JSON.stringify(raw)}`);
  }

  const accessToken = extractAccessToken(raw);

  if (!accessToken) {
    throw new Error(`Wix access token response did not include access_token: ${JSON.stringify(raw)}`);
  }

  return {
    accessToken,
    raw,
  };
}

export async function getPrintOpsWixCredentials() {
  return getWixCredentials(PRINTOPS_APP_KEY);
}

export async function getWixCredentials(appKey: string) {
  const databaseSecret = await getAppPlatformSecret(appKey, "wix");
  const envPrefix = getWixCredentialEnvPrefix(appKey);

  return {
    clientId: databaseSecret?.oauthClientId || process.env[`${envPrefix}_APP_ID`] || "",
    clientSecret: databaseSecret?.oauthClientSecret || process.env[`${envPrefix}_APP_SECRET`] || "",
    source: databaseSecret?.oauthClientId && databaseSecret.oauthClientSecret ? "database" : "env",
  };
}

function getWixCredentialEnvPrefix(appKey: string) {
  if (appKey === PRINTOPS_APP_KEY) {
    return "WIX_PRINTOPS";
  }

  return `WIX_${appKey.toUpperCase()}`;
}

function extractAccessToken(raw: unknown): string | null {
  const body = getRecord(raw);
  const nestedBody = typeof body?.body === "string" ? getRecordFromJson(body.body) : getRecord(body?.body);

  return getString(body?.access_token ?? body?.accessToken ?? nestedBody?.access_token ?? nestedBody?.accessToken);
}

function getRecord(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function getRecordFromJson(value: string) {
  try {
    return getRecord(JSON.parse(value));
  } catch {
    return null;
  }
}

function getString(value: unknown) {
  return typeof value === "string" ? value : null;
}
