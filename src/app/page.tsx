import { ArrowRight, ChevronDown, ChevronRight, Globe2, Menu, X } from "lucide-react";

const ziderLogoUrl = "https://zider.ink/wp-content/uploads/2024/07/zider-def.png";

const navItems = ["Products", "Solutions", "Resources", "Developers", "Pricing"];
const platformLogos = [
  { iconUrl: "https://cdn.simpleicons.org/wix/63758A", name: "Wix" },
  { iconUrl: "https://cdn.simpleicons.org/webflow/087A46", name: "Webflow" },
  { iconUrl: "https://cdn.simpleicons.org/wordpress/63758A", name: "WordPress" },
  { iconUrl: "https://cdn.simpleicons.org/shopify/087A46", name: "Shopify" },
  { iconUrl: "https://cdn.simpleicons.org/cursor/63758A", name: "Codex" },
  { iconUrl: "https://cdn.simpleicons.org/framer/63758A", name: "Framer" },
  { iconUrl: "https://cdn.simpleicons.org/figma/63758A", name: "Figma" },
];
const footerColumns = [
  {
    links: ["Components", "Widgets", "App utilities", "Templates"],
    title: "Products",
  },
  {
    links: ["Solutions", "Integrations", "Implementation", "Migration"],
    title: "Solutions",
  },
  {
    links: ["Blog", "Forum", "Guides", "Support"],
    title: "Resources",
  },
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
              <a href="#solutions" key={item}>
                {item}
                {item !== "Pricing" ? <ChevronDown size={14} /> : null}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a className="register-button" href="#resources">
              Register
            </a>
            <a className="login-button" href="#resources">
              Login
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
                    <a href="#solutions" key={item}>
                      <span>{item}</span>
                      {item !== "Pricing" ? <ChevronRight size={17} /> : null}
                    </a>
                  ))}
                  <a href="#resources">
                    <span>Login</span>
                  </a>
                </nav>
                <div className="mobile-menu__actions">
                  <a className="mobile-menu__primary" href="#resources">
                    Register
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
        <div className="hero-blueprint" aria-hidden="true">
          <div className="blueprint-grid">
            <span className="blueprint-line blueprint-line--one" />
            <span className="blueprint-line blueprint-line--two" />
            <span className="blueprint-line blueprint-line--three" />
            <span className="blueprint-node blueprint-node--one" />
            <span className="blueprint-node blueprint-node--two" />
            <span className="blueprint-node blueprint-node--three" />
            <span className="color-ribbon color-ribbon--one" />
            <span className="color-ribbon color-ribbon--two" />
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

        <div className="hero__inner">
          <div className="hero__copy">
            <p className="hero__metric">
              ZIDER for creators
            </p>
            <h1 id="hero-title">
              Components and solutions for creator websites.
              <span>We build lightweight interactive components, app utilities, and practical solutions that help creators ship better sites faster.</span>
            </h1>

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
            {footerColumns.map((column) => (
              <div className="footer-column" key={column.title}>
                <strong>{column.title}</strong>
                {column.links.map((link) => (
                  <a href="#resources" key={link}>
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <span>© 2026 ZIDER</span>
            <div className="footer-language" aria-label="Select language">
              <Globe2 size={16} />
              <a href="#resources">English</a>
              <span>/</span>
              <a href="#resources">繁中</a>
              <span>/</span>
              <a href="#resources">简中</a>
            </div>
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
      width: min(1240px, calc(100% - 48px));
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
      gap: 8px;
    }

    .register-button,
    .login-button {
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

    .register-button {
      gap: 8px;
      border: 1px solid var(--green);
      background: var(--green);
      color: #ffffff;
      box-shadow: 0 12px 28px rgba(8, 122, 70, 0.22);
    }

    .login-button {
      border: 1px solid rgba(8, 122, 70, 0.2);
      background: rgba(255, 255, 255, 0.78);
      color: var(--green);
    }

    .zider-stripe a.register-button,
    .zider-stripe a.primary-button {
      color: #ffffff !important;
    }

    .zider-stripe a.register-button svg,
    .zider-stripe a.primary-button svg {
      color: #ffffff;
    }

    .zider-stripe a.login-button,
    .zider-stripe a.secondary-button {
      color: var(--green) !important;
    }

    .register-button:hover,
    .login-button:hover {
      transform: translateY(-1px);
    }

    .register-button:hover,
    .primary-button:hover {
      background: #069456;
      border-color: #069456;
    }

    .login-button:hover,
    .secondary-button:hover {
      border-color: rgba(8, 122, 70, 0.42);
      background: rgba(223, 247, 234, 0.48);
      box-shadow: 0 12px 26px rgba(8, 122, 70, 0.08);
    }

    .register-button:active,
    .login-button:active,
    .primary-button:active,
    .secondary-button:active {
      transform: translateY(0) scale(0.98);
    }

    .register-button:focus-visible,
    .login-button:focus-visible,
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
      min-height: 752px;
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(180deg, #ffffff 0%, #fbfdfc 100%);
      padding-top: 78px;
    }

    .hero::before,
    .solutions::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(90deg, transparent 0 calc((100% - 1240px) / 2), rgba(10, 37, 64, 0.11) calc((100% - 1240px) / 2), rgba(10, 37, 64, 0.11) calc((100% - 1240px) / 2 + 1px), transparent calc((100% - 1240px) / 2 + 1px)),
        linear-gradient(90deg, transparent 0 calc((100% + 1240px) / 2), rgba(10, 37, 64, 0.11) calc((100% + 1240px) / 2), rgba(10, 37, 64, 0.11) calc((100% + 1240px) / 2 + 1px), transparent calc((100% + 1240px) / 2 + 1px));
      z-index: 1;
    }

    .hero__inner {
      width: min(1240px, calc(100% - 48px));
      min-height: 674px;
      display: grid;
      align-items: center;
      position: relative;
      z-index: 3;
      margin: 0 auto;
      padding-bottom: 52px;
    }

    .hero__copy {
      width: min(860px, 100%);
      position: relative;
      z-index: 4;
      padding-left: clamp(0px, 6vw, 96px);
      padding-top: 28px;
    }

    .hero__metric {
      margin: 0 0 44px;
      color: var(--ink);
      font-size: 14px;
      font-weight: 650;
    }

    .hero__metric span {
      color: var(--muted);
      font-weight: 450;
    }

    .hero h1 {
      max-width: 780px;
      margin: 0;
      color: #070b3f;
      font-size: clamp(42px, 5vw, 64px);
      line-height: 1.1;
      letter-spacing: 0;
      font-weight: 620;
      text-wrap: balance;
    }

    .hero h1 span {
      display: block;
      color: var(--blue-text);
      max-width: 640px;
      margin-top: 18px;
      font-size: clamp(18px, 1.65vw, 24px);
      font-weight: 400;
      line-height: 1.42;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 38px;
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

    .register-button:active,
    .login-button:active,
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
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      overflow: hidden;
    }

    .blueprint-grid {
      position: absolute;
      right: max(-74px, calc((100vw - 1240px) / 2 - 112px));
      top: 108px;
      width: min(780px, 53vw);
      height: 560px;
      opacity: 0.9;
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
      border: 1px solid rgba(8, 122, 70, 0.14);
      border-radius: 28px;
      background-image:
        radial-gradient(circle, rgba(8, 122, 70, 0.23) 0 1px, transparent 1.2px),
        linear-gradient(rgba(10, 37, 64, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(10, 37, 64, 0.06) 1px, transparent 1px);
      background-size: 24px 24px, 96px 96px, 96px 96px;
      mask-image: linear-gradient(90deg, transparent, #000 24%, #000 86%, transparent);
    }

    .blueprint-grid::after {
      inset: 58px 70px 34px 118px;
      border: 1px solid rgba(69, 103, 130, 0.16);
      border-radius: 18px;
      transform: rotate(4deg);
    }

    .blueprint-line {
      height: 1px;
      position: absolute;
      display: block;
      background: rgba(8, 122, 70, 0.3);
      transform-origin: left center;
      animation: lineSignal 7s ease-in-out infinite alternate;
    }

    .blueprint-line--one {
      width: 390px;
      left: 13%;
      top: 25%;
      transform: rotate(18deg);
    }

    .blueprint-line--two {
      width: 460px;
      left: 18%;
      top: 55%;
      transform: rotate(-11deg);
      animation-delay: -2.4s;
    }

    .blueprint-line--three {
      width: 380px;
      left: 42%;
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

    .color-ribbon {
      position: absolute;
      display: block;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--green), #35b68e, var(--gold), var(--coral));
      opacity: 0.72;
      transform: skewX(8deg) rotate(var(--rotate, 0deg));
      animation: ribbonShift 7.6s ease-in-out infinite alternate;
    }

    .color-ribbon--one {
      width: 390px;
      height: 14px;
      left: 24%;
      top: 18%;
      --rotate: 13deg;
    }

    .color-ribbon--two {
      width: 330px;
      height: 10px;
      left: 18%;
      top: 82%;
      --rotate: -9deg;
      animation-delay: -3s;
      opacity: 0.48;
    }

    .color-plane {
      position: absolute;
      display: grid;
      gap: 10px;
      border: 1px solid rgba(10, 37, 64, 0.12);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.78);
      backdrop-filter: blur(12px);
      box-shadow: 0 18px 48px rgba(10, 37, 64, 0.1);
      padding: 14px;
      transform: skewX(8deg);
      animation: planeFloat 8.5s ease-in-out infinite alternate;
      animation-delay: var(--delay, 0s);
    }

    .color-plane i {
      display: block;
      min-height: 24px;
      border-radius: 10px;
      background: rgba(8, 122, 70, 0.18);
    }

    .color-plane--main {
      grid-template-columns: 1.2fr 0.8fr 0.9fr;
      left: 32%;
      top: 18%;
      width: 286px;
      min-height: 192px;
      --dx: 12px;
      --dy: -10px;
    }

    .color-plane--side {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      left: 6%;
      top: 40%;
      width: 210px;
      min-height: 138px;
      --dx: -10px;
      --dy: 8px;
      --delay: -1.5s;
    }

    .color-plane--small {
      grid-template-columns: 1fr;
      left: 56%;
      top: 54%;
      width: 184px;
      min-height: 146px;
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
      left: 67%;
      top: 21%;
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
      width: min(1240px, calc(100% - 48px));
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
      width: min(1240px, calc(100% - 48px));
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
      padding: 72px 0 34px;
    }

    .site-footer__inner {
      width: min(1240px, calc(100% - 48px));
      display: grid;
      grid-template-columns: minmax(240px, 0.8fr) minmax(0, 1.2fr);
      gap: clamp(34px, 7vw, 96px);
      margin: 0 auto;
    }

    .footer-brand img {
      width: 96px;
      height: auto;
      display: block;
    }

    .footer-brand p {
      width: min(340px, 100%);
      margin: 22px 0 0;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.65;
    }

    .footer-links {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 28px;
    }

    .footer-column {
      display: grid;
      align-content: start;
      gap: 12px;
    }

    .footer-column strong {
      color: var(--ink);
      font-size: 14px;
      font-weight: 660;
    }

    .footer-column a {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.35;
      transition: color 160ms ease;
    }

    .footer-column a:hover {
      color: var(--green);
    }

    .footer-bottom {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      border-top: 1px solid var(--line);
      margin-top: 54px;
      padding-top: 24px;
      color: var(--muted);
      font-size: 13px;
    }

    .footer-language {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--line-soft);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.72);
      padding: 8px 12px;
      color: var(--blue-text);
      font-size: 13px;
      font-weight: 560;
      white-space: nowrap;
    }

    .footer-language svg {
      color: var(--green);
      stroke-width: 2.3;
    }

    .footer-language a {
      color: inherit;
      transition: color 160ms ease;
    }

    .footer-language a:hover {
      color: var(--green);
    }

    .footer-language span {
      color: rgba(69, 103, 130, 0.46);
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
      .solutions__inner {
        width: calc(100% - 36px);
      }

      .trust-strip__inner {
        padding: 14px 0;
      }

      .hero__copy {
        padding-left: 0;
      }

      .blueprint-grid {
        right: -34vw;
        width: 90vw;
        opacity: 0.38;
      }

      .resource-grid {
        grid-template-columns: 1fr;
      }

      .site-footer__inner,
      .footer-links {
        grid-template-columns: 1fr;
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
        grid-template-columns: auto auto;
        justify-content: space-between;
        gap: 10px;
      }

      .brand img {
        width: 82px;
      }

      .header-actions {
        gap: 6px;
      }

      .register-button,
      .login-button {
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
        min-height: 674px;
        padding-top: 66px;
      }

      .hero__inner {
        min-height: 608px;
        align-items: start;
        padding-top: 92px;
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

      .hero h1 span {
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
        right: -84vw;
        top: 176px;
        width: 142vw;
        height: 430px;
        opacity: 0.24;
      }

      .blueprint-line {
        opacity: 0.28;
      }

      .color-plane {
        gap: 8px;
        padding: 12px;
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
        padding-top: 56px;
      }

      .site-footer__inner {
        width: calc(100% - 36px);
      }

      .footer-bottom {
        align-items: flex-start;
        flex-direction: column;
      }

      .footer-language {
        flex-wrap: wrap;
        white-space: normal;
      }
    }

    @media (max-width: 420px) {
      .site-header__inner {
        width: calc(100% - 20px);
      }

      .brand img {
        width: 78px;
      }

      .register-button,
      .login-button {
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
