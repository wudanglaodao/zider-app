import { NextRequest, NextResponse } from "next/server";
import { readAccountBinding, requestAccountBindingCode, verifyAccountBindingCode } from "@/lib/platform/account-binding";
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

  const result = await readAccountBinding({
    appKey: PRINTOPS_APP_KEY,
    instanceId: instanceContext.instanceId,
    platform: "wix",
  });

  return NextResponse.json(
    {
      ok: result.status !== "error",
      accountBinding: result,
      appKey: PRINTOPS_APP_KEY,
      instance: {
        instanceId: instanceContext.instanceId,
        source: instanceContext.source,
        verified: instanceContext.verified,
      },
      platform: "wix",
    },
    { status: result.status === "error" ? 500 : 200 },
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    action?: unknown;
    code?: unknown;
    displayName?: unknown;
    email?: unknown;
    instanceId?: string;
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

  const action = readString(body?.action);
  const email = readString(body?.email);

  if (!email) {
    return NextResponse.json(
      {
        ok: false,
        error: "Email is required.",
      },
      { status: 400 },
    );
  }

  const result =
    action === "verify_code"
      ? await verifyAccountBindingCode({
          appKey: PRINTOPS_APP_KEY,
          code: readString(body?.code) ?? "",
          displayName: readString(body?.displayName),
          email,
          instanceId: instanceContext.instanceId,
          platform: "wix",
        })
      : await requestAccountBindingCode({
          appKey: PRINTOPS_APP_KEY,
          displayName: readString(body?.displayName),
          email,
          instanceId: instanceContext.instanceId,
          platform: "wix",
        });

  return NextResponse.json(
    {
      ok: result.status !== "error",
      accountBinding: result,
      appKey: PRINTOPS_APP_KEY,
      instance: {
        instanceId: instanceContext.instanceId,
        source: instanceContext.source,
        verified: instanceContext.verified,
      },
      platform: "wix",
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

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
