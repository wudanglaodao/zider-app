#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = parseArgs(process.argv.slice(2));
const filePath = args.file;
const appKey = args["app-key"] ?? args.appKey;
const platform = args.platform ?? "wix";
const envPath = args.env ?? ".env.local";
const dryRun = Boolean(args["dry-run"] ?? args.dryRun);

if (!filePath || !appKey) {
  throw new Error("Usage: npm run import:wix-payout -- --app-key zider_countup --file /path/to/payout.csv");
}

const env = await loadEnv(envPath);
const csvText = await fs.readFile(filePath, "utf8");
const rows = parseCsv(csvText);
const sourceFile = path.basename(filePath);
const records = rows.map((row) => mapPayoutRow(row, { appKey, platform, sourceFile }));
const summary = summarize(records);

if (dryRun) {
  console.log(JSON.stringify({ dryRun: true, appKey, platform, sourceFile, summary }, null, 2));
  process.exit(0);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const app = await findApp(supabase, appKey);
const appPlatform = await findAppPlatform(supabase, appKey, platform);
const rowsWithIds = records.map((record) => ({
  ...record,
  app_id: app.id,
  app_platform_id: appPlatform?.id ?? null,
}));

const { error } = await supabase
  .from("app_revenue_transactions")
  .upsert(rowsWithIds, { onConflict: "app_key,platform,invoice_id" });

if (error) {
  throw new Error(
    [
      `Failed to import Wix payout CSV: ${error.message}`,
      "If this says the table is missing from the schema cache, run supabase/migrations/20260509_add_wix_revenue_imports.sql in Supabase SQL Editor first.",
    ].join("\n"),
  );
}

const monthlyActuals = await readMonthlyActuals(supabase, appKey, platform);

console.log(
  JSON.stringify(
    {
      imported: rowsWithIds.length,
      appKey,
      platform,
      sourceFile,
      summary,
      monthlyActuals,
    },
    null,
    2,
  ),
);

function parseArgs(values) {
  const parsed = {};

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];

    if (!value.startsWith("--")) {
      continue;
    }

    const key = value.slice(2);
    const next = values[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

async function loadEnv(targetPath) {
  const text = await fs.readFile(targetPath, "utf8");
  const env = {};

  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const index = line.indexOf("=");

    if (index < 0) {
      continue;
    }

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value.replace(/\\n/g, "\n");
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(`Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in ${targetPath}`);
  }

  return env;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  row.push(field);
  rows.push(row);

  const headers = rows.shift()?.map((header) => header.trim()) ?? [];

  return rows
    .filter((cells) => cells.some((cell) => cell.trim() !== ""))
    .map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() ?? ""])));
}

function mapPayoutRow(row, context) {
  return {
    app_key: context.appKey,
    platform: context.platform,
    source: "wix_payout_csv",
    source_file: context.sourceFile,
    transaction_at: normalizeTimestamp(row["Transaction's Date"]),
    invoice_id: required(row["Invoice ID"], "Invoice ID"),
    instance_id: emptyToNull(row["Instance ID"]),
    website: emptyToNull(row.Website),
    transaction_type: required(row["Transaction Type"], "Transaction Type").toUpperCase(),
    cycle: emptyToNull(row.Cycle)?.toUpperCase() ?? null,
    product_id: emptyToNull(row["Product ID"]),
    offer: normalizeOffer(row.Offer),
    amount_usd: parseAmount(row["Amount (USD)"]),
    amount_after_billing_fee_usd: parseAmount(row["Amount after Billing Fee (USD)"]),
    your_revenue_usd: parseAmount(row["Your Revenue (USD)"]),
    revenue_share_pct: parseAmount(row["Revenue Share (%)"]),
    transaction_currency: emptyToNull(row["Currency of Transaction"]),
    raw_row: row,
  };
}

async function findApp(supabase, appKey) {
  const { data, error } = await supabase.from("zider_apps").select("id").eq("app_key", appKey).single();

  if (error) {
    throw new Error(`Could not find app_key=${appKey}: ${error.message}`);
  }

  return data;
}

async function findAppPlatform(supabase, appKey, platform) {
  const { data, error } = await supabase
    .from("app_platforms")
    .select("id")
    .eq("app_key", appKey)
    .eq("platform", platform)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read app platform for ${platform}:${appKey}: ${error.message}`);
  }

  return data;
}

async function readMonthlyActuals(supabase, appKey, platform) {
  const { data, error } = await supabase
    .from("app_revenue_monthly_actuals")
    .select("revenue_month, transaction_count, paying_instance_count, amount_usd, your_revenue_usd")
    .eq("app_key", appKey)
    .eq("platform", platform)
    .order("revenue_month", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return data;
}

function normalizeTimestamp(value) {
  const raw = required(value, "Transaction's Date");

  if (/[zZ]|[+-]\d\d:?\d\d$/.test(raw)) {
    return raw;
  }

  return `${raw.replace(" ", "T")}Z`;
}

function normalizeOffer(value) {
  const clean = emptyToNull(value);

  if (!clean || clean.toLowerCase() === "none") {
    return null;
  }

  return clean;
}

function parseAmount(value) {
  const clean = emptyToNull(value);

  if (!clean) {
    return null;
  }

  const number = Number(clean);

  if (!Number.isFinite(number)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }

  return number;
}

function required(value, label) {
  const clean = emptyToNull(value);

  if (!clean) {
    throw new Error(`Missing required field: ${label}`);
  }

  return clean;
}

function emptyToNull(value) {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const clean = value.trim();
  return clean === "" ? null : clean;
}

function summarize(records) {
  const totals = {
    transactionCount: records.length,
    uniqueInstances: new Set(records.map((record) => record.instance_id).filter(Boolean)).size,
    uniqueInvoices: new Set(records.map((record) => record.invoice_id)).size,
    amountUsd: 0,
    yourRevenueUsd: 0,
  };
  const byMonth = new Map();

  for (const record of records) {
    totals.amountUsd += record.amount_usd ?? 0;
    totals.yourRevenueUsd += record.your_revenue_usd ?? 0;

    const month = record.transaction_at.slice(0, 7);
    const entry = byMonth.get(month) ?? { month, transactionCount: 0, amountUsd: 0, yourRevenueUsd: 0 };
    entry.transactionCount += 1;
    entry.amountUsd += record.amount_usd ?? 0;
    entry.yourRevenueUsd += record.your_revenue_usd ?? 0;
    byMonth.set(month, entry);
  }

  return {
    ...roundMoneyObject(totals),
    byMonth: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)).map(roundMoneyObject),
  };
}

function roundMoneyObject(value) {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      typeof entry === "number" ? Math.round(entry * 1000000) / 1000000 : entry,
    ]),
  );
}
