import { NextResponse, type NextRequest } from "next/server";
import { waitUntil } from "@vercel/functions";
import { getAppRegistryEntry, INTERACTIVE_CUSTOM_CURSOR_APP_KEY, isSupportedPlatform } from "@/lib/webhooks/app-registry";
import { persistWixWebhook } from "@/lib/webhooks/persistence";
import { verifyWixWebhook, WixWebhookVerificationError } from "@/lib/webhooks/wix";
import { installInteractiveCustomCursorEmbedScript } from "@/lib/wix/embedded-script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    platform: string;
    appKey: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { platform, appKey } = await context.params;

  if (!isSupportedPlatform(platform)) {
    return NextResponse.json({ ok: false, error: "Unsupported platform" }, { status: 404 });
  }

  const app = getAppRegistryEntry(platform, appKey);

  if (!app) {
    return NextResponse.json({ ok: false, error: "Unknown app_key for platform" }, { status: 404 });
  }

  if (platform !== "wix") {
    return NextResponse.json({ ok: false, error: "Platform receiver is not implemented yet" }, { status: 501 });
  }

  const canonicalAppKey = app.appKey;
  const rawBody = await request.text();
  const rawHeaders = Object.fromEntries(request.headers.entries());

  try {
    const wix = await verifyWixWebhook(rawBody, canonicalAppKey);
    const persistence = persistWixWebhook({
      app,
      platform,
      appKey: canonicalAppKey,
      rawBody,
      rawHeaders,
      wix,
    }).catch((error) => {
      console.error("Failed to persist verified webhook", {
        platform,
        appKey: canonicalAppKey,
        eventType: wix.eventType,
        rawEventType: wix.rawEventType,
        instanceId: wix.instanceId,
        error,
      });
    });

    waitUntil(persistence);

    if (
      canonicalAppKey === INTERACTIVE_CUSTOM_CURSOR_APP_KEY &&
      wix.eventType === "app_instance_installed" &&
      wix.instanceId
    ) {
      waitUntil(
        installInteractiveCustomCursorEmbedScript(wix.instanceId).catch((error) => {
          console.warn("Interactive Custom Cursor embed script setup skipped or failed", {
            instanceId: wix.instanceId,
            error: error instanceof Error ? error.message : error,
          });
        }),
      );
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Failed to process webhook", {
      platform,
      appKey: app?.appKey ?? appKey,
      error,
    });

    if (error instanceof WixWebhookVerificationError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json({ ok: false, error: "Webhook processing failed" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({
    ok: true,
    receiver: "zider-events",
  });
}
