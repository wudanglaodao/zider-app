import { NextResponse, type NextRequest } from "next/server";

import {
  createOAuthStorage,
  createSupabaseAuthClient,
  encodeOAuthStorage,
  supabaseOAuthStorageCookieName,
  supabaseOAuthStorageMaxAgeSeconds,
} from "@/lib/account/supabase-auth";
import { isAccountAuthConfigured } from "@/lib/account/auth";
import { normalizeAccountNextPath } from "@/lib/account/session";

export async function GET(request: NextRequest) {
  const mode = accountModeFromSearch(request.nextUrl.searchParams.get("mode"));
  const nextPath = normalizeAccountNextPath(request.nextUrl.searchParams.get("next"), "/");

  if (!isAccountAuthConfigured()) {
    return NextResponse.redirect(accountRedirectUrl(request, mode, "google_config", nextPath));
  }

  const callbackUrl = new URL("/api/account/auth/callback", request.nextUrl.origin);
  callbackUrl.searchParams.set("mode", mode);

  if (nextPath !== "/") {
    callbackUrl.searchParams.set("next", nextPath);
  }

  try {
    const oauthStorage = createOAuthStorage();
    const supabase = createSupabaseAuthClient(oauthStorage.storage);
    const { data, error } = await supabase.auth.signInWithOAuth({
      options: {
        queryParams: {
          prompt: "select_account",
        },
        redirectTo: callbackUrl.toString(),
      },
      provider: "google",
    });

    if (error || !data.url) {
      throw error || new Error("Supabase did not return a Google OAuth URL");
    }

    const response = NextResponse.redirect(data.url);

    response.cookies.set(supabaseOAuthStorageCookieName, encodeOAuthStorage(oauthStorage.data), {
      httpOnly: true,
      maxAge: supabaseOAuthStorageMaxAgeSeconds,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Failed to start Supabase Google sign-in", error);

    return NextResponse.redirect(accountRedirectUrl(request, mode, "google_failed", nextPath));
  }
}

function accountModeFromSearch(value: string | null) {
  return value === "register" || value === "forgot" ? value : "signin";
}

function accountRedirectUrl(request: NextRequest, mode: string, error: string, nextPath: string) {
  const path = mode === "register" ? "/register" : mode === "forgot" ? "/forgot-password" : "/account";
  const url = new URL(path, request.nextUrl.origin);

  url.searchParams.set("error", error);

  if (nextPath !== "/") {
    url.searchParams.set("next", nextPath);
  }

  return url;
}
