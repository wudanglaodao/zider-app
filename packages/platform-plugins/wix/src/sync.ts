import { createWixOrderSyncWindow, WIX_ORDER_SYNC_DEFAULT_MAX_PAGES } from "./config";
import { normalizeWixOrder } from "./normalize";
import { searchWixOrders } from "./orders";
import type { PrintOpsNormalizedOrder, WixOrderSyncWindow, WixOrderSyncWindowInput, WixRawOrder } from "./types";

export type WixOrderSyncPage = {
  cursor: string | null;
  orders: WixRawOrder[];
  normalizedOrders: PrintOpsNormalizedOrder[];
  raw: unknown;
};

export type WixOrderSyncInput = WixOrderSyncWindowInput & {
  accessToken: string;
  cursor?: string | null;
  limit?: number;
  maxPages?: number;
  onPage?: (page: WixOrderSyncPage) => Promise<void> | void;
};

export type WixOrderSyncResult = {
  window: WixOrderSyncWindow;
  orders: WixRawOrder[];
  normalizedOrders: PrintOpsNormalizedOrder[];
  pages: number;
  nextCursor: string | null;
  reachedPageLimit: boolean;
};

export async function syncWixOrders(input: WixOrderSyncInput): Promise<WixOrderSyncResult> {
  const window = createWixOrderSyncWindow(input);
  const maxPages = input.maxPages ?? WIX_ORDER_SYNC_DEFAULT_MAX_PAGES;
  const orders: WixRawOrder[] = [];
  const normalizedOrders: PrintOpsNormalizedOrder[] = [];
  let cursor = input.cursor ?? null;
  let pages = 0;

  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new Error("Wix order sync `maxPages` must be a positive integer");
  }

  do {
    const page = await searchWixOrders({
      accessToken: input.accessToken,
      cursor,
      limit: input.limit,
      window,
    });
    const normalizedPageOrders = page.orders.map((order) => normalizeWixOrder(order));
    const syncPage: WixOrderSyncPage = {
      cursor: page.cursor,
      orders: page.orders,
      normalizedOrders: normalizedPageOrders,
      raw: page.raw,
    };

    orders.push(...page.orders);
    normalizedOrders.push(...normalizedPageOrders);
    await input.onPage?.(syncPage);

    cursor = page.cursor;
    pages += 1;
  } while (cursor && pages < maxPages);

  return {
    window,
    orders,
    normalizedOrders,
    pages,
    nextCursor: cursor,
    reachedPageLimit: Boolean(cursor),
  };
}
