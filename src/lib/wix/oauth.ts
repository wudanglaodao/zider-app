export type WixAccessTokenResponse = {
  accessToken: string;
  raw: unknown;
};

export async function createWixAccessToken(instanceId: string): Promise<WixAccessTokenResponse> {
  const clientId = process.env.WIX_INTERACTIVE_CUSTOM_CURSOR_APP_ID;
  const clientSecret = process.env.WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing WIX_INTERACTIVE_CUSTOM_CURSOR_APP_ID or WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET");
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
