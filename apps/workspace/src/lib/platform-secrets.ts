import { getSupabaseAdmin } from "@/lib/supabase/server";

export type AppPlatformSecret = {
  appKey: string;
  platform: string;
  oauthClientId: string | null;
  oauthClientSecret: string | null;
  appSecret: string | null;
  webhookPublicKey: string | null;
};

type AppPlatformSecretRow = {
  app_key: string;
  platform: string;
  oauth_client_id: string | null;
  oauth_client_secret: string | null;
  app_secret: string | null;
  webhook_public_key: string | null;
};

export async function getAppPlatformSecret(appKey: string, platform = "wix") {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_platform_secrets")
    .select("app_key,platform,oauth_client_id,oauth_client_secret,app_secret,webhook_public_key")
    .eq("app_key", appKey)
    .eq("platform", platform)
    .maybeSingle<AppPlatformSecretRow>();

  if (error) {
    console.warn("Failed to load app platform secrets", {
      appKey,
      platform,
      error: error.message,
    });
    return null;
  }

  return data ? mapAppPlatformSecret(data) : null;
}

function mapAppPlatformSecret(row: AppPlatformSecretRow): AppPlatformSecret {
  return {
    appKey: row.app_key,
    appSecret: row.app_secret,
    oauthClientId: row.oauth_client_id,
    oauthClientSecret: row.oauth_client_secret,
    platform: row.platform,
    webhookPublicKey: row.webhook_public_key,
  };
}
