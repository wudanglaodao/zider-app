import { NextResponse, type NextRequest } from "next/server";
import { waitUntil } from "@vercel/functions";
import { timingSafeEqual } from "crypto";
import { getAppPlatformSecret } from "@/lib/platform-secrets";
import { PRINTOPS_APP_KEY, getAppRegistryEntry } from "@/lib/webhooks/app-registry";
import {
  persistPrintOpsWixBusinessWebhook,
  persistPrintOpsWixForwardedBusinessEvent,
  type PrintOpsWixForwardedEvent,
} from "@/lib/webhooks/printops-business";
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
  const forwarded = await parseForwardedEventRequest(request, rawBody, PRINTOPS_APP_KEY);

  if (forwarded.error) {
    return NextResponse.json({ ok: false, error: forwarded.error }, { status: forwarded.status });
  }

  if (forwarded.event) {
    waitUntil(
      persistPrintOpsWixForwardedBusinessEvent({
        app,
        platform: "wix",
        appKey: PRINTOPS_APP_KEY,
        rawBody,
        rawHeaders,
        forwarded: forwarded.event,
      }).catch((error) => {
        console.error("Failed to persist forwarded PrintOps Wix order event", {
          appKey: PRINTOPS_APP_KEY,
          eventType: forwarded.event?.eventType,
          instanceId: forwarded.event?.instanceId,
          error,
        });
      }),
    );

    return new Response(null, { status: 200 });
  }

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
    deliveryModes: ["wix-jwt-webhook", "wix-cli-event-extension-forward"],
  });
}

type ForwardedParseResult =
  | {
      event: PrintOpsWixForwardedEvent;
      error?: never;
      status?: never;
    }
  | {
      event?: never;
      error: string;
      status: number;
    }
  | {
      event?: null;
      error?: never;
      status?: never;
    };

async function parseForwardedEventRequest(
  request: NextRequest,
  rawBody: string,
  appKey: string,
): Promise<ForwardedParseResult> {
  const source = request.headers.get("x-zider-event-source");
  const auth = request.headers.get("authorization");
  const isForwardedEvent = source === "wix-event-extension" || Boolean(auth?.startsWith("Bearer "));

  if (!isForwardedEvent) {
    return { event: null };
  }

  const expectedSecret = await getPrintOpsForwardSecret(appKey);

  if (!expectedSecret) {
    return {
      error: "Missing ZIDER_WIX_EVENT_FORWARD_SECRETS",
      status: 500,
    };
  }

  const actualSecret = auth?.replace(/^Bearer\s+/i, "").trim() ?? "";

  if (!secretMatches(actualSecret, expectedSecret)) {
    return {
      error: "Invalid PrintOps Wix event forward secret",
      status: 401,
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody) as unknown;
  } catch {
    return {
      error: "Forwarded Wix event body must be JSON",
      status: 400,
    };
  }

  if (!isRecord(parsed)) {
    return {
      error: "Forwarded Wix event body must be an object",
      status: 400,
    };
  }

  if (typeof parsed.eventType !== "string" || !parsed.eventType.trim()) {
    return {
      error: "Forwarded Wix event body must include eventType",
      status: 400,
    };
  }

  return { event: parsed };
}

async function getPrintOpsForwardSecret(appKey: string) {
  const mappedSecret = readForwardSecretFromMap(appKey);

  if (mappedSecret) {
    return mappedSecret;
  }

  const databaseSecret = await getAppPlatformSecret(appKey, "wix");
  return databaseSecret?.webhookSecret?.trim() || null;
}

function readForwardSecretFromMap(appKey: string) {
  const raw = process.env.ZIDER_WIX_EVENT_FORWARD_SECRETS?.trim();

  if (!raw) {
    return null;
  }

  if (!raw.startsWith("{")) {
    return raw;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const record = isRecord(parsed) ? parsed : null;
    const entry = record?.[appKey];

    if (typeof entry === "string" && entry.trim()) {
      return entry.trim();
    }

    if (isRecord(entry)) {
      const secret = entry.secret;

      return typeof secret === "string" && secret.trim() ? secret.trim() : null;
    }
  } catch (error) {
    console.warn("Invalid ZIDER_WIX_EVENT_FORWARD_SECRETS", {
      appKey,
      error: error instanceof Error ? error.message : error,
    });
  }

  return null;
}

function secretMatches(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
