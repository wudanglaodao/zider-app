import { NextResponse, type NextRequest } from "next/server";

import {
  accountSessionCookieName,
  accountSessionMaxAgeSeconds,
  createAccountSessionValue,
} from "@/lib/account/auth";
import { getAccountRequestOrigin } from "@/lib/account/origin";
import { normalizeAccountNextPath } from "@/lib/account/session";
import {
  createOAuthStorage,
  createSupabaseAuthClient,
  decodeOAuthStorage,
  displayNameFromSupabaseUser,
  supabaseOAuthStorageCookieName,
} from "@/lib/account/supabase-auth";
import { createOrUpdateZiderUserFromEmail, touchZiderUserLogin } from "@/lib/account/users";

type AccountMode = "signin" | "register" | "forgot";

export async function GET(request: NextRequest) {
  const mode = accountModeFromSearch(request.nextUrl.searchParams.get("mode"));
  const nextPath = normalizeAccountNextPath(request.nextUrl.searchParams.get("next"), "/");
  const providerError = request.nextUrl.searchParams.get("error");
  const origin = getAccountRequestOrigin(request);

  if (providerError) {
    return clearSupabaseOAuthCookie(NextResponse.redirect(accountRedirectUrl(origin, mode, "google_failed", nextPath)));
  }

  try {
    const supabaseUser = await resolveSupabaseUser(request);

    if (!supabaseUser.email) {
      return clearSupabaseOAuthCookie(NextResponse.redirect(accountRedirectUrl(origin, mode, "google_email_unverified", nextPath)));
    }

    const user = await createOrUpdateZiderUserFromEmail({
      displayName: displayNameFromSupabaseUser(supabaseUser),
      email: supabaseUser.email,
    });

    if (!user || user.status !== "active") {
      return clearSupabaseOAuthCookie(NextResponse.redirect(accountRedirectUrl(origin, mode, "forbidden", nextPath)));
    }

    const activeUser = await touchZiderUserLogin(user);
    const response = clearSupabaseOAuthCookie(NextResponse.redirect(new URL(nextPath, origin)));

    response.cookies.set(accountSessionCookieName, await createAccountSessionValue(activeUser.id), {
      httpOnly: true,
      maxAge: accountSessionMaxAgeSeconds,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Supabase account callback failed", error);

    return clearSupabaseOAuthCookie(NextResponse.redirect(accountRedirectUrl(origin, mode, "google_failed", nextPath)));
  }
}

async function resolveSupabaseUser(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");
  const code = request.nextUrl.searchParams.get("code");

  if (tokenHash && otpType) {
    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    } as Parameters<typeof supabase.auth.verifyOtp>[0]);

    if (error || !data.user) {
      throw error || new Error("Supabase email callback did not return a user");
    }

    return data.user;
  }

  if (code) {
    const oauthStorage = createOAuthStorage(decodeOAuthStorage(request.cookies.get(supabaseOAuthStorageCookieName)?.value));
    const supabase = createSupabaseAuthClient(oauthStorage.storage);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      throw error || new Error("Supabase OAuth callback did not return a user");
    }

    return data.user;
  }

  throw new Error("Supabase callback did not include a token hash or code");
}

function clearSupabaseOAuthCookie(response: NextResponse) {
  response.cookies.set(supabaseOAuthStorageCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function accountModeFromSearch(value: string | null): AccountMode {
  return value === "register" || value === "forgot" ? value : "signin";
}

function accountRedirectUrl(origin: string, mode: AccountMode, error: string, nextPath: string) {
  const path = mode === "register" ? "/register" : mode === "forgot" ? "/forgot-password" : "/account";
  const url = new URL(path, origin);

  url.searchParams.set("error", error);

  if (nextPath !== "/") {
    url.searchParams.set("next", nextPath);
  }

  return url;
}
