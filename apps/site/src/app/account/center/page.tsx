import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  KeyRound,
  LayoutGrid,
  Link2,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { isAccountAuthConfigured } from "@/lib/account/auth";
import { getAccountSession } from "@/lib/account/session";
import type { ZiderUser } from "@/lib/account/users";
import { signOutAction, updateAccountProfileAction } from "../actions";
import { AccountSaveButton } from "./AccountSaveButton";

export const metadata: Metadata = {
  title: "Account Center - ZIDER",
  description: "Manage your ZIDER account profile, sign-in methods, and security settings.",
};

type AccountCenterSearchParams = Promise<
  | {
      error?: string;
      saved?: string;
    }
  | undefined
>;

export default async function AccountCenterPage({ searchParams }: { searchParams?: AccountCenterSearchParams }) {
  const signInPath = `/account?mode=signin&next=${encodeURIComponent("/account/center")}`;

  if (!isAccountAuthConfigured()) {
    redirect(`${signInPath}&error=config`);
  }

  const session = await getAccountSession();

  if (!session) {
    redirect(signInPath);
  }

  const user = session.user;
  const params = await searchParams;
  const profileSaved = params?.saved === "profile";
  const nameRequired = params?.error === "name_required";
  const initials = initialsForUser(user);
  const fullName = user.displayName || displayNameFromEmail(user.email);
  const nameParts = splitDisplayName(fullName, user.email);
  const workspaceHref = getWorkspaceHref();

  return (
    <main className="accountCenterPage">
      <style>{getAccountCenterCss()}</style>
      <input className="accountMobileMenuToggle" id="account-center-sidebar" type="checkbox" />

      <header className="accountTopbar" aria-label="ZIDER account">
        <div className="accountBrandZone">
          <a className="accountMark" href="/" aria-label="ZIDER home">
            <ZiderLogo />
          </a>
        </div>

        <label className="accountMobileMenuButton" htmlFor="account-center-sidebar" aria-label="Open account menu">
          <Menu size={18} />
        </label>

        <div className="accountTopbarMain">
          <div className="accountTopActions">
            <a className="accountTopHelp" href="/forum">
              Help
            </a>
            <a className="accountTopLink" href={workspaceHref} aria-label="Open workspace" title="Workspace">
              <LayoutGrid size={16} strokeWidth={2.25} />
            </a>
            <div className="accountAvatarMenu">
              <button className="topbarAvatar" type="button" aria-label="Open account menu">
                <AvatarContent avatarUrl={user.avatarUrl} initials={initials} />
              </button>
              <section className="accountMenuPopover" aria-label="Signed-in account menu">
                <div className="accountMenuUser">
                  <div className="menuAvatar" aria-hidden="true">
                    <AvatarContent avatarUrl={user.avatarUrl} initials={initials} />
                  </div>
                  <div>
                    <h2>{fullName}</h2>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="accountMenuActions">
                  <a href="#account-info">
                    <UserRound size={15} />
                    My Profile
                  </a>
                  <form action={signOutAction}>
                    <button type="submit">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
      </header>

      <div className="accountShell">
        <aside className="accountSidebar" aria-label="Account navigation">
          <div className="accountSidebarMobileHeader">
            <a className="accountSidebarMobileMark" href="/" aria-label="ZIDER home">
              <ZiderLogo />
            </a>
            <label className="accountSidebarClose" htmlFor="account-center-sidebar" aria-label="Close account menu">
              <X size={18} />
            </label>
          </div>

          <div className="navGroup">
            <p className="navLabel">Account</p>
            <nav className="settingsNav">
              <a className="settingsNavItem settingsNavItem--active" href="#account-info">
                <UserRound size={18} />
                Account Center
              </a>
            </nav>
          </div>

          <div className="sidebarFooter">
            <a className="sidebarHelpLink" href="/forum">
              <CircleHelp size={16} />
              Help center
            </a>

            <a className="sidebarAccount" href="#account-info">
              <span className="sidebarAvatar" aria-hidden="true">
                <AvatarContent avatarUrl={user.avatarUrl} initials={initials} />
              </span>
              <span>
                <strong>{fullName}</strong>
                <small>{user.email}</small>
              </span>
              <ArrowRight size={16} />
            </a>
          </div>
        </aside>

        <section className="accountMain" aria-labelledby="account-settings-title">
          <div className="pageHeader">
            <div>
              <p className="pageKicker">ZIDER ACCOUNT</p>
              <h1 id="account-settings-title">Account Center</h1>
              <p className="pageLead">Manage your profile, sign-in identity, and connected login methods.</p>
            </div>
          </div>

          {profileSaved ? (
            <div className="accountNotice accountNotice--success" role="status" aria-live="polite">
              <CheckCircle2 size={17} />
              <span>Account profile saved.</span>
            </div>
          ) : null}

          {nameRequired ? (
            <div className="accountNotice accountNotice--error" role="alert">
              <AlertCircle size={17} />
              <span>Please enter your name before saving.</span>
            </div>
          ) : null}

          <section className="overviewGrid" aria-label="Account overview">
            <article className="summaryCard accountCard">
              <div className="summaryAvatar" aria-hidden="true">
                <AvatarContent avatarUrl={user.avatarUrl} initials={initials} />
              </div>
              <div className="summaryCopy">
                <span>Signed in as</span>
                <strong>{fullName}</strong>
                <small>{user.email}</small>
              </div>
              <span className="statusPill">
                <ShieldCheck size={14} />
                Verified
              </span>
            </article>

            <article className="summaryCard accountCard">
              <div className="summaryIcon" aria-hidden="true">
                <KeyRound size={20} />
              </div>
              <div className="summaryCopy">
                <span>Sign-in method</span>
                <strong>Passwordless email</strong>
                <small>Updated {formatDate(user.updatedAt)}</small>
              </div>
            </article>
          </section>

          <form id="account-info" className="accountCard accountInfoCard" action={updateAccountProfileAction}>
            <CardHeader
              icon={<UserRound size={18} />}
              title="Profile"
              description="Your basic ZIDER account information."
              action={<AccountSaveButton />}
            />

            <div className="accountInfoBody">
              <div className="profileFormGrid">
                <FieldLabel autoComplete="given-name" label="First name" name="firstName" required value={nameParts.firstName} />
                <FieldLabel autoComplete="family-name" label="Last name" name="lastName" value={nameParts.lastName} />
              </div>
            </div>
          </form>

          <div className="lowerGrid">
            <section id="login-info" className="accountCard">
              <CardHeader icon={<LockKeyhole size={18} />} title="Login info" description="How you sign in to ZIDER." />

              <div className="loginRows">
                <InfoRow
                  icon={<Mail size={19} />}
                  label="Account email"
                  title={user.email}
                  meta={
                    <span className="statusPill">
                      <CheckCircle2 size={14} />
                      Verified
                    </span>
                  }
                />
                <InfoRow
                  icon={<KeyRound size={19} />}
                  label="Email verification code"
                  title="Passwordless sign-in"
                  meta={<span className="mutedInline">Updated {formatDate(user.updatedAt)}</span>}
                />
              </div>
            </section>

            <section id="social-logins" className="accountCard socialCard">
              <CardHeader icon={<Link2 size={18} />} title="Social logins" description="Connected accounts you can use to sign in." />

              <div className="socialLoginRow">
                <div className="googleMark" aria-hidden="true">
                  <GoogleLogo />
                </div>
                <div>
                  <h3>Google</h3>
                  <p>Connected to {user.email}</p>
                </div>
                <span className="connectedStatus">
                  <span aria-hidden="true" />
                  Connected
                </span>
              </div>
            </section>
          </div>
        </section>
      </div>

      <label className="accountSidebarBackdrop" htmlFor="account-center-sidebar" aria-label="Close account menu" />
    </main>
  );
}

