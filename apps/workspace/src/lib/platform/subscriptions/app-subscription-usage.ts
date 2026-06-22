import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  PRINTOPS_APP_KEY,
  buildAppSubscriptionUpgradeAction,
  getFallbackAppSubscriptionPlan,
  resolveAppSubscriptionPlan,
} from "./app-subscription-plans";
import type { AppSubscriptionInstallationSnapshot, AppSubscriptionPlatform, AppSubscriptionUsageResult } from "./app-subscription-types";
import { readPrintOpsMonthlyOrderUsage } from "./usage-meters/printops-usage-meter";

type AppInstallationSubscriptionRow = {
  app_platform_id: string | null;
  billing_provider: string | null;
  current_plan_id: string | null;
  current_plan_name: string | null;
  is_free: boolean | null;
};

type AppPlatformSubscriptionRow = {
  platform_app_id: string | null;
};

export async function readAppSubscriptionUsage(input: {
  appKey: string;
  instanceId: string;
  platform: AppSubscriptionPlatform;
}): Promise<AppSubscriptionUsageResult> {
  const period = getCurrentMonthPeriod();
  const fallbackPlan = getFallbackAppSubscriptionPlan(input.appKey);
  const fallbackUpgrade = buildAppSubscriptionUpgradeAction({
    appKey: input.appKey,
    currentPlanId: fallbackPlan.id,
    instanceId: input.instanceId,
  });

  if (!hasSupabaseEnv()) {
    return {
      installation: null,
      plan: fallbackPlan,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
      upgrade: fallbackUpgrade,
      usage: buildUsage(0, fallbackPlan.limits.monthlyOrders ?? 0, period),
    };
  }

  const supabase = getSupabaseAdmin();
  const { data: installation, error: installationError } = await supabase
    .from("app_installations")
    .select("app_platform_id,billing_provider,current_plan_id,current_plan_name,is_free")
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId)
    .maybeSingle<AppInstallationSubscriptionRow>();

  if (installationError) {
    return {
      installation: null,
      plan: fallbackPlan,
      reason: installationError.message ?? "Failed to read app subscription plan",
      status: "error",
      upgrade: fallbackUpgrade,
      usage: buildUsage(0, fallbackPlan.limits.monthlyOrders ?? 0, period),
    };
  }

  const installationSnapshot = installation ? mapInstallationSnapshot(installation) : null;
  const wixAppId = await readWixPlatformAppId({
    appKey: input.appKey,
    appPlatformId: installation?.app_platform_id ?? null,
    platform: input.platform,
  });
  const plan = resolveAppSubscriptionPlan(input.appKey, installationSnapshot);
  const upgrade = buildAppSubscriptionUpgradeAction({
    appKey: input.appKey,
    currentPlanId: plan.id,
    instanceId: input.instanceId,
    wixAppId,
  });
  const usage = await readMonthlyUsage(input, period);

  if (usage.error) {
    return {
      installation: null,
      plan,
      reason: usage.error.message ?? "Failed to read app subscription usage",
      status: isMissingTableError(usage.error) ? "skipped" : "error",
      upgrade,
      usage: buildUsage(0, plan.limits.monthlyOrders ?? 0, period),
    };
  }

  return {
    installation: installationSnapshot,
    plan,
    status: "loaded",
    upgrade,
    usage: buildUsage(usage.used, plan.limits.monthlyOrders ?? 0, period),
  };
}

function mapInstallationSnapshot(row: AppInstallationSubscriptionRow): AppSubscriptionInstallationSnapshot {
  return {
    billingProvider: row.billing_provider,
    currentPlanId: row.current_plan_id,
    currentPlanName: row.current_plan_name,
    isFree: row.is_free,
  };
}

async function readWixPlatformAppId(input: { appKey: string; appPlatformId: string | null; platform: AppSubscriptionPlatform }) {
  const supabase = getSupabaseAdmin();

  const query = supabase.from("app_platforms").select("platform_app_id");
  const scopedQuery = input.appPlatformId
    ? query.eq("id", input.appPlatformId)
    : query.eq("app_key", input.appKey).eq("platform", input.platform);
  const { data, error } = await scopedQuery.maybeSingle<AppPlatformSubscriptionRow>();

  if (error) {
    return null;
  }

  return data?.platform_app_id ?? null;
}

async function readMonthlyUsage(
  input: {
    appKey: string;
    instanceId: string;
    platform: AppSubscriptionPlatform;
  },
  period: {
    periodEnd: string;
    periodStart: string;
  },
) {
  if (input.appKey === PRINTOPS_APP_KEY && input.platform === "wix") {
    return readPrintOpsMonthlyOrderUsage({
      appKey: input.appKey,
      instanceId: input.instanceId,
      periodEnd: period.periodEnd,
      periodStart: period.periodStart,
      platform: input.platform,
    });
  }

  return {
    error: null,
    used: 0,
  };
}

function buildUsage(used: number, limit: number, period: { periodEnd: string; periodStart: string }) {
  return {
    limit,
    metric: "monthlyOrders",
    periodEnd: period.periodEnd,
    periodStart: period.periodStart,
    remaining: Math.max(limit - used, 0),
    used,
  };
}

function getCurrentMonthPeriod() {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    periodEnd: periodEnd.toISOString(),
    periodStart: periodStart.toISOString(),
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "42P01" || message.includes("relation") || message.includes("could not find the table");
}
