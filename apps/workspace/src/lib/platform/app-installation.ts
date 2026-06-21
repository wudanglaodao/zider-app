import { getSupabaseAdmin } from "@/lib/supabase/server";

export type AppInstallationContext = {
  id: string;
  memberId: string | null;
  platformStoreProfileId: string | null;
  workspaceId: string | null;
};

type AppInstallationContextRow = {
  id: string;
  member_id: string | null;
  platform_store_profile_id: string | null;
  workspace_id: string | null;
};

export async function readAppInstallationContext(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
}): Promise<AppInstallationContext | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_installations")
    .select("id,member_id,platform_store_profile_id,workspace_id")
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId)
    .maybeSingle<AppInstallationContextRow>();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    memberId: data.member_id,
    platformStoreProfileId: data.platform_store_profile_id,
    workspaceId: data.workspace_id,
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
