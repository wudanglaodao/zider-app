import { toPrintOpsOrderCacheRows, type PrintOpsNormalizedOrder, type WixOrderSyncMode } from "@zider/platform-plugins/wix";
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
  instanceId: string;
  orders: PrintOpsNormalizedOrder[];
  syncMode?: WixOrderSyncMode | null;
  eventType?: string | null;
};

type CachedPrintOpsOrderRow = {
  source_order_id: string;
  source_order_number: string | null;
  source_created_at: string | null;
  source_updated_at: string | null;
  payment_status: string | null;
  fulfillment_status: string | null;
  currency: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  delivery_method: string | null;
  payment_method: string | null;
  total_item_quantity: number | null;
  total_amount: number | null;
  total_formatted: string | null;
  line_item_count: number | null;
  custom_field_count: number | null;
  normalized_order: unknown;
  last_sync_mode: string | null;
  last_event_type: string | null;
  synced_at: string;
};

export type PrintOpsCachedOrder = {
  sourceOrderId: string;
  orderNumber: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  paymentStatus: string | null;
  fulfillmentStatus: string | null;
  currency: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  deliveryMethod: string | null;
  paymentMethod: string | null;
  totalItemQuantity: number;
  totalAmount: number | null;
  totalFormatted: string | null;
  lineItemCount: number;
  customFieldCount: number;
  normalizedOrder: PrintOpsNormalizedOrder | null;
  lastSyncMode: string | null;
  lastEventType: string | null;
  syncedAt: string;
};

export type PrintOpsOrderCacheReadResult =
  | {
      status: "loaded";
      orders: PrintOpsCachedOrder[];
      reason?: never;
    }
  | {
      status: "skipped";
      orders: [];
      reason: string;
    }
  | {
      status: "error";
      orders: [];
      reason: string;
    };

export async function persistPrintOpsWixOrders(input: PersistPrintOpsWixOrdersInput): Promise<PrintOpsOrderCachePersistenceResult> {
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
    syncMode: input.syncMode,
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

export async function readPrintOpsWixOrders(input: {
  appKey: string;
  instanceId: string;
  limit?: number;
}): Promise<PrintOpsOrderCacheReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      status: "skipped",
      orders: [],
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("printops_orders")
    .select(
      [
        "source_order_id",
        "source_order_number",
        "source_created_at",
        "source_updated_at",
        "payment_status",
        "fulfillment_status",
        "currency",
        "customer_name",
        "customer_email",
        "customer_phone",
        "delivery_method",
        "payment_method",
        "total_item_quantity",
        "total_amount",
        "total_formatted",
        "line_item_count",
        "custom_field_count",
        "normalized_order",
        "last_sync_mode",
        "last_event_type",
        "synced_at",
      ].join(","),
    )
    .eq("app_key", input.appKey)
    .eq("platform", "wix")
    .eq("instance_id", input.instanceId)
    .order("synced_at", { ascending: false })
    .limit(input.limit ?? 50)
    .returns<CachedPrintOpsOrderRow[]>();

  if (!error) {
    return {
      status: "loaded",
      orders: (data ?? []).map(mapCachedOrderRow),
    };
  }

  if (isMissingTableError(error)) {
    return {
      status: "skipped",
      orders: [],
      reason: "Missing printops_orders table. Run supabase/migrations/20260609_add_printops_order_cache.sql first.",
    };
  }

  return {
    status: "error",
    orders: [],
    reason: error.message ?? "Failed to read PrintOps order cache",
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "42P01" || message.includes("relation") || message.includes("printops_orders");
}

function mapCachedOrderRow(row: CachedPrintOpsOrderRow): PrintOpsCachedOrder {
  return {
    sourceOrderId: row.source_order_id,
    orderNumber: row.source_order_number,
    createdAt: row.source_created_at,
    updatedAt: row.source_updated_at,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    currency: row.currency,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    deliveryMethod: row.delivery_method,
    paymentMethod: row.payment_method,
    totalItemQuantity: row.total_item_quantity ?? 0,
    totalAmount: row.total_amount,
    totalFormatted: row.total_formatted,
    lineItemCount: row.line_item_count ?? 0,
    customFieldCount: row.custom_field_count ?? 0,
    normalizedOrder: isNormalizedOrder(row.normalized_order) ? row.normalized_order : null,
    lastSyncMode: row.last_sync_mode,
    lastEventType: row.last_event_type,
    syncedAt: row.synced_at,
  };
}

function isNormalizedOrder(value: unknown): value is PrintOpsNormalizedOrder {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Partial<PrintOpsNormalizedOrder>;

  return record.sourcePlatform === "wix" && typeof record.sourceOrderId === "string";
}
