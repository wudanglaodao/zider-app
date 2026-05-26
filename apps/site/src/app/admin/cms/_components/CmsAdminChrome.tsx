import type { ReactNode } from "react";

import { isAccountAuthConfigured } from "@/lib/account/auth";
import { signOutAction } from "@/app/account/actions";

export function CmsAdminChrome({
  actions,
  children,
  description,
  eyebrow = "ZIDER CMS",
  showSignOut = true,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  showSignOut?: boolean;
  title: string;
}) {
  return (
    <main className="cms-admin">
      <style>{getAdminCss()}</style>
      <section className="cms-hero">
        <div>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          {description ? <span>{description}</span> : null}
        </div>
        <div className="cms-hero__actions">
          {actions}
          {showSignOut ? (
            <form action={signOutAction}>
              <button className="cms-button-muted" type="submit">
                Sign out
              </button>
            </form>
          ) : null}
        </div>
      </section>
      {children}
    </main>
  );
}

export function LockedCmsAdmin() {
  const isConfigured = isAccountAuthConfigured();

  return (
    <CmsAdminChrome showSignOut={false} title={isConfigured ? "Admin sign-in required" : "Account system is not configured"}>
      <section className="locked-card">
        <p>ZIDER CMS</p>
        <span>
          {isConfigured
            ? "Sign in with an admin account from /account to access the content backend."
            : "Add Supabase env vars and create the first admin account before using the content backend."}
        </span>
      </section>
    </CmsAdminChrome>
  );
}

