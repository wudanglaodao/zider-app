import { NextResponse } from "next/server";
import { getAppPlatformSecret } from "@/lib/platform-secrets";
import { EXISTING_WIX_APPS } from "@/lib/webhooks/app-registry";
import { resolveWixPublicKey } from "@/lib/webhooks/wix";
import { getInteractiveCustomCursorWixCredentials } from "@/lib/wix/oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeChecks = url.searchParams.get("checks") === "1";

  if (!includeChecks) {
    return NextResponse.json({
      ok: true,
      service: "zider-app",
    });
  }

  const wixPublicKeys = parseWixPublicKeys();
  const appKey = url.searchParams.get("app_key");
  const appKeys = appKey ? [appKey] : EXISTING_WIX_APPS.map((app) => app.appKey);
  const wixKeyStatus = Object.fromEntries(
    await Promise.all(
      appKeys.map(async (key) => {
        const resolution = await resolveWixPublicKey(key);
        const secret = await getAppPlatformSecret(key, "wix");
        const value = resolution.publicKey ?? "";

        return [
          key,
          {
            present: Boolean(value),
            source: resolution.source,
            databaseSecretPresent: resolution.databaseSecretPresent,
            databaseAppSecretPresent: Boolean(secret?.appSecret),
            databaseOauthClientIdPresent: Boolean(secret?.oauthClientId),
            databaseOauthClientSecretPresent: Boolean(secret?.oauthClientSecret),
            databaseRefPresent: Boolean(resolution.databaseRef),
            envRef: resolution.envRef,
            looksLikePem: value.includes("BEGIN PUBLIC KEY") && value.includes("END PUBLIC KEY"),
            error: resolution.error,
          },
        ];
      }),
    ),
  );
  const interactiveCursorCredentials = await getInteractiveCustomCursorWixCredentials();

  const legacyWixKeyStatus = Object.fromEntries(
    appKeys.map((key) => {
      const value = wixPublicKeys.value?.[key] ?? "";
      return [
        key,
        {
          present: Boolean(value),
          looksLikePem: value.includes("BEGIN PUBLIC KEY") && value.includes("END PUBLIC KEY"),
        },
      ];
    }),
  );

  return NextResponse.json({
    ok: true,
    service: "zider-app",
    env: {
      supabaseUrl: Boolean(process.env.SUPABASE_URL),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      ziderWorkspaceUrlOverride: Boolean(process.env.ZIDER_WORKSPACE_URL),
      wixInteractiveCustomCursorCredentials: Boolean(interactiveCursorCredentials.clientId && interactiveCursorCredentials.clientSecret),
      wixInteractiveCustomCursorCredentialsSource: interactiveCursorCredentials.source,
      wixWebhookPublicKeyFallback: Boolean(process.env.WIX_WEBHOOK_PUBLIC_KEY),
      wixWebhookPublicKeysJson: wixPublicKeys.valid,
      wixWebhookPublicKeysError: wixPublicKeys.error,
    },
    wixKeyStatus,
    legacyWixKeyStatus,
  });
}

function parseWixPublicKeys() {
  const raw = process.env.WIX_WEBHOOK_PUBLIC_KEYS;

  if (!raw) {
    return {
      valid: false,
      value: null,
      error: "missing",
    };
  }

  try {
    return {
      valid: true,
      value: JSON.parse(raw) as Record<string, string>,
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      value: null,
      error: error instanceof Error ? error.message : "invalid_json",
    };
  }
}
