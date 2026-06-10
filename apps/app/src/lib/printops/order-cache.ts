import { toPrintOpsOrderCacheRows, type PrintOpsNormalizedOrder } from "@zider/platform-plugins/wix";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type PrintOpsOrderCachePersistenceResult =
  | {
      status: "persisted";
      persistedCount: number;
    }
  | {
      status: "skipped";
      persistedCount: 0;
      reason: string;
    }
  | {
      status: "error";
      persistedCount: 0;
      reason: string;
    };

type PersistPrintOpsWixOrdersInput = {
  appKey: string;
  eventType?: string | null;
  instanceId: string | null;
  orders: PrintOpsNormalizedOrder[];
};

export async function persistPrintOpsWixOrders(input: PersistPrintOpsWixOrdersInput): Promise<PrintOpsOrderCachePersistenceResult> {
  if (!input.instanceId) {
    return {
      status: "skipped",
      persistedCount: 0,
      reason: "Missing Wix instanceId",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      status: "skipped",
      persistedCount: 0,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    };
  }

  const rows = toPrintOpsOrderCacheRows(input.orders, {
    appKey: input.appKey,
    eventType: input.eventType,
    instanceId: input.instanceId,
    platform: "wix",
  });

  if (rows.length === 0) {
    return {
      status: "persisted",
      persistedCount: 0,
    };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("printops_orders")
    .upsert(rows, { onConflict: "app_key,platform,instance_id,source_order_id" });

  if (!error) {
    return {
      status: "persisted",
      persistedCount: rows.length,
    };
  }

  if (isMissingTableError(error)) {
    return {
      status: "skipped",
      persistedCount: 0,
      reason: "Missing printops_orders table. Run supabase/migrations/20260609_add_printops_order_cache.sql first.",
    };
  }

  return {
    status: "error",
    persistedCount: 0,
    reason: error.message,
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "42P01" || message.includes("relation") || message.includes("printops_orders");
}
