import { NextRequest, NextResponse } from "next/server";
import {
  readPrintOpsWixOrders,
  updatePrintOpsWixOrderPrintStatus,
  type PrintOpsOrderPrintStatus,
} from "@/lib/printops/order-cache";
import { readPrintOpsSubscriptionUsage } from "@/lib/printops/subscription";
import { PRINTOPS_APP_KEY, resolveWixInstanceIdForApp } from "@/lib/wix/app-instance";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = searchParamsToRecord(request.nextUrl.searchParams);
  const instanceContext = await resolveWixInstanceIdForApp(PRINTOPS_APP_KEY, params);

  if (!instanceContext.instanceId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Wix instance. Open PrintOps from Wix, or pass instanceId in local development.",
      },
      { status: 401 },
    );
  }

  const limit = readPositiveInteger(request.nextUrl.searchParams.get("limit")) ?? 50;
  const result = await readPrintOpsWixOrders({
    appKey: PRINTOPS_APP_KEY,
    instanceId: instanceContext.instanceId,
    limit,
  });
  const subscription = await readPrintOpsSubscriptionUsage({
    appKey: PRINTOPS_APP_KEY,
    instanceId: instanceContext.instanceId,
    platform: "wix",
  });

  return NextResponse.json({
    ok: result.status !== "error",
    appKey: PRINTOPS_APP_KEY,
    platform: "wix",
    instance: {
      instanceId: instanceContext.instanceId,
      source: instanceContext.source,
      verified: instanceContext.verified,
    },
    cache: {
      status: result.status,
      reason: result.status === "loaded" ? null : result.reason,
      orderCount: result.orders.length,
    },
    orders: result.orders,
    subscription,
  });
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    instanceId?: string;
    printStatus?: unknown;
    sourceOrderIds?: unknown;
  } | null;
  const params = searchParamsToRecord(request.nextUrl.searchParams);

  if (body?.instanceId) {
    params.instanceId = body.instanceId;
  }

  const instanceContext = await resolveWixInstanceIdForApp(PRINTOPS_APP_KEY, params);

  if (!instanceContext.instanceId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Wix instance. Open PrintOps from Wix, or pass instanceId in local development.",
      },
      { status: 401 },
    );
  }

  const sourceOrderIds = Array.isArray(body?.sourceOrderIds)
    ? body.sourceOrderIds.filter((sourceOrderId): sourceOrderId is string => typeof sourceOrderId === "string")
    : [];
  const printStatus = readPrintStatus(body?.printStatus);

  if (sourceOrderIds.length === 0 || !printStatus) {
    return NextResponse.json(
      {
        ok: false,
        error: "Expected sourceOrderIds and a valid printStatus.",
      },
      { status: 400 },
    );
  }

  const result = await updatePrintOpsWixOrderPrintStatus({
    appKey: PRINTOPS_APP_KEY,
    instanceId: instanceContext.instanceId,
    sourceOrderIds,
    status: printStatus,
  });

  return NextResponse.json(
    {
      ok: result.status === "persisted",
      appKey: PRINTOPS_APP_KEY,
      platform: "wix",
      instance: {
        instanceId: instanceContext.instanceId,
        source: instanceContext.source,
        verified: instanceContext.verified,
      },
      printStatus: result,
    },
    { status: result.status === "error" ? 500 : 200 },
  );
}

function searchParamsToRecord(searchParams: URLSearchParams) {
  const record: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    record[key] = value;
  });

  return record;
}

function readPositiveInteger(value: unknown): number | undefined {
  const numberValue: number | null = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : null;

  if (numberValue === null) {
    return undefined;
  }

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
}

function readPrintStatus(value: unknown): PrintOpsOrderPrintStatus | null {
  if (value !== "unprinted" && value !== "generated" && value !== "printed" && value !== "failed") {
    return null;
  }

  return value;
}
