import { getSupabaseAdmin } from "@/lib/supabase/server";

export type PrintOpsTemplateRecord = Record<string, unknown> & {
  defaultLanguage?: unknown;
  documentType?: unknown;
  id?: unknown;
  isDefault?: unknown;
  name?: unknown;
};

export type PrintOpsTemplateReadResult =
  | {
      selectedTemplateId: string | null;
      status: "loaded";
      templates: PrintOpsTemplateRecord[];
    }
  | {
      reason: string;
      selectedTemplateId: null;
      status: "skipped" | "error";
      templates: [];
    };

export type PrintOpsTemplatePersistenceResult =
  | {
      persistedCount: number;
      status: "persisted";
    }
  | {
      persistedCount: 0;
      reason: string;
      status: "skipped" | "error";
    };

type PrintOpsTemplateRow = {
  is_default: boolean;
  template_id: string;
  template_record: PrintOpsTemplateRecord;
  updated_at: string;
};

type PersistPrintOpsTemplatesInput = {
  appKey: string;
  instanceId: string;
  platform: "wix";
  selectedTemplateId: string | null;
  templates: PrintOpsTemplateRecord[];
};

export async function readPrintOpsTemplates(input: {
  appKey: string;
  instanceId: string;
  platform: "wix";
}): Promise<PrintOpsTemplateReadResult> {
  if (!hasSupabaseEnv()) {
    return {
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      selectedTemplateId: null,
      status: "skipped",
      templates: [],
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("printops_templates")
    .select("template_id,is_default,template_record,updated_at")
    .eq("app_key", input.appKey)
    .eq("platform", input.platform)
    .eq("instance_id", input.instanceId)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false })
    .returns<PrintOpsTemplateRow[]>();

  if (!error) {
    const templates = (data ?? []).map((row) => ({
      ...row.template_record,
      id: readString(row.template_record.id) ?? row.template_id,
      isDefault: Boolean(row.template_record.isDefault ?? row.is_default),
    }));
    const selectedTemplateId = templates.find((template) => template.isDefault)?.id;

    return {
      selectedTemplateId: readString(selectedTemplateId),
      status: "loaded",
      templates,
    };
  }

  if (isMissingTableError(error)) {
    return {
      reason: "Missing printops_templates table. Run supabase/migrations/20260621_add_printops_templates.sql first.",
      selectedTemplateId: null,
      status: "skipped",
      templates: [],
    };
  }

  return {
    reason: error.message ?? "Failed to read PrintOps templates",
    selectedTemplateId: null,
    status: "error",
    templates: [],
  };
}

export async function persistPrintOpsTemplates(input: PersistPrintOpsTemplatesInput): Promise<PrintOpsTemplatePersistenceResult> {
  if (!hasSupabaseEnv()) {
    return {
      persistedCount: 0,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      status: "skipped",
    };
  }

  const templates = input.templates.filter((template) => readString(template.id));

  if (templates.length === 0) {
    return {
      persistedCount: 0,
      status: "persisted",
    };
  }

  const selectedTemplateId = input.selectedTemplateId ?? readString(templates.find((template) => template.isDefault)?.id);
  const rows = templates.map((template) => {
    const templateId = readString(template.id)!;
    const isDefault = templateId === selectedTemplateId || Boolean(template.isDefault);

    return {
      app_key: input.appKey,
      default_language: readString(template.defaultLanguage),
      document_type: readString(template.documentType),
      instance_id: input.instanceId,
      is_default: isDefault,
      platform: input.platform,
      template_id: templateId,
      template_name: readString(template.name),
      template_record: {
        ...template,
        isDefault,
      },
      updated_at: new Date().toISOString(),
    };
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("printops_templates").upsert(rows, {
    onConflict: "app_key,platform,instance_id,template_id",
  });

  if (!error) {
    const templateIds = rows.map((row) => row.template_id);
    const { error: deleteError } = await supabase
      .from("printops_templates")
      .delete()
      .eq("app_key", input.appKey)
      .eq("platform", input.platform)
      .eq("instance_id", input.instanceId)
      .not("template_id", "in", `(${templateIds.map(escapePostgrestListValue).join(",")})`);

    if (deleteError) {
      return {
        persistedCount: 0,
        reason: deleteError.message ?? "Failed to prune deleted PrintOps templates",
        status: "error",
      };
    }

    return {
      persistedCount: rows.length,
      status: "persisted",
    };
  }

  if (isMissingTableError(error)) {
    return {
      persistedCount: 0,
      reason: "Missing printops_templates table. Run supabase/migrations/20260621_add_printops_templates.sql first.",
      status: "skipped",
    };
  }

  return {
    persistedCount: 0,
    reason: error.message ?? "Failed to persist PrintOps templates",
    status: "error",
  };
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";

  return error.code === "42P01" || message.includes("relation") || message.includes("printops_templates");
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function escapePostgrestListValue(value: string) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}"`;
}
