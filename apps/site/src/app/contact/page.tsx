import type { Metadata } from "next";
import { ArrowRight, Mail, MessageSquareText, Sparkles } from "lucide-react";

import { PublicPage } from "@/app/_components/PublicChrome";

const supportEmail = "support@zider.ink";

export const metadata: Metadata = {
  title: "Contact - ZIDER",
  description: "Contact ZIDER for product questions, support, collaboration, and feedback.",
};

export default function ContactPage() {
  return (
    <PublicPage>
      <main className="contactPage">
        <style>{getContactCss()}</style>

        <section className="contactHero">
          <p className="contactEyebrow">Contact ZIDER</p>
          <h1>Tell us what you are building.</h1>
          <p>
            We would love to hear from you. Send questions about components, product support, collaboration, or feedback
            for the ZIDER site.
          </p>
        </section>

        <section className="contactGrid" aria-label="Contact options">
          <article className="contactCard contactCardPrimary">
            <div className="contactIcon">
              <Mail size={22} />
            </div>
            <p>Email</p>
            <h2>{supportEmail}</h2>
            <span>For product questions, support requests, and collaboration notes.</span>
            <a href={`mailto:${supportEmail}`}>
              Send email
              <ArrowRight size={17} />
            </a>
          </article>

          <article className="contactCard">
            <div className="contactIcon">
              <MessageSquareText size={22} />
            </div>
            <p>What to include</p>
            <h2>Context helps us reply faster.</h2>
            <span>Share the product, page URL, platform, and a short description of what you need.</span>
          </article>

          <article className="contactCard">
            <div className="contactIcon">
              <Sparkles size={22} />
            </div>
            <p>Common topics</p>
            <h2>Components, solutions, and migration.</h2>
            <span>We can help with component ideas, site workflows, Blog or Forum migration, and support questions.</span>
          </article>
        </section>
      </main>
    </PublicPage>
  );
}

function getContactCss() {
  return `
    .contactPage,
    .contactPage * {
      box-sizing: border-box;
    }

    .contactPage {
      background:
        linear-gradient(90deg, rgba(8, 122, 70, 0.08), transparent 34%),
        radial-gradient(circle at 78% 10%, rgba(8, 122, 70, 0.12), transparent 28%),
        #ffffff;
      color: #07122f;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 1px 24px 110px;
    }

    .contactCard a {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid #087a46;
      border-radius: 6px;
      background: #087a46;
      color: #ffffff;
      padding: 0 18px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 14px 32px rgba(8, 122, 70, 0.18);
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
    }

    .contactCard a:hover {
      background: #069456;
      border-color: #069456;
      transform: translateY(-1px);
    }

    .contactHero {
      width: min(1180px, 100%);
      margin: 110px auto 48px;
    }

    .contactEyebrow,
    .contactCard p {
      margin: 0 0 12px;
      color: #087a46;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .contactHero h1 {
      max-width: 860px;
      margin: 0;
      color: #060b3c;
      font-size: clamp(52px, 8vw, 104px);
      font-weight: 740;
      line-height: 0.96;
      letter-spacing: 0;
    }

    .contactHero > p:last-child {
      max-width: 700px;
      margin: 28px 0 0;
      color: #5f7188;
      font-size: clamp(19px, 2vw, 26px);
      line-height: 1.42;
    }

    .contactGrid {
      width: min(1180px, 100%);
      display: grid;
      grid-template-columns: 1.2fr 0.9fr 0.9fr;
      gap: 18px;
      margin: 0 auto;
    }

    .contactCard {
      min-height: 300px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      border: 1px solid #dce8e1;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.86);
      padding: 28px;
      box-shadow: 0 22px 68px rgba(10, 37, 64, 0.07);
    }

    .contactCardPrimary {
      background:
        linear-gradient(145deg, rgba(8, 122, 70, 0.08), rgba(255, 255, 255, 0.92)),
        #ffffff;
    }

    .contactIcon {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(8, 122, 70, 0.16);
      border-radius: 999px;
      background: #eef9f2;
      color: #087a46;
      margin-bottom: 34px;
    }

    .contactCard h2 {
      margin: 0;
      color: #0a2540;
      font-size: clamp(24px, 2.4vw, 34px);
      line-height: 1.12;
    }

    .contactCard span {
      display: block;
      margin-top: 16px;
      color: #5f7188;
      font-size: 16px;
      line-height: 1.62;
    }

    .contactCard a {
      margin-top: auto;
    }

    @media (max-width: 900px) {
      .contactPage {
        padding: 22px 20px 86px;
      }

      .contactHero {
        margin-top: 76px;
      }

      .contactGrid {
        grid-template-columns: 1fr;
      }

      .contactCard {
        min-height: 0;
      }
    }
  `;
}
