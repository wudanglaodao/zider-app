import { WIX_ORDER_SYNC_DEFAULT_LIMIT, WIX_ORDERS_SEARCH_ENDPOINT } from "./config";
import type { WixOrdersQueryInput, WixOrdersQueryPayload, WixRawOrder } from "./types";

export type WixOrdersSearchResponse = {
  orders: WixRawOrder[];
  cursor: string | null;
  raw: unknown;
};

export function buildWixOrdersSearchPayload(input: Omit<WixOrdersQueryInput, "accessToken">): WixOrdersQueryPayload {
  const cursorPaging: WixOrdersQueryPayload["search"]["cursorPaging"] = {
    limit: input.limit ?? WIX_ORDER_SYNC_DEFAULT_LIMIT,
  };

  if (input.cursor) {
    cursorPaging.cursor = input.cursor;
  }

  return {
    search: {
      filter: {
        status: {
          $ne: "INITIALIZED",
        },
        updatedDate: {
          $gte: input.window.from,
          $lte: input.window.to,
        },
      },
      sort: [
        {
          fieldName: "updatedDate",
          order: "DESC",
        },
      ],
      cursorPaging,
    },
  };
}

export async function searchWixOrders(input: WixOrdersQueryInput): Promise<WixOrdersSearchResponse> {
  const response = await fetch(WIX_ORDERS_SEARCH_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: formatWixAuthorization(input.accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildWixOrdersSearchPayload(input)),
  });
  const raw = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(`Wix orders search failed: ${response.status} ${JSON.stringify(raw)}`);
  }

  const body = asRecord(raw);
  const orders = readArray(body?.orders).flatMap((order) => {
    const record = asRecord(order);

    return record ? [record] : [];
  });
  const metadata = asRecord(body?.metadata);
  const cursorPagingMetadata = asRecord(metadata?.cursorPaging);

  return {
    orders,
    cursor: readString(cursorPagingMetadata?.nextCursor ?? body?.nextCursor),
    raw,
  };
}

function formatWixAuthorization(accessToken: string) {
  return accessToken.trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}
