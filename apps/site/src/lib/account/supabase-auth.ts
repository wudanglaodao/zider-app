import { Buffer } from "node:buffer";

import { createClient, type User } from "@supabase/supabase-js";

type OAuthStorageData = Record<string, string>;

export const supabaseOAuthStorageCookieName = "zider_supabase_oauth_storage";
export const supabaseOAuthStorageMaxAgeSeconds = 10 * 60;

export function getSupabaseAuthConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return {
    anonKey,
    url,
  };
}

export function createSupabaseAuthClient(storage?: ReturnType<typeof createOAuthStorage>["storage"]) {
  const config = getSupabaseAuthConfig();

  if (!config) {
    throw new Error("Missing SUPABASE_URL and Supabase anon key for account auth");
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "pkce",
      persistSession: Boolean(storage),
      storage,
    },
  });
}

export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin client");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createOAuthStorage(initialData: OAuthStorageData = {}) {
  const data: OAuthStorageData = {
    ...initialData,
  };

  return {
    data,
    storage: {
      getItem(key: string) {
        return data[key] ?? null;
      },
      removeItem(key: string) {
        delete data[key];
      },
      setItem(key: string, value: string) {
        data[key] = value;
      },
    },
  };
}

export function encodeOAuthStorage(data: OAuthStorageData) {
  return Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
}

export function decodeOAuthStorage(value: string | null | undefined): OAuthStorageData {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function displayNameFromSupabaseUser(user: User, fallbackName = "") {
  const metadata = user.user_metadata ?? {};
  const metadataName =
    stringMetadata(metadata.full_name) ||
    stringMetadata(metadata.name) ||
    stringMetadata(metadata.user_name) ||
    stringMetadata(metadata.preferred_username);

  return metadataName || fallbackName.trim() || user.email?.split("@")[0] || null;
}

export function avatarUrlFromSupabaseUser(user: User) {
  const metadata = user.user_metadata ?? {};

  return (
    stringMetadata(metadata.avatar_url) ||
    stringMetadata(metadata.picture) ||
    stringMetadata(metadata.photo_url) ||
    stringMetadata(metadata.image_url) ||
    null
  );
}

function stringMetadata(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
