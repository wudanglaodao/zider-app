import { NextRequest, NextResponse } from "next/server";
import { recordAppBillingEventAndUpdateInstallation } from "@/lib/platform/subscriptions/app-billing-events";
import { PRINTOPS_APP_KEY } from "@/lib/wix/app-instance";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = verifyForwardSecret(request);

  if (!auth.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: auth.reason,
      },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json(
      {
        ok: false,
        error: "Expected JSON billing event payload.",
      },
      { status: 400 },
    );
  }

  const event = normalizeWixBillingEvent(body);

  if (!event.instanceId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Wix instance ID in billing event payload.",
      },
      { status: 400 },
    );
  }

  const result = await recordAppBillingEventAndUpdateInstallation({
    appKey: PRINTOPS_APP_KEY,
    billingProvider: "wix",
    couponName: event.couponName,
    cycle: event.cycle,
    eventSource: event.eventSource,
    eventType: event.eventType,
    instanceId: event.instanceId,
    invoiceId: event.invoiceId,
    isFree: event.isFree,
    isTestEvent: event.isTestEvent,
    operationTimestamp: event.operationTimestamp,
    platform: "wix",
    previousCycle: event.previousCycle,
    previousVendorProductId: event.previousVendorProductId,
    testReason: event.testReason,
    vendorProductId: event.vendorProductId,
  });

  return NextResponse.json(
    {
      ok: result.status === "processed",
      result,
    },
    { status: result.status === "error" ? 500 : 200 },
  );
}

function verifyForwardSecret(request: NextRequest): { ok: true } | { ok: false; reason: string } {
  const allowedSecrets = (process.env.ZIDER_WIX_EVENT_FORWARD_SECRETS ?? "")
    .split(",")
    .map((secret) => secret.trim())
    .filter(Boolean);

  if (allowedSecrets.length === 0) {
    return {
      ok: false,
      reason: "Missing ZIDER_WIX_EVENT_FORWARD_SECRETS.",
    };
  }

  const providedSecret =
    request.headers.get("x-zider-wix-event-forward-secret") ??
    request.headers.get("x-zider-event-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (!providedSecret || !allowedSecrets.includes(providedSecret)) {
    return {
      ok: false,
      reason: "Invalid Wix event forward secret.",
    };
  }

  return {
    ok: true,
  };
}

function normalizeWixBillingEvent(body: Record<string, unknown>) {
  const instance = readRecord(body.instance);
  const billing = readRecord(instance?.billing) ?? readRecord(body.billing);
  const data = readRecord(body.data);
  const event = readRecord(body.event);

  return {
    couponName: readString(billing?.source) ?? readString(body.couponName),
    cycle: readString(billing?.billingCycle) ?? readString(body.cycle) ?? readString(data?.cycle),
    eventSource: readString(body.eventSource) ?? "live",
    eventType: readString(body.eventType) ?? readString(body.type) ?? readString(event?.type) ?? "wix_billing_updated",
    instanceId: readString(instance?.instanceId) ?? readString(body.instanceId) ?? readString(data?.instanceId),
    invoiceId: readString(body.invoiceId) ?? readString(data?.invoiceId),
    isFree: readBoolean(instance?.isFree) ?? readBoolean(body.isFree) ?? readBoolean(data?.isFree),
    isTestEvent: readBoolean(body.isTestEvent) ?? readBoolean(data?.isTestEvent),
    operationTimestamp: readString(body.operationTimestamp) ?? readString(body.eventTime) ?? readString(data?.operationTimestamp),
    previousCycle: readString(body.previousCycle) ?? readString(data?.previousCycle),
    previousVendorProductId: readString(body.previousVendorProductId) ?? readString(data?.previousVendorProductId),
    testReason: readString(body.testReason) ?? readString(data?.testReason),
    vendorProductId:
      readString(billing?.packageName) ??
      readString(body.vendorProductId) ??
      readString(body.packageName) ??
      readString(data?.vendorProductId) ??
      readString(data?.packageName),
  };
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}
