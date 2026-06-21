import { NextRequest, NextResponse } from "next/server";
import { persistPrintOpsTemplates, readPrintOpsTemplates, type PrintOpsTemplateRecord } from "@/lib/printops/template-store";
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

  const result = await readPrintOpsTemplates({
    appKey: PRINTOPS_APP_KEY,
    instanceId: instanceContext.instanceId,
    platform: "wix",
  });

  return NextResponse.json({
    ok: result.status !== "error",
    appKey: PRINTOPS_APP_KEY,
    platform: "wix",
    instance: {
      instanceId: instanceContext.instanceId,
      source: instanceContext.source,
      verified: instanceContext.verified,
    },
    selectedTemplateId: result.selectedTemplateId,
    templates: result.templates,
    templateStore: {
      reason: result.status === "loaded" ? null : result.reason,
      status: result.status,
      templateCount: result.templates.length,
    },
  });
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    instanceId?: string;
    selectedTemplateId?: unknown;
    templates?: unknown;
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

  const templates = readTemplateRecords(body?.templates);

  if (!templates) {
    return NextResponse.json(
      {
        ok: false,
        error: "Expected templates array.",
      },
      { status: 400 },
    );
  }

  const result = await persistPrintOpsTemplates({
    appKey: PRINTOPS_APP_KEY,
    instanceId: instanceContext.instanceId,
    platform: "wix",
    selectedTemplateId: readString(body?.selectedTemplateId),
    templates,
  });

  return NextResponse.json(
    {
      ok: result.status !== "error",
      appKey: PRINTOPS_APP_KEY,
      platform: "wix",
      instance: {
        instanceId: instanceContext.instanceId,
        source: instanceContext.source,
        verified: instanceContext.verified,
      },
      templateStore: result,
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

function readTemplateRecords(value: unknown): PrintOpsTemplateRecord[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.filter((item): item is PrintOpsTemplateRecord => Boolean(item && typeof item === "object" && !Array.isArray(item)));
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}
