import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const initialEnvKeys = new Set(Object.keys(process.env));

loadEnvFiles(["../../.env", "../../.env.local", ".env", ".env.local"]);

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const records = readSecretRecords();

if (!records.length) {
  throw new Error(
    "No platform secrets found. Set ZIDER_APP_PLATFORM_SECRETS_JSON or the interactive cursor seed variables.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const now = new Date().toISOString();
const { data, error } = await supabase
  .from("app_platform_secrets")
  .upsert(
    records.map((record) => ({
      app_key: record.appKey,
      client_id: record.clientId || null,
      client_secret: record.clientSecret || null,
      notes: record.notes || null,
      platform: record.platform || "wix",
      updated_at: now,
      webhook_public_key: normalizePemValue(record.webhookPublicKey),
      webhook_secret: record.webhookSecret || null,
    })),
    {
      onConflict: "app_key,platform",
    },
  )
  .select("app_key,platform")
  .returns();

if (error) {
  throw new Error(`Failed to seed app platform secrets: ${error.message}`);
}

console.log(`Seeded ${data?.length ?? 0} app platform secret record(s).`);

function readSecretRecords() {
  const json = process.env.ZIDER_APP_PLATFORM_SECRETS_JSON?.trim();

  if (json) {
    const parsed = JSON.parse(json);
    const records = Array.isArray(parsed) ? parsed : Object.values(parsed);

    return records.map((record) => ({
      appKey: normalizeAppKey(requiredString(record.appKey ?? record.app_key, "appKey")),
      clientId: optionalString(record.clientId ?? record.client_id ?? record.oauthClientId ?? record.oauth_client_id),
      clientSecret: optionalString(
        record.clientSecret ?? record.client_secret ?? record.oauthClientSecret ?? record.oauth_client_secret,
      ),
      notes: optionalString(record.notes),
      platform: optionalString(record.platform) || "wix",
      webhookPublicKey: optionalString(record.webhookPublicKey ?? record.webhook_public_key),
      webhookSecret: optionalString(record.webhookSecret ?? record.webhook_secret ?? record.appSecret ?? record.app_secret),
    }));
  }

  const webhookRecords = readWebhookPublicKeyRecords();
  const interactiveCursor = {
    appKey: "interactive_custom_cursor",
    clientId: optionalString(process.env.ZIDER_WIX_CLIENT_ID || process.env.WIX_INTERACTIVE_CUSTOM_CURSOR_APP_ID),
    clientSecret: optionalString(process.env.ZIDER_WIX_CLIENT_SECRET || process.env.WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET),
    notes: "Seeded from local environment.",
    platform: "wix",
    webhookPublicKey: optionalString(process.env.ZIDER_WIX_WEBHOOK_PUBLIC_KEY || process.env.WIX_WEBHOOK_PUBLIC_KEY),
    webhookSecret: optionalString(process.env.ZIDER_WIX_APP_SECRET || process.env.WIX_INTERACTIVE_CUSTOM_CURSOR_APP_SECRET),
  };

  return mergeSecretRecords([...webhookRecords, ...(hasAnySecret(interactiveCursor) ? [interactiveCursor] : [])]);
}

function hasAnySecret(record) {
  return Boolean(record.clientId || record.clientSecret || record.webhookPublicKey || record.webhookSecret);
}

function requiredString(value, label) {
  const normalized = optionalString(value);

  if (!normalized) {
    throw new Error(`Missing ${label} in platform secret record.`);
  }

  return normalized;
}

function optionalString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizePemValue(value) {
  const normalized = optionalString(value);

  if (!normalized) {
    return null;
  }

  return normalized.replace(/\\n/g, "\n");
}

function readWebhookPublicKeyRecords() {
  const envNames = ["ZIDER_WIX_WEBHOOK_PUBLIC_KEYS", "WIX_WEBHOOK_PUBLIC_KEYS", "WIX_WEBHOOK_ZIDER_APP_PUBLIC_KEYS"];
  const records = [];

  for (const envName of envNames) {
    const raw = process.env[envName]?.trim();

    if (!raw) {
      continue;
    }

    try {
      const parsed = parseWebhookPublicKeyMap(raw);
      const entries = Array.isArray(parsed)
        ? parsed.map((record) => [record.appKey ?? record.app_key, record.webhookPublicKey ?? record.webhook_public_key])
        : Object.entries(parsed);

      records.push(
        ...entries
          .map(([appKey, webhookPublicKey]) => ({
            appKey: normalizeAppKey(requiredString(appKey, "appKey")),
            clientId: "",
            clientSecret: "",
            notes: `Seeded from ${envName}.`,
            platform: "wix",
            webhookPublicKey: optionalString(webhookPublicKey),
            webhookSecret: "",
          }))
          .filter(hasAnySecret),
      );
    } catch (error) {
      console.warn(`Skipping ${envName}: ${error instanceof Error ? error.message : "invalid webhook public key map"}`);
    }
  }

  return mergeSecretRecords(records);
}

function parseWebhookPublicKeyMap(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(raw.replace(/\r?\n/g, "\\n"));
  }
}

function normalizeAppKey(appKey) {
  const aliases = {
    "interactive-custom-cursor": "interactive_custom_cursor",
  };

  return aliases[appKey] || appKey;
}

function mergeSecretRecords(records) {
  const merged = new Map();

  for (const record of records) {
    const key = `${record.platform || "wix"}:${record.appKey}`;
    const previous = merged.get(key);

    merged.set(key, previous ? { ...previous, ...pickNonEmpty(record) } : record);
  }

  return Array.from(merged.values());
}

function pickNonEmpty(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => Boolean(value)));
}

function loadEnvFiles(paths) {
  for (const path of paths) {
    const target = resolve(path);

    if (!existsSync(target)) {
      continue;
    }

    for (const [key, value] of parseEnvFile(readFileSync(target, "utf8"))) {
      if (initialEnvKeys.has(key)) {
        continue;
      }

      process.env[key] = value;
    }
  }
}

function parseEnvFile(content) {
  const entries = [];
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);

    if (!match) {
      continue;
    }

    const key = match[1];
    const parsed = parseEnvValue(match[2], lines, index);
    entries.push([key, parsed.value]);
    index = parsed.index;
  }

  return entries;
}

function parseEnvValue(rawValue, lines, index) {
  const trimmed = rawValue.trim();
  const quote = trimmed[0];

  if (quote !== '"' && quote !== "'") {
    if (trimmed.startsWith("{") && !trimmed.endsWith("}")) {
      let value = trimmed;

      while (!value.trim().endsWith("}") && index + 1 < lines.length) {
        index += 1;
        value += `\n${lines[index]}`;
      }

      return {
        index,
        value,
      };
    }

    return {
      index,
      value: trimmed,
    };
  }

  let value = trimmed.slice(1);

  while (!endsWithUnescapedQuote(value, quote) && index + 1 < lines.length) {
    index += 1;
    value += `\n${lines[index]}`;
  }

  if (endsWithUnescapedQuote(value, quote)) {
    value = value.slice(0, -1);
  }

  return {
    index,
    value: value.replace(/\\n/g, "\n"),
  };
}

function endsWithUnescapedQuote(value, quote) {
  if (!value.endsWith(quote)) {
    return false;
  }

  let backslashes = 0;

  for (let index = value.length - 2; index >= 0 && value[index] === "\\"; index -= 1) {
    backslashes += 1;
  }

  return backslashes % 2 === 0;
}
