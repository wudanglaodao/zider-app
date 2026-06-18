import type { Metadata } from "next";
import { ArrowRight, FileText, Link2, Mail, Scale, ShieldCheck, Store, UserRound } from "lucide-react";

import { PublicPage } from "@/app/_components/PublicChrome";

export const metadata: Metadata = {
  title: "Terms of Service - ZIDER",
  description: "ZIDER terms for website visitors, account users, workspace members, and product integrations.",
};

const termsSections = [
  {
    body: "These terms apply when you visit the ZIDER website, create or claim a ZIDER account, use Workspace, install a ZIDER app, or connect a supported commerce platform such as Wix.",
    icon: FileText,
    title: "Scope of service",
  },
  {
    body: "You are responsible for the accuracy of account information, workspace membership, and the actions taken by people who have access to your workspace or connected store.",
    icon: UserRound,
    title: "Accounts and workspaces",
  },
  {
    body: "Platform integrations require authorization from the connected platform. You may remove access from the platform or ZIDER where supported. Some features may stop working when authorization is removed or expires.",
    icon: Link2,
    title: "Platform connections",
  },
  {
    body: "ZIDER tools such as PrintOps help you preview, generate, download, and print operational documents. You are responsible for checking the output before using it for customers, fulfillment, accounting, tax, or legal workflows.",
    icon: Store,
    title: "Product use",
  },
  {
    body: "You retain ownership of your store data, templates, logos, text, files, and other content. You grant ZIDER permission to process that content only as needed to provide, secure, and improve the service.",
    icon: ShieldCheck,
    title: "Content and data",
  },
  {
    body: "We work to keep ZIDER reliable, but products may change, pause, or occasionally be unavailable. Services are provided without guarantees that they will meet every business, compliance, or platform requirement.",
    icon: Scale,
    title: "Availability and responsibility",
  },
];

