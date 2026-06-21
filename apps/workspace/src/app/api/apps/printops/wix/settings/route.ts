import { NextRequest, NextResponse } from "next/server";
import { persistPrintOpsSettings, readPrintOpsSettings, type PrintOpsSettingsRecord } from "@/lib/printops/settings-store";
import { PRINTOPS_APP_KEY, resolveWixInstanceIdForApp } from "@/lib/wix/app-instance";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = searchParamsToRecord(request.nextUrl.searchParams);
  const instanceContext = await resolveWixInstanceIdForApp(PRINTOPS_APP_KEY, params);

  if (!instanceContext.instanceId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Wix instance. Open PrintOps from Wix, or pass instanceId in local development.",
      },
      { status: 401 },
    );
  }

  const result = await readPrintOpsSettings({
    appKey: PRINTOPS_APP_KEY,
    instanceId: instanceContext.instanceId,
    platform: "wix",
  });

  return NextResponse.json({
    ok: result.status !== "error",
    appKey: PRINTOPS_APP_KEY,
    instance: {
      instanceId: instanceContext.instanceId,
      source: instanceContext.source,
      verified: instanceContext.verified,
    },
    platform: "wix",
    settings: result.settings,
    settingsStore: {
      reason: result.status === "loaded" ? null : result.reason,
      status: result.status,
    },
  });
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    instanceId?: string;
    settings?: unknown;
  } | null;
  const params = searchParamsToRecord(request.nextUrl.searchParams);

  if (body?.instanceId) {
    params.instanceId = body.instanceId;
  }

  const instanceContext = await resolveWixInstanceIdForApp(PRINTOPS_APP_KEY, params);

  if (!instanceContext.instanceId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Wix instance. Open PrintOps from Wix, or pass instanceId in local development.",
      },
      { status: 401 },
    );
  }

  const settings = readSettingsRecord(body?.settings);

  if (!settings) {
    return NextResponse.json(
      {
        ok: false,
        error: "Expected settings object.",
      },
      { status: 400 },
    );
  }

  const result = await persistPrintOpsSettings({
    appKey: PRINTOPS_APP_KEY,
    instanceId: instanceContext.instanceId,
    platform: "wix",
    settings,
  });

  return NextResponse.json(
    {
      ok: result.status !== "error",
      appKey: PRINTOPS_APP_KEY,
      instance: {
        instanceId: instanceContext.instanceId,
        source: instanceContext.source,
        verified: instanceContext.verified,
      },
      platform: "wix",
      settingsStore: result,
    },
    { status: result.status === "error" ? 500 : 200 },
  );
}

function searchParamsToRecord(searchParams: URLSearchParams) {
  const record: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    record[key] = value;
  });

  return record;
}

function readSettingsRecord(value: unknown): PrintOpsSettingsRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  return {
    printLocale: readString(record.printLocale),
    siteLocale: readString(record.siteLocale),
    theme: record.theme === "dark" || record.theme === "light" ? record.theme : null,
    timezone: readString(record.timezone),
    workspaceAccent: readString(record.workspaceAccent),
  };
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}
