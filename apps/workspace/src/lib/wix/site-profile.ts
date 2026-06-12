export type WixSiteProfile = {
  address: Record<string, unknown>;
  businessEmail: string | null;
  businessName: string | null;
  currency: string | null;
  language: string | null;
  locale: string | null;
  logoMediaPath: string | null;
  logoUrl: string | null;
  phone: string | null;
  rawProfile: Record<string, unknown>;
  siteId: string | null;
  siteUrl: string | null;
  timezone: string | null;
};

export async function fetchWixSiteProfile(accessToken: string): Promise<WixSiteProfile> {
  const response = await fetch("https://www.wixapis.com/site-properties/v4/properties", {
    headers: {
      Authorization: formatWixAuthorization(accessToken),
    },
  });
  const raw = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(`Wix site profile request failed: ${response.status} ${JSON.stringify(raw)}`);
  }

  return normalizeWixSiteProperties(raw);
}

function normalizeWixSiteProperties(raw: unknown): WixSiteProfile {
  const root = getRecord(raw) ?? {};
  const properties = getRecord(root.properties) ?? getRecord(root.siteProperties) ?? root;
  const businessInfo = getRecord(properties.businessInfo) ?? getRecord(properties.business) ?? {};
  const address = getRecord(properties.address) ?? getRecord(businessInfo.address) ?? {};
  const logo = resolveWixLogo(properties.logo ?? properties.logoImage ?? businessInfo.logo ?? businessInfo.logoImage);

  return {
    address,
    businessEmail: pickString(properties, ["email", "businessEmail"]) ?? pickString(businessInfo, ["email", "businessEmail"]),
    businessName: pickString(properties, ["businessName", "business_name", "siteDisplayName", "displayName", "siteName", "name"]),
    currency: pickString(properties, ["paymentCurrency", "currency", "defaultCurrency"]),
    language: pickString(properties, ["language", "defaultLanguage"]),
    locale: pickString(properties, ["locale", "regionalFormat", "defaultLocale"]),
    logoMediaPath: logo.mediaPath,
    logoUrl: logo.url,
    phone: pickString(properties, ["phone", "businessPhone"]) ?? pickString(businessInfo, ["phone", "businessPhone"]),
    rawProfile: root,
    siteId: pickString(properties, ["siteId", "site_id"]) ?? pickString(root, ["siteId", "site_id"]),
    siteUrl: normalizeUrl(pickString(properties, ["externalSiteUrl", "siteUrl", "url", "baseUrl", "domain"])),
    timezone: pickString(properties, ["timeZone", "timezone", "time_zone"]),
  };
}

function resolveWixLogo(value: unknown) {
  const logoRecord = getRecord(value);
  const mediaPath =
    getString(value) ??
    pickString(logoRecord, ["url", "src", "mediaId", "media_id", "path", "id", "imageId", "image_id", "fileUrl", "file_url"]);
  const url = normalizeWixMediaUrl(pickString(logoRecord, ["url", "src", "fileUrl", "file_url"]) ?? mediaPath);

  return {
    mediaPath,
    url,
  };
}

function normalizeWixMediaUrl(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const wixImagePrefix = "wix:image://v1/";

  if (trimmed.startsWith(wixImagePrefix)) {
    const mediaPath = trimmed.slice(wixImagePrefix.length).split(/[/?#]/)[0];

    return mediaPath ? `https://static.wixstatic.com/media/${mediaPath}` : null;
  }

  if (/^[\w.-]+\/[\w.-]+/.test(trimmed) || /^[\w.-]+\.(?:png|jpe?g|webp|gif|svg)$/i.test(trimmed)) {
    return `https://static.wixstatic.com/media/${trimmed.replace(/^\/+/, "")}`;
  }

  return null;
}

function normalizeUrl(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function formatWixAuthorization(accessToken: string) {
  return accessToken.toLowerCase().startsWith("bearer ") ? accessToken : `Bearer ${accessToken}`;
}

function pickString(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const value = getString(record[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function getRecord(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function getString(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed || null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}
