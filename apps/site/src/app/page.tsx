import { ArrowRight, Menu, X } from "lucide-react";

const ziderLogoUrl = "https://assets.lopuo.com/app/zider/uploads/2024/07/zider-def.png";

const navItems = [
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
];
const platformLogos = [
  { iconUrl: "https://cdn.simpleicons.org/wix/63758A", name: "Wix" },
  { iconUrl: "https://cdn.simpleicons.org/webflow/087A46", name: "Webflow" },
  { iconUrl: "https://cdn.simpleicons.org/wordpress/63758A", name: "WordPress" },
  { iconUrl: "https://cdn.simpleicons.org/shopify/087A46", name: "Shopify" },
  { iconUrl: "https://cdn.simpleicons.org/cursor/63758A", name: "Codex" },
  { iconUrl: "https://cdn.simpleicons.org/framer/63758A", name: "Framer" },
  { iconUrl: "https://cdn.simpleicons.org/figma/63758A", name: "Figma" },
];
const footerLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

export default function HomePage() {
  return (
    <main className="zider-stripe">
      <style>{getStripeLandingCss()}</style>

      <header className="site-header" aria-label="ZIDER website navigation">
        <div className="site-header__inner">
          <a className="brand" href="/" aria-label="ZIDER home">
            <img alt="ZIDER" src={ziderLogoUrl} />
          </a>

          <nav className="nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a className="contact-button" href="/contact">
              Contact
            </a>
            <details className="mobile-menu">
              <summary aria-label="Open menu">
                <Menu className="mobile-menu__icon-open" size={18} />
                <X className="mobile-menu__icon-close" size={18} />
              </summary>
              <div className="mobile-menu__panel">
                <div className="mobile-menu__brand">
                  <img alt="ZIDER" src={ziderLogoUrl} />
                </div>
                <nav className="mobile-menu__nav" aria-label="Mobile navigation">
                  {navItems.map((item) => (
                    <a href={item.href} key={item.href}>
                      <span>{item.label}</span>
                      <ArrowRight size={17} />
                    </a>
                  ))}
                </nav>
                <div className="mobile-menu__actions">
                  <a className="mobile-menu__primary" href="/contact">
                    Contact
                    <ArrowRight size={15} />
                  </a>
                  <a className="mobile-menu__secondary" href="#blog">
                    Read Blog
                  </a>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__inner">
          <div className="hero__copy">
            <p className="hero__metric">
              <span />
              ZIDER for creators
            </p>
            <h1 id="hero-title">
              Components and solutions for creator websites.
            </h1>
            <p className="hero__subtitle">
              We build lightweight interactive components, app utilities, and practical solutions that help creators ship better sites faster.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#resources">
                Get started
                <ArrowRight size={17} />
              </a>
              <a className="secondary-button" href="#blog">
                Read the Blog
              </a>
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <div className="hero-blueprint">
              <div className="blueprint-grid">
                <span className="blueprint-line blueprint-line--one" />
                <span className="blueprint-line blueprint-line--two" />
                <span className="blueprint-line blueprint-line--three" />
                <span className="blueprint-node blueprint-node--one" />
                <span className="blueprint-node blueprint-node--two" />
                <span className="blueprint-node blueprint-node--three" />
                <span className="color-ribbon color-ribbon--one" />
                <span className="color-ribbon color-ribbon--two" />
                <span className="visual-panel visual-panel--primary">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="visual-panel visual-panel--secondary">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="visual-panel visual-panel--mini">
                  <i />
                  <i />
                </span>
                <span className="color-plane color-plane--main">
                  <i className="color-tile color-tile--wide" />
                  <i className="color-tile color-tile--green" />
                  <i className="color-tile color-tile--blue" />
                  <i className="color-tile color-tile--gold" />
                  <i className="color-tile color-tile--coral" />
                  <i className="color-tile color-tile--slim" />
                </span>
                <span className="color-plane color-plane--side">
                  <i className="color-tile color-tile--green" />
                  <i className="color-tile color-tile--blue" />
                  <i className="color-tile color-tile--gold" />
                  <i className="color-tile color-tile--coral" />
                </span>
                <span className="color-plane color-plane--small">
                  <i className="color-tile color-tile--gold" />
                  <i className="color-tile color-tile--green" />
                  <i className="color-tile color-tile--blue" />
                </span>
                <span className="color-pixels" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Supported platforms and tools">
        <div className="trust-strip__inner">
          <div className="logo-marquee" aria-hidden="true">
            <div className="logo-track">
              {[...platformLogos, ...platformLogos].map((item, index) => (
                <span className="logo-mark" key={`${item.name}-${index}`}>
                  <img alt="" src={item.iconUrl} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="solutions" id="solutions" aria-labelledby="solutions-title">
        <div className="solutions__inner">
          <h2 id="solutions-title">
            Simple tools, thoughtful components, and practical solutions.
          </h2>

          <div className="resource-grid" id="resources">
            <a className="resource-card" href="#blog" id="blog">
              <small>Components</small>
              <strong>Reusable blocks for modern site experiences</strong>
              <p>Interaction components, visual widgets, and small details that make a site feel more complete.</p>
            </a>

            <a className="resource-card" href="#forum" id="forum">
              <small>Solutions</small>
              <strong>Custom implementation for real workflows</strong>
              <p>Practical solutions for storefronts, content sites, product pages, and creator operations.</p>
            </a>

            <a className="resource-card" href="#resources">
              <small>Resources</small>
              <strong>Blog and Forum for product knowledge</strong>
              <p>Guides, migration notes, release updates, and community answers in one searchable place.</p>
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="footer-brand">
            <img alt="ZIDER" src={ziderLogoUrl} />
            <p>Components and practical solutions for creators building better websites and digital products.</p>
          </div>

          <div className="footer-links" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="footer-bottom">
            <span>© 2026 ZIDER</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function getStripeLandingCss() {
  return `
    :root {
      color-scheme: light;
    }

    .zider-stripe,
    .zider-stripe *,
    .zider-stripe *::before,
    .zider-stripe *::after {
      box-sizing: border-box;
    }

    .zider-stripe {
      --ink: #0a2540;
      --blue-text: #456782;
      --muted: #63758a;
      --line: #d9e4ec;
      --line-soft: rgba(217, 228, 236, 0.68);
      --green: #087a46;
      --green-bright: #13b77a;
      --green-soft: #dff7ea;
      --gold: #ffb84d;
      --coral: #ff6f61;
      --magenta: #e74eb9;
      --violet: #6f52ff;
      --page-max: 1440px;
      --page-gutter: clamp(192px, 18vw, 360px);
      --page-width: min(var(--page-max), calc(100% - var(--page-gutter)));
      min-height: 100vh;
      background: #ffffff;
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
    }

    .zider-stripe a {
      text-decoration: none;
    }

    .zider-stripe .brand {
      color: inherit;
      font-size: inherit;
      font-weight: inherit;
    }

    .zider-stripe .nav {
      max-width: none;
      min-height: 0;
      margin: 0;
      padding: 0;
      border-bottom: 0;
      justify-content: center;
    }

    .site-header {
      height: 78px;
      position: fixed;
      inset: 0 0 auto;
      z-index: 20;
      border-bottom: 1px solid rgba(10, 37, 64, 0.1);
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(18px);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.7), 0 18px 44px rgba(10, 37, 64, 0.04);
    }

    .site-header__inner {
      width: var(--page-width);
      height: 100%;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 32px;
      margin: 0 auto;
    }

    .brand img {
      width: 92px;
      height: auto;
      display: block;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: clamp(20px, 2.6vw, 36px);
      min-width: 0;
      justify-self: center;
    }

    .nav a {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--ink);
      font-size: 14px;
      font-weight: 620;
      white-space: nowrap;
      transition: color 160ms ease;
    }

    .nav a:hover {
      color: var(--green);
    }

    .header-actions {
      display: flex;
      align-items: center;
      justify-self: end;
      gap: 8px;
    }

    .contact-button {
      min-height: 40px;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      padding: 0 18px;
      font-size: 14px;
      font-weight: 650;
      overflow: hidden;
      transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease, border-color 160ms ease, color 160ms ease;
    }

    .contact-button {
      gap: 8px;
      border: 1px solid var(--green);
      background: var(--green);
      color: #ffffff;
      box-shadow: 0 12px 28px rgba(8, 122, 70, 0.22);
    }

    .zider-stripe a.contact-button,
    .zider-stripe a.primary-button {
      color: #ffffff !important;
    }

    .zider-stripe a.contact-button svg,
    .zider-stripe a.primary-button svg {
      color: #ffffff;
    }

    .zider-stripe a.secondary-button {
      color: var(--green) !important;
    }

    .contact-button:hover {
      transform: translateY(-1px);
    }

    .contact-button:hover,
    .primary-button:hover {
      background: #069456;
      border-color: #069456;
    }

    .secondary-button:hover {
      border-color: rgba(8, 122, 70, 0.42);
      background: rgba(223, 247, 234, 0.48);
      box-shadow: 0 12px 26px rgba(8, 122, 70, 0.08);
    }

    .contact-button:active,
    .primary-button:active,
    .secondary-button:active {
      transform: translateY(0) scale(0.98);
    }

    .contact-button:focus-visible,
    .primary-button:focus-visible,
    .secondary-button:focus-visible {
      outline: 3px solid rgba(19, 183, 122, 0.28);
      outline-offset: 3px;
    }

    .mobile-menu {
      display: none;
      position: relative;
    }

    .mobile-menu summary {
      width: 40px;
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(8, 122, 70, 0.18);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.82);
      color: var(--ink);
      cursor: pointer;
      list-style: none;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
    }

    .mobile-menu__icon-close {
      display: none;
    }

    .mobile-menu[open] .mobile-menu__icon-open {
      display: none;
    }

    .mobile-menu[open] .mobile-menu__icon-close {
      display: block;
    }

    .mobile-menu summary::-webkit-details-marker {
      display: none;
    }

    .mobile-menu summary:hover,
    .mobile-menu[open] summary {
      border-color: rgba(8, 122, 70, 0.36);
      background: rgba(223, 247, 234, 0.55);
      color: var(--green);
      box-shadow: 0 12px 26px rgba(8, 122, 70, 0.08);
    }

    .mobile-menu summary:active {
      transform: scale(0.98);
    }

    .mobile-menu summary:focus-visible {
      outline: 3px solid rgba(19, 183, 122, 0.28);
      outline-offset: 3px;
    }

    .mobile-menu[open] summary {
      position: fixed;
      top: 26px;
      right: 30px;
      z-index: 51;
      border-color: transparent;
      background: rgba(8, 122, 70, 0.08);
      color: var(--green);
      box-shadow: none;
    }

    .mobile-menu__panel {
      position: fixed;
      inset: 0;
      z-index: 50;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      padding: 30px 32px 26px;
      overflow-y: auto;
    }

    .mobile-menu__brand img {
      width: 92px;
      height: auto;
      display: block;
    }

    .mobile-menu__nav {
      display: grid;
      margin-top: 42px;
    }

    .mobile-menu__nav a {
      min-height: 54px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(217, 228, 236, 0.8);
      color: var(--ink);
      font-size: 18px;
      font-weight: 650;
      transition: background 150ms ease, color 150ms ease;
    }

    .mobile-menu__nav a:hover {
      color: var(--green);
    }

    .mobile-menu__nav svg {
      color: var(--green);
      stroke-width: 2.3;
    }

    .mobile-menu__actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-top: auto;
      padding-top: 46px;
    }

    .mobile-menu__primary,
    .mobile-menu__secondary {
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 5px;
      font-size: 14px;
      font-weight: 650;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
    }

    .mobile-menu__primary {
      border: 1px solid var(--green);
      background: var(--green);
      color: #ffffff;
      box-shadow: 0 14px 28px rgba(8, 122, 70, 0.16);
    }

    .mobile-menu__secondary {
      border: 1px solid rgba(8, 122, 70, 0.22);
      background: #ffffff;
      color: var(--green);
    }

    .mobile-menu__primary:hover {
      background: #069456;
      border-color: #069456;
    }

    .mobile-menu__secondary:hover {
      border-color: rgba(8, 122, 70, 0.42);
      background: rgba(223, 247, 234, 0.48);
    }

    .mobile-menu__primary:active,
    .mobile-menu__secondary:active {
      transform: scale(0.98);
    }

    .zider-stripe a.mobile-menu__primary {
      color: #ffffff !important;
    }

    .zider-stripe a.mobile-menu__secondary {
      color: var(--green) !important;
    }

    .hero {
      width: 100%;
      max-width: none;
      min-height: clamp(620px, 68vh, 760px);
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid var(--line);
      background:
        linear-gradient(90deg, rgba(255, 255, 255, 0.99) 0 45%, rgba(247, 251, 249, 0.88) 74%, rgba(255, 255, 255, 0.98) 100%),
        linear-gradient(180deg, #ffffff 0%, #fbfdfc 100%);
      padding-top: 78px;
    }

    .hero::before,
    .solutions::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(90deg, transparent 0 calc((100% - var(--page-max)) / 2), rgba(10, 37, 64, 0.11) calc((100% - var(--page-max)) / 2), rgba(10, 37, 64, 0.11) calc((100% - var(--page-max)) / 2 + 1px), transparent calc((100% - var(--page-max)) / 2 + 1px)),
        linear-gradient(90deg, transparent 0 calc((100% + var(--page-max)) / 2), rgba(10, 37, 64, 0.11) calc((100% + var(--page-max)) / 2), rgba(10, 37, 64, 0.11) calc((100% + var(--page-max)) / 2 + 1px), transparent calc((100% + var(--page-max)) / 2 + 1px));
      z-index: 1;
    }

    .hero__inner {
      width: var(--page-width);
      min-height: calc(clamp(620px, 68vh, 760px) - 78px);
      display: grid;
      grid-template-columns: minmax(0, 1fr) clamp(430px, 35vw, 620px);
      align-items: center;
      gap: clamp(54px, 5vw, 104px);
      position: relative;
      z-index: 3;
      margin: 0 auto;
      padding-bottom: 38px;
    }

    .hero__copy {
      width: min(700px, 100%);
      position: relative;
      z-index: 4;
      padding-left: 0;
      padding-top: 16px;
    }

    .hero__visual {
      min-width: 0;
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
      align-self: stretch;
      justify-content: center;
      padding-top: 34px;
      padding-bottom: 34px;
      margin-left: 0;
    }

    .hero__visual::before {
      content: "";
      width: 82%;
      height: 76%;
      position: absolute;
      inset: 11% 0 auto auto;
      border: 1px solid rgba(8, 122, 70, 0.1);
      border-radius: 34px;
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(8, 122, 70, 0.035)),
        repeating-linear-gradient(90deg, rgba(8, 122, 70, 0.035) 0 1px, transparent 1px 44px);
      transform: rotate(-4deg);
      transform-origin: center;
      pointer-events: none;
    }

    .hero__metric {
      width: fit-content;
      min-height: 30px;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      border: 1px solid rgba(8, 122, 70, 0.14);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.72);
      margin: 0 0 30px;
      padding: 0 12px;
      color: var(--ink);
      font-size: 13px;
      font-weight: 680;
      box-shadow: 0 14px 36px rgba(10, 37, 64, 0.04);
    }

    .hero__metric span {
      width: 7px;
      height: 7px;
      display: block;
      border-radius: 999px;
      background: var(--green);
      box-shadow: 0 0 0 5px rgba(8, 122, 70, 0.1);
    }

    .hero h1 {
      max-width: 620px;
      margin: 0;
      color: #070b3f;
      font-size: clamp(44px, 3.55vw, 64px);
      line-height: 1.08;
      letter-spacing: 0;
      font-weight: 620;
      text-wrap: balance;
    }

    .hero__subtitle {
      color: var(--blue-text);
      max-width: 540px;
      margin: 18px 0 0;
      font-size: clamp(16px, 1.08vw, 19px);
      font-weight: 400;
      line-height: 1.48;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 32px;
    }

    .primary-button,
    .secondary-button {
      min-height: 48px;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      border-radius: 4px;
      padding: 0 22px;
      font-size: 15px;
      font-weight: 660;
      overflow: hidden;
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease;
    }

    .primary-button {
      border: 1px solid var(--green);
      background: var(--green);
      color: #ffffff;
      box-shadow: 0 14px 30px rgba(8, 122, 70, 0.22);
    }

    .secondary-button {
      border: 1px solid rgba(8, 122, 70, 0.24);
      background: #ffffff;
      color: var(--green);
    }

    .primary-button:hover,
    .secondary-button:hover {
      transform: translateY(-2px);
    }

    .contact-button:active,
    .primary-button:active,
    .secondary-button:active {
      transform: translateY(0) scale(0.98);
    }

    .primary-button svg {
      transition: transform 160ms ease;
    }

    .primary-button:hover svg {
      transform: translateX(3px);
    }

    .hero-blueprint {
      width: 100%;
      max-width: 620px;
      min-height: 470px;
      height: clamp(500px, 38vw, 640px);
      position: relative;
      pointer-events: none;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 28px;
      overflow: hidden;
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(242, 250, 246, 0.86) 48%, rgba(255, 255, 255, 0.98)),
        #ffffff;
      box-shadow:
        0 30px 80px rgba(10, 37, 64, 0.075),
        inset 0 1px 0 rgba(255, 255, 255, 0.88);
      transform: perspective(1200px) rotateY(-4deg) rotateZ(-0.6deg);
      transform-origin: center;
      overflow: hidden;
    }

    .hero-blueprint::before,
    .hero-blueprint::after {
      content: "";
      position: absolute;
      pointer-events: none;
      z-index: 1;
    }

    .hero-blueprint::before {
      inset: 22px;
      border: 1px solid rgba(8, 122, 70, 0.11);
      border-radius: 22px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.36), transparent 42%);
    }

    .hero-blueprint::after {
      width: 60%;
      height: 1px;
      left: 18%;
      top: 18%;
      background: linear-gradient(90deg, transparent, rgba(8, 122, 70, 0.24), transparent);
      transform: rotate(12deg);
    }

    .blueprint-grid {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0.98;
      transform: skewX(-8deg);
      animation: blueprintFloat 18s ease-in-out infinite alternate;
    }

    .blueprint-grid::before,
    .blueprint-grid::after {
      content: "";
      position: absolute;
      pointer-events: none;
    }

    .blueprint-grid::before {
      inset: 0;
      border: 1px solid rgba(8, 122, 70, 0.11);
      border-radius: 28px;
      background-image:
        radial-gradient(circle, rgba(8, 122, 70, 0.2) 0 1px, transparent 1.2px),
        linear-gradient(rgba(10, 37, 64, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(10, 37, 64, 0.05) 1px, transparent 1px);
      background-size: 22px 22px, 88px 88px, 88px 88px;
      mask-image: linear-gradient(90deg, transparent, #000 8%, #000 96%, transparent);
    }

    .blueprint-grid::after {
      inset: 58px 48px 34px 62px;
      border: 1px solid rgba(69, 103, 130, 0.16);
      border-radius: 18px;
      transform: rotate(4deg);
    }

    .blueprint-line {
      height: 2px;
      position: absolute;
      display: block;
      background: linear-gradient(90deg, rgba(8, 122, 70, 0.74), rgba(255, 184, 77, 0.58), rgba(255, 111, 97, 0.48));
      transform-origin: left center;
      animation: lineSignal 7s ease-in-out infinite alternate;
    }

    .blueprint-line--one {
      width: 62%;
      left: 10%;
      top: 25%;
      transform: rotate(18deg);
    }

    .blueprint-line--two {
      width: 74%;
      left: 12%;
      top: 55%;
      transform: rotate(-11deg);
      animation-delay: -2.4s;
    }

    .blueprint-line--three {
      width: 58%;
      left: 34%;
      top: 77%;
      transform: rotate(14deg);
      animation-delay: -4s;
    }

    .blueprint-node {
      width: 9px;
      height: 9px;
      position: absolute;
      border-radius: 999px;
      background: var(--green);
      box-shadow: 0 0 0 5px rgba(8, 122, 70, 0.1);
      animation: nodePing 4.8s ease-in-out infinite;
    }

    .blueprint-node--one {
      left: 24%;
      top: 29%;
    }

    .blueprint-node--two {
      left: 61%;
      top: 49%;
      background: var(--gold);
      animation-delay: -1.6s;
    }

    .blueprint-node--three {
      left: 46%;
      top: 77%;
      background: #5aa7bd;
      animation-delay: -3s;
    }

    .visual-panel {
      position: absolute;
      z-index: 3;
      display: grid;
      gap: 12px;
      border: 1px solid rgba(10, 37, 64, 0.085);
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.78);
      box-shadow:
        0 20px 56px rgba(10, 37, 64, 0.085),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(14px);
      padding: 16px;
      transform: skewX(8deg);
      animation: planeFloat 9s ease-in-out infinite alternate;
      animation-delay: var(--delay, 0s);
    }

    .visual-panel i {
      display: block;
      min-height: 26px;
      border-radius: 11px;
      background: rgba(8, 122, 70, 0.13);
    }

    .visual-panel--primary {
      grid-template-columns: 1.4fr 0.8fr;
      left: 12%;
      top: 25%;
      width: 74%;
      min-height: 214px;
      --dx: 14px;
      --dy: -10px;
    }

    .visual-panel--primary i:first-child {
      grid-column: span 2;
      min-height: 48px;
      background: linear-gradient(135deg, rgba(8, 122, 70, 0.78), rgba(31, 178, 137, 0.48));
    }

    .visual-panel--primary i:nth-child(2) {
      min-height: 92px;
      background:
        linear-gradient(135deg, rgba(255, 184, 77, 0.28), transparent 54%),
        rgba(8, 122, 70, 0.17);
    }

    .visual-panel--primary i:nth-child(3),
    .visual-panel--primary i:nth-child(4) {
      background: rgba(69, 103, 130, 0.12);
    }

    .visual-panel--secondary {
      grid-template-columns: 1fr;
      left: 12%;
      top: 58%;
      width: 52%;
      min-height: 170px;
      --dx: -10px;
      --dy: 12px;
      --delay: -1.8s;
    }

    .visual-panel--secondary i:first-child {
      min-height: 44px;
      background: rgba(255, 184, 77, 0.34);
    }

    .visual-panel--secondary i:nth-child(2) {
      min-height: 54px;
      background: rgba(8, 122, 70, 0.16);
    }

    .visual-panel--secondary i:nth-child(3) {
      min-height: 44px;
      background: rgba(66, 145, 170, 0.14);
    }

    .visual-panel--mini {
      grid-template-columns: repeat(2, 1fr);
      right: 9%;
      bottom: 15%;
      width: 36%;
      min-height: 106px;
      --dx: 10px;
      --dy: 8px;
      --delay: -3.2s;
    }

    .visual-panel--mini i:first-child {
      background: rgba(255, 111, 97, 0.22);
    }

    .visual-panel--mini i:nth-child(2) {
      background: rgba(8, 122, 70, 0.18);
    }

    .color-ribbon {
      position: absolute;
      z-index: 4;
      display: block;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--green), #35b68e, var(--gold), var(--coral));
      opacity: 0.66;
      transform: skewX(8deg) rotate(var(--rotate, 0deg));
      animation: ribbonShift 7.6s ease-in-out infinite alternate;
    }

    .color-ribbon--one {
      width: 66%;
      height: 10px;
      left: 15%;
      top: 18%;
      --rotate: 13deg;
    }

    .color-ribbon--two {
      width: 60%;
      height: 9px;
      left: 12%;
      top: 79%;
      --rotate: -9deg;
      animation-delay: -3s;
      opacity: 0.54;
    }

    .color-plane {
      position: absolute;
      z-index: 5;
      display: grid;
      gap: 10px;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      box-shadow: 0 18px 46px rgba(10, 37, 64, 0.08);
      padding: 12px;
      transform: skewX(8deg);
      animation: planeFloat 8.5s ease-in-out infinite alternate;
      animation-delay: var(--delay, 0s);
      opacity: 0.72;
    }

    .color-plane i {
      display: block;
      min-height: 24px;
      border-radius: 10px;
      background: rgba(8, 122, 70, 0.18);
    }

    .color-plane--main {
      grid-template-columns: 1.2fr 0.8fr 0.9fr;
      left: auto;
      right: 8%;
      top: 28%;
      width: min(230px, 38%);
      min-height: 150px;
      --dx: 12px;
      --dy: -10px;
    }

    .color-plane--side {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      left: 6%;
      top: 34%;
      width: min(190px, 32%);
      min-height: 124px;
      --dx: -10px;
      --dy: 8px;
      --delay: -1.5s;
    }

    .color-plane--small {
      grid-template-columns: 1fr;
      left: auto;
      right: 11%;
      top: 58%;
      width: min(170px, 31%);
      min-height: 122px;
      --dx: 10px;
      --dy: 8px;
      --delay: -3s;
    }

    .color-tile--wide {
      grid-column: span 2;
      background: linear-gradient(135deg, rgba(8, 122, 70, 0.94), rgba(31, 178, 137, 0.72));
    }

    .color-tile--green {
      background: rgba(8, 122, 70, 0.86);
    }

    .color-tile--blue {
      background: rgba(66, 145, 170, 0.72);
    }

    .color-tile--gold {
      background: rgba(255, 184, 77, 0.86);
    }

    .color-tile--coral {
      background: rgba(255, 111, 97, 0.72);
    }

    .color-tile--slim {
      min-height: 10px;
      grid-column: span 3;
      background:
        linear-gradient(90deg, rgba(8, 122, 70, 0.88) 0 34%, transparent 34% 43%, rgba(69, 103, 130, 0.25) 43% 100%);
    }

    .color-pixels {
      width: 156px;
      height: 156px;
      position: absolute;
      z-index: 2;
      left: auto;
      right: 8%;
      top: 18%;
      display: block;
      background-image:
        linear-gradient(90deg, rgba(8, 122, 70, 0.85) 0 10px, transparent 10px 26px),
        linear-gradient(rgba(255, 184, 77, 0.82) 0 10px, transparent 10px 26px);
      background-size: 26px 26px;
      border-radius: 22px;
      mask-image: linear-gradient(135deg, #000, transparent 82%);
      transform: skewX(8deg) rotate(-7deg);
      animation: pixelDrift 9s ease-in-out infinite alternate;
    }

    @keyframes blueprintFloat {
      from {
        transform: translate3d(-8px, -4px, 0) skewX(-8deg);
      }

      to {
        transform: translate3d(18px, 12px, 0) skewX(-8deg);
      }
    }

    @keyframes planeFloat {
      from {
        transform: translate3d(0, 0, 0) skewX(8deg);
      }

      to {
        transform: translate3d(var(--dx, 10px), var(--dy, -8px), 0) skewX(8deg);
      }
    }

    @keyframes ribbonShift {
      from {
        transform: translate3d(-8px, 4px, 0) skewX(8deg) rotate(var(--rotate, 0deg));
      }

      to {
        transform: translate3d(18px, -8px, 0) skewX(8deg) rotate(var(--rotate, 0deg));
      }
    }

    @keyframes pixelDrift {
      from {
        opacity: 0.42;
        transform: translate3d(0, 0, 0) skewX(8deg) rotate(-7deg);
      }

      to {
        opacity: 0.78;
        transform: translate3d(18px, -14px, 0) skewX(8deg) rotate(-7deg);
      }
    }

    @keyframes lineSignal {
      from {
        opacity: 0.28;
      }

      to {
        opacity: 0.72;
      }
    }

    @keyframes nodePing {
      0%, 100% {
        opacity: 0.64;
        transform: scale(0.9);
      }

      50% {
        opacity: 1;
        transform: scale(1.12);
      }
    }

    .trust-strip {
      position: relative;
      z-index: 4;
      min-height: 92px;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.92);
      margin-top: -1px;
      overflow: hidden;
    }

    .trust-strip__inner {
      width: var(--page-width);
      min-height: 92px;
      display: flex;
      align-items: center;
      margin: 0 auto;
    }

    .logo-marquee {
      width: 100%;
      overflow: hidden;
      mask-image: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent);
    }

    .logo-track {
      width: max-content;
      display: flex;
      align-items: center;
      gap: 58px;
      animation: logoMarquee 24s linear infinite;
      will-change: transform;
    }

    .logo-mark {
      flex: 0 0 auto;
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.78);
      box-shadow: 0 12px 32px rgba(10, 37, 64, 0.04);
    }

    .logo-mark img {
      width: 22px;
      height: 22px;
      display: block;
      object-fit: contain;
      opacity: 0.72;
    }

    @keyframes logoMarquee {
      from {
        transform: translate3d(0, 0, 0);
      }

      to {
        transform: translate3d(-50%, 0, 0);
      }
    }

    .solutions {
      position: relative;
      overflow: hidden;
      background: #ffffff;
      padding: 92px 0 110px;
    }

    .solutions__inner {
      width: var(--page-width);
      position: relative;
      z-index: 2;
      margin: 0 auto;
    }

    .solutions h2 {
      width: min(820px, 100%);
      margin: 0;
      color: var(--ink);
      font-size: clamp(34px, 4.2vw, 58px);
      line-height: 1.08;
      letter-spacing: 0;
      font-weight: 620;
    }

    .solutions h2 span {
      color: var(--muted);
      font-weight: 450;
    }

    .resource-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 46px;
    }

    .resource-card {
      min-height: 260px;
      position: relative;
      min-width: 0;
      display: grid;
      align-content: start;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #ffffff;
      padding: 24px;
      box-shadow: 0 18px 54px rgba(10, 37, 64, 0.05);
      overflow: hidden;
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
    }

    .resource-card::before,
    .resource-card::after {
      content: "";
      position: absolute;
      pointer-events: none;
    }

    .resource-card::before {
      display: none;
    }

    .resource-card::after {
      width: 78px;
      height: 78px;
      right: -24px;
      top: -22px;
      border-radius: 24px;
      background:
        linear-gradient(135deg, rgba(8, 122, 70, 0.16), rgba(255, 184, 77, 0.18));
      transform: rotate(12deg);
      transition: transform 180ms ease, opacity 180ms ease;
    }

    .resource-card:hover {
      border-color: rgba(8, 122, 70, 0.28);
      box-shadow: 0 26px 76px rgba(10, 37, 64, 0.1);
      transform: translateY(-4px);
    }

    .resource-card:hover::after {
      opacity: 0.88;
      transform: translate(-6px, 6px) rotate(12deg);
    }

    .resource-card small {
      min-width: 0;
      width: fit-content;
      min-height: 26px;
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border: 1px solid rgba(8, 122, 70, 0.12);
      border-radius: 999px;
      background: rgba(223, 247, 234, 0.56);
      padding: 0 10px;
      color: var(--green);
      font-size: 11px;
      font-weight: 760;
      line-height: 1;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }

    .resource-card small::before {
      content: "";
      width: 6px;
      height: 6px;
      flex: 0 0 auto;
      border-radius: 999px;
      background: var(--green);
      opacity: 0.82;
    }

    .resource-card strong {
      display: block;
      min-width: 0;
      max-width: 100%;
      margin-top: 54px;
      color: var(--ink);
      font-size: 25px;
      line-height: 1.14;
      font-weight: 620;
      overflow-wrap: anywhere;
      text-wrap: pretty;
    }

    .resource-card p {
      min-width: 0;
      max-width: 100%;
      margin: 14px 0 0;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.55;
      overflow-wrap: anywhere;
    }

    .site-footer {
      position: relative;
      overflow: hidden;
      border-top: 1px solid var(--line);
      background:
        linear-gradient(90deg, rgba(8, 122, 70, 0.05), transparent 38%),
        #f6f9fb;
      padding: 38px 0 24px;
    }

    .site-footer__inner {
      width: var(--page-width);
      display: grid;
      grid-template-columns: minmax(240px, 0.8fr) minmax(0, 1.2fr);
      gap: clamp(24px, 5vw, 72px);
      margin: 0 auto;
    }

    .footer-brand img {
      width: 86px;
      height: auto;
      display: block;
    }

    .footer-brand p {
      width: min(340px, 100%);
      margin: 14px 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.5;
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-content: flex-start;
      gap: 12px 24px;
      padding-top: 3px;
    }

    .footer-links a {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
      font-weight: 560;
      transition: color 160ms ease;
    }

    .footer-links a:hover {
      color: var(--green);
    }

    .footer-bottom {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      border-top: 1px solid var(--line);
      margin-top: 30px;
      padding-top: 16px;
      color: var(--muted);
      font-size: 13px;
    }

    @media (max-width: 980px) {
      .site-header__inner {
        width: calc(100% - 28px);
        gap: 18px;
      }

      .nav {
        display: none;
      }

      .mobile-menu {
        display: block;
      }

      .hero__inner,
      .trust-strip__inner,
      .solutions__inner,
      .site-footer__inner {
        width: calc(100% - 36px);
      }

      .hero__inner {
        grid-template-columns: 1fr;
        gap: 32px;
        min-height: auto;
        padding-top: 92px;
        padding-bottom: 52px;
      }

      .trust-strip__inner {
        padding: 14px 0;
      }

      .hero__copy {
        padding-left: 0;
      }

      .hero__visual {
        justify-content: center;
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 0;
      }

      .hero-blueprint {
        width: 100%;
        max-width: 720px;
        min-height: 0;
        height: 420px;
        opacity: 0.86;
        transform: none;
      }

      .blueprint-grid {
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0.74;
      }

      .resource-grid {
        grid-template-columns: 1fr;
      }

      .site-footer__inner,
      .footer-links {
        grid-template-columns: 1fr;
      }

      .footer-links {
        justify-content: flex-start;
      }

      .resource-card {
        min-height: 224px;
      }
    }

    @media (max-width: 640px) {
      .site-header {
        height: 66px;
      }

      .site-header__inner {
        width: calc(100% - 24px);
        grid-template-columns: auto minmax(0, 1fr);
        justify-content: space-between;
        gap: 10px;
      }

      .brand img {
        width: 82px;
      }

      .header-actions {
        gap: 6px;
      }

      .contact-button {
        min-height: 36px;
        border-radius: 5px;
        padding: 0 10px;
        font-size: 12px;
      }

      .mobile-menu summary {
        width: 36px;
        min-height: 36px;
        border-radius: 5px;
      }

      .mobile-menu__panel {
        width: auto;
        top: 0;
        right: 0;
        padding: 28px 32px 24px;
      }

      .mobile-menu[open] summary {
        top: 28px;
        right: 32px;
      }

      .hero {
        min-height: auto;
        padding-top: 66px;
      }

      .hero__inner {
        min-height: auto;
        align-items: start;
        padding-top: 58px;
        padding-bottom: 36px;
      }

      .hero__metric {
        margin-bottom: 28px;
        font-size: 13px;
      }

      .hero h1 {
        font-size: clamp(36px, 10vw, 50px);
        line-height: 1.08;
      }

      .hero__subtitle {
        max-width: 94vw;
        margin-top: 14px;
        font-size: clamp(16px, 4.6vw, 19px);
        line-height: 1.42;
      }

      .hero-actions {
        gap: 10px;
        margin-top: 32px;
      }

      .primary-button,
      .secondary-button {
        min-height: 46px;
        padding: 0 18px;
        font-size: 14px;
      }

      .blueprint-grid {
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0.24;
      }

      .hero-blueprint {
        height: 320px;
        border-radius: 20px;
        opacity: 0.78;
      }

      .blueprint-line {
        opacity: 0.28;
      }

      .color-plane {
        gap: 8px;
        padding: 12px;
      }

      .visual-panel {
        gap: 8px;
        border-radius: 16px;
        padding: 11px;
      }

      .visual-panel i {
        min-height: 18px;
        border-radius: 9px;
      }

      .visual-panel--primary {
        left: 24%;
        top: 22%;
        width: 58%;
        min-height: 148px;
      }

      .visual-panel--primary i:first-child {
        min-height: 34px;
      }

      .visual-panel--primary i:nth-child(2) {
        min-height: 64px;
      }

      .visual-panel--secondary {
        left: 8%;
        top: 52%;
        width: 42%;
        min-height: 126px;
      }

      .visual-panel--mini {
        right: 7%;
        bottom: 13%;
        width: 34%;
        min-height: 82px;
      }

      .color-plane i {
        min-height: 20px;
      }

      .trust-strip__inner {
        min-height: 104px;
        padding: 16px 0 18px;
      }

      .logo-track {
        gap: 34px;
      }

      .logo-mark {
        width: 38px;
        height: 38px;
      }

      .logo-mark img {
        width: 20px;
        height: 20px;
      }

      .solutions {
        padding: 70px 0 82px;
      }

      .solutions h2 {
        font-size: clamp(30px, 9vw, 40px);
      }

      .resource-grid {
        gap: 14px;
        margin-top: 34px;
      }

      .resource-card {
        min-height: 218px;
        border-radius: 10px;
        padding: 22px;
      }

      .resource-card::before {
        display: none;
      }

      .resource-card small {
        min-height: 24px;
        padding: 0 9px;
        font-size: 10px;
      }

      .resource-card strong {
        margin-top: 44px;
        font-size: 20px;
        line-height: 1.2;
      }

      .resource-card p {
        font-size: 14px;
        line-height: 1.55;
      }

      .site-footer {
        padding: 34px 0 24px;
      }

      .site-footer__inner {
        width: calc(100% - 36px);
      }

      .footer-bottom {
        align-items: flex-start;
        flex-direction: column;
      }

    }

    @media (max-width: 420px) {
      .site-header__inner {
        width: calc(100% - 20px);
      }

      .brand img {
        width: 78px;
      }

      .contact-button {
        min-height: 34px;
        padding: 0 9px;
      }

      .mobile-menu summary {
        width: 34px;
        min-height: 34px;
      }

      .mobile-menu__panel {
        padding: 24px 24px 22px;
      }

      .mobile-menu[open] summary {
        top: 24px;
        right: 24px;
      }

      .mobile-menu__brand img {
        width: 84px;
      }

      .mobile-menu__nav {
        margin-top: 38px;
      }

      .mobile-menu__nav a {
        min-height: 52px;
        font-size: 17px;
      }

      .hero-actions {
        display: grid;
        grid-template-columns: 1fr;
      }

      .primary-button,
      .secondary-button {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .solutions__inner {
        width: calc(100% - 28px);
      }

      .resource-card {
        min-height: 206px;
        padding: 20px;
      }

      .resource-card strong {
        margin-top: 42px;
        font-size: 18px;
        line-height: 1.24;
      }

      .resource-card p {
        font-size: 13.5px;
        line-height: 1.55;
      }
    }
  `;
}
