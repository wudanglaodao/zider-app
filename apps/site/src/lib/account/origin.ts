import { headers } from "next/headers";
import type { NextRequest } from "next/server";

const productionSiteOrigin = "https://zider.ink";
const localSiteOrigin = "http://localhost:3100";

type OriginParts = {
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  host?: string | null;
  requestOrigin?: string | null;
};

export function getAccountRequestOrigin(request: NextRequest) {
  return accountOriginFromParts({
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    host: request.headers.get("host"),
    requestOrigin: request.nextUrl.origin,
  });
}

export async function getAccountActionOrigin() {
  const requestHeaders = await headers();

  return accountOriginFromParts({
    forwardedHost: requestHeaders.get("x-forwarded-host"),
    forwardedProto: requestHeaders.get("x-forwarded-proto"),
    host: requestHeaders.get("host"),
  });
}

function accountOriginFromParts(parts: OriginParts) {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
  const vercelProductionOrigin = normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  const requestOrigin = originFromHost(parts.forwardedHost || parts.host, parts.forwardedProto)
    || normalizeOrigin(parts.requestOrigin);

  if (process.env.NODE_ENV === "production") {
    if (requestOrigin && !isLocalOrigin(requestOrigin) && !isVercelAppOrigin(requestOrigin)) {
      return requestOrigin;
    }

    if (configuredOrigin && !isLocalOrigin(configuredOrigin)) {
      return configuredOrigin;
    }

    if (vercelProductionOrigin && !isLocalOrigin(vercelProductionOrigin) && !isVercelAppOrigin(vercelProductionOrigin)) {
      return vercelProductionOrigin;
    }

    return productionSiteOrigin;
  }

  return requestOrigin
    || configuredOrigin
    || localSiteOrigin;
}

function originFromHost(host: string | null | undefined, proto: string | null | undefined) {
  const normalizedHost = firstHeaderValue(host);

  if (!normalizedHost) {
    return null;
  }

  const normalizedProto = (firstHeaderValue(proto) || (isLocalHost(normalizedHost) ? "http" : "https")).replace(/:$/, "");

  return normalizeOrigin(`${normalizedProto}://${normalizedHost}`);
}

function normalizeOrigin(value: string | null | undefined) {
  const trimmed = value?.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return null;
  }

  const urlValue = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(urlValue).origin;
  } catch {
    return null;
  }
}

function firstHeaderValue(value: string | null | undefined) {
  return value?.split(",")[0]?.trim() || null;
}

function isLocalOrigin(origin: string) {
  try {
    return isLocalHost(new URL(origin).host);
  } catch {
    return false;
  }
}

function isVercelAppOrigin(origin: string) {
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function isLocalHost(host: string) {
  const normalizedHost = host.startsWith("[")
    ? host.slice(1, host.indexOf("]"))
    : host.split(":")[0]?.toLowerCase();

  return normalizedHost === "localhost"
    || normalizedHost === "127.0.0.1"
    || normalizedHost === "0.0.0.0"
    || normalizedHost === "::1";
}
