import { getSupabaseAdmin } from "@/lib/supabase/server";

export type AppPlatformSecret = {
  appKey: string;
  platform: string;
  oauthClientId: string | null;
  oauthClientSecret: string | null;
  appSecret: string | null;
  webhookPublicKey: string | null;
  webhookSecret: string | null;
};

type AppPlatformSecretRow = AppPlatformSecretCurrentRow | AppPlatformSecretLegacyRow;

type AppPlatformSecretCurrentRow = {
  app_key: string;
  platform: string;
  client_id: string | null;
  client_secret: string | null;
  webhook_public_key: string | null;
  webhook_secret?: string | null;
};

type AppPlatformSecretLegacyRow = {
  app_key: string;
  platform: string;
  oauth_client_id: string | null;
  oauth_client_secret: string | null;
  app_secret: string | null;
  webhook_public_key: string | null;
};

type AppPlatformSecretMinimalRow = {
  app_key: string;
  platform: string;
  webhook_public_key: string | null;
};

export async function getAppPlatformSecret(appKey: string, platform = "wix") {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const current = await supabase
    .from("app_platform_secrets")
    .select("app_key,platform,client_id,client_secret,webhook_public_key,webhook_secret")
    .eq("app_key", appKey)
    .eq("platform", platform)
    .maybeSingle<AppPlatformSecretCurrentRow>();

  if (!current.error) {
    return current.data ? mapAppPlatformSecret(current.data) : null;
  }

  if (isMissingColumnError(current.error)) {
    const minimal = await supabase
      .from("app_platform_secrets")
      .select("app_key,platform,webhook_public_key")
      .eq("app_key", appKey)
      .eq("platform", platform)
      .maybeSingle<AppPlatformSecretMinimalRow>();

    if (!minimal.error) {
      return minimal.data ? mapMinimalAppPlatformSecret(minimal.data) : null;
    }
  }

  const legacy = isMissingColumnError(current.error)
    ? await supabase
        .from("app_platform_secrets")
        .select("app_key,platform,oauth_client_id,oauth_client_secret,app_secret,webhook_public_key")
        .eq("app_key", appKey)
        .eq("platform", platform)
        .maybeSingle<AppPlatformSecretRow>()
    : null;

  if (!legacy) {
    console.warn("Failed to load app platform secrets", {
      appKey,
      platform,
      error: current.error.message,
    });
    return null;
  }

  if (legacy.error) {
    if (!isMissingColumnError(legacy.error)) {
      console.warn("Failed to load app platform secrets", {
        appKey,
        platform,
        error: legacy.error.message,
      });
    }
    return null;
  }

  return legacy.data ? mapAppPlatformSecret(legacy.data) : null;
}

function mapMinimalAppPlatformSecret(row: AppPlatformSecretMinimalRow): AppPlatformSecret {
  return {
    appKey: row.app_key,
    appSecret: null,
    oauthClientId: null,
    oauthClientSecret: null,
    platform: row.platform,
    webhookPublicKey: row.webhook_public_key,
    webhookSecret: null,
  };
}

function mapAppPlatformSecret(row: AppPlatformSecretRow): AppPlatformSecret {
  if ("client_id" in row) {
    return {
      appKey: row.app_key,
      appSecret: row.webhook_secret ?? row.client_secret,
      oauthClientId: row.client_id,
      oauthClientSecret: row.client_secret,
      platform: row.platform,
      webhookPublicKey: row.webhook_public_key,
      webhookSecret: row.webhook_secret ?? null,
    };
  }

  return {
    appKey: row.app_key,
    appSecret: row.app_secret,
    oauthClientId: row.oauth_client_id,
    oauthClientSecret: row.oauth_client_secret,
    platform: row.platform,
    webhookPublicKey: row.webhook_public_key,
    webhookSecret: null,
  };
}

function isMissingColumnError(error: { code?: string; message?: string }) {
  return error.code === "42703" || Boolean(error.message?.toLowerCase().includes("column"));
}
