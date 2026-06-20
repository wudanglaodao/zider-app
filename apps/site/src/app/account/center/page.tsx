import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  KeyRound,
  Link2,
  LockKeyhole,
  Mail,
  Menu,
  Settings,
  UserRound,
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

  return (
    <main className="accountCenterPage">
      <style>{getAccountCenterCss()}</style>

      <header className="accountTopbar">
        <a className="accountBrand" href="/" aria-label="ZIDER home">
          <ZiderLogo />
        </a>
        <div className="topbarSpacer" />
        <div className="accountAvatarMenu">
          <button className="topbarAvatar" type="button" aria-label="Open account menu">
            <AvatarContent avatarUrl={user.avatarUrl} initials={initials} />
          </button>
          <section className="accountMenuPopover" aria-label="Signed-in account">
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
                <Settings size={15} />
                Account Settings
              </a>
              <form action={signOutAction}>
                <button type="submit">Log Out</button>
              </form>
            </div>
          </section>
        </div>
      </header>

      <div className="accountLayout">
        <aside className="accountSidebar" aria-label="Account settings navigation">
          <p className="sidebarLabel">Settings</p>
          <nav className="settingsNav settingsNav--desktop">
            <a className="settingsNavItem settingsNavItem--active" href="#account-info">
              <UserRound size={18} />
              Account
            </a>
          </nav>
          <details className="mobileSettingsMenu">
            <summary>
              <span>
                <Menu size={17} />
                Menu
              </span>
              <ChevronDown className="mobileMenuChevron" size={17} />
            </summary>
            <nav className="mobileSettingsMenuPanel" aria-label="Mobile account settings navigation">
              <a className="settingsNavItem settingsNavItem--active" href="#account-info">
                <UserRound size={18} />
                Account
              </a>
            </nav>
          </details>
          <p className="sidebarFootnote">Manage your ZIDER profile and sign-in details.</p>
        </aside>

        <section className="accountMain" aria-labelledby="account-settings-title">
          <div className="accountHero">
            <div>
              <h1 id="account-settings-title">Account Settings</h1>
              <p>View and update your account details, profile and sign-in methods.</p>
            </div>
          </div>

          <div className="sectionRule" />

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

          <form id="account-info" className="accountCard accountInfoCard" action={updateAccountProfileAction}>
            <CardHeader
              icon={<UserRound size={18} />}
              title="Account info"
              description="Your basic profile information."
              action={<AccountSaveButton />}
            />

            <div className="accountInfoBody">
              <div className="profileFormGrid">
                <FieldLabel autoComplete="given-name" label="First name" name="firstName" required value={nameParts.firstName} />
                <FieldLabel autoComplete="family-name" label="Last name" name="lastName" value={nameParts.lastName} />
              </div>

              <div className="profileImagePanel">
                <div>
                  <h3>Profile image</h3>
                  <p>Shown from Google when available. Otherwise we use your name initials.</p>
                </div>
                <div className="profileImageStack">
                  <div className="profileAvatarLarge">
                    <AvatarContent avatarUrl={user.avatarUrl} initials={initials} />
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="lowerGrid">
            <section id="login-info" className="accountCard">
              <CardHeader icon={<LockKeyhole size={18} />} title="Login info" description="Manage how you sign in to ZIDER." />

              <div className="loginRows">
                <InfoRow
                  icon={<Mail size={19} />}
                  label="Account email"
                  title={user.email}
                  meta={<span className="verifiedPill">Verified</span>}
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
    <svg aria-hidden="true" className="ziderLogo" xmlns="http://www.w3.org/2000/svg" width="163.1" height="43.5" viewBox="0 0 163.1 43.5">
      <path
        d="M155,2.1,133.8,35.5h21.1v7.8H119.8l21-33.4H128.2a6.31,6.31,0,0,1-3.7-1.2,3.62,3.62,0,0,1-1.8-2.8h0V0h7.4V.8a2,2,0,0,0,.2,1.1,1.94,1.94,0,0,0,.7.2Zm5.3,0h8.1V43.3h-8.1Zm16,41.3V2.2h12.3c5.3,0,9.6,1,13,3.1a18,18,0,0,1,7.3,7.9,23.23,23.23,0,0,1,2.3,10.4h0a19.5,19.5,0,0,1-2.8,10.5,18.72,18.72,0,0,1-7.5,7,22.1,22.1,0,0,1-10.4,2.4l-14.2-.1Zm8.1-7.9h4.8c4.2,0,7.6-1.1,10-3.2s3.7-5.3,3.7-9.4h0a13.85,13.85,0,0,0-2.1-7.9,10.42,10.42,0,0,0-4.8-4,13,13,0,0,0-5.1-1.1h-6.6ZM216.7,2.1h28.1V10h-20v8.8h17.7v7.8H224.8v8.9h20.8v7.8H216.7Zm66.2,41.3h-9.5l-8.7-13.1h-5.4V43.4h-8.1V2.2h12.5c5.1,0,9.1,1.2,11.9,3.7s4.2,5.9,4.2,10.2h0a16.46,16.46,0,0,1-1.6,7.2,12.29,12.29,0,0,1-4.9,5.2h0ZM259.3,10V22.4h5.8a5.8,5.8,0,0,0,4.8-1.9,6.51,6.51,0,0,0,1.5-4.2h0a7.73,7.73,0,0,0-1.3-4.2c-.9-1.4-2.5-2-5-2Z"
        fill="#087a46"
        transform="translate(-119.8 0)"
      />
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
      --account-green: #087a46;
      --account-green-dark: #055834;
      --account-green-soft: #eef6f1;
      --account-navy: #111e5a;
      --account-ink: #111816;
      --account-muted: #66766f;
      --account-faint: #8c9a94;
      --account-line: #d8e3dd;
      --account-panel: #ffffff;
      --account-bg: #f8fbf9;
      min-height: 100vh;
      background:
        radial-gradient(circle at 82% 8%, rgba(8, 122, 70, 0.075), transparent 28%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 251, 249, 0.98) 100%);
      color: var(--account-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .accountTopbar {
      min-height: 58px;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 0 clamp(22px, 3vw, 36px);
      border-bottom: 1px solid var(--account-line);
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(18px);
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .accountBrand {
      display: inline-flex;
      align-items: center;
      color: var(--account-green);
      text-decoration: none;
    }

    .ziderLogo {
      display: block;
      width: 68px;
      height: auto;
    }

    .topbarSpacer {
      flex: 1;
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
      width: 340px;
      height: 14px;
    }

    .topbarAvatar {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #dcefe6;
      border-radius: 999px;
      background: var(--account-green);
      color: #ffffff;
      font: inherit;
      font-size: 14px;
      font-weight: 800;
      line-height: 1;
      box-shadow: 0 10px 24px rgba(8, 122, 70, 0.16);
      cursor: default;
      overflow: hidden;
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
    }

    .topbarAvatar img,
    .menuAvatar img,
    .profileAvatarLarge img {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: inherit;
      object-fit: cover;
    }

    .topbarAvatar span,
    .menuAvatar span,
    .profileAvatarLarge span {
      width: 100%;
      height: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .accountAvatarMenu:hover .topbarAvatar,
    .accountAvatarMenu:focus-within .topbarAvatar {
      border-color: #c6ead8;
      box-shadow: 0 16px 34px rgba(8, 122, 70, 0.22);
      transform: translateY(-1px);
    }

    .accountMenuPopover {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: min(340px, calc(100vw - 32px));
      border: 1px solid var(--account-line);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 24px 58px rgba(31, 52, 42, 0.14);
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-6px) scale(0.985);
      transform-origin: top right;
      transition: opacity 150ms ease, transform 150ms ease;
      z-index: 30;
    }

    .accountAvatarMenu:hover .accountMenuPopover,
    .accountAvatarMenu:focus-within .accountMenuPopover {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .accountLayout {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      min-height: calc(100vh - 58px);
    }

    .accountSidebar {
      position: relative;
      min-height: calc(100vh - 58px);
      padding: 28px 22px 28px;
      border-right: 1px solid var(--account-line);
      background: rgba(255, 255, 255, 0.58);
    }

    .sidebarLabel {
      margin: 0 0 12px 12px;
      color: var(--account-faint);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .settingsNav {
      display: grid;
      gap: 8px;
    }

    .mobileSettingsMenu {
      display: none;
    }

    .settingsNavItem {
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-radius: 9px;
      color: #33423d;
      padding: 0 18px;
      font-size: 14px;
      font-weight: 760;
      text-decoration: none;
    }

    .settingsNavItem svg {
      color: var(--account-green);
      stroke-width: 2.4;
    }

    .settingsNavItem--active {
      background: #eff4f1;
      color: var(--account-ink);
      box-shadow: inset 0 0 0 1px rgba(8, 122, 70, 0.02);
    }

    .settingsNavItem:hover {
      background: #f2f6f3;
    }

    .sidebarFootnote {
      position: absolute;
      left: 36px;
      right: 36px;
      bottom: 34px;
      margin: 0;
      padding-top: 28px;
      border-top: 1px solid var(--account-line);
      color: var(--account-faint);
      font-size: 12px;
    }

    .accountMain {
      width: min(1040px, calc(100% - 72px));
      margin: 0 auto;
      padding: 42px 0 58px;
    }

    .accountHero {
      position: relative;
      min-height: 74px;
      display: block;
    }

    .accountHero h1 {
      margin: 0;
      color: var(--account-navy);
      font-size: clamp(30px, 2.6vw, 40px);
      line-height: 1.08;
      font-weight: 900;
      letter-spacing: 0;
    }

    .accountHero p {
      margin: 8px 0 0;
      color: #63748a;
      font-size: 15px;
      line-height: 1.5;
    }

    .accountMenuUser {
      display: flex;
      align-items: center;
      gap: 18px;
      min-height: 86px;
      padding: 16px 18px;
    }

    .menuAvatar {
      width: 46px;
      height: 46px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: #edf3ef;
      color: #6f7f78;
      font-weight: 900;
      flex-shrink: 0;
      overflow: hidden;
    }

    .accountMenuUser h2 {
      margin: 0;
      color: var(--account-ink);
      font-size: 16px;
      line-height: 1.2;
      font-weight: 850;
    }

    .accountMenuUser p {
      margin: 6px 0 0;
      color: #6d7c76;
      font-size: 13px;
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .accountMenuActions {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      border-top: 1px solid var(--account-line);
    }

    .accountMenuActions a,
    .accountMenuActions button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 34px;
      color: var(--account-ink);
      font: inherit;
      font-size: 13px;
      font-weight: 760;
      text-decoration: none;
    }

    .accountMenuActions form {
      margin: 0;
    }

    .accountMenuActions button {
      border: 1px solid #b9ccff;
      border-radius: 999px;
      background: #ffffff;
      color: #1460ff;
      padding: 0 18px;
      cursor: pointer;
    }

    .sectionRule {
      height: 1px;
      margin: 16px 0 18px;
      background: var(--account-line);
    }

    .accountCard {
      border: 1px solid var(--account-line);
      border-radius: 12px;
      background: var(--account-panel);
      box-shadow: 0 18px 44px rgba(31, 52, 42, 0.045);
      overflow: hidden;
    }

    .accountNotice {
      min-height: 40px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 14px;
      border-radius: 9px;
      padding: 0 13px;
      font-size: 13px;
      font-weight: 820;
      line-height: 1.35;
    }

    .accountNotice svg {
      flex: 0 0 auto;
      stroke-width: 2.4;
    }

    .accountNotice--success {
      border: 1px solid #bfe1cf;
      background: #edf8f1;
      color: var(--account-green);
    }

    .accountNotice--error {
      border: 1px solid #f0c5c0;
      background: #fff4f2;
      color: #b42318;
    }

    .cardHeader {
      min-height: 58px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 12px;
      padding: 14px 22px;
      border-bottom: 1px solid var(--account-line);
    }

    .cardHeaderIcon {
      width: 26px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--account-green);
    }

    .cardHeader h2 {
      margin: 0;
      color: var(--account-ink);
      font-size: 18px;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: 0;
    }

    .cardHeader p {
      margin: 4px 0 0;
      color: var(--account-faint);
      font-size: 13px;
      line-height: 1.35;
    }

    .primaryButton {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border: 0;
      border-radius: 8px;
      background: var(--account-green);
      color: #ffffff;
      padding: 0 16px;
      font: inherit;
      font-size: 13px;
      font-weight: 850;
      cursor: pointer;
      box-shadow: 0 14px 28px rgba(8, 122, 70, 0.16);
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
      display: grid;
      grid-template-columns: minmax(0, 1fr) 292px;
      gap: 24px;
      padding: 22px;
    }

    .profileFormGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
      align-content: start;
      padding-top: 2px;
    }

    .fieldLabel {
      display: grid;
      gap: 8px;
    }

    .fieldLabel span {
      color: #68786f;
      font-size: 13px;
      font-weight: 850;
    }

    .fieldLabel input {
      width: 100%;
      height: 44px;
      border: 1px solid #cddbd4;
      border-radius: 9px;
      background: #fbfdfb;
      color: var(--account-ink);
      padding: 0 16px;
      font: inherit;
      font-size: 14px;
      font-weight: 720;
      outline: none;
    }

    .fieldLabel input:focus {
      border-color: var(--account-green);
      box-shadow: 0 0 0 3px rgba(8, 122, 70, 0.12);
    }

    .profileImagePanel {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 20px;
      min-height: 108px;
      padding-left: 24px;
      border-left: 1px solid var(--account-line);
    }

    .profileImagePanel h3 {
      margin: 0;
      color: #42524c;
      font-size: 15px;
      font-weight: 850;
    }

    .profileImagePanel p {
      margin: 6px 0 0;
      color: #879690;
      font-size: 13px;
      line-height: 1.35;
      max-width: 180px;
    }

    .profileImageStack {
      display: grid;
      justify-items: center;
      gap: 12px;
    }

    .profileAvatarLarge {
      width: 62px;
      height: 62px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--account-green);
      color: #ffffff;
      font-size: 20px;
      font-weight: 900;
      box-shadow: 0 14px 30px rgba(8, 122, 70, 0.16);
      overflow: hidden;
    }

    .lowerGrid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 16px;
    }

    .loginRows {
      display: grid;
      padding: 14px 22px;
    }

    .infoRow {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 14px;
      min-height: 60px;
      border-bottom: 1px solid var(--account-line);
    }

    .infoRow:last-child {
      border-bottom: 0;
    }

    .infoRowIcon {
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #6c8077;
    }

    .infoRowCopy {
      min-width: 0;
      display: grid;
      gap: 5px;
    }

    .infoRowCopy span {
      color: #74847d;
      font-size: 12px;
      font-weight: 850;
    }

    .infoRowCopy strong {
      color: var(--account-ink);
      font-size: 15px;
      font-weight: 900;
      overflow-wrap: anywhere;
    }

    .infoRowMeta {
      color: #879690;
      font-size: 12px;
      font-weight: 760;
      white-space: nowrap;
    }

    .verifiedPill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      background: #e8f8ee;
      color: var(--account-green);
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 900;
    }

    .verifiedPill::before {
      content: "";
      width: 5px;
      height: 5px;
      border-radius: 999px;
      background: currentColor;
    }

    .mutedInline {
      color: #8b9a94;
    }

    .secondaryButton {
      min-height: 38px;
      border: 1px solid #bdd3c7;
      border-radius: 8px;
      background: #ffffff;
      color: var(--account-green);
      padding: 0 16px;
      font: inherit;
      font-size: 13px;
      font-weight: 850;
      cursor: default;
    }

    .socialCard {
      min-height: auto;
    }

    .socialLoginRow {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 16px;
      min-height: 96px;
      padding: 28px 22px;
    }

    .googleMark {
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--account-line);
      border-radius: 9px;
      background: #ffffff;
      color: inherit;
      font-size: 0;
    }

    .googleMark svg {
      width: 22px;
      height: 22px;
      display: block;
    }

    .socialLoginRow h3 {
      margin: 0;
      color: var(--account-ink);
      font-size: 16px;
      font-weight: 900;
    }

    .socialLoginRow p {
      margin: 6px 0 0;
      color: #879690;
      font-size: 13px;
      overflow-wrap: anywhere;
    }

    .connectedStatus {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: var(--account-green);
      font-size: 13px;
      font-weight: 900;
      white-space: nowrap;
    }

    .connectedStatus span {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: currentColor;
    }

    @media (max-width: 1180px) {
      .accountLayout {
        grid-template-columns: 240px minmax(0, 1fr);
      }

      .accountMain {
        width: min(100% - 48px, 960px);
      }

      .accountInfoBody,
      .lowerGrid {
        grid-template-columns: 1fr;
      }

      .profileImagePanel {
        padding: 24px 0 0;
        border-left: 0;
        border-top: 1px solid var(--account-line);
      }
    }

    @media (max-width: 820px) {
      .accountTopbar {
        padding: 0 20px;
      }

      .accountLayout {
        display: block;
      }

      .accountSidebar {
        min-height: 0;
        padding: 12px 16px;
        border-right: 0;
        border-bottom: 1px solid var(--account-line);
        background: rgba(255, 255, 255, 0.84);
        backdrop-filter: blur(18px);
        position: sticky;
        top: 58px;
        z-index: 12;
      }

      .settingsNav--desktop {
        display: none;
      }

      .sidebarFootnote,
      .sidebarLabel {
        display: none;
      }

      .mobileSettingsMenu {
        display: block;
      }

      .mobileSettingsMenu summary {
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: 1px solid var(--account-line);
        border-radius: 11px;
        background: #ffffff;
        color: var(--account-ink);
        padding: 0 14px;
        font-size: 14px;
        font-weight: 850;
        list-style: none;
        cursor: pointer;
        box-shadow: 0 12px 28px rgba(31, 52, 42, 0.05);
      }

      .mobileSettingsMenu summary::-webkit-details-marker {
        display: none;
      }

      .mobileSettingsMenu summary span {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .mobileSettingsMenu summary svg {
        color: var(--account-green);
        stroke-width: 2.3;
      }

      .mobileMenuChevron {
        transition: transform 160ms ease;
      }

      .mobileSettingsMenu[open] .mobileMenuChevron {
        transform: rotate(180deg);
      }

      .mobileSettingsMenuPanel {
        display: grid;
        gap: 8px;
        padding: 8px 0 2px;
      }

      .mobileSettingsMenu .settingsNavItem {
        min-height: 42px;
        justify-content: flex-start;
        border: 1px solid var(--account-line);
        background: #ffffff;
        padding: 0 14px;
        font-size: 14px;
      }

      .mobileSettingsMenu .settingsNavItem--active {
        border-color: #d7e6dd;
        background: #eff5f1;
      }

      .accountMain {
        width: min(100% - 32px, 680px);
        padding: 30px 0 52px;
      }

      .accountHero h1 {
        font-size: 30px;
      }

      .cardHeader {
        grid-template-columns: auto 1fr;
      }

      .cardHeaderAction {
        grid-column: 1 / -1;
      }

      .profileFormGrid,
      .infoRow,
      .socialLoginRow {
        grid-template-columns: 1fr;
      }

      .infoRowMeta {
        white-space: normal;
      }
    }
  `;
}
