import { createHash, randomInt } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { readPlatformStoreProfile } from "@/lib/platform/store-profile";

export type AccountBindingState = {
  bindingEmail: string | null;
  bindingStatus: "pending" | "verified" | "revoked";
  installationId: string | null;
  member: {
    email: string;
    id: string;
  } | null;
  ownerEmail: string | null;
  platformStoreProfileId: string | null;
  suggestedEmail: string | null;
  workspace: {
    id: string;
    name: string;
  } | null;
};

type AppInstallationBindingRow = {
  binding_email: string | null;
  binding_status: "pending" | "verified" | "revoked" | null;
  binding_verified_at: string | null;
  id: string;
  member_id: string | null;
  platform_store_profile_id: string | null;
  workspace_id: string | null;
};

type MemberRow = {
  email: string;
  id: string;
};

type WorkspaceRow = {
  id: string;
  name: string;
};

type AppRow = {
  id: string;
};

type VerificationRow = {
  attempts: number;
  code_hash: string;
  email: string;
  expires_at: string;
  id: string;
};

export type AccountBindingResult =
  | {
      binding: AccountBindingState;
      developmentCode?: string;
      status: "loaded" | "code_sent" | "bound";
    }
  | {
      binding: null;
      reason: string;
      status: "skipped" | "error";
    };