export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function getAdminCss() {
  return `
    .cms-admin,
    .cms-admin * {
      box-sizing: border-box;
    }

    .cms-admin {
      min-height: 100vh;
      background: #f6f9fb;
      color: #0a2540;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 32px;
    }

    .cms-hero,
    .cms-section,
    .stat-grid,
    .save-banner,
    .setup-banner {
      width: min(1180px, 100%);
      margin-left: auto;
      margin-right: auto;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }

    .cms-hero {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
    }

    .cms-hero p,
    .form-card__eyebrow,
    .table-card__eyebrow,
    .locked-card p {
      margin: 0 0 8px;
      color: #087a46;
      font-size: 12px;
      font-weight: 760;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .cms-hero h1 {
      max-width: 760px;
      margin: 0;
      color: #0a2540;
      font-size: clamp(38px, 5vw, 64px);
      line-height: 1.02;
      letter-spacing: 0;
      font-weight: 640;
    }

    .cms-hero span,
    .locked-card span {
      display: block;
      max-width: 700px;
      margin-top: 16px;
      color: #63758a;
      font-size: 17px;
      line-height: 1.55;
    }

    .cms-hero__actions,
    .inline-actions,
    .row-actions,
    .content-library-actions,
    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .cms-hero__actions form,
    .content-library-actions form,
    .row-actions form {
      margin: 0;
    }

    .cms-button,
    .cms-button-secondary,
    .cms-button-muted,
    .content-library-actions button,
    .row-actions button {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #087a46;
      border-radius: 6px;
      background: #087a46;
      color: #ffffff;
      padding: 0 16px;
      font-size: 14px;
      font-weight: 650;
      text-decoration: none;
      cursor: pointer;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
    }

    .cms-button:hover,
    .cms-button-secondary:hover,
    .cms-button-muted:hover,
    .content-library-actions button:hover,
    .row-actions button:hover {
      transform: translateY(-1px);
    }

    .cms-button-secondary,
    .content-library-actions button,
    .row-actions button {
      border-color: rgba(8, 122, 70, 0.24);
      background: #ffffff;
      color: #087a46;
    }

    .cms-button-muted {
      border-color: rgba(10, 37, 64, 0.14);
      background: #ffffff;
      color: #0a2540;
    }

    .save-banner,
    .setup-banner {
      border: 1px solid rgba(8, 122, 70, 0.18);
      border-radius: 8px;
      background: rgba(223, 247, 234, 0.7);
      color: #087a46;
      margin-bottom: 18px;
      padding: 12px 14px;
      font-weight: 620;
    }

    .setup-banner {
      border-color: #fed7aa;
      background: #fff7ed;
      color: #9a3412;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }

    .stat-card,
    .control-card,
    .form-card,
    .structure-card,
    .table-card,
    .locked-card {
      border: 1px solid #d9e4ec;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 20px 70px rgba(10, 37, 64, 0.06);
    }

    .stat-card {
      padding: 18px;
    }

    .stat-card span {
      color: #63758a;
      font-size: 13px;
      font-weight: 620;
    }

    .stat-card strong {
      display: block;
      margin-top: 8px;
      font-size: 30px;
      line-height: 1;
    }

    .table-card,
    .control-card,
    .structure-card,
    .form-card {
      padding: 22px;
    }

    .control-card,
    .structure-card {
      margin-bottom: 18px;
    }

    .table-head,
    .form-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .table-head h2,
    .form-head h2 {
      margin: 0;
      font-size: 25px;
      line-height: 1.16;
    }

    .filter-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(320px, 520px);
      align-items: center;
      gap: 16px;
    }

    .filter-tabs,
    .status-tabs {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-tabs a,
    .status-tabs a {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #d9e4ec;
      border-radius: 999px;
      background: #ffffff;
      color: #0a2540;
      padding: 0 13px;
      font-size: 13px;
      font-weight: 720;
      text-decoration: none;
      transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
    }

    .filter-tabs a:hover,
    .status-tabs a:hover,
    .filter-tabs a[aria-current="page"],
    .status-tabs a[aria-current="page"] {
      border-color: rgba(8, 122, 70, 0.3);
      background: #f2faf5;
      color: #087a46;
    }

    .filter-tabs span {
      color: #63758a;
      font-size: 12px;
      font-weight: 760;
    }

    .cms-search-form {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      margin: 0;
    }

    .cms-search-form label {
      min-height: 42px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid #d9e4ec;
      border-radius: 999px;
      background: #ffffff;
      color: #63758a;
      padding: 0 14px;
    }

    .cms-search-form input {
      width: 100%;
      min-width: 0;
      border: 0;
      background: transparent;
      color: #0a2540;
      font: inherit;
      outline: none;
    }

    .status-tabs {
      border-top: 1px solid #edf2f5;
      margin-top: 18px;
      padding-top: 18px;
    }

    .structure-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .structure-column {
      border: 1px solid #edf2f5;
      border-radius: 10px;
      background: #fbfdfc;
      padding: 14px;
    }

    .structure-column__head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      color: #0a2540;
      font-size: 14px;
      font-weight: 760;
    }

    .structure-column__head span {
      width: 34px;
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(8, 122, 70, 0.12);
      border-radius: 8px;
      background: #eef8f2;
      color: #087a46;
    }

    .structure-links {
      display: grid;
      gap: 8px;
    }

    .structure-links a {
      min-height: 42px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border: 1px solid #edf2f5;
      border-radius: 8px;
      background: #ffffff;
      color: #0a2540;
      padding: 0 12px;
      font-size: 13px;
      font-weight: 720;
      text-decoration: none;
      transition: border-color 160ms ease, background 160ms ease, color 160ms ease;
    }

    .structure-links a:hover,
    .structure-links a[aria-current="page"] {
      border-color: rgba(8, 122, 70, 0.28);
      background: #f5fbf7;
      color: #087a46;
    }

    .structure-links small {
      color: #63758a;
      font-size: 12px;
      font-weight: 760;
    }

    .structure-links p {
      margin: 0;
      color: #63758a;
      font-size: 13px;
    }

    .cms-table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      font-size: 14px;
    }

    .cms-table th,
    .cms-table td {
      border-top: 1px solid #edf2f5;
      padding: 14px 10px;
      text-align: left;
      vertical-align: top;
    }

    .cms-table th {
      color: #456782;
      font-size: 11px;
      font-weight: 760;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .entry-title {
      display: grid;
      gap: 6px;
      color: #0a2540;
      font-weight: 720;
    }

    .entry-title span,
    .entry-meta,
    .empty-state {
      color: #63758a;
      font-size: 13px;
      font-weight: 450;
    }

    .status-pill,
    .type-pill {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      border-radius: 999px;
      padding: 0 9px;
      background: #eef6f1;
      color: #087a46;
      font-size: 12px;
      font-weight: 720;
      text-transform: capitalize;
    }

    .content-library-list {
      display: grid;
      gap: 10px;
    }

    .content-library-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: 14px;
      border: 1px solid #edf2f5;
      border-radius: 10px;
      background: linear-gradient(180deg, #ffffff 0%, #fbfdfc 100%);
      padding: 14px;
      transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    }

    .content-library-card:hover {
      border-color: rgba(8, 122, 70, 0.2);
      box-shadow: 0 14px 34px rgba(10, 37, 64, 0.055);
      transform: translateY(-1px);
    }

    .content-library-icon {
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(8, 122, 70, 0.12);
      border-radius: 9px;
      background: #eef8f2;
      color: #087a46;
    }

    .content-library-icon[data-type="blog"] {
      background: #f4f7fb;
      color: #315c86;
    }

    .content-library-main {
      min-width: 0;
    }

    .content-library-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 7px;
      margin-bottom: 8px;
      color: #63758a;
      font-size: 12px;
      font-weight: 650;
    }

    .content-library-card h3 {
      margin: 0;
      color: #0a2540;
      font-size: 18px;
      line-height: 1.24;
      font-weight: 760;
      letter-spacing: 0;
    }

    .content-library-card p {
      max-width: 780px;
      display: -webkit-box;
      overflow: hidden;
      margin: 8px 0 0;
      color: #63758a;
      font-size: 14px;
      line-height: 1.5;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .entry-route {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      margin-top: 10px;
      color: #7a8ca0;
      font-size: 12px;
      font-weight: 600;
    }

    .entry-route span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .content-library-actions {
      justify-content: flex-end;
      min-width: 210px;
    }

    .status-pill[data-status="draft"] {
      background: #f8fafc;
      color: #456782;
    }

    .status-pill[data-status="archived"] {
      background: #fef2f2;
      color: #b91c1c;
    }

    .form-grid,
    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .form-card label,
    .rich-editor-wrap {
      display: grid;
      gap: 7px;
      margin-bottom: 14px;
    }

    .form-card label span,
    .rich-editor-label {
      color: #456782;
      font-size: 12px;
      font-weight: 720;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .form-card input,
    .form-card select,
    .form-card textarea {
      width: 100%;
      border: 1px solid #d9e4ec;
      border-radius: 8px;
      background: #ffffff;
      color: #0a2540;
      font: inherit;
      padding: 11px 12px;
    }

    .form-card textarea {
      resize: vertical;
    }

    .rich-editor {
      min-height: 360px;
      border: 1px solid #d9e4ec;
      border-radius: 10px;
      background: #ffffff;
      padding: 18px;
      color: #0a2540;
      line-height: 1.7;
      outline: none;
      overflow: auto;
    }

    .rich-editor:focus {
      border-color: rgba(8, 122, 70, 0.54);
      box-shadow: 0 0 0 3px rgba(8, 122, 70, 0.08);
    }

    .rich-editor h1,
    .rich-editor h2,
    .rich-editor h3 {
      margin: 0 0 14px;
      line-height: 1.15;
    }

    .rich-editor p {
      margin: 0 0 14px;
      color: #425f78;
    }

    .rich-editor a {
      color: #087a46;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .rich-editor img {
      max-width: 100%;
      display: block;
      border-radius: 10px;
      margin: 16px 0;
    }

    .toolbar {
      border: 1px solid #d9e4ec;
      border-radius: 10px;
      background: #f8fbf9;
      padding: 8px;
    }

    .toolbar button,
    .toolbar label {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(8, 122, 70, 0.18);
      border-radius: 7px;
      background: #ffffff;
      color: #0a2540;
      padding: 0 10px;
      font-size: 13px;
      font-weight: 720;
      cursor: pointer;
    }

    .toolbar input[type="file"] {
      display: none;
    }

    .media-library-overlay {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: grid;
      place-items: center;
      background: rgba(7, 18, 47, 0.28);
      padding: 24px;
    }

    .media-library-dialog {
      width: min(920px, 100%);
      max-height: min(720px, calc(100vh - 48px));
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      border: 1px solid #d9e4ec;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 30px 90px rgba(7, 18, 47, 0.22);
      overflow: hidden;
    }

    .media-library-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
      border-bottom: 1px solid #edf2f5;
      padding: 20px;
    }

    .media-library-head p {
      margin: 0 0 6px;
      color: #087a46;
      font-size: 12px;
      font-weight: 780;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .media-library-head h3 {
      margin: 0;
      color: #0a2540;
      font-size: 24px;
      line-height: 1.16;
    }

    .media-library-head span,
    .media-empty span,
    .media-card__body span {
      display: block;
      margin-top: 8px;
      color: #63758a;
      font-size: 13px;
      line-height: 1.45;
    }

    .media-library-head button,
    .media-card__actions button {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(8, 122, 70, 0.18);
      border-radius: 7px;
      background: #ffffff;
      color: #0a2540;
      padding: 0 10px;
      font-size: 13px;
      font-weight: 720;
      cursor: pointer;
      transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease;
    }

    .media-library-head button:hover,
    .media-card__actions button:hover {
      border-color: rgba(8, 122, 70, 0.38);
      color: #087a46;
      transform: translateY(-1px);
    }

    .media-library-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 14px;
      padding: 18px;
      overflow: auto;
    }

    .media-card {
      min-width: 0;
      overflow: hidden;
      border: 1px solid #d9e4ec;
      border-radius: 12px;
      background: #ffffff;
    }

    .media-card__preview {
      width: 100%;
      aspect-ratio: 4 / 3;
      display: block;
      border: 0;
      border-bottom: 1px solid #edf2f5;
      background: #f6f9fb;
      padding: 0;
      cursor: pointer;
      overflow: hidden;
    }

    .media-card__preview img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      transition: transform 180ms ease;
    }

    .media-card__preview:hover img {
      transform: scale(1.03);
    }

    .media-card__body {
      padding: 12px;
    }

    .media-card__body strong {
      display: block;
      overflow: hidden;
      color: #0a2540;
      font-size: 13px;
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .media-card__actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .media-card__actions button:first-child {
      border-color: #087a46;
      background: #087a46;
      color: #ffffff;
    }

    .media-card__actions button:first-child:hover {
      background: #069456;
      color: #ffffff;
    }

    .media-empty {
      border: 1px dashed #c8d6df;
      border-radius: 12px;
      margin: 18px;
      padding: 28px;
      color: #63758a;
    }

    .media-empty p {
      margin: 0 0 4px;
      color: #0a2540;
      font-size: 18px;
      font-weight: 720;
    }

    .empty-state {
      border: 1px dashed #c8d6df;
      border-radius: 10px;
      margin: 0;
      padding: 20px;
    }

    .locked-card {
      width: min(620px, 100%);
      margin: 0 auto;
      padding: 28px;
    }

    @media (max-width: 860px) {
      .cms-admin {
        padding: 20px;
      }

      .cms-hero,
      .table-head,
      .form-head,
      .filter-row {
        flex-direction: column;
      }

      .stat-grid,
      .form-grid,
      .field-grid,
      .filter-row,
      .structure-grid {
        grid-template-columns: 1fr;
      }

      .cms-search-form {
        grid-template-columns: 1fr;
      }

      .cms-table,
      .cms-table tbody,
      .cms-table tr,
      .cms-table td {
        display: block;
      }

      .cms-table thead {
        display: none;
      }

      .cms-table tr {
        border-top: 1px solid #edf2f5;
        padding: 12px 0;
      }

      .cms-table td {
        border: 0;
        padding: 7px 0;
      }

      .content-library-card {
        grid-template-columns: minmax(0, 1fr);
      }

      .content-library-icon {
        display: none;
      }

      .content-library-actions {
        justify-content: flex-start;
        min-width: 0;
      }

      .media-library-overlay {
        padding: 12px;
      }

      .media-library-head {
        flex-direction: column;
      }

      .media-library-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      }
    }
  `;
}
