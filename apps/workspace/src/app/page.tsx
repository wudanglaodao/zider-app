import {
  Activity,
  ArrowRight,
  CircleHelp,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  Printer,
  UserRound,
  X,
} from "lucide-react";

import { UserAvatar } from "./_components/UserAvatar";

const siteOrigin =
  normalizeOrigin(process.env.NEXT_PUBLIC_ZIDER_SITE_URL) ??
  (process.env.NODE_ENV === "production" ? "https://zider.ink" : "http://localhost:3100");

const accountCenterHref = `${siteOrigin}/account/center`;
const signInHref = `${siteOrigin}/account?mode=signin&next=${encodeURIComponent("/account/center")}`;
const helpHref = `${siteOrigin}/forum`;
const printOpsHref = "/apps/printops/wix";
const workspaceUser = {
  avatarUrl: null,
  email: "yancytien@gmail.com",
  fullName: "INY GU",
  initials: "IG",
};

export default function WorkspaceHomePage() {
  return (
    <main className="workspaceDashboardShell">
      <input className="workspaceDashboardMenuToggle" id="workspace-dashboard-menu" type="checkbox" />

      <header className="workspaceDashboardTopbar" aria-label="ZIDER Workspace">
        <a className="workspaceDashboardBrand" href="/" aria-label="ZIDER Workspace home">
          <ZiderMicroMark />
        </a>

        <label className="workspaceDashboardMenuButton" htmlFor="workspace-dashboard-menu" aria-label="Open workspace menu">
          <Menu size={18} />
        </label>

        <nav className="workspaceDashboardTopActions" aria-label="Workspace actions">
          <a className="workspaceDashboardHelp" href={helpHref}>
            Help
          </a>
          <a className="workspaceDashboardIconLink" href="/" aria-label="Open workspace" title="Workspace">
            <LayoutGrid size={17} strokeWidth={2.2} />
          </a>
          <div className="workspaceDashboardAvatarMenu">
            <button className="workspaceDashboardAvatar" type="button" aria-label="Open account menu">
              <UserAvatar avatarUrl={workspaceUser.avatarUrl} className="workspaceDashboardAvatarVisual" initials={workspaceUser.initials} />
            </button>
            <section className="workspaceDashboardAccountPopover" aria-label="Account menu">
              <div className="workspaceDashboardPopoverUser">
                <UserAvatar avatarUrl={workspaceUser.avatarUrl} className="workspaceDashboardAvatarVisual" initials={workspaceUser.initials} />
                <span>
                  <strong>{workspaceUser.fullName}</strong>
                  <small>{workspaceUser.email}</small>
                </span>
              </div>
              <div className="workspaceDashboardPopoverActions">
                <a href={accountCenterHref}>
                  <UserRound size={16} />
                  My Profile
                </a>
                <a data-danger="true" href={signInHref}>
                  <LogOut size={20} />
                  Logout
                </a>
              </div>
            </section>
          </div>
        </nav>
      </header>

      <div className="workspaceDashboardLayout">
        <aside className="workspaceDashboardSidebar" aria-label="Workspace navigation">
          <div className="workspaceDashboardSidebarHeader">
            <a className="workspaceDashboardSidebarBrand" href="/" aria-label="ZIDER Workspace home">
              <ZiderMicroMark />
            </a>
            <label className="workspaceDashboardSidebarClose" htmlFor="workspace-dashboard-menu" aria-label="Close workspace menu">
              <X size={18} />
            </label>
          </div>

          <div>
            <p className="workspaceDashboardNavLabel">Workspace</p>
            <nav className="workspaceDashboardNav">
              <a data-active="true" href="/">
                <LayoutDashboard size={18} />
                Dashboard
              </a>
            </nav>
          </div>

          <div className="workspaceDashboardSidebarFooter">
            <a className="workspaceDashboardHelpLink" href={helpHref}>
              <CircleHelp size={16} />
              Help center
            </a>
            <a className="workspaceDashboardUser" href={accountCenterHref}>
              <span>
                <UserAvatar avatarUrl={workspaceUser.avatarUrl} className="workspaceDashboardAvatarVisual" initials={workspaceUser.initials} />
              </span>
              <span>
                <strong>{workspaceUser.fullName}</strong>
                <small>Account Center</small>
              </span>
              <ArrowRight size={16} />
            </a>
          </div>
        </aside>

        <section className="workspaceDashboardMain" aria-labelledby="workspace-dashboard-title">
          <div className="workspaceDashboardHero">
            <div>
              <p>ACME PAPER GOODS</p>
              <h1 id="workspace-dashboard-title">Workspace</h1>
              <span>Open your apps and manage the account tools you use with ZIDER.</span>
            </div>

            <div className="workspaceDashboardHeroActions">
              <a className="workspaceDashboardButton" href={accountCenterHref}>
                <LayoutGrid size={16} />
                Account Center
              </a>
              <a className="workspaceDashboardButton workspaceDashboardButtonPrimary" href={printOpsHref}>
                <Printer size={16} />
                Open PrintOps
              </a>
            </div>
          </div>

          <section className="workspaceDashboardApps" aria-label="Your apps">
            <div className="workspaceDashboardSectionHead">
              <div>
                <h2>Your apps</h2>
                <p>Continue working in an installed ZIDER app.</p>
              </div>
              <a href={printOpsHref}>
                View all apps
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="workspaceDashboardAppGrid">
              <article className="workspaceDashboardPrintOps">
                <div className="workspaceDashboardAppTop">
                  <span className="workspaceDashboardAppIcon" aria-hidden="true">
                    <Printer size={27} />
                  </span>
                  <div className="workspaceDashboardAppTitle">
                    <div>
                      <h3>Zider PrintOps</h3>
                      <span className="workspaceDashboardPill">Active</span>
                      <span className="workspaceDashboardPill">Pro</span>
                    </div>
                    <p>Print invoices and packing slips from Wix orders.</p>
                  </div>
                  <a className="workspaceDashboardOpen" href={printOpsHref}>
                    Open PrintOps
                    <ArrowRight size={16} />
                  </a>
                </div>

                <div className="workspaceDashboardMeta">
                  <span>W</span>
                  <strong>Acme Paper Goods</strong>
                </div>
                <div className="workspaceDashboardMeta">
                  <span data-tone="link">↗</span>
                  <strong>Wix connected</strong>
                </div>

                <div className="workspaceDashboardStats" aria-label="PrintOps status">
                  <div>
                    <strong>8</strong>
                    <span>Ready to print</span>
                  </div>
                  <div>
                    <strong>24</strong>
                    <span>Printed today</span>
                  </div>
                  <div>
                    <strong>Healthy</strong>
                    <span>Synced 1 min ago</span>
                  </div>
                </div>

                <span className="workspaceDashboardWatermark" aria-hidden="true" />
              </article>

              <article className="workspaceDashboardGrowCard">
                <div className="workspaceDashboardGrowTools" aria-hidden="true">
                  <span>
                    <Plus size={19} />
                  </span>
                  <span>
                    <LayoutGrid size={17} />
                  </span>
                  <span>
                    <Activity size={17} />
                  </span>
                </div>
                <p>GROW WITH ZIDER</p>
                <h3>Add apps as your workflow grows.</h3>
                <span>Future apps can reuse this workspace, account center, and billing profile.</span>
                <a href={helpHref}>
                  Explore ZIDER apps
                  <ArrowRight size={16} />
                </a>
              </article>
            </div>
          </section>
        </section>
      </div>

      <label className="workspaceDashboardSidebarBackdrop" htmlFor="workspace-dashboard-menu" aria-label="Close workspace menu" />
    </main>
  );
}

function ZiderMicroMark() {
  return (
    <svg
      aria-hidden="true"
      className="workspaceDashboardBrandMark"
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
    >
      <g transform="translate(5.960 1.706) scale(1.025)">
        <path
          d="M35.2 2.1 L14 35.5 H35.1 V43.3 H0 L21 9.9 H8.4 C4.7 9.9 2.9 7.7 2.9 4.9 V0 H10.3 V0.8 C10.3 1.7 10.7 2.1 11.5 2.1 Z"
          fill="#007448"
        />
      </g>
    </svg>
  );
}

function normalizeOrigin(value: string | undefined) {
  const trimmed = value?.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).origin;
  } catch {
    return null;
  }
}
