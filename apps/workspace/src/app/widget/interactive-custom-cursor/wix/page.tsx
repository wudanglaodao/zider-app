import type { Metadata } from "next";
import { CURSOR_APP_KEY } from "@/cursor/core";
import { CursorLab } from "@/cursor/preview";
import { getCursorConfigRecord } from "@/lib/cursor/config-store";
import { resolveWixInstanceId } from "@/lib/wix/app-instance";

export const metadata: Metadata = {
  title: "Interactive Custom Cursor - Wix",
  description: "Wix dashboard configuration for the Interactive Custom Cursor app.",
};

export const dynamic = "force-dynamic";

type WixInteractiveCustomCursorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WixInteractiveCustomCursorPage({ searchParams }: WixInteractiveCustomCursorPageProps) {
  const params = await searchParams;
  const context = await resolveWixInstanceId(params);
  const instanceId = context.instanceId ?? "wix-dev-preview";
  const record = await getCursorConfigRecord("wix", instanceId);

  return (
    <CursorLab
      initialConfig={record.draftConfig}
      installContext={{
        appKey: CURSOR_APP_KEY,
        platform: "wix",
        instanceId,
        instanceToken: context.instance,
        configEndpoint: "/widget/interactive-custom-cursor/config",
      }}
      shell="embedded"
    />
  );
}
