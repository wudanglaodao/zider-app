import type { PrintOpsNormalizedOrder } from "./types";

export type PrintOpsOrderCacheContext = {
  appKey: string;
  platform?: string;
  instanceId: string;
  syncMode?: string | null;
  eventType?: string | null;
  syncedAt?: Date | string | null;
};

export type PrintOpsOrderCacheRow = {
  app_key: string;
  platform: string;
  instance_id: string;
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
  note: string | null;
  total_item_quantity: number;
  total_amount: number | null;
  total_formatted: string | null;
  line_item_count: number;
  custom_field_count: number;
  normalized_order: PrintOpsNormalizedOrder;
  raw_order: Record<string, unknown>;
  last_sync_mode: string | null;
  last_event_type: string | null;
  synced_at: string;
  updated_at: string;
};

export function toPrintOpsOrderCacheRows(orders: PrintOpsNormalizedOrder[], context: PrintOpsOrderCacheContext) {
  return orders.flatMap((order) => {
    const row = toPrintOpsOrderCacheRow(order, context);

    return row ? [row] : [];
  });
}

export function toPrintOpsOrderCacheRow(order: PrintOpsNormalizedOrder, context: PrintOpsOrderCacheContext): PrintOpsOrderCacheRow | null {
  if (!order.sourceOrderId) {
    return null;
  }

  const syncedAt = toTimestamp(context.syncedAt) ?? new Date().toISOString();

  return {
    app_key: context.appKey,
    platform: context.platform ?? order.sourcePlatform,
    instance_id: context.instanceId,
    source_order_id: order.sourceOrderId,
    source_order_number: order.orderNumber,
    source_created_at: toTimestamp(order.createdAt),
    source_updated_at: toTimestamp(order.updatedAt),
    payment_status: order.paymentStatus,
    fulfillment_status: order.fulfillmentStatus,
    currency: order.currency ?? order.totals.total.currency,
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    delivery_method: order.deliveryMethod,
    payment_method: order.paymentMethod,
    note: order.note,
    total_item_quantity: order.totalItemQuantity,
    total_amount: order.totals.total.amount,
    total_formatted: order.totals.total.formatted,
    line_item_count: order.lineItems.length,
    custom_field_count: countPrintOpsCustomFields(order),
    normalized_order: order,
    raw_order: order.raw,
    last_sync_mode: context.syncMode ?? null,
    last_event_type: context.eventType ?? null,
    synced_at: syncedAt,
    updated_at: syncedAt,
  };
}

export function countPrintOpsCustomFields(order: PrintOpsNormalizedOrder) {
  return (
    order.customFields.length +
    order.lineItems.reduce((total, lineItem) => total + lineItem.customFields.length + lineItem.options.length, 0)
  );
}

function toTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
