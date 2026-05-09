import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CURSOR_APP_KEY, normalizeCursorConfig } from "@/cursor/core";
import { getCursorConfigRecord, saveCursorConfigRecord, type CursorConfigRecord } from "@/lib/cursor/config-store";
import { parseWixInstance } from "@/lib/wix/app-instance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const platformSchema = z.enum(["wix", "zider", "direct"]).default("direct");
const saveSchema = z.object({
  platform: platformSchema,
  instanceId: z.string().min(1).optional(),
  instanceToken: z.string().min(1).optional(),
  mode: z.enum(["draft", "publish"]).default("draft"),
  config: z.record(z.string(), z.unknown()).default({}),
});

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const platform = platformSchema.parse(url.searchParams.get("platform") ?? "direct");
  const instanceId = url.searchParams.get("instanceId");

  if (!instanceId) {
    return NextResponse.json({ ok: false, error: "Missing instanceId" }, { status: 400 });
  }

  const record = await getCursorConfigRecord(platform, instanceId);
  const stage = url.searchParams.get("stage") === "draft" ? "draft" : "published";
  const response = NextResponse.json({
    ok: true,
    appKey: CURSOR_APP_KEY,
    platform,
    instanceId,
    stage,
    config: stage === "draft" ? record.draftConfig : record.publishedConfig,
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt,
  });

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
}

export async function POST(request: NextRequest) {
  const body = saveSchema.parse(await request.json());
  const instanceId = resolveWritableInstanceId(body.platform, body.instanceId, body.instanceToken);

  if (!instanceId) {
    return NextResponse.json({ ok: false, error: "Missing or invalid Wix instance" }, { status: 401 });
  }

  const record = await saveCursorConfigRecord({
    platform: body.platform as CursorConfigRecord["platform"],
    instanceId,
    config: normalizeCursorConfig(body.config),
    publish: body.mode === "publish",
  });

  return NextResponse.json({
    ok: true,
    appKey: CURSOR_APP_KEY,
    platform: body.platform,
    instanceId,
    mode: body.mode,
    config: body.mode === "publish" ? record.publishedConfig : record.draftConfig,
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt,
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function resolveWritableInstanceId(platform: CursorConfigRecord["platform"], instanceId?: string, instanceToken?: string) {
  if (platform !== "wix") {
    return instanceId ?? null;
  }

  const parsed = parseWixInstance(instanceToken);

  if (parsed?.instanceId && parsed.verified) {
    return parsed.instanceId;
  }

  if (process.env.NODE_ENV !== "production") {
    return parsed?.instanceId ?? instanceId ?? null;
  }

  return null;
}
