import { syncWixOrders, type PrintOpsNormalizedOrder, type WixOrderSyncMode } from "@zider/platform-plugins/wix";
import { NextRequest, NextResponse } from "next/server";
import { PRINTOPS_APP_KEY, resolveWixInstanceIdForApp } from "@/lib/wix/app-instance";
import { createPrintOpsWixAccessToken } from "@/lib/wix/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleWixOrderSync(request);
}

export async function POST(request: NextRequest) {
  return handleWixOrderSync(request);
}

async function handleWixOrderSync(request: NextRequest) {
  const body = request.method === "POST" ? await readJsonBody(request) : {};
  const params = {
    ...searchParamsToRecord(request.nextUrl.searchParams),
    ...bodyParamsToRecord(body),
  };
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

  try {
    const mode = readSyncMode(getBodyValue(body, "mode") ?? request.nextUrl.searchParams.get("mode")) ?? "latest";
    const historyDays = readPositiveInteger(getBodyValue(body, "historyDays") ?? request.nextUrl.searchParams.get("historyDays"));
    const limit = readPositiveInteger(getBodyValue(body, "limit") ?? request.nextUrl.searchParams.get("limit"));
    const maxPages = readPositiveInteger(getBodyValue(body, "maxPages") ?? request.nextUrl.searchParams.get("maxPages"));
    const lastSyncedAt = readDate(getBodyValue(body, "lastSyncedAt") ?? request.nextUrl.searchParams.get("lastSyncedAt"));
    const { accessToken } = await createPrintOpsWixAccessToken(instanceContext.instanceId);
    const result = await syncWixOrders({
      accessToken,
      historyDays,
      lastSyncedAt,
      limit,
      maxPages,
      mode,
    });
    const customFieldCount = result.normalizedOrders.reduce(
      (total, order) => total + order.customFields.length + order.lineItems.reduce((lineTotal, lineItem) => lineTotal + lineItem.customFields.length, 0),
      0,
    );

    return NextResponse.json({
      ok: true,
      appKey: PRINTOPS_APP_KEY,
      platform: "wix",
      instance: {
        instanceId: instanceContext.instanceId,
        source: instanceContext.source,
        verified: instanceContext.verified,
      },
      sync: {
        mode,
        window: result.window,
        pages: result.pages,
        orderCount: result.normalizedOrders.length,
        rawOrderCount: result.orders.length,
        customFieldCount,
        nextCursor: result.nextCursor,
        reachedPageLimit: result.reachedPageLimit,
      },
      orders: result.normalizedOrders.slice(0, 25).map(summarizeOrder),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Wix order sync failed",
      },
      { status: 500 },
    );
  }
}

function summarizeOrder(order: PrintOpsNormalizedOrder) {
  return {
    sourceOrderId: order.sourceOrderId,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    customFields: order.customFields,
    lineItems: order.lineItems.map((lineItem) => ({
      sourceLineItemId: lineItem.sourceLineItemId,
      title: lineItem.title,
      sku: lineItem.sku,
      quantity: lineItem.quantity,
      customFields: lineItem.customFields,
    })),
  };
}

async function readJsonBody(request: NextRequest) {
  try {
    const value = (await request.json()) as unknown;

    return getRecord(value) ?? {};
  } catch {
    return {};
  }
}

function searchParamsToRecord(searchParams: URLSearchParams) {
  const record: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    record[key] = value;
  });

  return record;
}

function bodyParamsToRecord(body: Record<string, unknown>) {
  const record: Record<string, string> = {};
  const instance = getString(body.instance);
  const instanceId = getString(body.instanceId);

  if (instance) {
    record.instance = instance;
  }

  if (instanceId) {
    record.instanceId = instanceId;
  }

  return record;
}

function readSyncMode(value: unknown): WixOrderSyncMode | null {
  return value === "latest" || value === "history" ? value : null;
}

function readPositiveInteger(value: unknown): number | undefined {
  const numberValue: number | null = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : null;

  if (numberValue === null) {
    return undefined;
  }

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
}

function readDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getBodyValue(body: Record<string, unknown>, key: string) {
  return body[key];
}

function getRecord(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function getString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}
