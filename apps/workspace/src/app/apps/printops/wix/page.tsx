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
  const initialView = getPrintOpsView(params.view);
  const apiQueryString = createQueryString(params, { excludeKeys: ["view"] });
  const ordersEndpoint = `/api/apps/printops/wix/orders${apiQueryString ? `?${apiQueryString}` : ""}`;
  const syncEndpoint = `/api/apps/printops/wix/orders/sync${apiQueryString ? `?${apiQueryString}` : ""}`;

  return (
    <PrintOpsWorkbench
      initialView={initialView}
      pluginContext={{
        appKey: PRINTOPS_APP_KEY,
        appName: "Zider PrintOps",
        instanceId: instanceContext.instanceId,
        ordersEndpoint,
        platform: "wix",
        source: instanceContext.source,
        syncEndpoint,
        viewLinks: {
          orders: createPluginViewHref(params, "orders"),
          settings: createPluginViewHref(params, "settings"),
          templates: createPluginViewHref(params, "templates"),
        },
        verified: instanceContext.verified,
      }}
    />
  );
}

type PrintOpsPluginView = "orders" | "templates" | "settings";

function getPrintOpsView(value: string | string[] | undefined): PrintOpsPluginView {
  const view = Array.isArray(value) ? value[0] : value;

  return view === "templates" || view === "settings" ? view : "orders";
}

function createPluginViewHref(params: Record<string, string | string[] | undefined>, view: PrintOpsPluginView) {
  const queryString = createQueryString(params, { overrides: { view } });

  return `/apps/printops/wix${queryString ? `?${queryString}` : ""}`;
}

function createQueryString(
  params: Record<string, string | string[] | undefined>,
  options: {
    excludeKeys?: string[];
    overrides?: Record<string, string>;
  } = {},
) {
  const query = new URLSearchParams();
  const excludeKeys = new Set(options.excludeKeys ?? []);

  Object.entries(params).forEach(([key, value]) => {
    if (excludeKeys.has(key) || options.overrides?.[key]) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }

    if (value) {
      query.set(key, value);
    }
  });

  Object.entries(options.overrides ?? {}).forEach(([key, value]) => {
    query.set(key, value);
  });

  return query.toString();
}
