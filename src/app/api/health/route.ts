import { NextResponse } from "next/server";
import { EXISTING_WIX_APPS } from "@/lib/webhooks/app-registry";

export const runtime = "nodejs";

export function GET(request: Request) {
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
      wixWebhookPublicKeyFallback: Boolean(process.env.WIX_WEBHOOK_PUBLIC_KEY),
      wixWebhookPublicKeysJson: wixPublicKeys.valid,
      wixWebhookPublicKeysError: wixPublicKeys.error,
    },
    wixKeyStatus,
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
