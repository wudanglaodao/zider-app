import { NextResponse, type NextRequest } from "next/server";
import { getAppRegistryEntry, isSupportedPlatform } from "@/lib/webhooks/app-registry";
import { persistWixWebhook } from "@/lib/webhooks/persistence";
import { verifyWixWebhook, WixWebhookVerificationError } from "@/lib/webhooks/wix";

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

  const rawBody = await request.text();
  const rawHeaders = Object.fromEntries(request.headers.entries());

  try {
    const wix = await verifyWixWebhook(rawBody, appKey);
    const result = await persistWixWebhook({
      app,
      platform,
      appKey,
      rawBody,
      rawHeaders,
      wix,
    });

    return NextResponse.json({
      ok: true,
      status: result.status,
      eventType: wix.eventType,
      rawEventType: wix.rawEventType,
      eventId: result.eventId,
    });
  } catch (error) {
    console.error("Failed to process webhook", {
      platform,
      appKey,
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
