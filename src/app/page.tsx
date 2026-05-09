"use client";

import { WorkbenchShell } from "./_components/WorkbenchShell";
import type { CSSProperties } from "react";
import { useState } from "react";

const ziderLogoUrl = "https://zider.ink/wp-content/uploads/2024/07/zider-def.png";

const stats = [
  {
    accent: "#ff9b42",
    label: "Widgets",
    tone: "warm",
    value: "0 Widgets",
  },
  {
    accent: "#e650c8",
    label: "Projects",
    tone: "pink",
    value: "0 Projects",
  },
  {
    accent: "#80d929",
    label: "Shared Projects",
    tone: "green",
    value: "0 Shared",
  },
];

export default function HomePage() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const openCatalog = () => setIsCatalogOpen(true);
  const closeCatalog = () => setIsCatalogOpen(false);

  return (
    <WorkbenchShell active="dashboard" onCreate={openCatalog}>
      <div className="dashboard">
        <style>{getDashboardCss()}</style>

        <header className="dashboard__header">
          <div>
            <div className="dashboard__brandline">
              <img alt="Zider" src={ziderLogoUrl} />
              <span>Cursor Studio</span>
            </div>
            <h1>Dashboard</h1>
            <p className="dashboard__subtitle">View and edit your widgets and projects</p>
          </div>
        </header>

        <section className="dashboard__stats" aria-label="Workspace stats">
          {stats.map((item) => (
            <article className="dashboard__stat" data-tone={item.tone} key={item.label}>
              <div className="dashboard__stat-icon" style={{ "--accent": item.accent } as CSSProperties}>
                <StatGlyph tone={item.tone} />
              </div>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            </article>
          ))}
        </section>

        <div className="dashboard__grid">
          <section className="dashboard__recent" aria-labelledby="recent-heading">
            <div className="dashboard__panel-head">
              <div>
                <h2 id="recent-heading">Recent Widgets</h2>
                <p>No widgets found</p>
              </div>
              <div className="dashboard__actions">
                <label className="dashboard__search">
                  <span className="sr-only">Search widgets</span>
                  <input placeholder="Search" type="search" />
                </label>
                <button className="dashboard__icon-button" type="button" aria-label="Filter widgets">
                  <FilterIcon />
                </button>
                <button className="dashboard__primary" onClick={openCatalog} type="button">
                  <PlusIcon />
                  Create Widget
                </button>
              </div>
            </div>

            <div className="dashboard__empty">
              <EmptyBlocks />
              <h3>Looks like you don&apos;t have any widgets yet</h3>
              <p>Explore our widget catalog and find the best widgets to fit your every need</p>
              <button className="dashboard__primary dashboard__primary--soft" onClick={openCatalog} type="button">
                <PlusIcon />
                Explore Catalog
              </button>
            </div>
          </section>

        </div>

        <WidgetCatalogModal open={isCatalogOpen} onClose={closeCatalog} />
      </div>
    </WorkbenchShell>
  );
}

function WidgetCatalogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) {
    return null;
  }

  return (
    <div className="catalog-modal" aria-modal="true" role="dialog" aria-labelledby="catalog-title" onClick={onClose}>
      <div className="catalog-modal__sheet" onClick={(event) => event.stopPropagation()}>
        <header className="catalog-modal__header">
          <div>
            <p>Widget catalog</p>
            <h2 id="catalog-title">Create a Zider widget</h2>
          </div>
          <button className="catalog-modal__close" onClick={onClose} type="button" aria-label="Close catalog">
            <CloseIcon />
          </button>
        </header>

        <div className="catalog-modal__body">
          <aside className="catalog-modal__rail" aria-label="Catalog filters">
            <label className="catalog-modal__search">
              <SearchIcon />
              <input placeholder="Search..." type="search" />
            </label>
            <button data-active="true" type="button">Home</button>
            <button type="button">Website Components</button>
            <button type="button">Interaction</button>
          </aside>

          <section className="catalog-modal__content">
            <div className="catalog-modal__section-title">
              <span />
              <h3>Available now</h3>
            </div>

            <a className="catalog-card" href="/interactive-custom-cursor">
              <div className="catalog-card__art" aria-hidden="true">
                <span />
                <span />
                <span />
                <strong>OPEN</strong>
              </div>
              <div className="catalog-card__content">
                <small>Interactive</small>
                <h4>Interactive Custom Cursor</h4>
                <p>Build a cursor widget with presets, link states, custom SVG, logo assets, and install-ready runtime config.</p>
                <strong>Create</strong>
              </div>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatGlyph({ tone }: { tone: string }) {
  if (tone === "pink") {
    return (
      <svg aria-hidden="true" viewBox="0 0 44 44">
        <rect x="12" y="16" width="16" height="16" rx="3" />
        <rect x="18" y="10" width="16" height="22" rx="3" />
      </svg>
    );
  }

  if (tone === "green") {
    return (
      <svg aria-hidden="true" viewBox="0 0 44 44">
        <path d="M11 29 21.2 11l11 18H11Z" />
        <path d="M8 31h14l-7-12-7 12Z" opacity=".55" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 44 44">
      <circle cx="16" cy="26" r="7" opacity=".6" />
      <circle cx="26" cy="18" r="9" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
      <path d="M5 7h14" />
      <path d="M8 12h8" />
      <path d="M10 17h4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="19" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 24 24" width="19">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="28" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" viewBox="0 0 24 24" width="28">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 24 24" width="22">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function EmptyBlocks() {
  return (
    <svg aria-hidden="true" className="dashboard__empty-icon" fill="none" viewBox="0 0 126 112">
      <path d="m63 10 31 16v34L63 77 32 60V26l31-16Z" />
      <path d="M32 26 63 43l31-17" />
      <path d="M63 43v34" />
      <path d="m28 65 31 16v21L28 86 8 75l20-10Z" />
      <path d="m98 65 20 10-20 11-31 16V81l31-16Z" />
      <path d="M8 75v22l51 5" />
      <path d="M118 75v22l-51 5" />
      <circle cx="63" cy="57" r="4" />
    </svg>
  );
}

function getDashboardCss() {
  return `
    .dashboard {
      width: 100%;
      max-width: 1660px;
      min-width: 0;
      margin: 0 auto;
    }

    .dashboard__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 32px;
      margin-bottom: 34px;
    }

    .dashboard__brandline {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 12px;
    }

    .dashboard__brandline img {
      width: 94px;
      height: auto;
      display: block;
    }

    .dashboard__brandline span {
      min-height: 28px;
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(8, 122, 70, 0.18);
      border-radius: 999px;
      background: #e8f7ee;
      color: #087a46;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .dashboard h1,
    .dashboard h2,
    .dashboard h3,
    .dashboard p {
      letter-spacing: 0;
    }

    .dashboard h1 {
      margin: 0;
      font-size: clamp(32px, 3.2vw, 44px);
      line-height: 1.02;
      overflow-wrap: break-word;
    }

    .dashboard__subtitle {
      margin: 18px 0 0;
      color: #43444b;
      font-size: 18px;
      line-height: 1.35;
    }

    .dashboard__stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(220px, 1fr));
      gap: 24px;
      margin-bottom: 28px;
    }

    .dashboard__stat,
    .dashboard__recent {
      border: 1px solid #e5e6ec;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.84);
      box-shadow: 0 1px 0 rgba(17, 19, 24, 0.02);
    }

    .dashboard__stat {
      min-height: 104px;
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }

    .dashboard__stat:hover {
      border-color: rgba(8, 122, 70, 0.24);
      box-shadow: 0 18px 48px rgba(35, 37, 47, 0.08);
      transform: translateY(-2px);
    }

    .dashboard__stat-icon {
      width: 64px;
      height: 64px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      border: 1px solid color-mix(in srgb, var(--accent) 52%, #ffffff);
      border-radius: 8px;
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 14%, #ffffff);
    }

    .dashboard__stat-icon svg {
      width: 40px;
      height: 40px;
      fill: currentColor;
    }

    .dashboard__stat span {
      display: block;
      margin-bottom: 6px;
      color: #34353b;
      font-size: 16px;
    }

    .dashboard__stat strong {
      display: block;
      color: #08090d;
      font-size: 24px;
      line-height: 1.1;
    }

    .dashboard__grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
      align-items: stretch;
    }

    .dashboard__recent {
      min-height: 640px;
      padding: 28px;
      display: grid;
      grid-template-rows: auto 1fr;
    }

    .dashboard__panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
    }

    .dashboard__panel-head h2 {
      margin: 0 0 12px;
      color: #111318;
      font-size: 22px;
      line-height: 1.15;
    }

    .dashboard__panel-head p {
      margin: 0;
      color: #4d4e55;
      font-size: 16px;
    }

    .dashboard__actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dashboard__search input {
      width: min(28vw, 352px);
      height: 50px;
      border: 1px solid #dedfe7;
      border-radius: 6px;
      background: #ffffff;
      color: #111318;
      padding: 0 16px;
      font-size: 17px;
      outline: none;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }

    .dashboard__search input:focus {
      border-color: rgba(8, 122, 70, 0.64);
      box-shadow: 0 0 0 4px rgba(8, 122, 70, 0.1);
    }

    .dashboard__icon-button,
    .dashboard__primary {
      min-height: 50px;
      border: 0;
      border-radius: 6px;
      cursor: pointer;
      transition:
        transform 160ms ease,
        box-shadow 160ms ease,
        background 160ms ease,
        color 160ms ease;
    }

    .dashboard__icon-button {
      width: 50px;
      display: grid;
      place-items: center;
      color: #4e5058;
      background: #f0f1f5;
    }

    .dashboard__icon-button:hover {
      color: #087a46;
      background: #e8f7ee;
      transform: translateY(-1px);
    }

    .dashboard__primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-width: 188px;
      padding: 0 20px;
      color: #ffffff;
      background: #087a46;
      font-weight: 800;
      box-shadow: 0 12px 26px rgba(8, 122, 70, 0.2);
    }

    .dashboard__primary:hover {
      background: #045f35;
      box-shadow: 0 16px 30px rgba(8, 122, 70, 0.28);
      transform: translateY(-1px);
    }

    .dashboard__primary--soft {
      min-width: 220px;
    }

    .dashboard__empty {
      display: grid;
      place-items: center;
      align-content: center;
      min-height: 560px;
      text-align: center;
      color: #2f3037;
    }

    .dashboard__empty-icon {
      width: 136px;
      max-width: 42%;
      margin-bottom: 28px;
      stroke: #d9dadd;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 7;
    }

    .dashboard__empty h3 {
      max-width: 520px;
      margin: 0;
      color: #101116;
      font-size: 22px;
      line-height: 1.2;
    }

    .dashboard__empty p {
      max-width: 520px;
      margin: 14px 0 32px;
      color: #55565e;
      font-size: 16px;
      line-height: 1.42;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .catalog-modal {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: grid;
      place-items: center;
      background: rgba(13, 23, 19, 0.28);
      padding: 28px;
      backdrop-filter: blur(10px);
    }

    .catalog-modal__sheet {
      width: min(960px, 100%);
      max-height: min(650px, calc(100vh - 56px));
      overflow: auto;
      border: 1px solid #dfe5df;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 28px 80px rgba(13, 23, 19, 0.2);
    }

    .catalog-modal__header {
      min-height: 92px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 1px solid #e5e7e5;
      padding: 24px 28px;
    }

    .catalog-modal__header p,
    .catalog-modal__header h2 {
      margin: 0;
    }

    .catalog-modal__header p {
      color: #087a46;
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .catalog-modal__header h2 {
      margin-top: 6px;
      color: #101611;
      font-size: 28px;
      line-height: 1.1;
    }

    .catalog-modal__close {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 8px;
      background: #f2f4f2;
      color: #60645f;
      cursor: pointer;
    }

    .catalog-modal__close:hover {
      background: #e8f7ee;
      color: #087a46;
    }

    .catalog-modal__body {
      display: grid;
      grid-template-columns: 230px minmax(0, 1fr);
      gap: 22px;
      padding: 24px 28px 28px;
    }

    .catalog-modal__rail {
      display: grid;
      align-content: start;
      gap: 12px;
    }

    .catalog-modal__search {
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid #dfe1e5;
      border-radius: 7px;
      background: #ffffff;
      color: #949894;
      padding: 0 14px;
    }

    .catalog-modal__search input {
      min-width: 0;
      width: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      color: #141914;
      font-size: 15px;
    }

    .catalog-modal__rail button {
      min-height: 40px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #454a45;
      padding: 0 12px;
      text-align: left;
      cursor: pointer;
      font-weight: 700;
    }

    .catalog-modal__rail button:hover,
    .catalog-modal__rail button[data-active="true"] {
      background: #e8f7ee;
      color: #087a46;
    }

    .catalog-modal__content {
      min-width: 0;
    }

    .catalog-modal__section-title {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .catalog-modal__section-title span {
      width: 10px;
      height: 16px;
      border-radius: 999px 999px 3px 3px;
      background: #087a46;
    }

    .catalog-modal__section-title h3 {
      margin: 0;
      color: #171a17;
      font-size: 20px;
    }

    .catalog-card {
      min-height: 236px;
      display: grid;
      grid-template-columns: minmax(260px, 0.95fr) minmax(0, 1fr);
      overflow: hidden;
      border: 1px solid #dfe1e5;
      border-radius: 8px;
      background: #ffffff;
      color: #111318;
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }

    .catalog-card:hover {
      border-color: rgba(8, 122, 70, 0.36);
      box-shadow: 0 20px 48px rgba(13, 23, 19, 0.12);
      transform: translateY(-2px);
    }

    .catalog-card__art {
      position: relative;
      min-height: 236px;
      overflow: hidden;
      background:
        linear-gradient(90deg, rgba(255, 255, 255, 0.42) 1px, transparent 1px),
        linear-gradient(rgba(255, 255, 255, 0.36) 1px, transparent 1px),
        radial-gradient(circle at 78% 28%, rgba(246, 184, 75, 0.2), transparent 28%),
        #e8f7ee;
      background-size: 28px 28px;
    }

    .catalog-card__art span {
      position: absolute;
      border-radius: 999px;
    }

    .catalog-card__art span:nth-child(1) {
      width: 92px;
      height: 92px;
      left: 18%;
      top: 52px;
      border: 2px solid rgba(8, 122, 70, 0.38);
      background: rgba(255, 255, 255, 0.76);
    }

    .catalog-card__art span:nth-child(2) {
      width: 18px;
      height: 18px;
      left: calc(18% + 37px);
      top: 89px;
      background: #087a46;
    }

    .catalog-card__art span:nth-child(3) {
      width: 116px;
      height: 116px;
      right: 13%;
      top: 40px;
      border: 2px solid rgba(246, 184, 75, 0.62);
      background: rgba(255, 255, 255, 0.5);
    }

    .catalog-card__art strong {
      position: absolute;
      right: 34px;
      bottom: 30px;
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      background: #087a46;
      color: #ffffff;
      padding: 0 14px;
      font-size: 12px;
      letter-spacing: 0.08em;
      box-shadow: 0 14px 28px rgba(8, 122, 70, 0.22);
    }

    .catalog-card__content {
      display: grid;
      align-content: center;
      justify-items: start;
      padding: 24px;
    }

    .catalog-card__content small {
      display: block;
      color: #087a46;
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .catalog-card__content h4 {
      margin: 8px 0 8px;
      color: #111318;
      font-size: 24px;
      line-height: 1.1;
    }

    .catalog-card__content p {
      max-width: 460px;
      margin: 0 0 18px;
      color: #555a55;
      font-size: 15px;
      line-height: 1.45;
    }

    .catalog-card__content strong {
      display: inline-flex;
      align-items: center;
      min-height: 38px;
      border-radius: 6px;
      background: #087a46;
      color: #ffffff;
      padding: 0 16px;
      font-size: 14px;
    }

    @media (max-width: 1180px) {
      .dashboard__stats,
      .dashboard__grid {
        grid-template-columns: 1fr;
      }

      .dashboard__recent {
        min-height: 620px;
      }

      .dashboard__search input {
        width: min(48vw, 352px);
      }
    }

    @media (max-width: 760px) {
      .dashboard__header,
      .dashboard__panel-head {
        display: grid;
        gap: 18px;
        min-width: 0;
      }

      .dashboard__brandline {
        flex-wrap: wrap;
      }

      .dashboard__stats {
        gap: 14px;
      }

      .dashboard__stat {
        min-height: 104px;
      }

      .dashboard__actions {
        flex-wrap: wrap;
      }

      .dashboard__search {
        flex: 1 1 100%;
      }

      .dashboard__search input {
        width: 100%;
      }

      .dashboard__primary {
        min-width: 0;
        flex: 1 1 auto;
      }

      .catalog-modal__body,
      .catalog-card {
        grid-template-columns: 1fr;
      }

      .catalog-card__art {
        min-height: 190px;
      }

      .dashboard__recent {
        padding: 20px;
      }

      .dashboard__empty {
        min-height: 420px;
      }

      .catalog-modal {
        padding: 14px;
      }

      .catalog-modal__header,
      .catalog-modal__body {
        padding: 18px;
      }

      .catalog-modal__body {
        grid-template-columns: 1fr;
      }

      .catalog-modal__rail {
        grid-template-columns: 1fr;
      }

      .catalog-modal__header h2 {
        font-size: 24px;
      }
    }
  `;
}
