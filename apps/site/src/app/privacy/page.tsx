import type { Metadata } from "next";
import { ArrowRight, Database, LockKeyhole, Mail, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { PublicPage } from "@/app/_components/PublicChrome";

export const metadata: Metadata = {
  title: "Privacy Policy - ZIDER",
  description: "ZIDER privacy policy for website visitors, content readers, and product users.",
};

const policySections = [
  {
    body: "We collect the information you choose to send us, such as contact messages, support details, and content submitted through ZIDER tools. We may also collect basic technical data that helps us keep the website stable and useful.",
    icon: Database,
    title: "Information we collect",
  },
  {
    body: "We use information to respond to requests, improve ZIDER products, maintain Blog and community content, protect our services, and understand how visitors use the site.",
    icon: SlidersHorizontal,
    title: "How we use it",
  },
  {
    body: "We do not sell personal information. We may use trusted infrastructure providers for hosting, analytics, email, storage, and product operations, only as needed to run ZIDER.",
    icon: LockKeyhole,
    title: "Sharing and providers",
  },
  {
    body: "You can contact us to request access, correction, or deletion of your information where applicable. Some operational records may be kept when required for security, billing, or legal reasons.",
    icon: ShieldCheck,
    title: "Your choices",
  },
];

export default function PrivacyPage() {
  return (
    <PublicPage>
      <main className="privacyPage">
        <style>{getPrivacyCss()}</style>
        <section className="privacyHero">
          <div className="privacyHeroCopy">
            <p className="privacyEyebrow">Privacy</p>
            <h1>Privacy Policy</h1>
            <p>
              A clear view of how ZIDER handles information across the website, Blog, community content, and product
              experiences.
            </p>
          </div>
        </section>

        <section className="policyList" aria-label="Privacy policy sections">
          {policySections.map((section, index) => {
            const Icon = section.icon;

            return (
              <article className="policyItem" key={section.title}>
                <div className="policyIndex">
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

        <section className="policyContact">
          <div>
            <p className="privacyEyebrow">Contact</p>
            <h2>Questions about privacy?</h2>
            <p>Send privacy questions or requests to our support inbox and we will review them directly.</p>
          </div>
          <div className="policyContactActions">
            <a href="mailto:support@zider.ink">
              <Mail size={17} />
              support@zider.ink
              <ArrowRight size={16} />
            </a>
            <small>Last updated: May 23, 2026</small>
          </div>
        </section>
      </main>
    </PublicPage>
  );
}

function getPrivacyCss() {
  return `
    .privacyPage,
    .privacyPage * {
      box-sizing: border-box;
    }

    .privacyPage {
      min-height: 100vh;
      overflow: hidden;
      background:
        linear-gradient(180deg, #ffffff 0%, #fbfdfb 42%, #f6faf7 100%);
      color: var(--zider-ink);
      padding: 1px 0 104px;
    }

    .privacyHero {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      margin: 88px auto 0;
      padding-bottom: 58px;
      border-bottom: 1px solid rgba(10, 37, 64, 0.12);
    }

    .privacyHeroCopy {
      max-width: 920px;
    }

    .privacyEyebrow {
      margin: 0 0 16px;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .privacyHero h1 {
      max-width: 920px;
      margin: 0;
      color: #060b3c;
      font-size: clamp(52px, 7.6vw, 96px);
      font-weight: 740;
      line-height: 0.98;
      letter-spacing: 0;
    }

    .privacyHeroCopy > p:last-child {
      max-width: 700px;
      margin: 28px 0 0;
      color: var(--zider-muted);
      font-size: clamp(19px, 2vw, 25px);
      line-height: 1.44;
    }

    .policyList {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      display: grid;
      gap: 0;
      margin: 0 auto;
    }

    .policyItem {
      display: grid;
      grid-template-columns: 96px minmax(0, 760px);
      gap: clamp(22px, 4vw, 58px);
      border-bottom: 1px solid rgba(10, 37, 64, 0.1);
      padding: 42px 0;
    }

    .policyIndex {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--zider-green);
    }

    .policyIndex span {
      color: rgba(7, 18, 47, 0.42);
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.08em;
    }

    .policyIndex svg {
      flex: 0 0 auto;
    }

    .policyItem h2 {
      margin: 0;
      color: #0a2540;
      font-size: clamp(25px, 2.6vw, 36px);
      line-height: 1.12;
      letter-spacing: 0;
    }

    .policyItem p {
      max-width: 760px;
      margin: 14px 0 0;
      color: var(--zider-muted);
      font-size: 17px;
      line-height: 1.72;
    }

    .policyContact {
      width: var(--public-page-width, min(1180px, calc(100% - 48px)));
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 32px;
      border: 1px solid rgba(8, 122, 70, 0.16);
      border-radius: 8px;
      background: #f8fbf9;
      margin: 54px auto 0;
      padding: 30px;
    }

    .policyContact h2 {
      margin: 0;
      color: #0a2540;
      font-size: clamp(28px, 3vw, 42px);
      line-height: 1.1;
      letter-spacing: 0;
    }

    .policyContact p:not(.privacyEyebrow) {
      max-width: 620px;
      margin: 14px 0 0;
      color: var(--zider-muted);
      font-size: 16px;
      line-height: 1.62;
    }

    .policyContactActions {
      display: grid;
      justify-items: end;
      gap: 16px;
    }

    .policyContact a {
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

    .policyContact a:hover {
      background: #069456;
      border-color: #069456;
      transform: translateY(-1px);
    }

    .policyContact small {
      display: block;
      color: var(--zider-muted);
      font-size: 13px;
    }

    @media (max-width: 980px) {
      .privacyPage {
        padding-bottom: 84px;
      }

      .privacyHero,
      .policyList,
      .policyContact {
        width: calc(100% - 36px);
      }

      .privacyHero {
        margin-top: 76px;
        padding-bottom: 42px;
      }

      .policyItem {
        grid-template-columns: 1fr;
        gap: 18px;
        padding: 34px 0;
      }

      .policyContact {
        grid-template-columns: 1fr;
        align-items: start;
      }

      .policyContactActions {
        justify-items: start;
      }
    }

    @media (max-width: 640px) {
      .privacyPage {
        padding-bottom: 72px;
      }

      .privacyHero,
      .policyList,
      .policyContact {
        width: calc(100% - 24px);
      }

      .privacyHero {
        margin-top: 58px;
      }

      .privacyHero h1 {
        font-size: clamp(44px, 14vw, 62px);
      }

      .privacyHeroCopy > p:last-child {
        font-size: 18px;
      }

      .policyContact {
        padding: 22px;
      }

      .policyContact a {
        width: 100%;
        min-width: 0;
      }
    }
  `;
}
