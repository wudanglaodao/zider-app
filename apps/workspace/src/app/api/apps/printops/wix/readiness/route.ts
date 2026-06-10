import { NextRequest, NextResponse } from "next/server";
import { readPrintOpsWixOrders } from "@/lib/printops/order-cache";
import { PRINTOPS_APP_KEY, resolveWixInstanceIdForApp } from "@/lib/wix/app-instance";
import { createPrintOpsWixAccessToken, getPrintOpsWixCredentials } from "@/lib/wix/oauth";

export const dynamic = "force-dynamic";

type ReadinessCheck = {
  key: "instance" | "credentials" | "database" | "oauth";
  label: string;
  status: "ready" | "warning" | "error" | "skipped";
  detail: string;
};

export async function GET(request: NextRequest) {
  const params = searchParamsToRecord(request.nextUrl.searchParams);
  const verifyOAuth = request.nextUrl.searchParams.get("verifyOAuth") === "1";
  const instanceContext = await resolveWixInstanceIdForApp(PRINTOPS_APP_KEY, params);
  const credentials = await getPrintOpsWixCredentials();
  const checks: ReadinessCheck[] = [];

  checks.push(
    instanceContext.instanceId
      ? {
          key: "instance",
          label: "Wix instance",
          status: instanceContext.verified ? "ready" : "warning",
          detail: instanceContext.verified
            ? "Signed Wix instance is verified."
            : `Using ${instanceContext.source === "dev-instance-id" ? "local development" : "unverified"} instance ${instanceContext.instanceId}.`,
        }
      : {
          key: "instance",
          label: "Wix instance",
          status: "error",
          detail: "Open PrintOps from Wix, or pass instanceId in local development.",
        },
  );

  checks.push(
    credentials.clientId && credentials.clientSecret
      ? {
          key: "credentials",
          label: "Wix OAuth credentials",
          status: "ready",
          detail: `Credentials found from ${credentials.source}.`,
        }
      : {
          key: "credentials",
          label: "Wix OAuth credentials",
          status: "error",
          detail: "Missing client_id/client_secret in app_platform_secrets or WIX_PRINTOPS_* environment variables.",
        },
  );

  if (instanceContext.instanceId) {
    const cache = await readPrintOpsWixOrders({
      appKey: PRINTOPS_APP_KEY,
      instanceId: instanceContext.instanceId,
      limit: 1,
    });

    checks.push({
      key: "database",
      label: "PrintOps order cache",
      status: cache.status === "loaded" ? "ready" : cache.status === "skipped" ? "error" : "error",
      detail:
        cache.status === "loaded"
          ? "printops_orders is available for cached Wix orders."
          : cache.reason,
    });
  } else {
    checks.push({
      key: "database",
      label: "PrintOps order cache",
      status: "skipped",
      detail: "Waiting for a Wix instance before checking order cache rows.",
    });
  }

  if (!verifyOAuth) {
    checks.push({
      key: "oauth",
      label: "Wix access token",
      status: "skipped",
      detail: "OAuth validation was not requested.",
    });
  } else if (!instanceContext.instanceId || !credentials.clientId || !credentials.clientSecret) {
    checks.push({
      key: "oauth",
      label: "Wix access token",
      status: "skipped",
      detail: "Waiting for a Wix instance and OAuth credentials.",
    });
  } else {
    try {
      await createPrintOpsWixAccessToken(instanceContext.instanceId);
      checks.push({
        key: "oauth",
        label: "Wix access token",
        status: "ready",
        detail: "Wix accepted the configured PrintOps app credentials for this instance.",
      });
    } catch (error) {
      checks.push({
        key: "oauth",
        label: "Wix access token",
        status: "error",
        detail: normalizeOAuthError(error),
      });
    }
  }

  const status = checks.some((check) => check.status === "error")
    ? "error"
    : checks.some((check) => check.status === "warning")
      ? "warning"
      : checks.some((check) => check.status === "skipped")
        ? "warning"
        : "ready";

  return NextResponse.json({
    ok: status !== "error",
    appKey: PRINTOPS_APP_KEY,
    platform: "wix",
    instance: {
      instanceId: instanceContext.instanceId,
      source: instanceContext.source,
      verified: instanceContext.verified,
    },
    status,
    checks,
  });
}

function searchParamsToRecord(searchParams: URLSearchParams) {
  const record: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    record[key] = value;
  });

  return record;
}

function normalizeOAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "Wix access token validation failed.";

  if (message.includes("getBy.app") || message.includes("is invalid")) {
    return "Wix rejected the configured PrintOps app id for this instance. Check app_platform_secrets.client_id/client_secret and the Wix test app instance.";
  }

  return message;
}
