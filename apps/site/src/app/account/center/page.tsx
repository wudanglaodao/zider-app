import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  KeyRound,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { isAccountAuthConfigured } from "@/lib/account/auth";
import { getAccountSession } from "@/lib/account/session";
import type { ZiderUser } from "@/lib/account/users";
import { signOutAction } from "../actions";

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

  return (
    <main className="accountCenterPage">
      <style>{getAccountCenterCss()}</style>
      <section className="accountShell" aria-labelledby="account-center-title">
        <header className="accountHeader">
          <a className="accountBrand" href="/" aria-label="ZIDER home">
            <ZiderLogo />
          </a>
          <div className="accountHeaderActions">
            <a className="ghostButton" href="/account/center/settings">
              <Settings size={16} />
              Settings
            </a>
            <div className="headerAvatar" aria-label="Account menu">
              <span className="headerAvatarInitials">{initialsForUser(session.user)}</span>
            </div>
            <form action={signOutAction}>
              <button className="ghostButton" type="submit">
                <LogOut size={16} />
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="accountHero">
          <div className="accountHeroCopy">
            <h1 id="account-center-title">Account Center</h1>
            <p>Manage your ZIDER identity, sign-in methods, and account security.</p>
          </div>
          <section className="heroProfileCard" aria-label="Signed-in account">
            <div className="heroAvatar" aria-hidden="true">
              {initialsForUser(session.user)}
            </div>
            <div>
              <h2>{session.user.displayName || "Zider member"}</h2>
              <p>{session.user.email}</p>
            </div>
          </section>
        </div>

        <div className="accountGrid">
          <InfoCard
            icon={<CalendarClock size={20} />}
            label="Last sign-in"
            title={formatDateTime(session.user.lastLoginAt)}
            value={`Session expires ${formatDateTime(session.expiresAt)}`}
          />
          <InfoCard
            icon={<KeyRound size={20} />}
            label="Sign-in methods"
            title="Google + email code"
            value="Managed by Supabase Auth"
          />
          <InfoCard
            icon={<Mail size={20} />}
            label="Primary email"
            title={session.user.email}
            value="Used for account recovery and ownership checks"
          />
        </div>

        <div className="accountSections">
          <section className="accountPanel accountPanel--wide">
            <div className="panelTitle">
              <UserRound size={20} />
              <h2>Account details</h2>
            </div>
            <dl className="detailList">
              <div>
                <dt>Name</dt>
                <dd>{session.user.displayName || "Not set"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{session.user.email}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDateTime(session.user.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{formatDateTime(session.user.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="accountPanel">
            <div className="panelTitle">
              <ShieldCheck size={20} />
              <h2>Security</h2>
            </div>
            <div className="securityRow">
              <span>Email verification code</span>
              <strong>Enabled</strong>
            </div>
            <div className="securityRow">
              <span>Google sign-in</span>
              <strong>Available</strong>
            </div>
          </section>

          <section className="accountPanel">
            <div className="panelTitle">
              <Sparkles size={20} />
              <h2>Account scope</h2>
            </div>
            <p className="panelCopy">
              This center only manages your ZIDER identity. App permissions and merchant access stay controlled inside each connected app.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  title,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  value: string;
}) {
  return (
    <section className="infoCard">
      <div className="cardIcon">{icon}</div>
      <p className="cardKicker">{label}</p>
      <h2>{title}</h2>
      <p>{value}</p>
    </section>
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

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getAccountCenterCss() {
  return `
    .accountCenterPage,
    .accountCenterPage * {
      box-sizing: border-box;
    }

    .accountCenterPage {
      --account-ink: #101816;
      --account-muted: #64746e;
      --account-line: #d7e2dc;
      --account-soft: #f3f7f4;
      --account-soft-strong: #e8f4ee;
      --account-green: #087a46;
      --account-page-max: 1440px;
      --account-page-gutter: clamp(192px, 18vw, 360px);
      --account-page-width: min(var(--account-page-max), calc(100% - var(--account-page-gutter)));
      min-height: 100vh;
      padding: 0 0 72px;
      background:
        linear-gradient(90deg, transparent 0 calc((100% - var(--account-page-max)) / 2), rgba(10, 37, 64, 0.08) calc((100% - var(--account-page-max)) / 2), rgba(10, 37, 64, 0.08) calc((100% - var(--account-page-max)) / 2 + 1px), transparent calc((100% - var(--account-page-max)) / 2 + 1px)),
        linear-gradient(90deg, transparent 0 calc((100% + var(--account-page-max)) / 2), rgba(10, 37, 64, 0.08) calc((100% + var(--account-page-max)) / 2), rgba(10, 37, 64, 0.08) calc((100% + var(--account-page-max)) / 2 + 1px), transparent calc((100% + var(--account-page-max)) / 2 + 1px)),
        linear-gradient(180deg, #ffffff 0%, #f7faf8 58%, #ffffff 100%);
      color: var(--account-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .accountShell {
      width: var(--account-page-width);
      margin: 0 auto;
    }

    .accountHeader {
      min-height: 86px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 44px;
    }

    .accountBrand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--account-ink);
      text-decoration: none;
    }

    .ziderLogo {
      display: block;
      width: 120px;
      height: auto;
    }

    .accountHeaderActions {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .headerAvatar {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--account-green);
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .headerAvatarInitials {
      line-height: 1;
    }

    .accountHeaderActions {
      gap: 10px;
    }

    .accountHeaderActions form {
      margin: 0;
    }

    .ghostButton {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      justify-content: center;
      gap: 8px;
      border: 1px solid var(--account-line);
      border-radius: 8px;
      background: #ffffff;
      color: var(--account-ink);
      padding: 0 14px;
      font: inherit;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .ghostButton:hover {
      border-color: #b8c8c0;
      box-shadow: 0 8px 20px rgba(16, 24, 22, 0.06);
    }

    .accountHero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
      align-items: end;
      gap: clamp(28px, 4vw, 64px);
      margin-bottom: 20px;
      padding: 30px 0 28px;
      border-bottom: 1px solid var(--account-line);
    }

    .accountHeroCopy {
      max-width: 760px;
    }

    .accountHero h1 {
      margin: 8px 0 10px;
      font-size: clamp(48px, 6.1vw, 92px);
      line-height: 0.94;
      font-weight: 850;
      letter-spacing: 0;
    }

    .accountHero p,
    .infoCard p,
    .heroProfileCard p,
    .panelCopy {
      color: var(--account-muted);
      font-size: 15px;
      line-height: 1.5;
    }

    .heroProfileCard {
      min-height: 178px;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 18px;
      border: 1px solid var(--account-line);
      border-radius: 8px;
      background:
        linear-gradient(135deg, rgba(8, 122, 70, 0.08), transparent 54%),
        #ffffff;
      padding: 22px;
      box-shadow: 0 20px 54px rgba(16, 24, 22, 0.06);
    }

    .heroAvatar {
      width: 78px;
      height: 78px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: var(--account-green);
      color: #ffffff;
      font-size: 28px;
      font-weight: 850;
    }

    .cardKicker {
      margin: 0;
      color: var(--account-green);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .accountGrid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 14px;
    }

    .infoCard,
    .accountPanel {
      border: 1px solid var(--account-line);
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 12px 32px rgba(16, 24, 22, 0.04);
    }

    .heroProfileCard h2,
    .infoCard h2,
    .accountPanel h2 {
      margin: 6px 0 4px;
      color: var(--account-ink);
      font-size: 20px;
      line-height: 1.2;
      font-weight: 800;
    }

    .infoCard {
      min-height: 176px;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }

    .cardIcon {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      margin-bottom: 16px;
      border-radius: 8px;
      background: #e6f5ed;
      color: var(--account-green);
    }

    .accountSections {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.9fr) minmax(280px, 0.9fr);
      gap: 14px;
    }

    .accountPanel {
      padding: 22px;
    }

    .panelTitle {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
      color: var(--account-green);
    }

    .panelTitle h2 {
      margin: 0;
    }

    .detailList {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 0;
    }

    .detailList div,
    .securityRow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 48px;
      padding: 12px;
      border: 1px solid var(--account-line);
      border-radius: 8px;
      background: var(--account-soft);
    }

    .detailList dt,
    .securityRow span {
      color: var(--account-muted);
      font-size: 13px;
      font-weight: 700;
    }

    .detailList dd {
      margin: 0;
      color: var(--account-ink);
      font-size: 14px;
      font-weight: 750;
      text-align: right;
      overflow-wrap: anywhere;
    }

    .securityRow strong {
      color: var(--account-ink);
      font-size: 15px;
      font-weight: 800;
    }

    .securityRow + .securityRow {
      margin-top: 12px;
    }

    .panelCopy {
      min-height: 116px;
      margin: 0;
      border: 1px solid var(--account-line);
      border-radius: 8px;
      background: var(--account-soft);
      padding: 14px;
    }

    @media (max-width: 1180px) {
      .accountGrid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 980px) {
      .accountCenterPage {
        --account-page-width: calc(100% - 48px);
      }

      .accountHero,
      .accountGrid,
      .accountSections {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 620px) {
      .accountCenterPage {
        --account-page-width: calc(100% - 36px);
        padding-bottom: 46px;
      }

      .accountHeader,
      .accountHeaderActions,
      .detailList div,
      .securityRow {
        align-items: stretch;
        flex-direction: column;
      }

      .accountHeaderActions,
      .ghostButton {
        width: 100%;
      }

      .accountHero {
        padding-top: 16px;
      }

      .heroProfileCard,
      .detailList {
        grid-template-columns: 1fr;
      }

      .detailList dd {
        text-align: left;
      }
    }
  `;
}
