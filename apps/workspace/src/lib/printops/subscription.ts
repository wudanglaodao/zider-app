import { readAppSubscriptionUsage } from "@/lib/platform/subscriptions/app-subscription-usage";

export type PrintOpsSubscriptionPlan = {
  id: "free" | "starter" | "pro" | "business" | string;
  monthlyOrderLimit: number;
  name: string;
};

export type PrintOpsSubscriptionUsageResult =
  | {
      installation: {
        billingProvider: string | null;
        currentPlanId: string | null;
        currentPlanName: string | null;
        isFree: boolean | null;
      } | null;
      plan: PrintOpsSubscriptionPlan;
      reason?: never;
      status: "loaded";
      upgrade: {
        href: string;
        provider: "wix" | "support";
        targetPlanId: string | null;
      };
      usage: {
        limit: number;
        metric: string;
        periodEnd: string;
        periodStart: string;
        remaining: number;
        used: number;
      };
    }
  | {
      installation: null;
      plan: PrintOpsSubscriptionPlan;
      reason: string;
      status: "skipped" | "error";
      upgrade: {
        href: string;
        provider: "wix" | "support";
        targetPlanId: string | null;
      };
      usage: {
        limit: number;
        metric: string;
        periodEnd: string;
        periodStart: string;
        remaining: number;
        used: number;
      };
    };

export async function readPrintOpsSubscriptionUsage(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
}): Promise<PrintOpsSubscriptionUsageResult> {
  const result = await readAppSubscriptionUsage(input);

  return {
    ...result,
    plan: {
      id: result.plan.id,
      monthlyOrderLimit: result.plan.limits.monthlyOrders ?? 0,
      name: result.plan.name,
    },
  };
}
