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
  const contactInfo =
    getRecord(properties.contactInfo) ??
    getRecord(properties.businessContact) ??
    getRecord(businessInfo.contactInfo) ??
    getRecord(businessInfo.businessContact) ??
    {};
  const regionalSettings = getRecord(properties.regionalSettings) ?? getRecord(properties.region) ?? {};
  const localeRecord = getRecord(properties.locale) ?? getRecord(regionalSettings.locale) ?? {};
  const multilingual = getRecord(properties.multilingual) ?? getRecord(regionalSettings.multilingual) ?? {};
  const currencyRecord = getRecord(properties.paymentCurrency) ?? getRecord(properties.currency) ?? getRecord(regionalSettings.currency) ?? {};
  const siteUrlRecord = getRecord(properties.siteUrl) ?? getRecord(properties.siteUrls) ?? getRecord(root.siteUrl) ?? getRecord(root.siteUrls) ?? {};
  const address = getRecord(properties.address) ?? getRecord(businessInfo.address) ?? getRecord(contactInfo.address) ?? {};
  const logo = resolveWixLogo(
    properties.logo ??
      properties.logoImage ??
      properties.logoMedia ??
      businessInfo.logo ??
      businessInfo.logoImage ??
      businessInfo.logoMedia,
  );

  return {
    address,
    businessEmail: pickStringFromRecords([properties, businessInfo, contactInfo], ["email", "businessEmail", "business_email"]),
    businessName: pickStringFromRecords(
      [properties, businessInfo, contactInfo],
      ["businessName", "business_name", "siteDisplayName", "displayName", "siteName", "companyName", "name"],
    ),
    currency:
      pickStringFromRecords([properties, regionalSettings], ["paymentCurrency", "currency", "defaultCurrency"]) ??
      pickString(currencyRecord, ["code", "currencyCode", "currency", "value"]),
    language:
      pickStringFromRecords([properties, regionalSettings, multilingual], ["language", "defaultLanguage", "siteLanguage", "primaryLanguage"]) ??
      pickString(localeRecord, ["language"]),
    locale:
      pickStringFromRecords([properties, regionalSettings], ["regionalFormat", "defaultLocale", "locale"]) ??
      pickString(localeRecord, ["locale", "code", "languageTag", "id"]),
    logoMediaPath: logo.mediaPath,
    logoUrl: logo.url,
    phone: pickStringFromRecords([properties, businessInfo, contactInfo], ["phone", "businessPhone", "business_phone"]),
    rawProfile: root,
    siteId: pickString(properties, ["siteId", "site_id"]) ?? pickString(root, ["siteId", "site_id", "metasiteId", "metaSiteId"]),
    siteUrl: normalizeUrl(
      pickStringFromRecords(
        [properties, siteUrlRecord, root],
        ["externalSiteUrl", "publishedSiteUrl", "siteUrl", "url", "baseUrl", "domain", "primary"],
      ),
    ),
    timezone: pickStringFromRecords([properties, regionalSettings, businessInfo], ["timeZone", "timezone", "time_zone"]),
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

function pickStringFromRecords(records: Array<Record<string, unknown> | null>, keys: string[]) {
  for (const record of records) {
    const value = pickString(record, keys);

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
