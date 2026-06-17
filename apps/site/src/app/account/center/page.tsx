import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, BadgeCheck, Building2, Clock3, KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";

import { isAccountAuthConfigured } from "@/lib/account/auth";
import { getAccountSession } from "@/lib/account/session";
import type { ZiderUser } from "@/lib/account/users";
import { signOutAction } from "../actions";

export const metadata: Metadata = {
  title: "Account Center - ZIDER",
  description: "Manage your ZIDER account profile and workspace access.",
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

  const workspaceUrl = process.env.NEXT_PUBLIC_WORKSPACE_URL?.trim() || "https://workspace.zider.ink/app";

  return (
    <main className="accountCenterPage">
      <style>{getAccountCenterCss()}</style>
      <section className="accountShell" aria-labelledby="account-center-title">
        <header className="accountHeader">
          <a className="accountBrand" href="/" aria-label="ZIDER home">
            <ZiderMark />
            <span>ZIDER</span>
          </a>
          <div className="accountHeaderActions">
            <a className="ghostButton" href={workspaceUrl}>
              Workspace
              <ArrowRight size={16} />
            </a>
            <form action={signOutAction}>
              <button className="ghostButton" type="submit">
                <LogOut size={16} />
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="accountHero">
          <p className="accountEyebrow">ZIDER ACCOUNT</p>
          <h1 id="account-center-title">Account Center</h1>
          <p>{session.user.email}</p>
        </div>

        <div className="accountGrid">
          <section className="profileCard">
            <div className="profileAvatar" aria-hidden="true">
              {initialsForUser(session.user)}
            </div>
            <div>
              <p className="cardKicker">Profile</p>
              <h2>{session.user.displayName || "Zider member"}</h2>
              <p>{session.user.email}</p>
            </div>
          </section>

          <InfoCard
            icon={<BadgeCheck size={20} />}
            label="Account status"
            title={capitalize(session.user.status)}
            value={`Role: ${capitalize(session.user.role)}`}
          />
          <InfoCard
            icon={<Clock3 size={20} />}
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
        </div>

        <div className="accountSections">
          <section className="accountPanel">
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
              <Building2 size={20} />
              <h2>Connected workspace</h2>
            </div>
            <div className="workspaceRow">
              <div>
                <strong>ZIDER Workspace</strong>
                <span>Apps, widgets, and merchant tools</span>
              </div>
              <a className="primaryLink" href={workspaceUrl}>
                Open
                <ArrowRight size={16} />
              </a>
            </div>
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

function ZiderMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="20" cy="20" r="5" fill="currentColor" />
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

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
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
      --account-green: #087a46;
      min-height: 100vh;
      padding: 32px;
      background: #f7faf8;
      color: var(--account-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .accountShell {
      width: min(1120px, 100%);
      margin: 0 auto;
    }

    .accountHeader {
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 56px;
    }

    .accountBrand,
    .accountHeaderActions,
    .ghostButton,
    .primaryLink {
      display: inline-flex;
      align-items: center;
    }

    .accountBrand {
      gap: 10px;
      color: var(--account-ink);
      font-size: 18px;
      font-weight: 800;
      text-decoration: none;
    }

    .accountBrand svg {
      width: 34px;
      height: 34px;
      color: var(--account-green);
    }

    .accountHeaderActions {
      gap: 10px;
    }

    .accountHeaderActions form {
      margin: 0;
    }

    .ghostButton,
    .primaryLink {
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

    .ghostButton:hover,
    .primaryLink:hover {
      border-color: #b8c8c0;
      box-shadow: 0 8px 20px rgba(16, 24, 22, 0.06);
    }

    .accountHero {
      max-width: 720px;
      margin-bottom: 28px;
    }

    .accountEyebrow,
    .cardKicker {
      margin: 0;
      color: var(--account-green);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .accountHero h1 {
      margin: 8px 0 10px;
      font-size: clamp(44px, 7vw, 82px);
      line-height: 0.96;
      font-weight: 850;
    }

    .accountHero p,
    .infoCard p,
    .profileCard p,
    .workspaceRow span {
      color: var(--account-muted);
      font-size: 15px;
      line-height: 1.5;
    }

    .accountGrid {
      display: grid;
      grid-template-columns: minmax(280px, 1.25fr) repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 14px;
    }

    .profileCard,
    .infoCard,
    .accountPanel {
      border: 1px solid var(--account-line);
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 12px 32px rgba(16, 24, 22, 0.04);
    }

    .profileCard {
      min-height: 162px;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 18px;
      padding: 22px;
    }

    .profileAvatar {
      width: 72px;
      height: 72px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: var(--account-green);
      color: #ffffff;
      font-size: 26px;
      font-weight: 850;
    }

    .profileCard h2,
    .infoCard h2,
    .accountPanel h2 {
      margin: 6px 0 4px;
      color: var(--account-ink);
      font-size: 20px;
      line-height: 1.2;
      font-weight: 800;
    }

    .infoCard {
      min-height: 162px;
      padding: 18px;
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
      grid-template-columns: 1.25fr 1fr 1fr;
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
      gap: 12px;
      margin: 0;
    }

    .detailList div,
    .securityRow,
    .workspaceRow {
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

    .workspaceRow {
      align-items: flex-start;
    }

    .workspaceRow div {
      display: grid;
      gap: 4px;
    }

    .workspaceRow strong,
    .securityRow strong {
      color: var(--account-ink);
      font-size: 15px;
      font-weight: 800;
    }

    .primaryLink {
      flex: 0 0 auto;
      border-color: var(--account-green);
      background: var(--account-green);
      color: #ffffff;
    }

    .primaryLink:hover {
      border-color: #069456;
      background: #069456;
    }

    .securityRow + .securityRow {
      margin-top: 12px;
    }

    @media (max-width: 980px) {
      .accountGrid,
      .accountSections {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 620px) {
      .accountCenterPage {
        padding: 20px;
      }

      .accountHeader,
      .accountHeaderActions,
      .detailList div,
      .workspaceRow,
      .securityRow {
        align-items: stretch;
        flex-direction: column;
      }

      .accountHeaderActions,
      .ghostButton,
      .primaryLink {
        width: 100%;
      }

      .profileCard {
        grid-template-columns: 1fr;
      }

      .detailList dd {
        text-align: left;
      }
    }
  `;
}
