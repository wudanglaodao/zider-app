import { ArrowRight, BookOpenText, Home, MessageSquareText, Search } from "lucide-react";

import { PublicPage } from "@/app/_components/PublicChrome";

const quickLinks = [
  {
    description: "Return to the main ZIDER website.",
    href: "/",
    icon: Home,
    label: "Home",
  },
  {
    description: "Read product notes and migration updates.",
    href: "/blog",
    icon: BookOpenText,
    label: "Blog",
  },
  {
    description: "Browse community answers and reusable fixes.",
    href: "/forum",
    icon: MessageSquareText,
    label: "Forum",
  },
];

export default function NotFound() {
  return (
    <PublicPage>
      <main className="notFoundPage">
        <style>{getNotFoundCss()}</style>

        <section className="notFoundHero" aria-labelledby="not-found-title">
          <div className="notFoundCode" aria-label="Error code">
            404
          </div>
          <p className="notFoundEyebrow">Page not found</p>
          <h1 id="not-found-title">This page is not available.</h1>
          <p>
            The link may have changed or the page may no longer exist. You can return to ZIDER or browse the public
            resources below.
          </p>

          <div className="notFoundActions" aria-label="Helpful links">
            <a className="notFoundPrimary" href="/">
              Go to homepage
              <ArrowRight size={17} />
            </a>
            <a className="notFoundSecondary" href="/forum/search">
              <Search size={17} />
              Search forum
            </a>
          </div>
        </section>

        <section className="notFoundLinks" aria-label="Explore ZIDER">
          {quickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <a className="notFoundLink" href={link.href} key={link.href}>
                <span className="notFoundLinkIcon">
                  <Icon size={19} />
                </span>
                <span>
                  <strong>{link.label}</strong>
                  <small>{link.description}</small>
                </span>
                <ArrowRight className="notFoundLinkArrow" size={17} />
              </a>
            );
          })}
        </section>
      </main>
    </PublicPage>
  );
}

function getNotFoundCss() {
  return `
    .notFoundPage,
    .notFoundPage * {
      box-sizing: border-box;
    }

    .notFoundPage {
      min-height: calc(100vh - 78px);
      background:
        linear-gradient(180deg, #ffffff 0%, #fbfdfb 48%, #f6faf7 100%);
      color: var(--zider-ink);
      padding: 1px 0 108px;
    }

    .notFoundHero {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      column-gap: clamp(28px, 8vw, 96px);
      align-items: end;
      margin: 98px auto 0;
      padding-bottom: 48px;
      border-bottom: 1px solid rgba(10, 37, 64, 0.12);
    }

    .notFoundCode {
      grid-column: 2;
      grid-row: 1 / span 5;
      color: rgba(8, 122, 70, 0.1);
      font-size: clamp(96px, 15vw, 208px);
      font-weight: 780;
      line-height: 0.82;
      letter-spacing: 0;
      user-select: none;
    }

    .notFoundEyebrow {
      margin: 0 0 16px;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .notFoundHero h1 {
      max-width: 780px;
      margin: 0;
      color: #060b3c;
      font-size: clamp(48px, 7vw, 88px);
      font-weight: 740;
      line-height: 0.98;
      letter-spacing: 0;
    }

    .notFoundHero > p:not(.notFoundEyebrow) {
      max-width: 660px;
      margin: 26px 0 0;
      color: var(--zider-muted);
      font-size: clamp(18px, 2vw, 24px);
      line-height: 1.46;
    }

    .notFoundActions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 34px;
    }

    .notFoundPrimary,
    .notFoundSecondary {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 6px;
      padding: 0 18px;
      font-size: 14px;
      font-weight: 760;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease;
    }

    .notFoundPrimary {
      border: 1px solid var(--zider-green);
      background: var(--zider-green);
      color: #ffffff;
      box-shadow: 0 14px 32px rgba(8, 122, 70, 0.18);
    }

    .notFoundSecondary {
      border: 1px solid rgba(8, 122, 70, 0.22);
      background: rgba(255, 255, 255, 0.86);
      color: var(--zider-green);
    }

    .notFoundPrimary:hover,
    .notFoundSecondary:hover {
      transform: translateY(-1px);
    }

    .notFoundPrimary:hover {
      background: #069456;
      border-color: #069456;
    }

    .notFoundSecondary:hover {
      border-color: rgba(8, 122, 70, 0.38);
      background: #ffffff;
    }

    .notFoundLinks {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin: 22px auto 0;
    }

    .notFoundLink {
      min-height: 132px;
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr) auto;
      gap: 14px;
      align-items: start;
      border: 1px solid rgba(10, 37, 64, 0.1);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.86);
      padding: 20px;
      box-shadow: 0 16px 48px rgba(10, 37, 64, 0.05);
      transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
    }

    .notFoundLink:hover {
      border-color: rgba(8, 122, 70, 0.24);
      box-shadow: 0 18px 54px rgba(10, 37, 64, 0.08);
      transform: translateY(-1px);
    }

    .notFoundLinkIcon {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(8, 122, 70, 0.16);
      border-radius: 999px;
      background: #eef9f2;
      color: var(--zider-green);
    }

    .notFoundLink strong {
      display: block;
      color: #0a2540;
      font-size: 18px;
      line-height: 1.25;
    }

    .notFoundLink small {
      display: block;
      margin-top: 8px;
      color: var(--zider-muted);
      font-size: 14px;
      line-height: 1.5;
    }

    .notFoundLinkArrow {
      color: rgba(8, 122, 70, 0.58);
      margin-top: 11px;
    }

    @media (max-width: 920px) {
      .notFoundHero {
        grid-template-columns: 1fr;
        margin-top: 72px;
      }

      .notFoundCode {
        grid-column: auto;
        grid-row: auto;
        margin: 0 0 20px;
        font-size: clamp(84px, 28vw, 148px);
      }

      .notFoundLinks {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 560px) {
      .notFoundPage {
        padding-bottom: 80px;
      }

      .notFoundHero {
        width: min(100% - 40px, 1180px);
        margin-top: 56px;
        padding-bottom: 36px;
      }

      .notFoundActions {
        display: grid;
      }

      .notFoundPrimary,
      .notFoundSecondary {
        width: 100%;
      }

      .notFoundLinks {
        width: min(100% - 40px, 1180px);
      }
    }
  `;
}
