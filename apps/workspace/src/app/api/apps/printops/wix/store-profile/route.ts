import { NextRequest, NextResponse } from "next/server";
import { readPrintOpsStoreProfile, upsertPrintOpsStoreProfile } from "@/lib/printops/store-profile";
import { PRINTOPS_APP_KEY, resolveWixInstanceIdForApp } from "@/lib/wix/app-instance";
import { createPrintOpsWixAccessToken } from "@/lib/wix/oauth";
import { fetchWixSiteProfile } from "@/lib/wix/site-profile";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleWixStoreProfile(request, { refresh: request.nextUrl.searchParams.get("refresh") === "1" });
}

export async function POST(request: NextRequest) {
  return handleWixStoreProfile(request, { refresh: true });
}

async function handleWixStoreProfile(request: NextRequest, options: { refresh: boolean }) {
  const body = request.method === "POST" ? await readJsonBody(request) : {};
  const params = {
    ...searchParamsToRecord(request.nextUrl.searchParams),
    ...bodyParamsToRecord(body),
  };
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

  const cached = await readPrintOpsStoreProfile({
    appKey: PRINTOPS_APP_KEY,
    instanceId: instanceContext.instanceId,
    platform: "wix",
  });

  if (!options.refresh && cached.status === "loaded") {
    return NextResponse.json({
      ok: true,
      appKey: PRINTOPS_APP_KEY,
      instance: {
        instanceId: instanceContext.instanceId,
        source: instanceContext.source,
        verified: instanceContext.verified,
      },
      platform: "wix",
      profile: cached.profile,
      source: "cache",
    });
  }

  try {
    const { accessToken } = await createPrintOpsWixAccessToken(instanceContext.instanceId);
    const wixProfile = await fetchWixSiteProfile(accessToken);
    const persistence = await upsertPrintOpsStoreProfile({
      ...wixProfile,
      appKey: PRINTOPS_APP_KEY,
      instanceId: instanceContext.instanceId,
      platform: "wix",
    });

    return NextResponse.json({
      ok: true,
      appKey: PRINTOPS_APP_KEY,
      instance: {
        instanceId: instanceContext.instanceId,
        source: instanceContext.source,
        verified: instanceContext.verified,
      },
      persistence,
      platform: "wix",
      profile:
        persistence.status === "persisted"
          ? persistence.profile
          : {
              ...wixProfile,
              appKey: PRINTOPS_APP_KEY,
              instanceId: instanceContext.instanceId,
              platform: "wix",
              syncedAt: new Date().toISOString(),
            },
      source: "wix",
    });
  } catch (error) {
    if (cached.status === "loaded") {
      return NextResponse.json({
        ok: true,
        appKey: PRINTOPS_APP_KEY,
        instance: {
          instanceId: instanceContext.instanceId,
          source: instanceContext.source,
          verified: instanceContext.verified,
        },
        platform: "wix",
        profile: cached.profile,
        source: "cache",
        warning: error instanceof Error ? error.message : "Wix store profile refresh failed",
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Wix store profile refresh failed",
      },
      { status: 500 },
    );
  }
}

async function readJsonBody(request: NextRequest) {
  try {
    const value = (await request.json()) as unknown;

    return getRecord(value) ?? {};
  } catch {
    return {};
  }
}

function searchParamsToRecord(searchParams: URLSearchParams) {
  const record: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    record[key] = value;
  });

  return record;
}

function bodyParamsToRecord(body: Record<string, unknown>) {
  const record: Record<string, string> = {};
  const instance = getString(body.instance);
  const instanceId = getString(body.instanceId);

  if (instance) {
    record.instance = instance;
  }

  if (instanceId) {
    record.instanceId = instanceId;
  }

  return record;
}

function getRecord(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function getString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}