export default function TermsPage() {
  return (
    <PublicPage>
      <main className="termsPage">
        <style>{getTermsCss()}</style>

        <section className="termsHero">
          <div className="termsHeroCopy">
            <p className="termsEyebrow">Terms</p>
            <h1>Terms of Service</h1>
            <p>
              Practical terms for using ZIDER, connecting commerce platforms, managing workspaces, and generating
              customer-facing documents.
            </p>
          </div>
        </section>

        <section className="termsIntro" aria-label="Terms overview">
          <div>
            <p className="termsEyebrow">Agreement</p>
            <h2>By using ZIDER, you agree to use the service responsibly.</h2>
          </div>
          <p>
            ZIDER is built for creators and merchants who need lightweight website components, app utilities, and
            platform-connected workflows. These terms are meant to keep the product boundaries clear while we continue
            building the Workspace and app ecosystem.
          </p>
        </section>

        <section className="termsList" aria-label="Terms of service sections">
          {termsSections.map((section, index) => {
            const Icon = section.icon;

            return (
              <article className="termsItem" key={section.title}>
                <div className="termsIndex">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="termsDetails" aria-label="Additional terms">
          <article>
            <h2>Payments, subscriptions, and app marketplaces</h2>
            <p>
              Paid plans, trials, refunds, and cancellations may be handled by ZIDER or by the marketplace where an app
              is installed. Marketplace billing rules can apply in addition to these terms.
            </p>
          </article>
          <article>
            <h2>Changes to these terms</h2>
            <p>
              We may update these terms as ZIDER products evolve. When changes are material, we will make reasonable
              efforts to provide notice through the website, product UI, or account communication.
            </p>
          </article>
        </section>

        <section className="termsContact">
          <div>
            <p className="termsEyebrow">Contact</p>
            <h2>Questions about these terms?</h2>
            <p>Send questions about product use, account access, platform integrations, or legal terms to our support inbox.</p>
          </div>
          <div className="termsContactActions">
            <a href="mailto:support@zider.ink">
              <Mail size={17} />
              support@zider.ink
              <ArrowRight size={16} />
            </a>
            <small>Last updated: June 18, 2026</small>
          </div>
        </section>
      </main>
    </PublicPage>
  );
}

function getTermsCss() {
  return `
    .termsPage,
    .termsPage * {
      box-sizing: border-box;
    }

    .termsPage {
      min-height: 100vh;
      overflow: hidden;
      background:
        linear-gradient(180deg, #ffffff 0%, #fbfdfb 42%, #f6faf7 100%);
      color: var(--zider-ink);
      padding: 1px 0 104px;
    }

    .termsHero {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      margin: 88px auto 0;
      padding-bottom: 48px;
      border-bottom: 1px solid rgba(10, 37, 64, 0.12);
    }

    .termsHeroCopy {
      max-width: 960px;
    }

    .termsEyebrow {
      margin: 0 0 16px;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .termsHero h1 {
      max-width: 940px;
      margin: 0;
      color: #060b3c;
      font-size: clamp(52px, 7.6vw, 96px);
      font-weight: 740;
      line-height: 0.98;
      letter-spacing: 0;
    }

    .termsHeroCopy > p:last-child {
      max-width: 760px;
      margin: 28px 0 0;
      color: var(--zider-muted);
      font-size: clamp(19px, 2vw, 25px);
      line-height: 1.44;
    }

    .termsIntro {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      display: grid;
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
      gap: clamp(28px, 6vw, 86px);
      margin: 0 auto;
      padding: 42px 0;
      border-bottom: 1px solid rgba(10, 37, 64, 0.1);
    }

    .termsIntro h2 {
      max-width: 560px;
      margin: 0;
      color: #0a2540;
      font-size: clamp(28px, 3.2vw, 44px);
      line-height: 1.1;
      letter-spacing: 0;
    }

    .termsIntro > p {
      margin: 35px 0 0;
      color: var(--zider-muted);
      font-size: 17px;
      line-height: 1.72;
    }

    .termsList {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      display: grid;
      gap: 0;
      margin: 0 auto;
    }

    .termsItem {
      display: grid;
      grid-template-columns: 96px minmax(0, 780px);
      gap: clamp(22px, 4vw, 58px);
      border-bottom: 1px solid rgba(10, 37, 64, 0.1);
      padding: 42px 0;
    }

    .termsIndex {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--zider-green);
    }

    .termsIndex span {
      color: rgba(7, 18, 47, 0.42);
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.08em;
    }

    .termsIndex svg {
      flex: 0 0 auto;
    }

    .termsItem h2,
    .termsDetails h2 {
      margin: 0;
      color: #0a2540;
      font-size: clamp(25px, 2.6vw, 36px);
      line-height: 1.12;
      letter-spacing: 0;
    }

    .termsItem p,
    .termsDetails p {
      max-width: 780px;
      margin: 14px 0 0;
      color: var(--zider-muted);
      font-size: 17px;
      line-height: 1.72;
    }

    .termsDetails {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin: 52px auto 0;
    }

    .termsDetails article {
      min-height: 220px;
      border: 1px solid rgba(8, 122, 70, 0.14);
      border-radius: 8px;
      background: #ffffff;
      padding: 28px;
      box-shadow: 0 22px 60px rgba(10, 37, 64, 0.06);
    }

    .termsContact {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 32px;
      border: 1px solid rgba(8, 122, 70, 0.16);
      border-radius: 8px;
      background: #f8fbf9;
      margin: 18px auto 0;
      padding: 30px;
    }

    .termsContact h2 {
      margin: 0;
      color: #0a2540;
      font-size: clamp(28px, 3vw, 42px);
      line-height: 1.1;
      letter-spacing: 0;
    }

    .termsContact p:not(.termsEyebrow) {
      max-width: 640px;
      margin: 14px 0 0;
      color: var(--zider-muted);
      font-size: 16px;
      line-height: 1.62;
    }

    .termsContactActions {
      display: grid;
      justify-items: end;
      gap: 16px;
    }

    .termsContact a {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid var(--zider-green);
      border-radius: 6px;
      background: var(--zider-green);
      color: #ffffff;
      padding: 0 18px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 14px 32px rgba(8, 122, 70, 0.18);
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
    }

    .termsContact a:hover {
      background: #069456;
      border-color: #069456;
      transform: translateY(-1px);
    }

    .termsContact small {
      display: block;
      color: var(--zider-muted);
      font-size: 13px;
    }

    @media (max-width: 980px) {
      .termsPage {
        padding-bottom: 84px;
      }

      .termsHero,
      .termsIntro,
      .termsList,
      .termsDetails,
      .termsContact {
        width: calc(100% - 36px);
      }

      .termsHero {
        margin-top: 76px;
        padding-bottom: 42px;
      }

      .termsIntro,
      .termsItem,
      .termsDetails,
      .termsContact {
        grid-template-columns: 1fr;
      }

      .termsIntro {
        gap: 18px;
      }

      .termsIntro > p {
        margin-top: 0;
      }

      .termsItem {
        gap: 18px;
        padding: 34px 0;
      }

      .termsContact {
        align-items: start;
      }

      .termsContactActions {
        justify-items: start;
      }
    }

    @media (max-width: 640px) {
      .termsPage {
        padding-bottom: 72px;
      }

      .termsHero,
      .termsIntro,
      .termsList,
      .termsDetails,
      .termsContact {
        width: calc(100% - 24px);
      }

      .termsHero {
        margin-top: 58px;
      }

      .termsHero h1 {
        font-size: clamp(44px, 14vw, 62px);
      }

      .termsHeroCopy > p:last-child {
        font-size: 18px;
      }

      .termsDetails article,
      .termsContact {
        padding: 22px;
      }

      .termsContact a {
        width: 100%;
        min-width: 0;
      }
    }
  `;
}
