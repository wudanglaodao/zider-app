import { getSupabaseAdmin } from "@/lib/supabase/server";

export type PlatformStoreProfile = {
  address: Record<string, unknown>;
  businessEmail: string | null;
  businessName: string | null;
  currency: string | null;
  firstSeenAppKey: string | null;
  language: string | null;
  lastSeenInstanceId: string | null;
  lastSyncedAppKey: string | null;
  locale: string | null;
  logoMediaPath: string | null;
  logoUrl: string | null;
  phone: string | null;
  platform: "wix";
  platformSiteId: string | null;
  primarySiteUrl: string | null;
  rawProfile: Record<string, unknown>;
  syncedAt: string;
  timezone: string | null;
};

export type PlatformStoreProfilePersistenceResult =
  | {
      profile: PlatformStoreProfile;
      status: "persisted";
    }
  | {
      reason: string;
      status: "skipped";
    }
  | {
      reason: string;
      status: "error";
    };

export type PlatformStoreProfileReadResult =
  | {
      profile: PlatformStoreProfile;
      status: "loaded";
    }
  | {
      profile: null;
      reason: string;
      status: "skipped";
    }
  | {
      profile: null;
      reason: string;
      status: "error";
    };

type PlatformStoreProfileRow = {
  address: unknown;
  business_email: string | null;
  business_name: string | null;
  currency: string | null;
  first_seen_app_key: string | null;
  id: string;
  language: string | null;
  last_seen_instance_id: string | null;
  last_synced_app_key: string | null;
  locale: string | null;
  logo_media_path: string | null;
  logo_url: string | null;
  phone: string | null;
  platform: string;
  platform_site_id: string | null;
  primary_site_url: string | null;
  raw_profile: unknown;
  synced_at: string;
  timezone: string | null;
};

type AppInstallationSiteRow = {
  external_site_id: string | null;
  site_id: string | null;
};

export async function upsertPlatformStoreProfile(input: {
  address: Record<string, unknown>;
  appKey: string;
  businessEmail: string | null;
  businessName: string | null;
  currency: string | null;
  instanceId: string;
  language: string | null;
  locale: string | null;
  logoMediaPath: string | null;
  logoUrl: string | null;
  phone: string | null;
  platform: "wix";
  rawProfile: Record<string, unknown>;
  siteId: string | null;
  siteUrl: string | null;
  timezone: string | null;
}): Promise<PlatformStoreProfilePersistenceResult> {
  if (!hasSupabaseEnv()) {
    return {
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

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

  const existingProfile = existing.profile;
  const row = {
    address: hasRecordContent(input.address) ? input.address : existingProfile?.address ?? {},
    business_email: input.businessEmail ?? existingProfile?.businessEmail ?? null,
    business_name: input.businessName ?? existingProfile?.businessName ?? null,
    currency: input.currency ?? existingProfile?.currency ?? null,
    first_seen_app_key: existingProfile?.firstSeenAppKey ?? input.appKey,
    language: input.language ?? existingProfile?.language ?? null,
    last_seen_instance_id: input.instanceId,
    last_synced_app_key: input.appKey,
    locale: input.locale ?? existingProfile?.locale ?? null,
    logo_media_path: input.logoMediaPath ?? existingProfile?.logoMediaPath ?? null,
    logo_url: input.logoUrl ?? existingProfile?.logoUrl ?? null,
    phone: input.phone ?? existingProfile?.phone ?? null,
    platform: input.platform,
    platform_site_id: input.siteId ?? existingProfile?.platformSiteId ?? null,
    primary_site_url: input.siteUrl ?? existingProfile?.primarySiteUrl ?? null,
    raw_profile: hasRecordContent(input.rawProfile) ? input.rawProfile : existingProfile?.rawProfile ?? {},
    synced_at: syncedAt,
    timezone: input.timezone ?? existingProfile?.timezone ?? null,
    updated_at: syncedAt,
  };
  const query = existing.rowId
    ? supabase.from("platform_store_profiles").update(row).eq("id", existing.rowId)
    : supabase.from("platform_store_profiles").insert({
        ...row,
        created_at: syncedAt,
      });
  const { data, error } = await query.select(getProfileSelectColumns()).single<PlatformStoreProfileRow>();

  if (!error && data) {
    await updateAppInstallationStoreProfileLink({
      appKey: input.appKey,
      instanceId: input.instanceId,
      platform: input.platform,
      siteId: input.siteId,
      siteUrl: input.siteUrl,
      syncedAt,
    });

    return {
      profile: mapPlatformStoreProfileRow(data),
      status: "persisted",
    };
  }

  if (error && isMissingPlatformStoreProfileTable(error)) {
    return {
      reason: "Missing platform_store_profiles table. Run supabase/migrations/20260620_create_platform_store_profiles.sql first.",
      status: "skipped",
    };
  }

  return {
    reason: error?.message ?? "Failed to persist platform store profile",
    status: "error",
  };
}

export async function readPlatformStoreProfile(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
}): Promise<PlatformStoreProfileReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      profile: null,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const installationSiteId = await readInstallationSiteId(input);

  if (installationSiteId) {
    const bySite = await readProfileByColumn({
      column: "platform_site_id",
      platform: input.platform,
      value: installationSiteId,
    });

    if (bySite.status === "loaded" || bySite.status === "error") {
      return bySite;
    }
  }

  return readProfileByColumn({
    column: "last_seen_instance_id",
    platform: input.platform,
    value: input.instanceId,
  });
}

