import { NextResponse, type NextRequest } from "next/server";
import { waitUntil } from "@vercel/functions";
import { PRINTOPS_APP_KEY, getAppRegistryEntry } from "@/lib/webhooks/app-registry";
import { persistPrintOpsWixBusinessWebhook } from "@/lib/webhooks/printops-business";
import { isWixAppManagementEventType, verifyWixWebhook, WixWebhookVerificationError } from "@/lib/webhooks/wix";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const app = getAppRegistryEntry("wix", PRINTOPS_APP_KEY);

  if (!app) {
    return NextResponse.json({ ok: false, error: "PrintOps Wix app is not registered" }, { status: 500 });
  }

  const rawBody = await request.text();
  const rawHeaders = Object.fromEntries(request.headers.entries());

  try {
    const wix = await verifyWixWebhook(rawBody, PRINTOPS_APP_KEY);

    if (isWixAppManagementEventType(wix.eventType)) {
      return NextResponse.json(
        {
          ok: false,
          error: "App lifecycle and billing webhooks must use /events/wix/zider_printops",
        },
        { status: 409 },
      );
    }

    waitUntil(
      persistPrintOpsWixBusinessWebhook({
        app,
        platform: "wix",
        appKey: PRINTOPS_APP_KEY,
        rawBody,
        rawHeaders,
        wix,
      }).catch((error) => {
        console.error("Failed to persist PrintOps Wix business webhook", {
          appKey: PRINTOPS_APP_KEY,
          rawEventType: wix.rawEventType,
          instanceId: wix.instanceId,
          error,
        });
      }),
    );

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Failed to process PrintOps Wix business webhook", {
      appKey: PRINTOPS_APP_KEY,
      error,
    });

    if (error instanceof WixWebhookVerificationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ ok: false, error: "Webhook processing failed" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({
    ok: true,
    receiver: "printops-wix-business-webhooks",
    url: "/webhooks/printops/wix",
  });
}
