import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const passwordHashVersion = "scrypt-v1";
const keyLength = 64;

loadEnvFiles(["../../.env", "../../.env.local", ".env", ".env.local"]);

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ZIDER_ADMIN_EMAIL || "yancytien@gmail.com").trim().toLowerCase();
const password = process.env.ZIDER_ADMIN_PASSWORD || "";
const displayName = process.env.ZIDER_ADMIN_DISPLAY_NAME || "Yancy Tien";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

if (!password || password.length < 10) {
  throw new Error("Missing ZIDER_ADMIN_PASSWORD, or password is shorter than 10 characters.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const passwordHash = await hashPassword(password);
const now = new Date().toISOString();
const { data, error } = await supabase
  .from("zider_users")
  .upsert(
    {
      display_name: displayName,
      email,
      password_hash: passwordHash,
      role: "admin",
      status: "active",
      updated_at: now,
    },
    {
      onConflict: "email",
    },
  )
  .select("id,email,role,status")
  .single();

if (error) {
  throw new Error(`Failed to seed admin user: ${error.message}`);
}

console.log(`Seeded ${data.role} user ${data.email}.`);

async function hashPassword(value) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await scryptAsync(value, salt, keyLength);

  return `${passwordHashVersion}$${salt}$${derivedKey.toString("base64url")}`;
}

function loadEnvFiles(paths) {
  for (const path of paths) {
    const target = resolve(path);

    if (!existsSync(target)) {
      continue;
    }

    const lines = readFileSync(target, "utf8").split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);

      if (!match || process.env[match[1]]) {
        continue;
      }

      process.env[match[1]] = unquoteEnvValue(match[2]);
    }
  }
}

function unquoteEnvValue(value) {
  const trimmed = value.trim();

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).replace(/\\n/g, "\n");
  }

  return trimmed;
}