function CardHeader({
  action,
  description,
  icon,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <header className="cardHeader">
      <div className="cardHeaderIcon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div className="cardHeaderAction">{action}</div> : null}
    </header>
  );
}

function AvatarContent({ avatarUrl, initials }: { avatarUrl: string | null; initials: string }) {
  if (avatarUrl) {
    return <img alt="" src={avatarUrl} />;
  }

  return <span>{initials}</span>;
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.29h6.47c-.28 1.5-1.13 2.77-2.41 3.62v3.01h3.9c2.28-2.1 3.53-5.19 3.53-8.65z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.9-3.01c-1.08.72-2.46 1.15-4.05 1.15-3.11 0-5.74-2.1-6.68-4.93H1.29v3.1C3.27 21.32 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.32 14.3A7.21 7.21 0 0 1 4.94 12c0-.8.14-1.58.38-2.3V6.6H1.29A11.96 11.96 0 0 0 0 12c0 1.93.46 3.75 1.29 5.4l4.03-3.1z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.96 1.18 15.24 0 12 0 7.33 0 3.27 2.68 1.29 6.6l4.03 3.1C6.26 6.87 8.89 4.77 12 4.77z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FieldLabel({
  autoComplete,
  label,
  name,
  required = false,
  value,
}: {
  autoComplete: string;
  label: string;
  name: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="fieldLabel">
      <span>{label}</span>
      <input autoComplete={autoComplete} defaultValue={value} name={name} required={required} />
    </label>
  );
}

function InfoRow({
  action,
  icon,
  label,
  meta,
  title,
}: {
  action?: string;
  icon: ReactNode;
  label: string;
  meta?: ReactNode;
  title: string;
}) {
  return (
    <div className="infoRow">
      <div className="infoRowIcon" aria-hidden="true">
        {icon}
      </div>
      <div className="infoRowCopy">
        <span>{label}</span>
        <strong>{title}</strong>
      </div>
      {meta ? <div className="infoRowMeta">{meta}</div> : null}
      {action ? (
        <button className="secondaryButton" type="button">
          {action}
        </button>
      ) : null}
    </div>
  );
}

function ZiderLogo() {
  return (
    <svg aria-hidden="true" className="ziderLogo" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <g transform="translate(5.960 1.706) scale(1.025)">
        <path d="M35.2 2.1 L14 35.5 H35.1 V43.3 H0 L21 9.9 H8.4 C4.7 9.9 2.9 7.7 2.9 4.9 V0 H10.3 V0.8 C10.3 1.7 10.7 2.1 11.5 2.1 Z" fill="#007448" />
      </g>
    </svg>
  );
}

function initialsForUser(user: ZiderUser) {
  const source = user.displayName || user.email;
  const trimmed = source.trim();

  if (!trimmed) {
    return "Z";
  }

  return trimmed
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function displayNameFromEmail(email: string) {
  return email.split("@")[0] || "Zider member";
}

function splitDisplayName(displayName: string, email: string) {
  const fallback = displayNameFromEmail(email);
  const parts = (displayName.trim() || fallback).split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function getWorkspaceHref() {
  const configuredUrl = process.env.ZIDER_WORKSPACE_URL?.trim().replace(/\/+$/, "");

  if (configuredUrl) {
    return /^https?:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`;
  }

  return process.env.NODE_ENV === "production" ? "https://workspace.zider.ink" : "http://localhost:3102";
}

function formatDate(value: string | null) {
  if (!value) {
    return "recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
}

function getAccountCenterCss() {
  return `
    .accountCenterPage,
    .accountCenterPage * {
      box-sizing: border-box;
    }

    .accountCenterPage {
      --brand: #007448;
      --brand-700: #005f3c;
      --brand-900: #003d29;
      --brand-soft: #e7f4ee;
      --brand-pale: #f2f8f5;
      --canvas: #f4f8f6;
      --surface: #ffffff;
      --surface-2: #f9fbfa;
      --text: #12261d;
      --muted: #607169;
      --muted-2: #84948c;
      --line: #dbe7e1;
      --line-strong: #c8d8d0;
      --danger: #bd3f43;
      --shadow: 0 14px 38px rgba(0, 73, 46, 0.07);
      --shadow-sm: 0 6px 18px rgba(0, 73, 46, 0.055);
      --sidebar: 260px;
      --topbar: 60px;
      --radius: 18px;
      min-height: 100vh;
      background: var(--canvas);
      color: var(--text);
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      line-height: 1.45;
      letter-spacing: 0;
      -webkit-font-smoothing: antialiased;
    }

    .accountCenterPage a {
      color: inherit;
      text-decoration: none;
    }

    .accountCenterPage button,
    .accountCenterPage input {
      font: inherit;
    }

    .accountTopbar {
      height: var(--topbar);
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(14px);
    }

    .accountMobileMenuToggle,
    .accountMobileMenuButton,
    .accountSidebarBackdrop,
    .accountSidebarMobileHeader {
      display: none;
    }

    .accountBrandZone {
      width: var(--sidebar);
      display: flex;
      align-items: center;
      border-right: 1px solid var(--line);
      padding: 0 18px;
    }

    .accountMark {
      width: 32px;
      height: 32px;
      display: block;
      flex: 0 0 auto;
    }

    .ziderLogo {
      width: 100%;
      height: 100%;
      display: block;
    }

    .accountBrandProduct {
      color: #84948c;
      font-size: 10px;
      font-weight: 820;
      letter-spacing: 0.13em;
      line-height: 1;
      text-transform: uppercase;
    }

    .accountBrandCopy {
      min-width: 0;
      display: grid;
      gap: 5px;
    }

    .accountBrandCopy strong {
      color: var(--brand-900);
      font-size: 19px;
      font-weight: 820;
      letter-spacing: 0;
      line-height: 1;
    }

    .accountBrandCopy span {
      color: #819188;
      font-size: 10px;
      font-weight: 750;
      letter-spacing: 0.14em;
      line-height: 1;
      text-transform: uppercase;
    }

    .accountTopbarMain {
      min-width: 0;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 0 18px;
    }

    .accountTopActions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .accountTopHelp {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      color: #7f8f87;
      padding: 0 8px;
      font-size: 13px;
      font-weight: 740;
      transition: background 150ms ease, color 150ms ease;
    }

    .accountTopHelp:hover,
    .accountTopHelp:focus-visible {
      background: var(--brand-soft);
      color: var(--brand);
    }

    .accountTopHelp:focus-visible,
    .accountMobileMenuButton:focus-visible,
    .accountSidebarClose:focus-visible {
      outline: 2px solid rgba(0, 116, 72, 0.2);
      outline-offset: 2px;
    }

    .accountTopLink {
      width: 36px;
      height: 36px;
      display: inline-grid;
      align-items: center;
      justify-content: center;
      border: 1px solid #edf3f0;
      border-radius: 10px;
      background: #ffffff;
      color: #7f8f87;
      padding: 0;
      transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
    }

    .accountTopLink:hover,
    .accountTopLink:focus-visible {
      border-color: #bdd8cb;
      background: var(--brand-soft);
      color: var(--brand);
    }

    .accountTopLink:focus-visible {
      outline: 2px solid rgba(0, 116, 72, 0.2);
      outline-offset: 2px;
    }

    .accountAvatarMenu {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .accountAvatarMenu::after {
      content: "";
      position: absolute;
      top: 100%;
      right: 0;
      width: min(224px, calc(100vw - 24px));
      height: 12px;
    }

    .topbarAvatar {
      --avatar-size: 36px;
      --avatar-inner: 100%;
      width: var(--avatar-size);
      height: var(--avatar-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--brand);
      font-size: 12px;
      font-weight: 820;
      line-height: 1;
      overflow: hidden;
      cursor: default;
    }

    .topbarAvatar img,
    .topbarAvatar span,
    .menuAvatar img,
    .menuAvatar span,
    .summaryAvatar img,
    .summaryAvatar span,
    .sidebarAvatar img,
    .sidebarAvatar span {
      width: var(--avatar-inner);
      height: var(--avatar-inner);
      flex: 0 0 auto;
      border-radius: 999px;
    }

    .topbarAvatar img,
    .menuAvatar img,
    .summaryAvatar img,
    .sidebarAvatar img {
      display: block;
      object-fit: cover;
    }

    .topbarAvatar span,
    .menuAvatar span,
    .summaryAvatar span,
    .sidebarAvatar span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--brand-soft);
      color: var(--brand-700);
    }

    .accountMenuPopover {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: min(224px, calc(100vw - 24px));
      border: 1px solid var(--line);
      border-radius: 10px;
      background: #ffffff;
      box-shadow: 0 16px 38px rgba(31, 52, 42, 0.12);
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-5px);
      transform-origin: top right;
      transition: opacity 150ms ease, transform 150ms ease;
      z-index: 40;
    }

    .accountAvatarMenu:hover .accountMenuPopover,
    .accountAvatarMenu:focus-within .accountMenuPopover {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .accountMenuUser {
      display: block;
      padding: 18px 18px 16px;
    }

    .accountMenuUser .menuAvatar {
      display: none;
    }

    .menuAvatar {
      --avatar-size: 56px;
      --avatar-inner: 100%;
      width: var(--avatar-size);
      height: var(--avatar-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      border-radius: 999px;
      background: #ffffff;
      color: var(--brand-700);
      font-size: 14px;
      font-weight: 900;
      line-height: 1;
      overflow: hidden;
    }

    .accountMenuUser h2 {
      margin: 0;
      color: var(--text);
      font-size: 14px;
      font-weight: 760;
      letter-spacing: 0;
      line-height: 1.2;
    }

    .accountMenuUser p {
      margin: 3px 0 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .accountMenuActions {
      min-height: 0;
      display: grid;
      grid-template-columns: 1fr;
      align-items: center;
      border-top: 1px solid var(--line);
      padding: 0;
    }

    .accountMenuActions a,
    .accountMenuActions button {
      width: 100%;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--text);
      padding: 0 18px;
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 140ms ease, color 140ms ease;
    }

    .accountMenuActions form {
      margin: 0;
    }

    .accountMenuActions a:hover,
    .accountMenuActions a:focus-visible,
    .accountMenuActions button:hover,
    .accountMenuActions button:focus-visible {
      background: #f7faf8;
    }

    .accountMenuActions button {
      color: #d22525;
    }

    .accountShell {
      min-height: calc(100vh - var(--topbar));
      display: grid;
      grid-template-columns: var(--sidebar) minmax(0, 1fr);
    }

    .accountSidebar {
      position: sticky;
      top: var(--topbar);
      height: calc(100vh - var(--topbar));
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--line);
      background: #fbfdfc;
      padding: 22px 14px 16px;
      overflow: hidden;
    }

    .accountSidebarMobileMark {
      display: inline-flex;
      align-items: center;
    }

    .accountSidebarMobileMark .ziderLogo {
      width: 32px;
      height: 32px;
    }

    .navGroup {
      margin-bottom: 23px;
    }

    .navLabel {
      margin: 0;
      padding: 0 13px 9px;
      color: #8a9b92;
      font-size: 10px;
      font-weight: 820;
      letter-spacing: 0.13em;
      line-height: 1;
      text-transform: uppercase;
    }

    .settingsNav {
      display: grid;
      gap: 5px;
    }

    .settingsNavItem {
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      border-radius: 13px;
      color: #556b60;
      padding: 0 12px;
      font-size: 14px;
      font-weight: 760;
    }

    .settingsNavItem:hover {
      background: #f0f6f3;
      color: var(--brand-900);
    }

    .settingsNavItem--active {
      background: var(--brand-soft);
      color: var(--brand-700);
    }

    .settingsNavItem--active::before {
      display: none;
    }

    .sidebarFooter {
      margin-top: auto;
      display: grid;
      gap: 12px;
      border-top: 1px solid var(--line);
      padding-top: 16px;
    }

    .sidebarHelpLink {
      min-height: 36px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-radius: 11px;
      color: #61736a;
      padding: 0 10px;
      font-size: 13px;
      font-weight: 740;
    }

    .sidebarHelpLink:hover {
      background: var(--brand-soft);
      color: var(--brand-700);
    }

    .sidebarAccount {
      min-width: 0;
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr) 16px;
      gap: 10px;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 13px;
      background: #f5faf7;
      padding: 10px;
    }

    .sidebarAvatar {
      --avatar-size: 36px;
      --avatar-inner: 100%;
      width: var(--avatar-size);
      height: var(--avatar-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      border-radius: 999px;
      background: transparent;
      color: var(--brand-700);
      font-size: 11px;
      font-weight: 820;
      line-height: 1;
      overflow: hidden;
    }

    .sidebarAccount strong,
    .sidebarAccount small {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sidebarAccount strong {
      color: var(--text);
      font-size: 13px;
      font-weight: 850;
    }

    .sidebarAccount small {
      margin-top: 2px;
      color: #7f9087;
      font-size: 11px;
    }

    .accountMain {
      min-width: 0;
      width: min(1280px, calc(100% - 76px));
      margin: 0 auto;
      padding: 34px 0 56px;
    }

    .pageHeader {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 28px;
      margin-bottom: 24px;
    }

    .pageKicker {
      margin: 0 0 7px;
      color: var(--brand);
      font-size: 11px;
      font-weight: 820;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .pageHeader h1 {
      margin: 0;
      color: var(--brand-900);
      font-size: 38px;
      font-weight: 830;
      letter-spacing: 0;
      line-height: 1.08;
    }

    .pageLead {
      max-width: 700px;
      margin: 9px 0 0;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.55;
    }

    .accountNotice {
      min-height: 44px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-radius: 13px;
      margin: 0 0 14px;
      padding: 0 14px;
      font-size: 13px;
      font-weight: 780;
    }

    .accountNotice--success {
      border: 1px solid #c4dfd0;
      background: #f0f8f3;
      color: var(--brand-700);
    }

    .accountNotice--error {
      border: 1px solid #f0c5c0;
      background: #fff4f2;
      color: var(--danger);
    }

    .overviewGrid {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
      gap: 16px;
      margin-bottom: 16px;
    }

    .accountCard {
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .summaryCard {
      min-height: 132px;
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr) auto;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }

    .summaryAvatar,
    .summaryIcon {
      width: 64px;
      height: 64px;
      display: grid;
      place-items: center;
      border-radius: 18px;
      background: var(--brand-soft);
      color: var(--brand-700);
      font-size: 18px;
      font-weight: 900;
      overflow: hidden;
    }

    .summaryAvatar {
      --avatar-size: 64px;
      --avatar-inner: 100%;
      width: var(--avatar-size);
      height: var(--avatar-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      border-radius: 999px;
      background: #ffffff;
      color: var(--brand-700);
      font-size: 18px;
      font-weight: 900;
      line-height: 1;
    }

    .summaryCopy {
      min-width: 0;
      display: grid;
      gap: 5px;
    }

    .summaryCopy span {
      color: var(--brand);
      font-size: 11px;
      font-weight: 840;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .summaryCopy strong {
      overflow-wrap: anywhere;
      color: var(--brand-900);
      font-size: 20px;
      font-weight: 820;
      line-height: 1.2;
    }

    .summaryCopy small {
      overflow-wrap: anywhere;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.35;
    }

    .statusPill {
      min-height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border-radius: 999px;
      background: #e4f5ec;
      color: var(--brand-700);
      padding: 0 10px;
      font-size: 12px;
      font-weight: 820;
      white-space: nowrap;
    }

    .cardHeader {
      min-height: 72px;
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(180deg, #ffffff, #fcfefd);
      padding: 16px 18px;
    }

    .cardHeaderIcon {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border: 1px solid #d9e8e1;
      border-radius: 12px;
      background: var(--brand-pale);
      color: var(--brand);
    }

    .cardHeader h2 {
      margin: 0;
      color: var(--brand-900);
      font-size: 17px;
      font-weight: 790;
      line-height: 1.2;
    }

    .cardHeader p {
      margin: 3px 0 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.35;
    }

    .primaryButton {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      border: 1px solid var(--brand);
      border-radius: 12px;
      background: var(--brand);
      color: #ffffff;
      padding: 0 16px;
      font-size: 13px;
      font-weight: 740;
      box-shadow: 0 9px 22px rgba(0, 116, 72, 0.18);
      cursor: pointer;
    }

    .primaryButton:hover {
      border-color: var(--brand-700);
      background: var(--brand-700);
    }

    .primaryButton:disabled {
      cursor: wait;
      opacity: 0.82;
      box-shadow: none;
    }

    .saveSpinner {
      animation: accountSpin 850ms linear infinite;
    }

    @keyframes accountSpin {
      to {
        transform: rotate(360deg);
      }
    }

    .accountInfoBody {
      padding: 20px;
    }

    .profileFormGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      align-content: start;
    }

    .fieldLabel {
      display: grid;
      gap: 8px;
    }

    .fieldLabel span {
      color: #66766f;
      font-size: 13px;
      font-weight: 780;
    }

    .fieldLabel input {
      width: 100%;
      height: 44px;
      border: 1px solid #d2ded8;
      border-radius: 12px;
      background: #fbfdfc;
      color: var(--text);
      outline: 0;
      padding: 0 14px;
      font-size: 14px;
      font-weight: 650;
    }

    .fieldLabel input:focus {
      border-color: #8bb6a2;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(0, 116, 72, 0.075);
    }

    .lowerGrid {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
      gap: 16px;
      margin-top: 16px;
    }

    .loginRows {
      display: grid;
      padding: 6px 18px;
    }

    .infoRow {
      min-height: 76px;
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--line);
    }

    .infoRow:last-child {
      border-bottom: 0;
    }

    .infoRowIcon {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border: 1px solid #d9e8e1;
      border-radius: 12px;
      background: var(--brand-pale);
      color: var(--brand);
    }

    .infoRowCopy {
      min-width: 0;
      display: grid;
      gap: 4px;
    }

    .infoRowCopy span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 760;
    }

    .infoRowCopy strong {
      overflow-wrap: anywhere;
      color: var(--text);
      font-size: 14px;
      font-weight: 760;
      line-height: 1.3;
    }

    .infoRowMeta {
      color: var(--muted-2);
      font-size: 12px;
      font-weight: 720;
      white-space: nowrap;
    }

    .mutedInline {
      color: var(--muted-2);
    }

    .secondaryButton {
      min-height: 38px;
      border: 1px solid var(--line-strong);
      border-radius: 10px;
      background: #ffffff;
      color: var(--brand-900);
      padding: 0 13px;
      font-size: 12px;
      font-weight: 740;
      cursor: default;
    }

    .socialLoginRow {
      min-height: 118px;
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) auto;
      align-items: center;
      gap: 14px;
      padding: 20px 18px;
    }

    .googleMark {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border: 1px solid #d9e8e1;
      border-radius: 12px;
      background: #ffffff;
    }

    .googleMark svg {
      width: 22px;
      height: 22px;
      display: block;
    }

    .socialLoginRow h3 {
      margin: 0;
      color: var(--brand-900);
      font-size: 15px;
      font-weight: 780;
    }

    .socialLoginRow p {
      margin: 5px 0 0;
      color: var(--muted);
      font-size: 13px;
      overflow-wrap: anywhere;
    }

    .connectedStatus {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--brand-700);
      font-size: 13px;
      font-weight: 820;
      white-space: nowrap;
    }

    .connectedStatus span {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: currentColor;
    }

    @media (min-width: 1680px) {
      .accountMain {
        width: min(1480px, calc(100% - 96px));
      }
    }

    @media (max-width: 1120px) {
      .accountCenterPage {
        --sidebar: 236px;
      }

      .accountMain {
        width: min(100% - 52px, 900px);
      }

      .overviewGrid,
      .lowerGrid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 820px) {
      .accountCenterPage {
        --topbar: 58px;
      }

      .accountTopbar {
        height: var(--topbar);
      }

      .accountBrandZone {
        width: auto;
        flex: 0 0 auto;
        border-right: 0;
        padding: 0 15px;
      }

      .accountMark {
        width: 30px;
        height: 30px;
      }

      .accountBrandCopy strong {
        font-size: 18px;
      }

      .accountBrandCopy span,
      .accountBrandProduct,
      .accountTopHelp {
        display: none;
      }

      .accountMobileMenuButton,
      .accountSidebarClose {
        width: 36px;
        height: 36px;
        display: inline-grid;
        place-items: center;
        flex: 0 0 auto;
        border: 1px solid #edf3f0;
        border-radius: 10px;
        background: #ffffff;
        color: #7f8f87;
        cursor: pointer;
        transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
      }

      .accountMobileMenuButton:hover,
      .accountSidebarClose:hover {
        border-color: #bdd8cb;
        background: var(--brand-soft);
        color: var(--brand);
      }

      .accountMenuPopover {
        width: min(224px, calc(100vw - 24px));
        border-radius: 10px;
      }

      .accountMenuUser {
        min-height: auto;
        display: block;
        padding: 18px 18px 16px;
      }

      .menuAvatar {
        --avatar-size: 56px;
      }

      .accountMenuUser h2 {
        font-size: 16px;
      }

      .accountMenuUser p {
        margin-top: 3px;
        font-size: 13px;
      }

      .accountMenuActions {
        min-height: 0;
        grid-template-columns: 1fr;
        gap: 0;
        padding: 0;
      }

      .accountMenuActions a,
      .accountMenuActions button {
        min-height: 44px;
        justify-content: flex-start;
        border-radius: 0;
        font-size: 14px;
        padding: 0 18px;
      }

      .accountTopbarMain {
        flex: 1;
        padding: 0 15px 0 0;
      }

      .accountShell {
        display: block;
        min-height: calc(100vh - var(--topbar));
      }

      .accountSidebar {
        width: min(82vw, 260px);
        height: 100dvh;
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 80;
        gap: 24px;
        border-right: 1px solid var(--line);
        border-bottom: 0;
        background: #ffffff;
        padding: 22px 14px 16px;
        box-shadow: 18px 0 42px rgba(18, 38, 29, 0.12);
        transform: translateX(-105%);
        transition: transform 180ms ease;
        overflow-y: auto;
      }

      .accountMobileMenuToggle:checked ~ .accountShell .accountSidebar {
        transform: translateX(0);
      }

      .accountMobileMenuToggle:checked ~ .accountSidebarBackdrop {
        display: block;
      }

      .accountSidebarBackdrop {
        position: fixed;
        inset: 0;
        z-index: 70;
        background: rgba(18, 28, 24, 0.54);
        cursor: pointer;
      }

      .accountSidebarMobileHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 0 2px 2px;
      }

      .navGroup {
        margin: 0;
      }

      .sidebarFooter {
        display: grid;
        margin-top: auto;
      }

      .accountMain {
        width: min(100% - 30px, 680px);
        padding: 26px 0 40px;
      }

      .pageHeader {
        display: block;
        margin-bottom: 20px;
      }

      .pageHeader h1 {
        font-size: 31px;
      }

      .pageLead {
        font-size: 14px;
      }

      .summaryCard,
      .cardHeader,
      .infoRow,
      .socialLoginRow {
        grid-template-columns: 1fr;
        justify-items: start;
      }

      .cardHeaderAction {
        width: 100%;
      }

      .primaryButton {
        width: 100%;
      }

      .profileFormGrid {
        grid-template-columns: 1fr;
      }

      .infoRowMeta {
        white-space: normal;
      }
    }
  `;
}
