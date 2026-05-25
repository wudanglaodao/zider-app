import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  accountSessionCookieName,
  accountSessionMaxAgeSeconds,
  createAccountSessionValue,
  isAccountAuthConfigured,
  readAccountSessionValue,
} from "./auth";
import { getZiderUserById, type ZiderUser } from "./users";

export function normalizeAccountNextPath(value: string | null | undefined, fallback = "/") {
  if (!value || value.startsWith("//") || !value.startsWith("/")) {
    return fallback;
  }

  return value;
}

export async function getAccountSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(accountSessionCookieName)?.value;
  const parsedSession = await readAccountSessionValue(sessionValue);

  if (!parsedSession) {
    return null;
  }

  const user = await getZiderUserById(parsedSession.userId);

  if (!user || user.status !== "active") {
    return null;
  }

  return {
    expiresAt: parsedSession.expiresAt,
    user,
  };
}

export async function isAccountSignedIn() {
  return Boolean(await getAccountSession());
}

export async function requireAdminSession(nextPath = "/admin/cms") {
  const safeNextPath = normalizeAccountNextPath(nextPath, "/admin/cms");
  const accountHref = `/account?mode=signin&next=${encodeURIComponent(safeNextPath)}`;

  if (!isAccountAuthConfigured()) {
    redirect(`${accountHref}&error=config`);
  }

  const session = await getAccountSession();

  if (!session) {
    redirect(accountHref);
  }

  if (session.user.role !== "admin") {
    redirect(`${accountHref}&error=forbidden`);
  }

  return session;
}

export async function setAccountSessionCookie(user: ZiderUser) {
  const cookieStore = await cookies();

  cookieStore.set(accountSessionCookieName, await createAccountSessionValue(user.id), {
    httpOnly: true,
    maxAge: accountSessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAccountSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(accountSessionCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
