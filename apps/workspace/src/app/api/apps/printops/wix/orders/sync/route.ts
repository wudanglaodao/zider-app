import { countPrintOpsCustomFields, syncWixOrders, type PrintOpsNormalizedOrder, type WixOrderSyncMode } from "@/lib/wix-printops";
import { NextRequest, NextResponse } from "next/server";
import { persistPrintOpsWixOrders } from "@/lib/printops/order-cache";
import { upsertPrintOpsStoreProfile } from "@/lib/printops/store-profile";
import { PRINTOPS_APP_KEY, resolveWixInstanceIdForApp } from "@/lib/wix/app-instance";
import { createPrintOpsWixAccessToken } from "@/lib/wix/oauth";
import { fetchWixSiteProfile } from "@/lib/wix/site-profile";

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
    const storeProfile = await syncStoreProfileFromWix(accessToken, instanceContext.instanceId);
    const result = await syncWixOrders({
      accessToken,
      historyDays,
      lastSyncedAt,
      limit,
      maxPages,
      mode,
    });
    const customFieldCount = result.normalizedOrders.reduce((total, order) => total + countPrintOpsCustomFields(order), 0);
    const persistence = await persistPrintOpsWixOrders({
      appKey: PRINTOPS_APP_KEY,
      instanceId: instanceContext.instanceId,
      orders: result.normalizedOrders,
      syncMode: mode,
    });

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
      persistence,
      storeProfile,
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

async function syncStoreProfileFromWix(accessToken: string, instanceId: string) {
  try {
    const profile = await fetchWixSiteProfile(accessToken);
    const persistence = await upsertPrintOpsStoreProfile({
      ...profile,
      appKey: PRINTOPS_APP_KEY,
      instanceId,
      platform: "wix",
    });

    return {
      persistence,
      status: persistence.status,
    };
  } catch (error) {
    return {
      reason: error instanceof Error ? error.message : "Wix store profile sync failed",
      status: "error" as const,
    };
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
    currency: order.currency,
    customer: order.customer,
    billingAddress: order.billingAddress,
    shippingAddress: order.shippingAddress,
    deliveryMethod: order.deliveryMethod,
    paymentMethod: order.paymentMethod,
    note: order.note,
    tags: order.tags,
    totalItemQuantity: order.totalItemQuantity,
    totals: order.totals,
    customFields: order.customFields,
    lineItems: order.lineItems.map((lineItem) => ({
      sourceLineItemId: lineItem.sourceLineItemId,
      title: lineItem.title,
      sku: lineItem.sku,
      barcode: lineItem.barcode,
      variant: lineItem.variant,
      quantity: lineItem.quantity,
      imageUrl: lineItem.imageUrl,
      price: lineItem.price,
      totalPrice: lineItem.totalPrice,
      options: lineItem.options,
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
