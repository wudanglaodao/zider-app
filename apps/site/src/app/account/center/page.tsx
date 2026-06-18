import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  KeyRound,
  Link2,
  LockKeyhole,
  Mail,
  Settings,
  UserRound,
} from "lucide-react";

import { isAccountAuthConfigured } from "@/lib/account/auth";
import { getAccountSession } from "@/lib/account/session";
import type { ZiderUser } from "@/lib/account/users";
import { signOutAction, updateAccountProfileAction } from "../actions";

export const metadata: Metadata = {
  title: "Account Center - ZIDER",
  description: "Manage your ZIDER account profile, sign-in methods, and security settings.",
};

export default async function AccountCenterPage() {
  const signInPath = `/account?mode=signin&next=${encodeURIComponent("/account/center")}`;

  if (!isAccountAuthConfigured()) {
    redirect(`${signInPath}&error=config`);
  }

  const session = await getAccountSession();

  if (!session) {
    redirect(signInPath);
  }

  const user = session.user;
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
          <nav className="settingsNav">
            <a className="settingsNavItem settingsNavItem--active" href="#account-info">
              <UserRound size={18} />
              Account
            </a>
          </nav>
          <p className="sidebarFootnote">One account for all ZIDER products.</p>
        </aside>

        <section className="accountMain" aria-labelledby="account-settings-title">
          <div className="accountHero">
            <div>
              <h1 id="account-settings-title">Account Settings</h1>
              <p>View and update your account details, profile and sign-in methods.</p>
            </div>
          </div>

          <div className="sectionRule" />

          <form id="account-info" className="accountCard accountInfoCard" action={updateAccountProfileAction}>
            <CardHeader
              icon={<UserRound size={18} />}
              title="Account info"
              description="Your basic profile information."
              action={
                <button className="primaryButton" type="submit">
                  Save changes
                  <ArrowRight size={16} />
                </button>
              }
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
                  G
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
      --account-bg: #f7faf8;
      min-height: 100vh;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(247, 250, 248, 0.94) 42%, rgba(255, 255, 255, 0.96) 100%),
        repeating-linear-gradient(90deg, transparent 0 95px, rgba(8, 122, 70, 0.055) 95px 96px),
        repeating-linear-gradient(180deg, transparent 0 95px, rgba(8, 122, 70, 0.045) 95px 96px);
      color: var(--account-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .accountTopbar {
      min-height: 76px;
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 0 clamp(28px, 4vw, 52px);
      border-bottom: 1px solid var(--account-line);
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(16px);
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
      width: 92px;
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
      width: 390px;
      height: 18px;
    }

    .topbarAvatar {
      width: 46px;
      height: 46px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 4px solid #dcefe6;
      border-radius: 999px;
      background: var(--account-green);
      color: #ffffff;
      font: inherit;
      font-size: 16px;
      font-weight: 800;
      line-height: 1;
      box-shadow: 0 12px 30px rgba(8, 122, 70, 0.18);
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
      top: calc(100% + 14px);
      right: 0;
      width: min(390px, calc(100vw - 32px));
      border: 1px solid var(--account-line);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 26px 70px rgba(31, 52, 42, 0.16);
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
      grid-template-columns: 280px minmax(0, 1fr);
      min-height: calc(100vh - 76px);
    }

    .accountSidebar {
      position: relative;
      min-height: calc(100vh - 76px);
      padding: 44px 24px 36px;
      border-right: 1px solid var(--account-line);
      background: rgba(255, 255, 255, 0.58);
    }

    .sidebarLabel {
      margin: 0 0 14px 14px;
      color: var(--account-faint);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .settingsNav {
      display: grid;
      gap: 10px;
    }

    .settingsNavItem {
      min-height: 64px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-radius: 10px;
      color: #33423d;
      padding: 0 18px;
      font-size: 17px;
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
      font-size: 13px;
    }

    .accountMain {
      width: min(1240px, calc(100% - 88px));
      margin: 0 auto;
      padding: 74px 0 80px;
    }

    .accountHero {
      position: relative;
      min-height: 122px;
      display: block;
    }

    .accountHero h1 {
      margin: 0;
      color: var(--account-navy);
      font-size: clamp(52px, 5vw, 72px);
      line-height: 0.95;
      font-weight: 900;
      letter-spacing: 0;
    }

    .accountHero p {
      margin: 14px 0 0;
      color: #63748a;
      font-size: 20px;
      line-height: 1.5;
    }

    .accountMenuUser {
      display: flex;
      align-items: center;
      gap: 18px;
      min-height: 112px;
      padding: 22px 24px;
    }

    .menuAvatar {
      width: 58px;
      height: 58px;
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
      font-size: 18px;
      line-height: 1.2;
      font-weight: 850;
    }

    .accountMenuUser p {
      margin: 6px 0 0;
      color: #6d7c76;
      font-size: 14px;
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .accountMenuActions {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 18px;
      padding: 20px 24px;
      border-top: 1px solid var(--account-line);
    }

    .accountMenuActions a,
    .accountMenuActions button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 40px;
      color: var(--account-ink);
      font: inherit;
      font-size: 14px;
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
      padding: 0 22px;
      cursor: pointer;
    }

    .sectionRule {
      height: 1px;
      margin: 28px 0 26px;
      background: var(--account-line);
    }

    .accountCard {
      border: 1px solid var(--account-line);
      border-radius: 18px;
      background: var(--account-panel);
      box-shadow: 0 20px 52px rgba(31, 52, 42, 0.06);
      overflow: hidden;
    }

    .cardHeader {
      min-height: 76px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 16px;
      padding: 20px 28px;
      border-bottom: 1px solid var(--account-line);
    }

    .cardHeaderIcon {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--account-green);
    }

    .cardHeader h2 {
      margin: 0;
      color: var(--account-ink);
      font-size: 24px;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: 0;
    }

    .cardHeader p {
      margin: 4px 0 0;
      color: var(--account-faint);
      font-size: 15px;
      line-height: 1.35;
    }

    .primaryButton {
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border: 0;
      border-radius: 8px;
      background: var(--account-green);
      color: #ffffff;
      padding: 0 22px;
      font: inherit;
      font-size: 16px;
      font-weight: 850;
      cursor: pointer;
      box-shadow: 0 16px 32px rgba(8, 122, 70, 0.18);
    }

    .accountInfoBody {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 370px;
      gap: 32px;
      padding: 28px;
    }

    .profileFormGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 28px;
      align-content: start;
      padding-top: 10px;
    }

    .fieldLabel {
      display: grid;
      gap: 10px;
    }

    .fieldLabel span {
      color: #68786f;
      font-size: 14px;
      font-weight: 850;
    }

    .fieldLabel input {
      width: 100%;
      height: 58px;
      border: 1px solid #cddbd4;
      border-radius: 10px;
      background: #fbfdfb;
      color: var(--account-ink);
      padding: 0 18px;
      font: inherit;
      font-size: 17px;
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
      gap: 24px;
      min-height: 146px;
      padding-left: 32px;
      border-left: 1px solid var(--account-line);
    }

    .profileImagePanel h3 {
      margin: 0;
      color: #42524c;
      font-size: 17px;
      font-weight: 850;
    }

    .profileImagePanel p {
      margin: 8px 0 0;
      color: #879690;
      font-size: 15px;
      line-height: 1.35;
      max-width: 180px;
    }

    .profileImageStack {
      display: grid;
      justify-items: center;
      gap: 12px;
    }

    .profileAvatarLarge {
      width: 82px;
      height: 82px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--account-green);
      color: #ffffff;
      font-size: 24px;
      font-weight: 900;
      box-shadow: 0 16px 36px rgba(8, 122, 70, 0.18);
      overflow: hidden;
    }

    .lowerGrid {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.75fr);
      gap: 22px;
      margin-top: 24px;
    }

    .loginRows {
      display: grid;
      padding: 22px 28px;
    }

    .infoRow {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 16px;
      min-height: 74px;
      border-bottom: 1px solid var(--account-line);
    }

    .infoRow:last-child {
      border-bottom: 0;
    }

    .infoRowIcon {
      width: 28px;
      height: 28px;
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
      font-size: 14px;
      font-weight: 850;
    }

    .infoRowCopy strong {
      color: var(--account-ink);
      font-size: 17px;
      font-weight: 900;
      overflow-wrap: anywhere;
    }

    .infoRowMeta {
      color: #879690;
      font-size: 13px;
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
      min-height: 42px;
      border: 1px solid #bdd3c7;
      border-radius: 9px;
      background: #ffffff;
      color: var(--account-green);
      padding: 0 18px;
      font: inherit;
      font-size: 14px;
      font-weight: 850;
      cursor: default;
    }

    .socialCard {
      min-height: 100%;
    }

    .socialLoginRow {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 18px;
      padding: 58px 28px;
    }

    .googleMark {
      width: 48px;
      height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--account-line);
      border-radius: 9px;
      background: #ffffff;
      color: #4285f4;
      font-size: 20px;
      font-weight: 900;
    }

    .socialLoginRow h3 {
      margin: 0;
      color: var(--account-ink);
      font-size: 18px;
      font-weight: 900;
    }

    .socialLoginRow p {
      margin: 6px 0 0;
      color: #879690;
      font-size: 15px;
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
        padding: 18px 20px;
        border-right: 0;
        border-bottom: 1px solid var(--account-line);
      }

      .settingsNav {
        grid-template-columns: minmax(0, 1fr);
      }

      .settingsNavItem {
        min-height: 48px;
        justify-content: flex-start;
        padding: 0 16px;
        font-size: 14px;
      }

      .sidebarFootnote,
      .sidebarLabel {
        display: none;
      }

      .accountMain {
        width: min(100% - 32px, 680px);
        padding: 36px 0 52px;
      }

      .accountHero h1 {
        font-size: 46px;
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
