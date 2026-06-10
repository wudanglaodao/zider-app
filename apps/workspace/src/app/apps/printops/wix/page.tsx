import type { Metadata } from "next";
import { PrintOpsWorkbench } from "@/app/apps/printops/PrintOpsWorkbench";
import { PRINTOPS_APP_KEY, resolveWixInstanceIdForApp } from "@/lib/wix/app-instance";

export const metadata: Metadata = {
  title: "Zider PrintOps - Wix",
  description: "Wix dashboard workspace for Zider PrintOps order printing.",
};

export const dynamic = "force-dynamic";

type PrintOpsWixPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PrintOpsWixPage({ searchParams }: PrintOpsWixPageProps) {
  const params = await searchParams;
  const instanceContext = await resolveWixInstanceIdForApp(PRINTOPS_APP_KEY, params);
  const queryString = createQueryString(params);
  const ordersEndpoint = `/api/apps/printops/wix/orders${queryString ? `?${queryString}` : ""}`;
  const readinessEndpoint = `/api/apps/printops/wix/readiness${queryString ? `?${queryString}&verifyOAuth=1` : "?verifyOAuth=1"}`;
  const syncEndpoint = `/api/apps/printops/wix/orders/sync${queryString ? `?${queryString}` : ""}`;

  return (
    <PrintOpsWorkbench
      initialView="orders"
      pluginContext={{
        appKey: PRINTOPS_APP_KEY,
        appName: "Zider PrintOps",
        instanceId: instanceContext.instanceId,
        ordersEndpoint,
        platform: "wix",
        readinessEndpoint,
        source: instanceContext.source,
        syncEndpoint,
        verified: instanceContext.verified,
      }}
    />
  );
}

function createQueryString(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }

    if (value) {
      query.set(key, value);
    }
  });

  return query.toString();
}
