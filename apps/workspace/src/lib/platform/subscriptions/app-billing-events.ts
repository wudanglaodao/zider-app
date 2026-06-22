import { getSupabaseAdmin } from "@/lib/supabase/server";
import { resolveAppSubscriptionPlan } from "./app-subscription-plans";

type BillingEventInstallationRow = {
  app_id: string;
  app_platform_id: string | null;
  id: string;
};

export type AppBillingEventInput = {
  appKey: string;
  billingProvider: "wix";
  couponName?: string | null;
  cycle?: string | null;
  eventSource?: string | null;
  eventType: string;
  instanceId: string;
  invoiceId?: string | null;
  isFree?: boolean | null;
  isTestEvent?: boolean | null;
  operationTimestamp?: string | null;
  platform: "wix";
  previousCycle?: string | null;
  previousVendorProductId?: string | null;
  rawEventId?: string | null;
  testReason?: string | null;
  vendorProductId?: string | null;
};

export type AppBillingEventResult =
  | {
      installationId: string;
      planId: string;
      status: "processed";
    }
  | {
      reason: string;
      status: "skipped" | "error";
    };

export async function recordAppBillingEventAndUpdateInstallation(input: AppBillingEventInput): Promise<AppBillingEventResult> {
  if (!hasSupabaseEnv()) {
    return {
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const supabase = getSupabaseAdmin();
  const { data: installation, error: installationError } = await supabase
    .from("app_installations")
    .select("id,app_id,app_platform_id")
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId)
    .maybeSingle<BillingEventInstallationRow>();

  if (installationError) {
    return {
      reason: installationError.message,
      status: "error",
    };
  }

  if (!installation) {
    return {
      reason: "Missing app installation for billing event.",
      status: "error",
    };
  }

  const plan = resolveAppSubscriptionPlan(input.appKey, {
    billingProvider: input.billingProvider,
    currentPlanId: input.vendorProductId ?? null,
    currentPlanName: input.vendorProductId ?? null,
    isFree: input.isFree ?? null,
  });
  const isFree = input.isFree ?? plan.id === "free";
  const now = new Date().toISOString();

  const { error: billingEventError } = await supabase.from("app_billing_events").insert({
    app_id: installation.app_id,
    app_key: input.appKey,
    app_platform_id: installation.app_platform_id,
    billing_provider: input.billingProvider,
    coupon_name: input.couponName ?? null,
    cycle: input.cycle ?? null,
    event_source: input.eventSource ?? "live",
    event_type: input.eventType,
    installation_id: installation.id,
    instance_id: input.instanceId,
    invoice_id: input.invoiceId ?? null,
    is_test_event: input.isTestEvent ?? false,
    operation_timestamp: input.operationTimestamp ?? now,
    platform: input.platform,
    previous_cycle: input.previousCycle ?? null,
    previous_vendor_product_id: input.previousVendorProductId ?? null,
    raw_event_id: input.rawEventId ?? null,
    test_reason: input.testReason ?? null,
    vendor_product_id: input.vendorProductId ?? null,
  });

  if (billingEventError && billingEventError.code !== "23505") {
    return {
      reason: billingEventError.message,
      status: "error",
    };
  }

  const { error: installationUpdateError } = await supabase
    .from("app_installations")
    .update({
      billing_provider: input.billingProvider,
      current_plan_id: plan.id === "free" && input.vendorProductId && !isFree ? input.vendorProductId : plan.id,
      current_plan_name: plan.name,
      is_free: isFree,
      last_event_at: input.operationTimestamp ?? now,
      updated_at: now,
    })
    .eq("id", installation.id);

  if (installationUpdateError) {
    return {
      reason: installationUpdateError.message,
      status: "error",
    };
  }

  return {
    installationId: installation.id,
    planId: plan.id,
    status: "processed",
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
