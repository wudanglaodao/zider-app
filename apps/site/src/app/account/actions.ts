"use server";

import { redirect } from "next/navigation";

import { isAccountAuthConfigured } from "@/lib/account/auth";
import { getAccountActionOrigin } from "@/lib/account/origin";
import { clearAccountSessionCookie, normalizeAccountNextPath, setAccountSessionCookie } from "@/lib/account/session";
import { createSupabaseAdminClient, createSupabaseAuthClient, displayNameFromSupabaseUser } from "@/lib/account/supabase-auth";
import {
  createOrUpdateZiderUserFromEmail,
  normalizeEmail,
  touchZiderUserLogin,
} from "@/lib/account/users";

type AccountMode = "signin" | "register" | "forgot";

export async function signOutAction() {
  await clearAccountSessionCookie();
  redirect("/account?mode=signin&loggedOut=1");
}

export async function sendAccountCodeAction(formData: FormData) {
  const mode = accountModeValue(formData);
  const email = stringValue(formData, "email");
  const nextPath = normalizeAccountNextPath(stringValue(formData, "next"), "/");
  const displayName = stringValue(formData, "name");

  if (!isAccountAuthConfigured()) {
    redirect(accountRedirectPath(mode, { error: "config", nextPath }));
  }

  try {
    // For registration: use Admin API to create user directly (avoids email dependency)
    if (mode === "register") {
      const admin = createSupabaseAdminClient();
      const { error: createError } = await admin.auth.admin.createUser({
        email: normalizeEmail(email),
        email_confirm: true,
        password: crypto.randomUUID(),
        user_metadata: displayName.trim() ? { full_name: displayName.trim() } : undefined,
      });

      if (createError) throw createError;

      redirect(
        accountRedirectPath("signin", {
          email,
          nextPath,
          sent: true,
        }),
      );
    }

    // Sign-in/forgot: send OTP
    const supabase = createSupabaseAuthClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizeEmail(email),
      options: {
        data: displayName.trim() ? { full_name: displayName.trim() } : undefined,
        shouldCreateUser: false,
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to request Supabase account verification code", error);
    redirect(accountRedirectPath(mode, { email, error: "code_send_failed", nextPath }));
  }

  redirect(
    accountRedirectPath(mode, {
      email,
      nextPath,
      sent: true,
    }),
  );
}

export async function verifyAccountCodeAction(formData: FormData) {
  const mode = accountModeValue(formData);
  const nextPath = normalizeAccountNextPath(stringValue(formData, "next"), "/");
  const email = stringValue(formData, "email");
  const code = stringValue(formData, "code");
  const displayName = stringValue(formData, "name");

  if (!isAccountAuthConfigured()) {
    redirect(accountRedirectPath(mode, { error: "config", nextPath }));
  }

  if (mode === "register" && !displayName.trim()) {
    redirect(accountRedirectPath(mode, { email, error: "name_required", nextPath }));
  }

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: normalizeEmail(email),
    token: code.trim(),
    type: "email",
  });

  if (error || !data.user?.email) {
    redirect(accountRedirectPath(mode, { email, error: "invalid_code", nextPath }));
  }

  const user = await createOrUpdateZiderUserFromEmail({
    displayName: displayNameFromSupabaseUser(data.user, displayName),
    email: data.user.email,
  });

  if (!user || user.status !== "active") {
    redirect(accountRedirectPath(mode, { email, error: "forbidden", nextPath }));
  }

  await setAccountSessionCookie(await touchZiderUserLogin(user));
  redirect(nextPath);
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function accountModeValue(formData: FormData): AccountMode {
  const mode = stringValue(formData, "mode");

  return mode === "register" || mode === "forgot" ? mode : "signin";
}

function accountRedirectPath(
  mode: AccountMode,
  {
    email,
    error,
    nextPath,
    sent,
  }: {
    email?: string;
    error?: string;
    nextPath: string;
    sent?: boolean;
  },
) {
  const path = mode === "register" ? "/register" : mode === "forgot" ? "/forgot-password" : "/account";
  const params = new URLSearchParams();

  if (nextPath !== "/") {
    params.set("next", nextPath);
  }

  if (email?.trim()) {
    params.set("email", email.trim().toLowerCase());
  }

  if (error) {
    params.set("error", error);
  }

  if (sent) {
    params.set("sent", "1");
  }

  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

async function accountAuthCallbackUrl(mode: AccountMode, nextPath: string) {
  const origin = await getAccountActionOrigin();
  const callbackUrl = new URL("/api/account/auth/callback", origin);

  callbackUrl.searchParams.set("mode", mode);

  if (nextPath !== "/") {
    callbackUrl.searchParams.set("next", nextPath);
  }

  return callbackUrl.toString();
}
