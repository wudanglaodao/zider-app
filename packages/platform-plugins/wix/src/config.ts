import type { WixOrderSyncWindow, WixOrderSyncWindowInput } from "./types";

export const WIX_PRINTOPS_APP_KEY = "zider_printops";
export const WIX_PRINTOPS_APP_NAME = "PrintOps";
export const WIX_ORDERS_ENDPOINT = "https://www.wixapis.com/ecom/v1/orders";
export const WIX_ORDERS_SEARCH_ENDPOINT = "https://www.wixapis.com/ecom/v1/orders/search";
export const WIX_ORDER_HISTORY_MAX_DAYS = 7;
export const WIX_ORDER_LATEST_DEFAULT_LOOKBACK_HOURS = 24;
export const WIX_ORDER_SYNC_DEFAULT_LIMIT = 50;
export const WIX_ORDER_SYNC_DEFAULT_MAX_PAGES = 10;

export function createWixOrderSyncWindow(input: WixOrderSyncWindowInput): WixOrderSyncWindow {
  const now = input.now ?? new Date();

  if (Number.isNaN(now.getTime())) {
    throw new Error("Invalid Wix order sync `now` value");
  }

  if (input.mode === "history") {
    const historyDays = input.historyDays ?? WIX_ORDER_HISTORY_MAX_DAYS;

    if (!Number.isInteger(historyDays) || historyDays < 1 || historyDays > WIX_ORDER_HISTORY_MAX_DAYS) {
      throw new Error(`Wix historical order sync is limited to 1-${WIX_ORDER_HISTORY_MAX_DAYS} days in P0`);
    }

    return {
      mode: input.mode,
      from: subtractDays(now, historyDays).toISOString(),
      to: now.toISOString(),
      maxHistoryDays: WIX_ORDER_HISTORY_MAX_DAYS,
    };
  }

  const from =
    input.lastSyncedAt && !Number.isNaN(input.lastSyncedAt.getTime())
      ? input.lastSyncedAt
      : subtractHours(now, WIX_ORDER_LATEST_DEFAULT_LOOKBACK_HOURS);

  return {
    mode: input.mode,
    from: from.toISOString(),
    to: now.toISOString(),
    maxHistoryDays: WIX_ORDER_HISTORY_MAX_DAYS,
  };
}

function subtractDays(date: Date, days: number) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

function subtractHours(date: Date, hours: number) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}
