import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountAuthPage } from "@/app/account/AccountAuthPage";
import { isAccountAuthConfigured } from "@/lib/account/auth";
import { getAccountSession, normalizeAccountNextPath } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Register - ZIDER",
  description: "Create a ZIDER account with Google or an email verification code.",
};

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = (await searchParams) ?? {};
  const nextPath = normalizeAccountNextPath(readSearchParam(params.next), "/");
  const isConfigured = isAccountAuthConfigured();
  const session = isConfigured ? await getAccountSession() : null;

  if (session && nextPath !== "/") {
    redirect(nextPath);
  }

  return (
    <AccountAuthPage
      error={readSearchParam(params.error)}
      initialEmail={readSearchParam(params.email)}
      isConfigured={isConfigured}
      loggedOut={false}
      mode="register"
      nextPath={nextPath}
      sent={readSearchParam(params.sent) === "1"}
      user={session?.user ?? null}
    />
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
