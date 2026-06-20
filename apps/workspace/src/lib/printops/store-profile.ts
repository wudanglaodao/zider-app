import {
  readPlatformStoreProfile,
  upsertPlatformStoreProfile,
  type PlatformStoreProfile,
  type PlatformStoreProfilePersistenceResult,
  type PlatformStoreProfileReadResult,
} from "@/lib/platform/store-profile";

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
  ownerEmail: string | null;
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
  ownerEmail: string | null;
  phone: string | null;
  platform: "wix";
  rawProfile: Record<string, unknown>;
  siteId: string | null;
  siteUrl: string | null;
  timezone: string | null;
}): Promise<PrintOpsStoreProfilePersistenceResult> {
  const result = await upsertPlatformStoreProfile(input);

  return mapPersistenceResult(result, input.appKey, input.instanceId);
}

export async function readPrintOpsStoreProfile(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
}): Promise<PrintOpsStoreProfileReadResult> {
  const result = await readPlatformStoreProfile(input);

  return mapReadResult(result, input.appKey, input.instanceId);
}

function mapPersistenceResult(
  result: PlatformStoreProfilePersistenceResult,
  appKey: string,
  instanceId: string,
): PrintOpsStoreProfilePersistenceResult {
  if (result.status !== "persisted") {
    return result;
  }

  return {
    profile: mapPlatformProfileToPrintOpsProfile(result.profile, appKey, instanceId),
    status: "persisted",
  };
}

function mapReadResult(result: PlatformStoreProfileReadResult, appKey: string, instanceId: string): PrintOpsStoreProfileReadResult {
  if (result.status !== "loaded") {
    return result;
  }

  return {
    profile: mapPlatformProfileToPrintOpsProfile(result.profile, appKey, instanceId),
    status: "loaded",
  };
}

function mapPlatformProfileToPrintOpsProfile(
  profile: PlatformStoreProfile,
  appKey: string,
  instanceId: string,
): PrintOpsStoreProfile {
  return {
    address: profile.address,
    appKey,
    businessEmail: profile.businessEmail,
    businessName: profile.businessName,
    currency: profile.currency,
    instanceId,
    language: profile.language,
    locale: profile.locale,
    logoMediaPath: profile.logoMediaPath,
    logoUrl: profile.logoUrl,
    ownerEmail: profile.ownerEmail,
    phone: profile.phone,
    platform: profile.platform,
    rawProfile: profile.rawProfile,
    siteId: profile.platformSiteId,
    siteUrl: profile.primarySiteUrl,
    syncedAt: profile.syncedAt,
    timezone: profile.timezone,
  };
}
