import { toPrintOpsOrderCacheRows, type PrintOpsNormalizedOrder, type WixOrderSyncMode } from "@/lib/wix-printops";
import { readAppInstallationContext } from "@/lib/platform/app-installation";
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

export type PrintOpsOrderPrintStatus = "unprinted" | "generated" | "printed" | "failed";

export type PrintOpsOrderPrintStatusUpdateResult =
  | {
      status: "persisted";
      updatedCount: number;
    }
  | {
      status: "skipped";
      updatedCount: 0;
      reason: string;
    }
  | {
      status: "error";
      updatedCount: 0;
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
  installation_id: string | null;
  platform_store_profile_id: string | null;
  workspace_id: string | null;
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
  print_status: string | null;
  printed_at: string | null;
  print_updated_at: string | null;
  normalized_order: unknown;
  last_sync_mode: string | null;
  last_event_type: string | null;
  synced_at: string;
};

type CachedPrintOpsOrderRowWithoutPrintStatus = Omit<CachedPrintOpsOrderRow, "print_status" | "printed_at" | "print_updated_at">;

type StoreProfileSummaryRow = {
  business_name: string | null;
  id: string;
  platform_site_id: string | null;
  primary_site_url: string | null;
};

type PrintOpsOrderStoreSummary = {
  id: string;
  name: string | null;
  platformSiteId: string | null;
  siteUrl: string | null;
};

const cachedOrderBaseSelectColumns = [
  "installation_id",
  "platform_store_profile_id",
  "workspace_id",
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
] as const;

const cachedOrderPrintStatusSelectColumns = ["print_status", "printed_at", "print_updated_at"] as const;