async function findExistingPlatformStoreProfile(input: {
  instanceId: string;
  platform: "wix";
  platformSiteId: string | null;
}): Promise<
  | {
      profile: PlatformStoreProfile | null;
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

    const byInstance = await readProfileRowByColumn({
      column: "last_seen_instance_id",
      platform: input.platform,
      value: input.instanceId,
    });

    if (byInstance.status === "error") {
      return byInstance;
    }

    if (bySite.status === "loaded") {
      if (byInstance.status === "loaded" && byInstance.rowId !== bySite.rowId) {
        const deleted = await deletePlatformStoreProfileRow(byInstance.rowId);

        if (deleted.status === "error") {
          return deleted;
        }
      }

      return bySite;
    }

    if (byInstance.status === "loaded") {
      return byInstance;
    }
  }

  return readProfileRowByColumn({
    column: "last_seen_instance_id",
    platform: input.platform,
    value: input.instanceId,
  });
}

async function readProfileByColumn(input: {
  column: "last_seen_instance_id" | "platform_site_id";
  platform: "wix";
  value: string;
}): Promise<PlatformStoreProfileReadResult> {
  const result = await readProfileRowByColumn(input);

  if (result.status === "loaded") {
    return {
      profile: result.profile,
      status: "loaded",
    };
  }

  return {
    profile: null,
    reason: result.reason,
    status: result.status,
  };
}

async function readProfileRowByColumn(input: {
  column: "last_seen_instance_id" | "platform_site_id";
  platform: "wix";
  value: string;
}): Promise<
  | {
      profile: PlatformStoreProfile;
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
    .select(getProfileSelectColumns())
    .eq("platform", input.platform)
    .eq(input.column, input.value)
    .maybeSingle<PlatformStoreProfileRow>();

  if (!error) {
    if (!data) {
      return {
        profile: null,
        reason: "No cached platform store profile",
        rowId: null,
        status: "skipped",
      };
    }

    return {
      profile: mapPlatformStoreProfileRow(data),
      rowId: data.id,
      status: "loaded",
    };
  }

  if (isMissingPlatformStoreProfileTable(error)) {
    return {
      reason: "Missing platform_store_profiles table. Run supabase/migrations/20260620_create_platform_store_profiles.sql first.",
      status: "error",
    };
  }

  return {
    reason: error.message ?? "Failed to read platform store profile",
    status: "error",
  };
}

async function readInstallationSiteId(input: { appKey: string; instanceId: string; platform: "wix" }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_installations")
    .select("site_id,external_site_id")
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId)
    .maybeSingle<AppInstallationSiteRow>();

  if (error) {
    return null;
  }

  return data?.site_id || data?.external_site_id || null;
}

async function deletePlatformStoreProfileRow(rowId: string): Promise<{ status: "deleted" } | { reason: string; status: "error" }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("platform_store_profiles").delete().eq("id", rowId);

  if (error) {
    return {
      reason: error.message ?? "Failed to merge duplicate platform store profile",
      status: "error",
    };
  }

  return { status: "deleted" };
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

function getProfileSelectColumns() {
  return [
    "address",
    "business_email",
    "business_name",
    "currency",
    "first_seen_app_key",
    "id",
    "language",
    "last_seen_instance_id",
    "last_synced_app_key",
    "locale",
    "logo_media_path",
    "logo_url",
    "phone",
    "platform",
    "platform_site_id",
    "primary_site_url",
    "raw_profile",
    "synced_at",
    "timezone",
  ].join(",");
}

function mapPlatformStoreProfileRow(row: PlatformStoreProfileRow): PlatformStoreProfile {
  return {
    address: getRecord(row.address) ?? {},
    businessEmail: row.business_email,
    businessName: row.business_name,
    currency: row.currency,
    firstSeenAppKey: row.first_seen_app_key,
    language: row.language,
    lastSeenInstanceId: row.last_seen_instance_id,
    lastSyncedAppKey: row.last_synced_app_key,
    locale: row.locale,
    logoMediaPath: row.logo_media_path,
    logoUrl: row.logo_url,
    phone: row.phone,
    platform: "wix",
    platformSiteId: row.platform_site_id,
    primarySiteUrl: row.primary_site_url,
    rawProfile: getRecord(row.raw_profile) ?? {},
    syncedAt: row.synced_at,
    timezone: row.timezone,
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingPlatformStoreProfileTable(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "42P01" || message.includes("relation") || message.includes("platform_store_profiles");
}

function getRecord(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function hasRecordContent(value: Record<string, unknown>) {
  return Object.keys(value).length > 0;
}
