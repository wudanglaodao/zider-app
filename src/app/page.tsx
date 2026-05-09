export default function HomePage() {
  return (
    <main className="zider-landing">
      <style>{`
        :root {
          color-scheme: dark;
        }

        .zider-landing {
          box-sizing: border-box;
          width: 100%;
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
          overflow: hidden;
          background:
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            #090b0f;
          background-size: 56px 56px, 56px 56px, auto;
          color: #f8fafc;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          padding: 32px;
          position: relative;
          isolation: isolate;
        }

        .zider-landing::before {
          content: "ZIDER";
          position: absolute;
          right: -0.16em;
          bottom: -0.24em;
          z-index: -1;
          color: rgba(255, 255, 255, 0.035);
          font-size: clamp(120px, 28vw, 420px);
          font-weight: 800;
          letter-spacing: 0;
          line-height: 1;
        }

        .zider-topbar,
        .zider-footer {
          display: flex;
          align-items: center;
          gap: 20px;
          color: rgba(248, 250, 252, 0.62);
          font-size: 14px;
        }

        .zider-topbar {
          justify-content: space-between;
        }

        .zider-footer {
          justify-content: flex-end;
        }

        .zider-wordmark {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #f8fafc;
          font-weight: 650;
        }

        .zider-mark {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: #f8fafc;
          color: #090b0f;
          font-size: 16px;
          font-weight: 800;
          line-height: 1;
        }

        .zider-hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          max-width: 920px;
          padding: 11vh 0;
        }

        .zider-kicker {
          margin: 0 0 22px;
          color: #7dd3fc;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .zider-title {
          margin: 0;
          color: #ffffff;
          font-size: clamp(72px, 14vw, 176px);
          font-weight: 820;
          letter-spacing: 0;
          line-height: 0.86;
        }

        .zider-tagline {
          max-width: 620px;
          margin: 30px 0 0;
          color: rgba(248, 250, 252, 0.76);
          font-size: clamp(24px, 4vw, 46px);
          font-weight: 520;
          letter-spacing: 0;
          line-height: 1.08;
        }

        .zider-accent {
          color: #fef08a;
        }

        .zider-status {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 40px;
          margin-top: 42px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 0 14px;
          color: rgba(248, 250, 252, 0.72);
          font-size: 14px;
          background: rgba(255, 255, 255, 0.045);
        }

        .zider-status::before {
          content: "";
          width: 8px;
          height: 8px;
          background: #7dd3fc;
          border-radius: 999px;
          box-shadow: 0 0 18px rgba(125, 211, 252, 0.72);
        }

        @media (max-width: 720px) {
          .zider-landing {
            min-height: 100vh;
            padding: 22px;
            background-size: 40px 40px, 40px 40px, auto;
          }

          .zider-topbar,
          .zider-footer {
            font-size: 12px;
          }

          .zider-hero {
            padding: 8vh 0;
          }

          .zider-title {
            font-size: clamp(64px, 23vw, 108px);
          }

          .zider-tagline {
            max-width: 430px;
          }
        }
      `}</style>

      <header className="zider-topbar" aria-label="Zider">
        <div className="zider-wordmark">
          <span className="zider-mark">Z</span>
          <span>Zider</span>
        </div>
        <span>app.zider.ink</span>
      </header>

      <section className="zider-hero" aria-labelledby="zider-title">
        <p className="zider-kicker">Zider Apps</p>
        <h1 id="zider-title" className="zider-title">
          Zider
        </h1>
        <p className="zider-tagline">
          Small apps. <span className="zider-accent">Sharper</span> websites.
        </p>
        <p className="zider-status">New workspace opening soon</p>
      </section>

      <footer className="zider-footer">
        <span>2026</span>
      </footer>
    </main>
  );
}
