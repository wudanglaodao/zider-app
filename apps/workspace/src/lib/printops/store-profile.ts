import { getSupabaseAdmin } from "@/lib/supabase/server";

export type PrintOpsStoreProfile = {
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
  syncedAt: string;
  timezone: string | null;
};

export type PrintOpsStoreProfilePersistenceResult =
  | {
      profile: PrintOpsStoreProfile;
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

export type PrintOpsStoreProfileReadResult =
  | {
      profile: PrintOpsStoreProfile;
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

type PrintOpsStoreProfileRow = {
  address: unknown;
  app_key: string;
  business_email: string | null;
  business_name: string | null;
  currency: string | null;
  instance_id: string;
  language: string | null;
  locale: string | null;
  logo_media_path: string | null;
  logo_url: string | null;
  phone: string | null;
  platform: string;
  raw_profile: unknown;
  site_id: string | null;
  site_url: string | null;
  synced_at: string;
  timezone: string | null;
};

export async function upsertPrintOpsStoreProfile(input: {
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
}): Promise<PrintOpsStoreProfilePersistenceResult> {
  if (!hasSupabaseEnv()) {
    return {
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const supabase = getSupabaseAdmin();
  const syncedAt = new Date().toISOString();
  const row = {
    address: input.address,
    app_key: input.appKey,
    business_email: input.businessEmail,
    business_name: input.businessName,
    currency: input.currency,
    instance_id: input.instanceId,
    language: input.language,
    locale: input.locale,
    logo_media_path: input.logoMediaPath,
    logo_url: input.logoUrl,
    phone: input.phone,
    platform: input.platform,
    raw_profile: input.rawProfile,
    site_id: input.siteId,
    site_url: input.siteUrl,
    synced_at: syncedAt,
    timezone: input.timezone,
    updated_at: syncedAt,
  };
  const { data, error } = await supabase
    .from("printops_store_profiles")
    .upsert(row, { onConflict: "app_key,platform,instance_id" })
    .select(getProfileSelectColumns())
    .single<PrintOpsStoreProfileRow>();

  if (!error && data) {
    return {
      profile: mapStoreProfileRow(data),
      status: "persisted",
    };
  }

  if (error && isMissingTableError(error)) {
    return {
      reason: "Missing printops_store_profiles table. Run supabase/migrations/20260612_add_printops_store_profiles.sql first.",
      status: "skipped",
    };
  }

  return {
    reason: error?.message ?? "Failed to persist PrintOps store profile",
    status: "error",
  };
}

export async function readPrintOpsStoreProfile(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
}): Promise<PrintOpsStoreProfileReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      profile: null,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("printops_store_profiles")
    .select(getProfileSelectColumns())
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId)
    .maybeSingle<PrintOpsStoreProfileRow>();

  if (!error) {
    if (!data) {
      return {
        profile: null,
        reason: "No cached PrintOps store profile",
        status: "skipped",
      };
    }

    return {
      profile: mapStoreProfileRow(data),
      status: "loaded",
    };
  }

  if (isMissingTableError(error)) {
    return {
      profile: null,
      reason: "Missing printops_store_profiles table. Run supabase/migrations/20260612_add_printops_store_profiles.sql first.",
      status: "skipped",
    };
  }

  return {
    profile: null,
    reason: error.message ?? "Failed to read PrintOps store profile",
    status: "error",
  };
}

function getProfileSelectColumns() {
  return [
    "address",
    "app_key",
    "business_email",
    "business_name",
    "currency",
    "instance_id",
    "language",
    "locale",
    "logo_media_path",
    "logo_url",
    "phone",
    "platform",
    "raw_profile",
    "site_id",
    "site_url",
    "synced_at",
    "timezone",
  ].join(",");
}

function mapStoreProfileRow(row: PrintOpsStoreProfileRow): PrintOpsStoreProfile {
  return {
    address: getRecord(row.address) ?? {},
    appKey: row.app_key,
    businessEmail: row.business_email,
    businessName: row.business_name,
    currency: row.currency,
    instanceId: row.instance_id,
    language: row.language,
    locale: row.locale,
    logoMediaPath: row.logo_media_path,
    logoUrl: row.logo_url,
    phone: row.phone,
    platform: "wix",
    rawProfile: getRecord(row.raw_profile) ?? {},
    siteId: row.site_id,
    siteUrl: row.site_url,
    syncedAt: row.synced_at,
    timezone: row.timezone,
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "42P01" || message.includes("relation") || message.includes("printops_store_profiles");
}

function getRecord(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}