export async function readAccountBinding(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
}): Promise<AccountBindingResult> {
  if (!hasSupabaseEnv()) {
    return {
      binding: null,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const installation = await ensurePendingInstallation(input);

  if (!installation) {
    return {
      binding: null,
      reason: "Unable to create or read app installation",
      status: "error",
    };
  }

  return {
    binding: await mapBindingState(input, installation),
    status: "loaded",
  };
}

export async function requestAccountBindingCode(input: {
  appKey: string;
  displayName?: string | null;
  email: string;
  instanceId: string;
  platform: "wix";
}): Promise<AccountBindingResult> {
  if (!hasSupabaseEnv()) {
    return {
      binding: null,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const email = normalizeEmail(input.email);

  if (!email) {
    return {
      binding: null,
      reason: "A valid email is required.",
      status: "error",
    };
  }

  const supabase = getSupabaseAdmin();
  const installation = await ensurePendingInstallation(input);

  if (!installation) {
    return {
      binding: null,
      reason: "Unable to create or read app installation",
      status: "error",
    };
  }

  const code = generateVerificationCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

  await supabase
    .from("account_email_verifications")
    .update({
      status: "expired",
      updated_at: now.toISOString(),
    })
    .eq("app_installation_id", installation.id)
    .eq("status", "pending");

  const { error: verificationError } = await supabase.from("account_email_verifications").insert({
    app_installation_id: installation.id,
    code_hash: hashVerificationCode(code),
    email,
    expires_at: expiresAt,
    status: "pending",
  });

  if (verificationError) {
    return {
      binding: null,
      reason: verificationError.message,
      status: "error",
    };
  }

  const { data: updatedInstallation, error } = await supabase
    .from("app_installations")
    .update({
      binding_email: email,
      binding_status: "pending",
      last_seen_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", installation.id)
    .select("id,binding_email,binding_status,binding_verified_at,member_id,platform_store_profile_id,workspace_id")
    .single<AppInstallationBindingRow>();

  if (error || !updatedInstallation) {
    return {
      binding: null,
      reason: error?.message ?? "Failed to prepare account binding",
      status: "error",
    };
  }

  const delivery = await sendAccountBindingCode({ code, email });

  if (!delivery.ok) {
    return {
      binding: null,
      reason: delivery.reason,
      status: "error",
    };
  }

  return {
    binding: await mapBindingState(input, updatedInstallation),
    developmentCode: shouldExposeDevelopmentCode() ? code : undefined,
    status: "code_sent",
  };
}

export async function verifyAccountBindingCode(input: {
  appKey: string;
  code: string;
  displayName?: string | null;
  email: string;
  instanceId: string;
  platform: "wix";
}): Promise<AccountBindingResult> {
  if (!hasSupabaseEnv()) {
    return {
      binding: null,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const email = normalizeEmail(input.email);
  const code = normalizeVerificationCode(input.code);

  if (!email) {
    return {
      binding: null,
      reason: "A valid email is required.",
      status: "error",
    };
  }

  if (!code) {
    return {
      binding: null,
      reason: "Verification code is required.",
      status: "error",
    };
  }

  const supabase = getSupabaseAdmin();
  const installation = await ensurePendingInstallation(input);

  if (!installation) {
    return {
      binding: null,
      reason: "Unable to create or read app installation",
      status: "error",
    };
  }

  const { data: verification, error: verificationReadError } = await supabase
    .from("account_email_verifications")
    .select("id,email,code_hash,attempts,expires_at")
    .eq("app_installation_id", installation.id)
    .eq("email", email)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<VerificationRow>();

  if (verificationReadError || !verification) {
    return {
      binding: null,
      reason: verificationReadError?.message ?? "Verification code expired or was not requested.",
      status: "error",
    };
  }

  if (verification.attempts >= 5) {
    await supabase
      .from("account_email_verifications")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("id", verification.id);

    return {
      binding: null,
      reason: "Too many verification attempts. Request a new code.",
      status: "error",
    };
  }

  if (hashVerificationCode(code) !== verification.code_hash) {
    await supabase
      .from("account_email_verifications")
      .update({
        attempts: verification.attempts + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", verification.id);

    return {
      binding: null,
      reason: "Verification code is incorrect.",
      status: "error",
    };
  }

  const result = await bindVerifiedAccountEmail({
    appKey: input.appKey,
    displayName: input.displayName,
    email,
    instanceId: input.instanceId,
    platform: input.platform,
  });

  if (result.status === "bound") {
    await supabase
      .from("account_email_verifications")
      .update({
        status: "verified",
        updated_at: new Date().toISOString(),
        verified_at: new Date().toISOString(),
      })
      .eq("id", verification.id);
  }

  return result;
}

async function bindVerifiedAccountEmail(input: {
  appKey: string;
  displayName?: string | null;
  email: string;
  instanceId: string;
  platform: "wix";
}): Promise<AccountBindingResult> {
  const supabase = getSupabaseAdmin();
  const installation = await ensurePendingInstallation(input);

  if (!installation) {
    return {
      binding: null,
      reason: "Unable to create or read app installation",
      status: "error",
    };
  }

  const email = normalizeEmail(input.email);

  if (!email) {
    return {
      binding: null,
      reason: "A valid email is required.",
      status: "error",
    };
  }

  const member = await upsertMember({
    displayName: input.displayName,
    email,
  });
  const workspace = await ensureWorkspaceForMember({
    memberId: member.id,
    workspaceName: buildWorkspaceName(input.displayName, email),
  });
  const now = new Date().toISOString();

  await supabase
    .from("workspace_members")
    .upsert(
      {
        member_id: member.id,
        role: "owner",
        status: "active",
        updated_at: now,
        workspace_id: workspace.id,
      },
      { onConflict: "workspace_id,member_id" },
    );

  const { data: updatedInstallation, error } = await supabase
    .from("app_installations")
    .update({
      binding_email: email,
      binding_status: "verified",
      binding_verified_at: now,
      last_seen_at: now,
      member_id: member.id,
      status: "active",
      updated_at: now,
      workspace_id: workspace.id,
    })
    .eq("id", installation.id)
    .select("id,binding_email,binding_status,binding_verified_at,member_id,platform_store_profile_id,workspace_id")
    .single<AppInstallationBindingRow>();

  if (error || !updatedInstallation) {
    return {
      binding: null,
      reason: error?.message ?? "Failed to bind app installation",
      status: "error",
    };
  }

  if (updatedInstallation.platform_store_profile_id) {
    await supabase
      .from("platform_store_profiles")
      .update({
        member_id: member.id,
        updated_at: now,
        workspace_id: workspace.id,
      })
      .eq("id", updatedInstallation.platform_store_profile_id);
  }

  await backfillPrintOpsOwnership({
    appKey: input.appKey,
    instanceId: input.instanceId,
    installationId: updatedInstallation.id,
    memberId: member.id,
    platform: input.platform,
    platformStoreProfileId: updatedInstallation.platform_store_profile_id,
    workspaceId: workspace.id,
  });

  return {
    binding: await mapBindingState(input, updatedInstallation, member, workspace),
    status: "bound",
  };
}

async function ensurePendingInstallation(input: { appKey: string; instanceId: string; platform: "wix" }) {
  const supabase = getSupabaseAdmin();
  const existing = await supabase
    .from("app_installations")
    .select("id,binding_email,binding_status,binding_verified_at,member_id,platform_store_profile_id,workspace_id")
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId)
    .maybeSingle<AppInstallationBindingRow>();

  if (existing.data) {
    return existing.data;
  }

  const app = await ensureApp(input.appKey);
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("app_installations")
    .upsert(
      {
        app_id: app.id,
        app_key: input.appKey,
        binding_status: "pending",
        distribution_channel: input.platform,
        event_source: "live",
        first_seen_at: now,
        instance_id: input.instanceId,
        last_seen_at: now,
        platform: input.platform,
        status: "active",
        updated_at: now,
      },
      { onConflict: "app_key,platform,instance_id" },
    )
    .select("id,binding_email,binding_status,binding_verified_at,member_id,platform_store_profile_id,workspace_id")
    .single<AppInstallationBindingRow>();

  if (error) {
    return null;
  }

  return data;
}

async function ensureApp(appKey: string) {
  const supabase = getSupabaseAdmin();
  const existing = await supabase.from("zider_apps").select("id").eq("app_key", appKey).maybeSingle<AppRow>();

  if (existing.data) {
    return existing.data;
  }

  const { data, error } = await supabase
    .from("zider_apps")
    .insert({
      app_key: appKey,
      app_name: appKey === "zider_printops" ? "Zider PrintOps" : appKey,
      status: "active",
    })
    .select("id")
    .single<AppRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create app record");
  }

  return data;
}

async function upsertMember(input: { displayName?: string | null; email: string }) {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("zider_members")
    .upsert(
      {
        display_name: input.displayName || input.email.split("@")[0],
        email: input.email,
        email_verified_at: now,
        status: "active",
        updated_at: now,
      },
      { onConflict: "email" },
    )
    .select("email,id")
    .single<MemberRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create member");
  }

  return data;
}

async function ensureWorkspaceForMember(input: { memberId: string; workspaceName: string }) {
  const supabase = getSupabaseAdmin();
  const existing = await supabase.from("workspaces").select("id,name").eq("owner_member_id", input.memberId).eq("status", "active").limit(1).maybeSingle<WorkspaceRow>();

  if (existing.data) {
    return existing.data;
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name: input.workspaceName,
      owner_member_id: input.memberId,
      status: "active",
    })
    .select("id,name")
    .single<WorkspaceRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create workspace");
  }

  return data;
}

async function mapBindingState(
  input: { appKey: string; instanceId: string; platform: "wix" },
  installation: AppInstallationBindingRow,
  knownMember?: MemberRow,
  knownWorkspace?: WorkspaceRow,
): Promise<AccountBindingState> {
  const [profile, member, workspace] = await Promise.all([
    readPlatformStoreProfile(input),
    knownMember ?? readMember(installation.member_id),
    knownWorkspace ?? readWorkspace(installation.workspace_id),
  ]);
  const ownerEmail = profile.status === "loaded" ? profile.profile.ownerEmail : null;
  const suggestedEmail = normalizeEmail(installation.binding_email) ?? normalizeEmail(ownerEmail);

  return {
    bindingEmail: installation.binding_email,
    bindingStatus: installation.binding_status ?? "pending",
    installationId: installation.id,
    member,
    ownerEmail,
    platformStoreProfileId: installation.platform_store_profile_id,
    suggestedEmail,
    workspace,
  };
}

async function readMember(memberId: string | null): Promise<MemberRow | null> {
  if (!memberId) {
    return null;
  }

  const { data } = await getSupabaseAdmin().from("zider_members").select("email,id").eq("id", memberId).maybeSingle<MemberRow>();

  return data ?? null;
}

async function readWorkspace(workspaceId: string | null): Promise<WorkspaceRow | null> {
  if (!workspaceId) {
    return null;
  }

  const { data } = await getSupabaseAdmin().from("workspaces").select("id,name").eq("id", workspaceId).maybeSingle<WorkspaceRow>();

  return data ?? null;
}

async function backfillPrintOpsOwnership(input: {
  appKey: string;
  instanceId: string;
  installationId: string;
  memberId: string;
  platform: "wix";
  platformStoreProfileId: string | null;
  workspaceId: string;
}) {
  const supabase = getSupabaseAdmin();
  const update = {
    installation_id: input.installationId,
    member_id: input.memberId,
    platform_store_profile_id: input.platformStoreProfileId,
    updated_at: new Date().toISOString(),
    workspace_id: input.workspaceId,
  };
  const match = {
    app_key: input.appKey,
    instance_id: input.instanceId,
    platform: input.platform,
  };

  await Promise.all([
    supabase.from("printops_orders").update(update).match(match),
    supabase.from("printops_templates").update(update).match(match),
    supabase.from("printops_settings").update(update).match(match),
  ]);
}

function buildWorkspaceName(displayName: string | null | undefined, email: string) {
  const name = displayName?.trim() || email.split("@")[0] || "ZIDER";

  return `${name} Workspace`;
}

function normalizeEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase();

  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function generateVerificationCode() {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}

function normalizeVerificationCode(value: string | null | undefined) {
  const code = value?.replace(/\D/g, "").trim();

  return code && code.length === 6 ? code : null;
}

function hashVerificationCode(code: string) {
  return createHash("sha256").update(`${process.env.ACCOUNT_BINDING_CODE_SECRET ?? "zider-dev-code-secret"}:${code}`).digest("hex");
}

async function sendAccountBindingCode(input: { code: string; email: string }): Promise<{ ok: true } | { ok: false; reason: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ACCOUNT_BINDING_FROM_EMAIL;

  if (resendApiKey && fromEmail) {
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from: fromEmail,
        html: `<p>Your ZIDER verification code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px;">${input.code}</p><p>This code expires in 10 minutes.</p>`,
        subject: "Your ZIDER verification code",
        text: `Your ZIDER verification code is ${input.code}. This code expires in 10 minutes.`,
        to: input.email,
      }),
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      return {
        ok: false,
        reason: payload?.message ?? `Email delivery failed with ${response.status}`,
      };
    }

    return { ok: true };
  }

  if (shouldExposeDevelopmentCode()) {
    console.info(`ZIDER account binding code for ${input.email}: ${input.code}`);
    return { ok: true };
  }

  return {
    ok: false,
    reason: "Email delivery is not configured. Set RESEND_API_KEY and ACCOUNT_BINDING_FROM_EMAIL.",
  };
}

function shouldExposeDevelopmentCode() {
  return process.env.NODE_ENV !== "production" || process.env.PRINTOPS_EXPOSE_BINDING_CODE === "1";
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
