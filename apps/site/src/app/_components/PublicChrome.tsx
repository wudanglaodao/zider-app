import type { ReactNode } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const ziderLogoUrl = "https://assets.lopuo.com/app/zider/uploads/2024/07/zider-def.png";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
];

const footerLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
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

export function PublicHeader() {
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
          <a className="publicContactButton" href="/contact">
            Contact
          </a>
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
              <a className="publicMobileContact" href="/contact">
                Contact
                <ArrowRight size={15} />
              </a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
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
      background: #ffffff;
      color: var(--zider-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
      -webkit-font-smoothing: antialiased;
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

    .publicContactButton,
    .publicMobileContact {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid var(--zider-green);
      border-radius: 5px;
      background: var(--zider-green);
      color: #ffffff;
      padding: 0 18px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 14px 30px rgba(8, 122, 70, 0.16);
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
    }

    .publicContactButton:hover,
    .publicMobileContact:hover {
      background: #069456;
      border-color: #069456;
      transform: translateY(-1px);
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

    .publicMobileContact {
      margin-top: auto;
    }

    .publicFooter {
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
