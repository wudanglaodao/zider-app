export type AppSubscriptionPlatform = "wix";

export type AppSubscriptionPlan = {
  appKey: string;
  id: string;
  limits: {
    monthlyOrders?: number;
    [key: string]: number | undefined;
  };
  name: string;
  provider: AppSubscriptionPlatform;
  wixPackageIds?: string[];
};

export type AppSubscriptionInstallationSnapshot = {
  billingProvider: string | null;
  currentPlanId: string | null;
  currentPlanName: string | null;
  isFree: boolean | null;
};

export type AppSubscriptionUpgradeAction = {
  href: string;
  provider: AppSubscriptionPlatform | "support";
  targetPlanId: string | null;
};

export type AppSubscriptionUsageResult =
  | {
      installation: AppSubscriptionInstallationSnapshot | null;
      plan: AppSubscriptionPlan;
      reason?: never;
      status: "loaded";
      upgrade: AppSubscriptionUpgradeAction;
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
      plan: AppSubscriptionPlan;
      reason: string;
      status: "skipped" | "error";
      upgrade: AppSubscriptionUpgradeAction;
      usage: {
        limit: number;
        metric: string;
        periodEnd: string;
        periodStart: string;
        remaining: number;
        used: number;
      };
    };