export type PrintOpsCachedOrder = {
  installationId: string | null;
  platformStoreProfileId: string | null;
  workspaceId: string | null;
  store: PrintOpsOrderStoreSummary | null;
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
  printStatus: string | null;
  printedAt: string | null;
  printUpdatedAt: string | null;
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

  const installationContext = await readAppInstallationContext({
    appKey: input.appKey,
    instanceId: input.instanceId,
    platform: "wix",
  });
  const rows = toPrintOpsOrderCacheRows(input.orders, {
    appKey: input.appKey,
    eventType: input.eventType,
    instanceId: input.instanceId,
    platform: "wix",
    syncMode: input.syncMode,
  }).map((row) => ({
    ...row,
    installation_id: installationContext?.id ?? null,
    member_id: installationContext?.memberId ?? null,
    platform_store_profile_id: installationContext?.platformStoreProfileId ?? null,
    workspace_id: installationContext?.workspaceId ?? null,
  }));

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
    .select([...cachedOrderBaseSelectColumns, ...cachedOrderPrintStatusSelectColumns].join(","))
    .eq("app_key", input.appKey)
    .eq("platform", "wix")
    .eq("instance_id", input.instanceId)
    .order("synced_at", { ascending: false })
    .limit(input.limit ?? 50)
    .returns<CachedPrintOpsOrderRow[]>();

  if (!error) {
    const storeProfilesById = await readStoreProfileSummaries(
      [...new Set((data ?? []).map((row) => row.platform_store_profile_id).filter((id): id is string => Boolean(id)))],
    );

    return {
      status: "loaded",
      orders: (data ?? []).map((row) => mapCachedOrderRow(row, storeProfilesById.get(row.platform_store_profile_id ?? ""))),
    };
  }

  if (isMissingPrintStatusColumnError(error)) {
    return readPrintOpsWixOrdersWithoutPrintStatus(input);
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

async function readPrintOpsWixOrdersWithoutPrintStatus(input: {
  appKey: string;
  instanceId: string;
  limit?: number;
}): Promise<PrintOpsOrderCacheReadResult> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("printops_orders")
    .select(cachedOrderBaseSelectColumns.join(","))
    .eq("app_key", input.appKey)
    .eq("platform", "wix")
    .eq("instance_id", input.instanceId)
    .order("synced_at", { ascending: false })
    .limit(input.limit ?? 50)
    .returns<CachedPrintOpsOrderRowWithoutPrintStatus[]>();

  if (!error) {
    const storeProfilesById = await readStoreProfileSummaries(
      [...new Set((data ?? []).map((row) => row.platform_store_profile_id).filter((id): id is string => Boolean(id)))],
    );

    return {
      status: "loaded",
      orders: (data ?? []).map((row) =>
        mapCachedOrderRow(
          {
            ...row,
            print_status: null,
            print_updated_at: null,
            printed_at: null,
          },
          storeProfilesById.get(row.platform_store_profile_id ?? ""),
        ),
      ),
    };
  }

  return {
    status: "error",
    orders: [],
    reason: error.message ?? "Failed to read PrintOps order cache",
  };
}

export async function updatePrintOpsWixOrderPrintStatus(input: {
  appKey: string;
  instanceId: string;
  sourceOrderIds: string[];
  status: PrintOpsOrderPrintStatus;
}): Promise<PrintOpsOrderPrintStatusUpdateResult> {
  const sourceOrderIds = [...new Set(input.sourceOrderIds.map((sourceOrderId) => sourceOrderId.trim()).filter(Boolean))];

  if (sourceOrderIds.length === 0) {
    return {
      status: "persisted",
      updatedCount: 0,
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      status: "skipped",
      updatedCount: 0,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    };
  }

  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("printops_orders")
    .update({
      print_status: input.status,
      print_updated_at: now,
      printed_at: input.status === "printed" ? now : null,
      updated_at: now,
    })
    .eq("app_key", input.appKey)
    .eq("platform", "wix")
    .eq("instance_id", input.instanceId)
    .in("source_order_id", sourceOrderIds)
    .select("source_order_id");

  if (!error) {
    return {
      status: "persisted",
      updatedCount: data?.length ?? 0,
    };
  }

  if (isMissingPrintStatusColumnError(error)) {
    return {
      status: "skipped",
      updatedCount: 0,
      reason: "Missing print status columns. Run supabase/migrations/20260612_add_printops_order_print_status.sql first.",
    };
  }

  if (isMissingTableError(error)) {
    return {
      status: "skipped",
      updatedCount: 0,
      reason: "Missing printops_orders table. Run supabase/migrations/20260609_add_printops_order_cache.sql first.",
    };
  }

  return {
    status: "error",
    updatedCount: 0,
    reason: error.message ?? "Failed to update PrintOps order print status",
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "42P01" || message.includes("relation") || message.includes("could not find the table");
}

function isMissingPrintStatusColumnError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "42703" || message.includes("print_status") || message.includes("printed_at") || message.includes("print_updated_at");
}

async function readStoreProfileSummaries(profileIds: string[]) {
  const ids = [...new Set(profileIds.map((id) => id.trim()).filter(Boolean))];
  const summariesById = new Map<string, PrintOpsOrderStoreSummary>();

  if (ids.length === 0) {
    return summariesById;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("platform_store_profiles")
    .select("id,business_name,platform_site_id,primary_site_url")
    .in("id", ids)
    .returns<StoreProfileSummaryRow[]>();

  if (error) {
    return summariesById;
  }

  for (const row of data ?? []) {
    summariesById.set(row.id, {
      id: row.id,
      name: row.business_name,
      platformSiteId: row.platform_site_id,
      siteUrl: row.primary_site_url,
    });
  }

  return summariesById;
}

function mapCachedOrderRow(row: CachedPrintOpsOrderRow, store?: PrintOpsOrderStoreSummary): PrintOpsCachedOrder {
  return {
    installationId: row.installation_id,
    platformStoreProfileId: row.platform_store_profile_id,
    store: store ?? null,
    workspaceId: row.workspace_id,
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
    printStatus: row.print_status,
    printedAt: row.print_status === "printed" ? row.printed_at : null,
    printUpdatedAt: row.print_updated_at,
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
