import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sha256 } from "./dedupe";

export type CreateWebhookIngressLogInput = {
  requestId: string | null;
  platform: string;
  appKey: string;
  route: string;
  method: string;
  headers: Record<string, string>;
  rawBody: string;
};

export type UpdateWebhookIngressLogInput = {
  status?: string;
  verificationStatus?: string;
  processingStatus?: string;
  httpStatus?: number;
  eventType?: string | null;
  rawEventType?: string | null;
  eventId?: string | null;
  eventTime?: string | null;
  instanceId?: string | null;
  eventSource?: string | null;
  isTestEvent?: boolean | null;
  testReason?: string | null;
  platformEventLogId?: string | null;
  errorType?: string | null;
  errorMessage?: string | null;
  verifiedAt?: string | null;
  respondedAt?: string | null;
  processedAt?: string | null;
  durationMs?: number;
};

const ROUTE_NAME = "/events/[platform]/[appKey]";

export async function createWebhookIngressLog(input: CreateWebhookIngressLogInput) {
  try {
    const supabase = getSupabaseAdmin();
    const headers = sanitizeHeaders(input.headers);
    const { data, error } = await supabase
      .from("webhook_ingress_logs")
      .insert({
        request_id: input.requestId,
        platform: input.platform,
        app_key: input.appKey,
        route: input.route,
        method: input.method,
        host: getHeader(input.headers, "host"),
        user_agent: getHeader(input.headers, "user-agent"),
        source_ip: getSourceIp(input.headers),
        content_type: getHeader(input.headers, "content-type"),
        body_sha256: sha256(input.rawBody),
        body_bytes: Buffer.byteLength(input.rawBody),
        headers,
        status: "received",
        verification_status: "pending",
        processing_status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      warnIngressLog("create_failed", error);
      return null;
    }

    return typeof data?.id === "string" ? data.id : null;
  } catch (error) {
    warnIngressLog("create_threw", error);
    return null;
  }
}

export async function updateWebhookIngressLog(id: string | null, input: UpdateWebhookIngressLogInput) {
  if (!id) {
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("webhook_ingress_logs")
      .update(toDatabasePatch(input))
      .eq("id", id);

    if (error) {
      warnIngressLog("update_failed", error);
    }
  } catch (error) {
    warnIngressLog("update_threw", error);
  }
}

export function getWebhookIngressRoute() {
  return ROUTE_NAME;
}

function toDatabasePatch(input: UpdateWebhookIngressLogInput) {
  const patch: Record<string, unknown> = {};

  setIfDefined(patch, "status", input.status);
  setIfDefined(patch, "verification_status", input.verificationStatus);
  setIfDefined(patch, "processing_status", input.processingStatus);
  setIfDefined(patch, "http_status", input.httpStatus);
  setIfDefined(patch, "event_type", input.eventType);
  setIfDefined(patch, "raw_event_type", input.rawEventType);
  setIfDefined(patch, "event_id", input.eventId);
  setIfDefined(patch, "event_time", input.eventTime);
  setIfDefined(patch, "instance_id", input.instanceId);
  setIfDefined(patch, "event_source", input.eventSource);
  setIfDefined(patch, "is_test_event", input.isTestEvent);
  setIfDefined(patch, "test_reason", input.testReason);
  setIfDefined(patch, "platform_event_log_id", input.platformEventLogId);
  setIfDefined(patch, "error_type", input.errorType);
  setIfDefined(patch, "error_message", input.errorMessage);
  setIfDefined(patch, "verified_at", input.verifiedAt);
  setIfDefined(patch, "responded_at", input.respondedAt);
  setIfDefined(patch, "processed_at", input.processedAt);
  setIfDefined(patch, "duration_ms", input.durationMs);

  return patch;
}

function setIfDefined(patch: Record<string, unknown>, key: string, value: unknown) {
  if (value !== undefined) {
    patch[key] = value;
  }
}

function sanitizeHeaders(headers: Record<string, string>) {
  const allowedHeaderNames = [
    "accept",
    "content-length",
    "content-type",
    "host",
    "user-agent",
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-proto",
    "x-real-ip",
    "x-vercel-deployment-url",
    "x-vercel-forwarded-for",
    "x-vercel-id",
    "x-vercel-ip-city",
    "x-vercel-ip-country",
    "x-vercel-ip-country-region",
    "x-wix-webhook-id",
  ];
  const sanitized: Record<string, string> = {};

  for (const name of allowedHeaderNames) {
    const value = getHeader(headers, name);

    if (value) {
      sanitized[name] = value;
    }
  }

  return sanitized;
}

function getHeader(headers: Record<string, string>, name: string) {
  return headers[name] ?? headers[name.toLowerCase()] ?? null;
}

function getSourceIp(headers: Record<string, string>) {
  const forwardedFor =
    getHeader(headers, "x-forwarded-for") ??
    getHeader(headers, "x-vercel-forwarded-for") ??
    getHeader(headers, "x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || null;
}

function warnIngressLog(reason: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(JSON.stringify({ level: "warn", message: "webhook_ingress_log_skipped", reason, error: message }));
}
