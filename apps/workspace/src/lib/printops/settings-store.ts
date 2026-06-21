import { getSupabaseAdmin } from "@/lib/supabase/server";

export type PrintOpsSettingsRecord = {
  printLocale: string | null;
  siteLocale: string | null;
  theme: "dark" | "light" | null;
  timezone: string | null;
  workspaceAccent: string | null;
};

export type PrintOpsSettingsReadResult =
  | {
      settings: PrintOpsSettingsRecord | null;
      status: "loaded";
    }
  | {
      reason: string;
      settings: null;
      status: "skipped" | "error";
    };

export type PrintOpsSettingsPersistenceResult =
  | {
      status: "persisted";
    }
  | {
      reason: string;
      status: "skipped" | "error";
    };

type PrintOpsSettingsRow = {
  print_locale: string | null;
  settings: Record<string, unknown> | null;
  site_locale: string | null;
  theme: string | null;
  timezone: string | null;
  workspace_accent: string | null;
};

export async function readPrintOpsSettings(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
}): Promise<PrintOpsSettingsReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      settings: null,
      status: "skipped",
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("printops_settings")
    .select("site_locale,print_locale,timezone,workspace_accent,theme,settings")
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId)
    .maybeSingle<PrintOpsSettingsRow>();

  if (!error) {
    return {
      settings: data ? mapSettingsRow(data) : null,
      status: "loaded",
    };
  }

  if (isMissingTableError(error)) {
    return {
      reason: "Missing printops_settings table. Run supabase/migrations/20260621_add_printops_settings.sql first.",
      settings: null,
      status: "skipped",
    };
  }

  return {
    reason: error.message ?? "Failed to read PrintOps settings",
    settings: null,
    status: "error",
  };
}

export async function persistPrintOpsSettings(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
  settings: PrintOpsSettingsRecord;
}): Promise<PrintOpsSettingsPersistenceResult> {
  if (!hasSupabaseEnv()) {
    return {
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const row = {
    app_key: input.appKey,
    instance_id: input.instanceId,
    platform: input.platform,
    print_locale: input.settings.printLocale,
    settings: input.settings,
    site_locale: input.settings.siteLocale,
    theme: input.settings.theme,
    timezone: input.settings.timezone,
    updated_at: new Date().toISOString(),
    workspace_accent: input.settings.workspaceAccent,
  };
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("printops_settings").upsert(row, {
    onConflict: "app_key,platform,instance_id",
  });

  if (!error) {
    return {
      status: "persisted",
    };
  }

  if (isMissingTableError(error)) {
    return {
      reason: "Missing printops_settings table. Run supabase/migrations/20260621_add_printops_settings.sql first.",
      status: "skipped",
    };
  }

  return {
    reason: error.message ?? "Failed to persist PrintOps settings",
    status: "error",
  };
}

function mapSettingsRow(row: PrintOpsSettingsRow): PrintOpsSettingsRecord {
  return {
    printLocale: row.print_locale ?? readString(row.settings?.printLocale),
    siteLocale: row.site_locale ?? readString(row.settings?.siteLocale),
    theme: row.theme === "dark" || row.theme === "light" ? row.theme : null,
    timezone: row.timezone ?? readString(row.settings?.timezone),
    workspaceAccent: row.workspace_accent ?? readString(row.settings?.workspaceAccent),
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "42P01" || message.includes("relation") || message.includes("printops_settings");
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}
