import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { getSupabaseAdmin } from "@/lib/supabase/server";

const scryptAsync = promisify(scrypt);
const passwordHashVersion = "scrypt-v1";
const keyLength = 64;

export type ZiderUserRole = "admin" | "editor" | "member";
export type ZiderUserStatus = "active" | "disabled";

export type ZiderUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: ZiderUserRole;
  status: ZiderUserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ZiderUserRow = {
  created_at: string;
  display_name: string | null;
  email: string;
  id: string;
  last_login_at: string | null;
  role: ZiderUserRole;
  status: ZiderUserStatus;
  updated_at: string;
};

type ZiderUserPrivateRow = ZiderUserRow & {
  password_hash: string;
};

const ziderUserSelect = `
  id,
  email,
  display_name,
  role,
  status,
  last_login_at,
  created_at,
  updated_at
`;

const ziderUserPrivateSelect = `
  ${ziderUserSelect},
  password_hash
`;

export async function getZiderUserById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("zider_users").select(ziderUserSelect).eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to load account user: ${error.message}`);
  }

  return data ? mapZiderUser(data) : null;
}

export async function verifyZiderUserCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("zider_users")
    .select(ziderUserPrivateSelect)
    .eq("email", normalizedEmail)
    .eq("status", "active")
    .maybeSingle<ZiderUserPrivateRow>();

  if (error) {
    throw new Error(`Failed to verify account user: ${error.message}`);
  }

  if (!data || !(await verifyPassword(password, data.password_hash))) {
    return null;
  }

  const now = new Date().toISOString();
  await supabase
    .from("zider_users")
    .update({
      last_login_at: now,
      updated_at: now,
    })
    .eq("id", data.id);

  return mapZiderUser({
    ...data,
    last_login_at: now,
    updated_at: now,
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer;

  return `${passwordHashVersion}$${salt}$${derivedKey.toString("base64url")}`;
}

async function verifyPassword(password: string, passwordHash: string) {
  const [version, salt, storedKey] = passwordHash.split("$");

  if (version !== passwordHashVersion || !salt || !storedKey) {
    return false;
  }

  const storedBuffer = Buffer.from(storedKey, "base64url");
  const derivedKey = (await scryptAsync(password, salt, storedBuffer.length)) as Buffer;

  return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function mapZiderUser(row: ZiderUserRow): ZiderUser {
  return {
    createdAt: row.created_at,
    displayName: row.display_name,
    email: row.email,
    id: row.id,
    lastLoginAt: row.last_login_at,
    role: row.role,
    status: row.status,
    updatedAt: row.updated_at,
  };
}
