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
  await resolveWixInstanceIdForApp(PRINTOPS_APP_KEY, params);

  return <PrintOpsWorkbench initialView="orders" />;
}
