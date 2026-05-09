import { CURSOR_APP_KEY, DEFAULT_CURSOR_CONFIG, normalizeCursorConfig, type CursorConfig, type CursorConfigInput } from "@/cursor/core";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type CursorConfigRecord = {
  appKey: typeof CURSOR_APP_KEY;
  platform: "wix" | "zider" | "direct";
  instanceId: string;
  draftConfig: CursorConfig;
  publishedConfig: CursorConfig;
  updatedAt: string;
  publishedAt: string | null;
};

type SaveCursorConfigInput = {
  platform: CursorConfigRecord["platform"];
  instanceId: string;
  config: CursorConfigInput;
  publish?: boolean;
};

const memoryStore = new Map<string, CursorConfigRecord>();
const tableName = process.env.CURSOR_WIDGET_CONFIGS_TABLE ?? "widget_configs";

export async function getCursorConfigRecord(platform: CursorConfigRecord["platform"], instanceId: string): Promise<CursorConfigRecord> {
  const key = createKey(platform, instanceId);
  const fromMemory = memoryStore.get(key);

  if (fromMemory) {
    return fromMemory;
  }

  const fromSupabase = await readFromSupabase(platform, instanceId);

  if (fromSupabase) {
    memoryStore.set(key, fromSupabase);
    return fromSupabase;
  }

  const empty = createEmptyRecord(platform, instanceId);
  memoryStore.set(key, empty);
  return empty;
}

export async function saveCursorConfigRecord(input: SaveCursorConfigInput) {
  const current = await getCursorConfigRecord(input.platform, input.instanceId);
  const now = new Date().toISOString();
  const draftConfig = normalizeCursorConfig({
    ...current.draftConfig,
    ...input.config,
    defaultStyle: {
      ...current.draftConfig.defaultStyle,
      ...input.config.defaultStyle,
    },
    linkStyle: {
      ...current.draftConfig.linkStyle,
      ...input.config.linkStyle,
    },
    customAsset: {
      ...current.draftConfig.customAsset,
      ...input.config.customAsset,
    },
    interaction: {
      ...current.draftConfig.interaction,
      ...input.config.interaction,
    },
  });
  const next: CursorConfigRecord = {
    ...current,
    draftConfig,
    publishedConfig: input.publish ? draftConfig : current.publishedConfig,
    updatedAt: now,
    publishedAt: input.publish ? now : current.publishedAt,
  };

  memoryStore.set(createKey(input.platform, input.instanceId), next);
  await writeToSupabase(next).catch((error) => {
    console.warn("Falling back to in-memory cursor config store", {
      platform: input.platform,
      instanceId: input.instanceId,
      error: error instanceof Error ? error.message : error,
    });
  });

  return next;
}

function createEmptyRecord(platform: CursorConfigRecord["platform"], instanceId: string): CursorConfigRecord {
  const now = new Date().toISOString();
  const config = normalizeCursorConfig(DEFAULT_CURSOR_CONFIG);

  return {
    appKey: CURSOR_APP_KEY,
    platform,
    instanceId,
    draftConfig: config,
    publishedConfig: config,
    updatedAt: now,
    publishedAt: null,
  };
}

async function readFromSupabase(platform: CursorConfigRecord["platform"], instanceId: string) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(tableName)
      .select("draft_config,published_config,updated_at,published_at")
      .eq("app_key", CURSOR_APP_KEY)
      .eq("platform", platform)
      .eq("instance_id", instanceId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      appKey: CURSOR_APP_KEY,
      platform,
      instanceId,
      draftConfig: normalizeCursorConfig((data.draft_config ?? {}) as CursorConfigInput),
      publishedConfig: normalizeCursorConfig((data.published_config ?? data.draft_config ?? {}) as CursorConfigInput),
      updatedAt: String(data.updated_at ?? new Date().toISOString()),
      publishedAt: data.published_at ? String(data.published_at) : null,
    } satisfies CursorConfigRecord;
  } catch {
    return null;
  }
}

async function writeToSupabase(record: CursorConfigRecord) {
  if (!hasSupabaseEnv()) {
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(tableName).upsert(
    {
      app_key: record.appKey,
      platform: record.platform,
      instance_id: record.instanceId,
      draft_config: record.draftConfig,
      published_config: record.publishedConfig,
      updated_at: record.updatedAt,
      published_at: record.publishedAt,
    },
    { onConflict: "app_key,platform,instance_id" },
  );

  if (error) {
    throw error;
  }
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function createKey(platform: string, instanceId: string) {
  return `${platform}:${CURSOR_APP_KEY}:${instanceId}`;
}
