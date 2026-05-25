import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAccountAuthConfigured } from "@/lib/account/auth";
import { getAccountSession, normalizeAccountNextPath } from "@/lib/account/session";
import { AccountAuthPage } from "./AccountAuthPage";

export const metadata: Metadata = {
  title: "Account - ZIDER",
  description: "Sign in or create a ZIDER account.",
};

type AccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = (await searchParams) ?? {};
  const mode = readSearchParam(params.mode) === "signup" ? "signup" : "signin";
  const nextPath = normalizeAccountNextPath(readSearchParam(params.next), "/");
  const isConfigured = isAccountAuthConfigured();
  const session = isConfigured ? await getAccountSession() : null;

  if (session && mode === "signin" && nextPath !== "/") {
    redirect(nextPath);
  }

  return (
    <AccountAuthPage
      error={readSearchParam(params.error)}
      isConfigured={isConfigured}
      loggedOut={Boolean(readSearchParam(params.loggedOut))}
      mode={mode}
      nextPath={nextPath}
      user={session?.user ?? null}
    />
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
