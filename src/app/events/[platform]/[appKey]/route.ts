import { NextResponse, type NextRequest } from "next/server";
import { waitUntil } from "@vercel/functions";
import { CURSOR_APP_KEY } from "@/cursor/core";
import { getAppRegistryEntry, isSupportedPlatform } from "@/lib/webhooks/app-registry";
import {
  createWebhookIngressLog,
  getWebhookIngressRoute,
  updateWebhookIngressLog,
} from "@/lib/webhooks/ingress-log";
import { persistWixWebhook } from "@/lib/webhooks/persistence";
import { classifyWixEvent, verifyWixWebhook, WixWebhookVerificationError } from "@/lib/webhooks/wix";
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
  const startedAt = Date.now();
  const { platform, appKey } = await context.params;
  const requestId = request.headers.get("x-vercel-id") ?? request.headers.get("x-request-id");
  const rawBody = await request.text();
  const rawHeaders = Object.fromEntries(request.headers.entries());
  const ingressLogId = createWebhookIngressLog({
    requestId,
    platform,
    appKey,
    route: getWebhookIngressRoute(),
    method: request.method,
    headers: rawHeaders,
    rawBody,
  });

  logWebhook("info", "wix_webhook_request_received", {
    requestId,
    platform,
    appKey,
  });

  if (!isSupportedPlatform(platform)) {
    queueIngressLogUpdate(ingressLogId, {
      status: "rejected",
      verificationStatus: "skipped",
      processingStatus: "skipped",
      httpStatus: 404,
      errorType: "unsupported_platform",
      errorMessage: "Unsupported platform",
      respondedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    });
    logWebhook("warn", "wix_webhook_rejected", {
      requestId,
      platform,
      appKey,
      reason: "unsupported_platform",
      ms: Date.now() - startedAt,
    });
    return NextResponse.json({ ok: false, error: "Unsupported platform" }, { status: 404 });
  }

  const app = getAppRegistryEntry(platform, appKey);

  if (!app) {
    queueIngressLogUpdate(ingressLogId, {
      status: "rejected",
      verificationStatus: "skipped",
      processingStatus: "skipped",
      httpStatus: 404,
      errorType: "unknown_app_key",
      errorMessage: "Unknown app_key for platform",
      respondedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    });
    logWebhook("warn", "wix_webhook_rejected", {
      requestId,
      platform,
      appKey,
      reason: "unknown_app_key",
      ms: Date.now() - startedAt,
    });
    return NextResponse.json({ ok: false, error: "Unknown app_key for platform" }, { status: 404 });
  }

  if (platform !== "wix") {
    queueIngressLogUpdate(ingressLogId, {
      status: "rejected",
      verificationStatus: "skipped",
      processingStatus: "skipped",
      httpStatus: 501,
      errorType: "platform_not_implemented",
      errorMessage: "Platform receiver is not implemented yet",
      respondedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    });
    logWebhook("warn", "wix_webhook_rejected", {
      requestId,
      platform,
      appKey: app.appKey,
      reason: "platform_not_implemented",
      ms: Date.now() - startedAt,
    });
    return NextResponse.json({ ok: false, error: "Platform receiver is not implemented yet" }, { status: 501 });
  }

  const canonicalAppKey = app.appKey;

  try {
    const wix = await verifyWixWebhook(rawBody, canonicalAppKey);
    const classification = classifyWixEvent(wix);
    const verifiedAt = new Date().toISOString();

    logWebhook("info", "wix_webhook_verified", {
      requestId,
      platform,
      appKey: canonicalAppKey,
      eventType: wix.eventType,
      rawEventType: wix.rawEventType,
      eventId: redactIdentifier(wix.eventId),
      instanceId: redactIdentifier(wix.instanceId),
      bodyBytes: Buffer.byteLength(rawBody),
      ms: Date.now() - startedAt,
    });

    const acceptedIngressPatch = {
      status: "accepted",
      verificationStatus: "verified",
      processingStatus: "accepted",
      httpStatus: 200,
      eventType: wix.eventType,
      rawEventType: wix.rawEventType,
      eventId: wix.eventId,
      eventTime: wix.eventTime,
      instanceId: wix.instanceId,
      eventSource: classification.eventSource,
      isTestEvent: classification.isTestEvent,
      testReason: classification.testReason,
      verifiedAt,
      respondedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    };

    const persistence = Promise.all([
      persistWixWebhook({
        app,
        platform,
        appKey: canonicalAppKey,
        rawBody,
        rawHeaders,
        wix,
      }),
      ingressLogId.then((id) => updateWebhookIngressLog(id, acceptedIngressPatch)),
    ])
      .then(async ([result]) => {
        await updateWebhookIngressLog(await ingressLogId, {
          status: result.status,
          processingStatus: result.status,
          platformEventLogId: result.eventId,
          processedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
        });
      })
      .catch(async (error) => {
        console.error("Failed to persist verified webhook", {
          platform,
          appKey: canonicalAppKey,
          eventType: wix.eventType,
          rawEventType: wix.rawEventType,
          instanceId: wix.instanceId,
          error,
        });
        logWebhook("error", "wix_webhook_persist_failed", {
          requestId,
          platform,
          appKey: canonicalAppKey,
          eventType: wix.eventType,
          rawEventType: wix.rawEventType,
          instanceId: redactIdentifier(wix.instanceId),
          error: error instanceof Error ? error.message : String(error),
        });
        await updateWebhookIngressLog(await ingressLogId, {
          status: "failed",
          processingStatus: "failed",
          errorType: "persist_failed",
          errorMessage: error instanceof Error ? error.message : String(error),
          processedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
        });
      });

    waitUntil(persistence);

    if (canonicalAppKey === CURSOR_APP_KEY && wix.eventType === "app_instance_installed" && wix.instanceId) {
      waitUntil(
        installInteractiveCustomCursorEmbedScript(wix.instanceId).catch((error) => {
          console.warn("Interactive Custom Cursor embed script setup skipped or failed", {
            instanceId: wix.instanceId,
            error: error instanceof Error ? error.message : error,
          });
        }),
      );
    }

    logWebhook("info", "wix_webhook_accepted", {
      requestId,
      platform,
      appKey: canonicalAppKey,
      eventType: wix.eventType,
      rawEventType: wix.rawEventType,
      eventId: redactIdentifier(wix.eventId),
      instanceId: redactIdentifier(wix.instanceId),
      ms: Date.now() - startedAt,
    });

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Failed to process webhook", {
      platform,
      appKey: app?.appKey ?? appKey,
      error,
    });
    logWebhook("error", "wix_webhook_failed", {
      requestId,
      platform,
      appKey: app?.appKey ?? appKey,
      error: error instanceof Error ? error.message : String(error),
      statusCode: error instanceof WixWebhookVerificationError ? error.statusCode : 500,
      ms: Date.now() - startedAt,
    });
    queueIngressLogUpdate(ingressLogId, {
      status: "failed",
      verificationStatus: error instanceof WixWebhookVerificationError ? "failed" : "unknown",
      processingStatus: "skipped",
      httpStatus: error instanceof WixWebhookVerificationError ? error.statusCode : 500,
      errorType: error instanceof WixWebhookVerificationError ? "verification_failed" : "webhook_processing_failed",
      errorMessage: error instanceof Error ? error.message : String(error),
      respondedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
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

function queueIngressLogUpdate(
  ingressLogId: Promise<string | null>,
  input: Parameters<typeof updateWebhookIngressLog>[1],
) {
  waitUntil(ingressLogId.then((id) => updateWebhookIngressLog(id, input)));
}

function logWebhook(level: "info" | "warn" | "error", message: string, details: Record<string, unknown>) {
  const payload = JSON.stringify({
    level,
    message,
    route: "/events/[platform]/[appKey]",
    ...details,
  });

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.info(payload);
}

function redactIdentifier(value: string | null) {
  if (!value) {
    return null;
  }

  return value.length <= 14 ? value : `${value.slice(0, 8)}...${value.slice(-6)}`;
}
