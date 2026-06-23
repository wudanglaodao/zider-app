import type { AppSubscriptionInstallationSnapshot, AppSubscriptionPlan, AppSubscriptionUpgradeAction } from "./app-subscription-types";

export const PRINTOPS_APP_KEY = "zider_printops";

export const appSubscriptionPlans: Record<string, AppSubscriptionPlan[]> = {
  [PRINTOPS_APP_KEY]: [
    {
      appKey: PRINTOPS_APP_KEY,
      id: "free",
      limits: {
        monthlyOrders: 50,
      },
      name: "Basic",
      provider: "wix",
      wixPackageIds: readPlanPackageIds(PRINTOPS_APP_KEY, "free", ["basic", "free"]),
    },
    {
      appKey: PRINTOPS_APP_KEY,
      id: "starter",
      limits: {
        monthlyOrders: 500,
      },
      name: "Starter",
      provider: "wix",
      wixPackageIds: readPlanPackageIds(PRINTOPS_APP_KEY, "starter", ["starter"]),
    },
    {
      appKey: PRINTOPS_APP_KEY,
      id: "pro",
      limits: {
        monthlyOrders: 3000,
      },
      name: "Pro",
      provider: "wix",
      wixPackageIds: readPlanPackageIds(PRINTOPS_APP_KEY, "pro", ["pro"]),
    },
    {
      appKey: PRINTOPS_APP_KEY,
      id: "business",
      limits: {
        monthlyOrders: 10000,
      },
      name: "Business",
      provider: "wix",
      wixPackageIds: readPlanPackageIds(PRINTOPS_APP_KEY, "business", ["business"]),
    },
  ],
};

export function getAppSubscriptionPlans(appKey: string) {
  return appSubscriptionPlans[appKey] ?? [];
}

export function getFallbackAppSubscriptionPlan(appKey: string): AppSubscriptionPlan {
  return getAppSubscriptionPlans(appKey).find((plan) => plan.id === "free") ?? {
    appKey,
    id: "free",
    limits: {
      monthlyOrders: 0,
    },
    name: "Free",
    provider: "wix",
    wixPackageIds: ["free"],
  };
}

export function resolveAppSubscriptionPlan(appKey: string, installation: AppSubscriptionInstallationSnapshot | null): AppSubscriptionPlan {
  const plans = getAppSubscriptionPlans(appKey);
  const fallbackPlan = getFallbackAppSubscriptionPlan(appKey);

  if (!installation || installation.isFree === true) {
    return fallbackPlan;
  }

  const currentPlanId = normalizePlanText(installation.currentPlanId);
  const currentPlanName = normalizePlanText(installation.currentPlanName);

  const matchedByPackage = plans.find((plan) => plan.wixPackageIds?.some((packageId) => normalizePlanText(packageId) === currentPlanId));

  if (matchedByPackage) {
    return matchedByPackage;
  }

  const matchedByInternalId = plans.find((plan) => normalizePlanText(plan.id) === currentPlanId);

  if (matchedByInternalId) {
    return matchedByInternalId;
  }

  const matchedByName = plans.find((plan) => {
    const normalizedPlanId = normalizePlanText(plan.id);
    const normalizedPlanName = normalizePlanText(plan.name);

    return currentPlanName.includes(normalizedPlanName) || currentPlanId.includes(normalizedPlanId);
  });

  return matchedByName ?? fallbackPlan;
}

export function buildAppSubscriptionUpgradeAction(input: {
  appKey: string;
  currentPlanId: string;
  instanceId?: string | null;
  wixAppId?: string | null;
}): AppSubscriptionUpgradeAction {
  const targetPlanId = resolveNextPlanId(input.appKey, input.currentPlanId);
  const configuredHref = readUpgradeHref(input.appKey, input.instanceId ?? null, input.wixAppId ?? null);

  if (configuredHref) {
    return {
      href: configuredHref,
      provider: "wix",
      targetPlanId,
    };
  }

  return {
    href: `mailto:support@zider.ink?subject=${encodeURIComponent(`Upgrade ${input.appKey} plan`)}`,
    provider: "support",
    targetPlanId,
  };
}

function resolveNextPlanId(appKey: string, currentPlanId: string) {
  const plans = getAppSubscriptionPlans(appKey);
  const currentIndex = plans.findIndex((plan) => plan.id === currentPlanId);

  if (currentIndex < 0) {
    return plans.find((plan) => plan.id !== "free")?.id ?? null;
  }

  return plans[currentIndex + 1]?.id ?? plans[currentIndex]?.id ?? null;
}

function readPlanPackageIds(appKey: string, planId: string, defaults: string[]) {
  const mapping = readPlanPackageIdMapping(appKey);
  const value = mapping[planId];

  if (!value || value.length === 0) {
    return defaults;
  }

  return value;
}

function readPlanPackageIdMapping(appKey: string): Record<string, string[]> {
  const appPrefix = toEnvPrefix(appKey);
  const value = process.env[`${appPrefix}_WIX_PLAN_IDS`];

  if (!value) {
    return {};
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return {};
  }

  if (trimmedValue.startsWith("{")) {
    return parseJsonPlanMapping(trimmedValue);
  }

  return parseCompactPlanMapping(trimmedValue);
}

function parseJsonPlanMapping(value: string): Record<string, string[]> {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(parsed).map(([planId, productIds]) => [
        normalizePlanText(planId),
        Array.isArray(productIds)
          ? productIds.filter((productId): productId is string => typeof productId === "string" && productId.trim().length > 0).map((productId) => productId.trim())
          : typeof productIds === "string"
            ? splitProductIds(productIds)
            : [],
      ]),
    );
  } catch {
    return {};
  }
}

function parseCompactPlanMapping(value: string): Record<string, string[]> {
  return Object.fromEntries(
    value
      .split(";")
      .map((entry) => {
        const [planId, productIds] = entry.split("=");

        return [normalizePlanText(planId), splitProductIds(productIds ?? "")] as const;
      })
      .filter(([planId, productIds]) => planId && productIds.length > 0),
  );
}

function splitProductIds(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readUpgradeHref(appKey: string, instanceId: string | null, wixAppId: string | null) {
  const appId = wixAppId ?? readWixAppIdFromEnvironment(appKey);

  if (!appId || !instanceId) {
    return null;
  }

  return `https://www.wix.com/apps/upgrade/${encodeURIComponent(appId)}?appInstanceId=${encodeURIComponent(instanceId)}`;
}

function readWixAppIdFromEnvironment(appKey: string) {
  const appPrefix = toEnvPrefix(appKey);
  const legacyWixPrefix = appPrefix.replace(/^ZIDER_/, "WIX_");

  return process.env[`${appPrefix}_WIX_APP_ID`] ?? process.env[`${legacyWixPrefix}_APP_ID`] ?? process.env[`${appPrefix}_APP_ID`] ?? null;
}

function normalizePlanText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toEnvPrefix(appKey: string) {
  return appKey.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}
