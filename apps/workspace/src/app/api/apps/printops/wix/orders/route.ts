import { NextRequest, NextResponse } from "next/server";
import { readPrintOpsWixOrders } from "@/lib/printops/order-cache";
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
  });
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
