import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

import { getSupabaseAdmin } from "@/lib/supabase/server";

const scryptAsync = promisify(scrypt);
const passwordHashVersion = "scrypt-v1";
const keyLength = 64;

export type ZiderUserRole = "admin" | "editor" | "member";
export type ZiderUserStatus = "active" | "disabled";

export type ZiderUser = {
  avatarUrl: string | null;
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
  avatar_url: string | null;
  created_at: string;
  display_name: string | null;
  email: string;
  id: string;
  last_login_at: string | null;
  role: ZiderUserRole;
  status: ZiderUserStatus;
  updated_at: string;
};

const ziderUserSelect = `
  id,
  email,
  avatar_url,
  display_name,
  role,
  status,
  last_login_at,
  created_at,
  updated_at
`;

export async function getZiderUserById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("zider_users").select(ziderUserSelect).eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to load account user: ${error.message}`);
  }

  return data ? mapZiderUser(data) : null;
}

export async function getZiderUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("zider_users")
    .select(ziderUserSelect)
    .eq("email", normalizedEmail)
    .maybeSingle<ZiderUserRow>();

  if (error) {
    throw new Error(`Failed to load account user by email: ${error.message}`);
  }

  return data ? mapZiderUser(data) : null;
}

export async function createOrUpdateZiderUserFromEmail({
  avatarUrl,
  displayName,
  email,
}: {
  avatarUrl?: string | null;
  displayName?: string | null;
  email: string;
}) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const existingUser = await getZiderUserByEmail(normalizedEmail);
  const nextDisplayName = displayName?.trim() || existingUser?.displayName || normalizedEmail.split("@")[0] || null;
  const nextAvatarUrl = avatarUrl?.trim() || existingUser?.avatarUrl || null;

  if (existingUser) {
    const updates: {
      avatar_url?: string | null;
      display_name?: string;
      updated_at?: string;
    } = {};

    if (nextDisplayName && nextDisplayName !== existingUser.displayName) {
      updates.display_name = nextDisplayName;
    }

    if (nextAvatarUrl && nextAvatarUrl !== existingUser.avatarUrl) {
      updates.avatar_url = nextAvatarUrl;
    }

    if (Object.keys(updates).length > 0) {
      const supabase = getSupabaseAdmin();
      const now = new Date().toISOString();
      updates.updated_at = now;
      const { data, error } = await supabase
        .from("zider_users")
        .update(updates)
        .eq("id", existingUser.id)
        .select(ziderUserSelect)
        .single<ZiderUserRow>();

      if (error) {
        throw new Error(`Failed to update account user: ${error.message}`);
      }

      return mapZiderUser(data);
    }

    return existingUser;
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("zider_users")
    .insert({
      avatar_url: nextAvatarUrl,
      display_name: nextDisplayName,
      email: normalizedEmail,
      password_hash: await hashPassword(`email-code:${randomBytes(24).toString("base64url")}`),
      role: "member",
      status: "active",
      updated_at: now,
    })
    .select(ziderUserSelect)
    .single<ZiderUserRow>();

  if (error) {
    throw new Error(`Failed to create account user: ${error.message}`);
  }

  return mapZiderUser(data);
}

export async function updateZiderUserDisplayName({
  displayName,
  id,
}: {
  displayName: string;
  id: string;
}) {
  const nextDisplayName = displayName.trim();

  if (!nextDisplayName) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("zider_users")
    .update({
      display_name: nextDisplayName,
      updated_at: now,
    })
    .eq("id", id)
    .select(ziderUserSelect)
    .single<ZiderUserRow>();

  if (error) {
    throw new Error(`Failed to update account profile: ${error.message}`);
  }

  return mapZiderUser(data);
}

export async function touchZiderUserLogin(user: ZiderUser) {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  await supabase
    .from("zider_users")
    .update({
      last_login_at: now,
      updated_at: now,
    })
    .eq("id", user.id);

  return {
    ...user,
    lastLoginAt: now,
    updatedAt: now,
  };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer;

  return `${passwordHashVersion}$${salt}$${derivedKey.toString("base64url")}`;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function mapZiderUser(row: ZiderUserRow): ZiderUser {
  return {
    avatarUrl: row.avatar_url,
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
