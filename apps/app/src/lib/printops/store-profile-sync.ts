import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createWixAccessTokenForApp } from "@/lib/wix/oauth";

type WixSiteProfile = {
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

type PlatformStoreProfileRow = {
  address: unknown;
  business_email: string | null;
  business_name: string | null;
  currency: string | null;
  first_seen_app_key: string | null;
  id: string;
  language: string | null;
  locale: string | null;
  logo_media_path: string | null;
  logo_url: string | null;
  phone: string | null;
  platform_site_id: string | null;
  primary_site_url: string | null;
  timezone: string | null;
};

export type PrintOpsStoreProfileInstallSyncResult =
  | {
      profile: {
        businessName: string | null;
        platformSiteId: string | null;
        primarySiteUrl: string | null;
      };
      status: "persisted";
    }
  | {
      reason: string;
      status: "skipped" | "error";
    };

export async function syncPrintOpsStoreProfileForInstall(input: {
  appKey: string;
  instanceId: string;
}): Promise<PrintOpsStoreProfileInstallSyncResult> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const { accessToken } = await createWixAccessTokenForApp(input.appKey, input.instanceId);
  const profile = await fetchWixSiteProfile(accessToken);
  const persisted = await upsertPlatformStoreProfile({
    ...profile,
    appKey: input.appKey,
    instanceId: input.instanceId,
    platform: "wix",
  });

  return persisted;
}

async function fetchWixSiteProfile(accessToken: string): Promise<WixSiteProfile> {
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

async function upsertPlatformStoreProfile(input: WixSiteProfile & {
  appKey: string;
  instanceId: string;
  platform: "wix";
}): Promise<PrintOpsStoreProfileInstallSyncResult> {
  const supabase = getSupabaseAdmin();
  const syncedAt = new Date().toISOString();
  const existing = await findExistingPlatformStoreProfile({
    instanceId: input.instanceId,
    platform: input.platform,
    platformSiteId: input.siteId,
  });

  if (existing.status === "error") {
    return existing;
  }

  const row = mergePlatformStoreProfileRow(input, existing.profile, syncedAt);
  const query = existing.rowId
    ? supabase.from("platform_store_profiles").update(row).eq("id", existing.rowId)
    : supabase.from("platform_store_profiles").insert({
        ...row,
        created_at: syncedAt,
      });
  const { data, error } = await query.select("business_name,id,platform_site_id,primary_site_url").single<{
    business_name: string | null;
    id: string;
    platform_site_id: string | null;
    primary_site_url: string | null;
  }>();

  if (error) {
    return {
      reason: error.message ?? "Failed to persist platform store profile",
      status: "error",
    };
  }

  await updateAppInstallationStoreProfileLink({
    appKey: input.appKey,
    instanceId: input.instanceId,
    platform: input.platform,
    siteId: input.siteId,
    siteUrl: input.siteUrl,
    syncedAt,
  });

  return {
    profile: {
      businessName: data?.business_name ?? null,
      platformSiteId: data?.platform_site_id ?? null,
      primarySiteUrl: data?.primary_site_url ?? null,
    },
    status: "persisted",
  };
}

function mergePlatformStoreProfileRow(
  input: WixSiteProfile & {
    appKey: string;
    instanceId: string;
    platform: "wix";
  },
  existing: PlatformStoreProfileRow | null,
  syncedAt: string,
) {
  return {
    address: hasProfileObject(input.address) ? input.address : getRecord(existing?.address) ?? {},
    business_email: input.businessEmail ?? existing?.business_email ?? null,
    business_name: input.businessName ?? existing?.business_name ?? null,
    currency: input.currency ?? existing?.currency ?? null,
    first_seen_app_key: existing?.first_seen_app_key ?? input.appKey,
    language: input.language ?? existing?.language ?? null,
    last_seen_instance_id: input.instanceId,
    last_synced_app_key: input.appKey,
    locale: input.locale ?? existing?.locale ?? null,
    logo_media_path: input.logoMediaPath ?? existing?.logo_media_path ?? null,
    logo_url: input.logoUrl ?? existing?.logo_url ?? null,
    phone: input.phone ?? existing?.phone ?? null,
    platform: input.platform,
    platform_site_id: input.siteId ?? existing?.platform_site_id ?? null,
    primary_site_url: input.siteUrl ?? existing?.primary_site_url ?? null,
    raw_profile: input.rawProfile,
    synced_at: syncedAt,
    timezone: input.timezone ?? existing?.timezone ?? null,
    updated_at: syncedAt,
  };
}

async function findExistingPlatformStoreProfile(input: {
  instanceId: string;
  platform: "wix";
  platformSiteId: string | null;
}): Promise<
  | {
      profile: PlatformStoreProfileRow | null;
      rowId: string | null;
      status: "loaded" | "skipped";
    }
  | {
      reason: string;
      status: "error";
    }
> {
  if (input.platformSiteId) {
    const bySite = await readProfileRowByColumn({
      column: "platform_site_id",
      platform: input.platform,
      value: input.platformSiteId,
    });

    if (bySite.status === "error") {
      return bySite;
    }

    if (bySite.status === "loaded") {
      return bySite;
    }
  }

  return readProfileRowByColumn({
    column: "last_seen_instance_id",
    platform: input.platform,
    value: input.instanceId,
  });
}

async function readProfileRowByColumn(input: {
  column: "last_seen_instance_id" | "platform_site_id";
  platform: "wix";
  value: string;
}): Promise<
  | {
      profile: PlatformStoreProfileRow;
      rowId: string;
      status: "loaded";
    }
  | {
      profile: null;
      reason: string;
      rowId: null;
      status: "skipped";
    }
  | {
      reason: string;
      status: "error";
    }
> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("platform_store_profiles")
    .select(
      [
        "address",
        "business_email",
        "business_name",
        "currency",
        "first_seen_app_key",
        "id",
        "language",
        "locale",
        "logo_media_path",
        "logo_url",
        "phone",
        "platform_site_id",
        "primary_site_url",
        "timezone",
      ].join(","),
    )
    .eq("platform", input.platform)
    .eq(input.column, input.value)
    .maybeSingle<PlatformStoreProfileRow>();

  if (error) {
    return {
      reason: error.message ?? "Failed to read platform store profile",
      status: "error",
    };
  }

  if (!data) {
    return {
      profile: null,
      reason: "No cached platform store profile",
      rowId: null,
      status: "skipped",
    };
  }

  return {
    profile: data,
    rowId: data.id,
    status: "loaded",
  };
}

async function updateAppInstallationStoreProfileLink(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
  siteId: string | null;
  siteUrl: string | null;
  syncedAt: string;
}) {
  const supabase = getSupabaseAdmin();
  const update: Record<string, string> = {
    last_seen_at: input.syncedAt,
    updated_at: input.syncedAt,
  };

  if (input.siteId) {
    update.external_site_id = input.siteId;
    update.site_id = input.siteId;
  }

  if (input.siteUrl) {
    update.site_url = input.siteUrl;
  }

  await supabase
    .from("app_installations")
    .update(update)
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId);
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

function hasProfileObject(value: Record<string, unknown>) {
  return Object.keys(value).length > 0;
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
