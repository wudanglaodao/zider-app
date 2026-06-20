import type { ReactNode } from "react";
import { ArrowRight, LogOut, Menu, Settings, X } from "lucide-react";

import { signOutAction } from "@/app/account/actions";
import { isAccountAuthConfigured } from "@/lib/account/auth";
import { getAccountSession } from "@/lib/account/session";

const ziderLogoUrl = "https://assets.lopuo.com/app/zider/uploads/2024/07/zider-def.png";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
  { href: "/contact", label: "Contact" },
];

const footerLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function PublicPage({ children }: { children: ReactNode }) {
  return (
    <div className="publicChrome">
      <style>{getPublicChromeCss()}</style>
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}

export async function PublicHeader() {
  const accountSession = isAccountAuthConfigured() ? await getAccountSession() : null;
  const accountNextPath = "/account/center";
  const accountNext = encodeURIComponent(accountNextPath);
  const accountInitials = publicAccountInitials(accountSession?.user.displayName, accountSession?.user.email);
  const accountName = publicAccountName(accountSession?.user.displayName, accountSession?.user.email);

  return (
    <header className="publicHeader" aria-label="ZIDER website navigation">
      <div className="publicHeaderInner">
        <a className="publicBrand" href="/" aria-label="ZIDER home">
          <img alt="ZIDER" src={ziderLogoUrl} />
        </a>

        <nav className="publicNav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="publicActions">
          {accountSession ? (
            <details className="publicAccountMenu">
              <summary className="publicAccountButton" aria-label="Open account menu">
                <span className="publicAccountAvatar" aria-hidden="true">
                  {accountInitials}
                </span>
              </summary>
              <div className="publicAccountPanel" aria-label="Account menu">
                <div className="publicAccountSummary">
                  <span className="publicAccountPanelAvatar" aria-hidden="true">
                    {accountInitials}
                  </span>
                  <span>
                    <strong>{accountName}</strong>
                    <small>{accountSession.user.email}</small>
                  </span>
                </div>
                <div className="publicAccountPanelActions">
                  <a href={accountNextPath}>
                    <Settings size={16} />
                    Account Settings
                  </a>
                  <form action={signOutAction}>
                    <button type="submit">
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </details>
          ) : (
            <>
              <a className="publicAuthLink" href={`/account?mode=signin&next=${accountNext}`}>
                Sign in
              </a>
              <a className="publicAuthButton" href={`/register?next=${accountNext}`}>
                Sign up
              </a>
            </>
          )}
          <details className="publicMobileMenu">
            <summary aria-label="Open menu">
              <Menu className="publicMobileOpen" size={18} />
              <X className="publicMobileClose" size={18} />
            </summary>
            <div className="publicMobilePanel">
              <a className="publicMobileBrand" href="/" aria-label="ZIDER home">
                <img alt="ZIDER" src={ziderLogoUrl} />
              </a>
              <nav className="publicMobileNav" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <a href={link.href} key={link.href}>
                    <span>{link.label}</span>
                    <ArrowRight size={17} />
                  </a>
                ))}
              </nav>
              <div className="publicMobileActions">
                {accountSession ? (
                  <>
                    <a className="publicMobilePrimary" href={accountNextPath}>
                      <Settings size={15} />
                      Account
                    </a>
                    <form action={signOutAction}>
                      <button className="publicMobileSecondary" type="submit">
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <a className="publicMobilePrimary" href={`/register?next=${accountNext}`}>
                      Sign up
                      <ArrowRight size={15} />
                    </a>
                    <a className="publicMobileSecondary" href={`/account?mode=signin&next=${accountNext}`}>
                      Sign in
                    </a>
                  </>
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

function publicAccountInitials(displayName?: string | null, email?: string | null) {
  const source = displayName?.trim() || email?.trim() || "Z";

  return source
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function publicAccountName(displayName?: string | null, email?: string | null) {
  const trimmedName = displayName?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const emailName = email?.split("@")[0]?.trim();
  return emailName || "ZIDER account";
}

export function PublicFooter() {
  return (
    <footer className="publicFooter">
      <div className="publicFooterInner">
        <div className="publicFooterBrand">
          <img alt="ZIDER" src={ziderLogoUrl} />
          <p>Components, app utilities, and practical solutions for creator websites.</p>
        </div>

        <nav className="publicFooterLinks" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="publicFooterBottom">
          <span>© 2026 ZIDER</span>
        </div>
      </div>
    </footer>
  );
}

function getPublicChromeCss() {
  return `
    .publicChrome,
    .publicChrome * {
      box-sizing: border-box;
    }

    .publicChrome {
      --public-page-max: 1440px;
      --public-page-gutter: clamp(192px, 18vw, 360px);
      --public-page-width: min(var(--public-page-max), calc(100% - var(--public-page-gutter)));
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      color: var(--zider-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .publicChrome > main {
      flex: 1 0 auto;
    }

    .publicHeader {
      position: sticky;
      top: 0;
      z-index: 30;
      border-bottom: 1px solid rgba(10, 37, 64, 0.1);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(18px);
    }

    .publicHeaderInner {
      width: var(--public-page-width);
      min-height: 78px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 32px;
      margin: 0 auto;
    }

    .publicBrand img,
    .publicMobileBrand img,
    .publicFooterBrand img {
      display: block;
      width: 92px;
      height: auto;
    }

    .publicNav {
      display: flex;
      align-items: center;
      justify-self: center;
      gap: 30px;
    }

    .publicNav a,
    .publicFooterLinks a {
      color: var(--zider-ink);
      font-size: 14px;
      font-weight: 650;
      transition: color 160ms ease;
    }

    .publicNav a:hover,
    .publicFooterLinks a:hover {
      color: var(--zider-green);
    }

    .publicActions {
      display: flex;
      align-items: center;
      justify-self: end;
      gap: 8px;
    }

    .publicAuthLink,
    .publicAuthButton,
    .publicAccountButton {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 5px;
      padding: 0 18px;
      font-size: 14px;
      font-weight: 700;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
    }

    .publicAuthLink {
      border: 1px solid rgba(8, 122, 70, 0.22);
      background: rgba(255, 255, 255, 0.86);
      color: var(--zider-green);
    }

    .publicAuthButton,
    .publicAccountButton {
      border: 1px solid var(--zider-green);
      background: var(--zider-green);
      color: #ffffff;
      box-shadow: 0 14px 30px rgba(8, 122, 70, 0.16);
    }

    .publicAccountButton {
      width: 44px;
      min-height: 44px;
      border-radius: 999px;
      padding: 0;
    }

    .publicAuthButton:hover,
    .publicAccountButton:hover {
      background: #069456;
      border-color: #069456;
      transform: translateY(-1px);
    }

    .publicAuthLink:hover {
      border-color: rgba(8, 122, 70, 0.42);
      background: rgba(223, 247, 234, 0.5);
      transform: translateY(-1px);
    }

    .publicAccountMenu {
      position: relative;
      display: inline-flex;
    }

    .publicAccountMenu summary {
      cursor: pointer;
      list-style: none;
    }

    .publicAccountMenu summary::-webkit-details-marker {
      display: none;
    }

    .publicAccountAvatar {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 12px;
      font-weight: 820;
      line-height: 1;
    }

    .publicAccountPanel {
      width: 260px;
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      z-index: 80;
      border: 1px solid rgba(8, 122, 70, 0.16);
      border-radius: 10px;
      background: #ffffff;
      box-shadow: 0 24px 60px rgba(10, 37, 64, 0.14);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(-4px);
      transition: opacity 150ms ease, transform 150ms ease, visibility 150ms ease;
      overflow: hidden;
    }

    .publicAccountPanel::before {
      content: "";
      position: absolute;
      inset: -14px 0 auto;
      height: 14px;
    }

    .publicAccountMenu:hover .publicAccountPanel,
    .publicAccountMenu[open] .publicAccountPanel,
    .publicAccountMenu:focus-within .publicAccountPanel {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(0);
    }

    .publicAccountSummary {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .publicAccountPanelAvatar {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 999px;
      background: rgba(8, 122, 70, 0.1);
      color: var(--zider-green);
      font-size: 14px;
      font-weight: 820;
    }

    .publicAccountSummary span:last-child {
      min-width: 0;
      display: grid;
      gap: 3px;
    }

    .publicAccountSummary strong {
      color: var(--zider-ink);
      font-size: 14px;
      line-height: 1.2;
      font-weight: 760;
    }

    .publicAccountSummary small {
      color: var(--zider-muted);
      font-size: 12px;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .publicAccountPanelActions {
      display: grid;
      gap: 2px;
      border-top: 1px solid rgba(217, 228, 236, 0.68);
      padding: 8px;
    }

    .publicAccountPanelActions a,
    .publicAccountPanelActions button {
      width: 100%;
      min-height: 38px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: var(--zider-ink);
      padding: 0 10px;
      font: inherit;
      font-size: 13px;
      font-weight: 650;
      text-align: left;
      cursor: pointer;
      transition: background 150ms ease, color 150ms ease;
    }

    .publicAccountPanelActions a:hover,
    .publicAccountPanelActions button:hover {
      background: rgba(223, 247, 234, 0.58);
      color: var(--zider-green);
    }

    .publicMobileMenu {
      display: none;
    }

    .publicMobileMenu summary {
      width: 40px;
      min-height: 40px;
      display: inline-grid;
      place-items: center;
      border: 1px solid rgba(8, 122, 70, 0.2);
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.9);
      color: var(--zider-ink);
      cursor: pointer;
      list-style: none;
    }

    .publicMobileMenu summary::-webkit-details-marker {
      display: none;
    }

    .publicMobileClose,
    .publicMobileMenu[open] .publicMobileOpen {
      display: none;
    }

    .publicMobileMenu[open] .publicMobileClose {
      display: block;
    }

    .publicMobileMenu[open] summary {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 61;
      border-color: transparent;
      background: rgba(8, 122, 70, 0.08);
      color: var(--zider-green);
    }

    .publicMobilePanel {
      position: fixed;
      inset: 0;
      z-index: 60;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      padding: 28px 32px 24px;
    }

    .publicMobileNav {
      display: grid;
      margin-top: 42px;
    }

    .publicMobileNav a {
      min-height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(217, 228, 236, 0.82);
      color: var(--zider-ink);
      font-size: 18px;
      font-weight: 700;
    }

    .publicMobileNav svg {
      color: var(--zider-green);
    }

    .publicMobileActions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-top: auto;
      padding-top: 42px;
    }

    .publicMobilePrimary,
    .publicMobileSecondary {
      width: 100%;
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 5px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease;
    }

    .publicMobilePrimary {
      border: 1px solid var(--zider-green);
      background: var(--zider-green);
      color: #ffffff;
      box-shadow: 0 14px 28px rgba(8, 122, 70, 0.16);
    }

    .publicMobileSecondary {
      border: 1px solid rgba(8, 122, 70, 0.22);
      background: #ffffff;
      color: var(--zider-green);
    }

    button.publicMobileSecondary {
      font: inherit;
    }

    .publicMobilePrimary:hover {
      background: #069456;
      border-color: #069456;
    }

    .publicMobileSecondary:hover {
      border-color: rgba(8, 122, 70, 0.42);
      background: rgba(223, 247, 234, 0.48);
    }

    .publicFooter {
      flex: 0 0 auto;
      margin-top: auto;
      border-top: 1px solid var(--zider-line);
      background: #f7faf8;
      padding: 38px 0 24px;
    }

    .publicFooterInner {
      width: var(--public-page-width);
      display: grid;
      grid-template-columns: minmax(220px, 1fr) auto;
      gap: 28px;
      margin: 0 auto;
    }

    .publicFooterBrand img {
      width: 86px;
    }

    .publicFooterBrand p {
      max-width: 370px;
      margin: 14px 0 0;
      color: var(--zider-muted);
      font-size: 14px;
      line-height: 1.5;
    }

    .publicFooterLinks {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: flex-end;
      gap: 12px 24px;
      padding-top: 3px;
    }

    .publicFooterBottom {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      border-top: 1px solid var(--zider-line);
      margin-top: 24px;
      padding-top: 16px;
      color: var(--zider-muted);
      font-size: 13px;
    }

    @media (max-width: 980px) {
      .publicHeaderInner {
        width: calc(100% - 28px);
        grid-template-columns: auto minmax(0, 1fr);
        justify-content: space-between;
        gap: 10px;
      }

      .publicNav {
        display: none;
      }

      .publicMobileMenu {
        display: block;
      }

      .publicFooterInner {
        width: calc(100% - 36px);
        grid-template-columns: 1fr;
      }

      .publicFooterLinks {
        justify-content: flex-start;
      }

      .publicFooterBottom {
        align-items: flex-start;
        flex-direction: column;
      }

    }

    @media (max-width: 640px) {
      .publicHeaderInner {
        width: calc(100% - 24px);
        min-height: 66px;
      }

      .publicBrand img,
      .publicMobileBrand img {
        width: 82px;
      }
    }
  `;
}
