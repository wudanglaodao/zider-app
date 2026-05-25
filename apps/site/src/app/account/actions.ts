"use server";

import { redirect } from "next/navigation";

import { isAccountAuthConfigured } from "@/lib/account/auth";
import { clearAccountSessionCookie, normalizeAccountNextPath, setAccountSessionCookie } from "@/lib/account/session";
import { verifyZiderUserCredentials } from "@/lib/account/users";

export async function signInAction(formData: FormData) {
  const email = stringValue(formData, "email");
  const password = stringValue(formData, "password");
  const nextPath = normalizeAccountNextPath(stringValue(formData, "next"), "/");
  const errorNext = encodeURIComponent(nextPath);

  if (!isAccountAuthConfigured()) {
    redirect(`/account?mode=signin&error=config&next=${errorNext}`);
  }

  const user = await verifyZiderUserCredentials(email, password);

  if (!user) {
    redirect(`/account?mode=signin&error=invalid&next=${errorNext}`);
  }

  await setAccountSessionCookie(user);
  redirect(nextPath);
}

export async function signOutAction() {
  await clearAccountSessionCookie();
  redirect("/account?mode=signin&loggedOut=1");
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
