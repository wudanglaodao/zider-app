import { getAppPlatformSecret } from "@/lib/platform-secrets";
import { INTERACTIVE_CUSTOM_CURSOR_APP_KEY } from "@/lib/webhooks/app-registry";

export type WixAccessTokenResponse = {
  accessToken: string;
  raw: unknown;
};

export async function createWixAccessToken(instanceId: string): Promise<WixAccessTokenResponse> {
  const credentials = await getInteractiveCustomCursorWixCredentials();
  const clientId = credentials.clientId;
  const clientSecret = credentials.clientSecret;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Interactive Custom Cursor Wix OAuth credentials in app_platform_secrets");
  }

  const response = await fetch("https://www.wixapis.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
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

export async function getInteractiveCustomCursorWixCredentials() {
  const databaseSecret = await getAppPlatformSecret(INTERACTIVE_CUSTOM_CURSOR_APP_KEY, "wix");

  return {
    clientId: databaseSecret?.oauthClientId || process.env.WIX_INTERACTIVE_CUSTOM_CURSOR_APP_ID || "",
    clientSecret: databaseSecret?.oauthClientSecret || process.env.WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET || "",
    source: databaseSecret?.oauthClientId && databaseSecret.oauthClientSecret ? "database" : "env",
  };
}

function extractAccessToken(raw: unknown): string | null {
  const body = getRecord(raw);
  const nestedBody = typeof body?.body === "string" ? getRecordFromJson(body.body) : getRecord(body?.body);
  const accessToken = getString(body?.access_token ?? body?.accessToken ?? nestedBody?.access_token ?? nestedBody?.accessToken);

  return accessToken;
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
