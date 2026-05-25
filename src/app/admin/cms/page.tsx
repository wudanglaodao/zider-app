import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isCmsAdminTokenConfigured, isCmsAdminTokenValid, requireCmsAdminToken } from "@/lib/cms/auth";
import { archiveCmsEntry, getCmsStats, listCmsEntries, parseTagInput, upsertCmsEntry } from "@/lib/cms/content";

export const metadata: Metadata = {
  title: "ZIDER CMS Admin",
};

type AdminCmsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCmsPage({ searchParams }: AdminCmsPageProps) {
  const params = (await searchParams) ?? {};
  const token = readSearchParam(params.token);
  const saved = readSearchParam(params.saved);
  const isConfigured = isCmsAdminTokenConfigured();
  const isAuthorized = isCmsAdminTokenValid(token);

  if (!isConfigured || !isAuthorized) {
    return <LockedCmsAdmin isConfigured={isConfigured} />;
  }

  const [entries, stats] = await Promise.all([listCmsEntries(), getCmsStats()]);

  return (
    <main className="cms-admin">
      <style>{getAdminCss()}</style>
      <section className="cms-hero">
        <div>
          <p>ZIDER CMS</p>
          <h1>Blog and Forum content backend</h1>
          <span>Manage migrated posts, forum answers, guides, and publishing status from one lightweight admin surface.</span>
        </div>
        <a href="/" className="home-link">View site</a>
      </section>

      {saved ? <p className="save-banner">Content saved.</p> : null}

      <section className="stat-grid" aria-label="CMS stats">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Draft" value={stats.draft} />
        <StatCard label="Blog" value={stats.blog} />
        <StatCard label="Forum" value={stats.forum} />
      </section>

      <section className="cms-layout">
        <form action={saveCmsEntryAction} className="editor-card">
          <input name="adminToken" type="hidden" value={token} />
          <div className="editor-head">
            <div>
              <p>Editor</p>
              <h2>Create or update content</h2>
            </div>
            <button type="submit">Save content</button>
          </div>

          <div className="field-grid">
            <label>
              <span>Type</span>
              <select name="contentType" defaultValue="blog">
                <option value="blog">Blog</option>
                <option value="forum">Forum</option>
              </select>
            </label>
            <label>
              <span>Status</span>
              <select name="status" defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              <span>Locale</span>
              <select name="locale" defaultValue="en">
                <option value="en">English</option>
                <option value="zh-Hant">繁中</option>
                <option value="zh-Hans">简中</option>
              </select>
            </label>
            <label>
              <span>Author</span>
              <input name="authorName" placeholder="ZIDER Team" />
            </label>
          </div>

          <label>
            <span>Title</span>
            <input name="title" placeholder="Content title" required />
          </label>
          <label>
            <span>Slug</span>
            <input name="slug" placeholder="auto-generated when empty" />
          </label>
          <label>
            <span>Excerpt</span>
            <textarea name="excerpt" placeholder="Short description for listing pages" rows={3} />
          </label>
          <label>
            <span>Body</span>
            <textarea name="body" placeholder="Markdown-style body content" rows={12} />
          </label>
          <div className="field-grid">
            <label>
              <span>Tags</span>
              <input name="tags" placeholder="migration, guide, wix" />
            </label>
            <label>
              <span>Source URL</span>
              <input name="sourceUrl" placeholder="https://old-site.example/post" type="url" />
            </label>
          </div>
        </form>

        <section className="entry-list" aria-labelledby="entries-heading">
          <div className="entry-list__head">
            <p>Content</p>
            <h2 id="entries-heading">Latest entries</h2>
          </div>
          {entries.length ? (
            entries.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <div>
                  <small>{entry.contentType} · {entry.locale} · {entry.status}</small>
                  <h3>{entry.title}</h3>
                  <p>{entry.excerpt || "No excerpt yet."}</p>
                  <span>/{entry.contentType}/{entry.slug}</span>
                </div>
                <form action={archiveCmsEntryAction}>
                  <input name="adminToken" type="hidden" value={token} />
                  <input name="id" type="hidden" value={entry.id} />
                  <button type="submit">Archive</button>
                </form>
              </article>
            ))
          ) : (
            <p className="empty-state">No CMS entries yet. Create your first blog or forum item.</p>
          )}
        </section>
      </section>
    </main>
  );
}

async function saveCmsEntryAction(formData: FormData) {
  "use server";

  const adminToken = stringValue(formData, "adminToken");
  requireCmsAdminToken(adminToken);

  await upsertCmsEntry({
    authorName: stringValue(formData, "authorName"),
    body: stringValue(formData, "body"),
    contentType: stringValue(formData, "contentType") === "forum" ? "forum" : "blog",
    excerpt: stringValue(formData, "excerpt"),
    locale: stringValue(formData, "locale") || "en",
    slug: stringValue(formData, "slug"),
    sourceUrl: stringValue(formData, "sourceUrl"),
    status: parseStatus(stringValue(formData, "status")),
    tags: parseTagInput(stringValue(formData, "tags")),
    title: stringValue(formData, "title"),
  });

  revalidatePath("/admin/cms");
  revalidatePath("/blog");
  revalidatePath("/forum");
  redirect(`/admin/cms?token=${encodeURIComponent(adminToken)}&saved=1`);
}

async function archiveCmsEntryAction(formData: FormData) {
  "use server";

  const adminToken = stringValue(formData, "adminToken");
  requireCmsAdminToken(adminToken);

  await archiveCmsEntry(stringValue(formData, "id"));
  revalidatePath("/admin/cms");
  revalidatePath("/blog");
  revalidatePath("/forum");
  redirect(`/admin/cms?token=${encodeURIComponent(adminToken)}&saved=1`);
}

function LockedCmsAdmin({ isConfigured }: { isConfigured: boolean }) {
  return (
    <main className="cms-admin cms-admin--locked">
      <style>{getAdminCss()}</style>
      <section className="locked-card">
        <p>ZIDER CMS</p>
        <h1>{isConfigured ? "Admin token required" : "CMS admin token is not configured"}</h1>
        <span>
          {isConfigured
            ? "Open /admin/cms?token=YOUR_TOKEN to access the content backend."
            : "Add CMS_ADMIN_TOKEN in Vercel and local .env before using the admin backend."}
        </span>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function parseStatus(value: string) {
  if (value === "published" || value === "archived") {
    return value;
  }

  return "draft";
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
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
    .cms-layout,
    .stat-grid {
      width: min(1180px, 100%);
      margin: 0 auto;
    }

    .cms-hero {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
    }

    .cms-hero p,
    .editor-head p,
    .entry-list__head p,
    .locked-card p {
      margin: 0 0 8px;
      color: #087a46;
      font-size: 12px;
      font-weight: 760;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .cms-hero h1,
    .locked-card h1 {
      max-width: 720px;
      margin: 0;
      font-size: clamp(34px, 5vw, 62px);
      line-height: 1.02;
      letter-spacing: 0;
      font-weight: 640;
    }

    .cms-hero span,
    .locked-card span {
      display: block;
      max-width: 680px;
      margin-top: 16px;
      color: #63758a;
      font-size: 17px;
      line-height: 1.55;
    }

    .home-link,
    .editor-head button,
    .entry-card button {
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
    }

    .save-banner {
      width: min(1180px, 100%);
      border: 1px solid rgba(8, 122, 70, 0.18);
      border-radius: 8px;
      background: rgba(223, 247, 234, 0.7);
      color: #087a46;
      margin: 0 auto 18px;
      padding: 12px 14px;
      font-weight: 620;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }

    .stat-card,
    .editor-card,
    .entry-list,
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

    .cms-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
      gap: 18px;
      align-items: start;
    }

    .editor-card,
    .entry-list {
      padding: 22px;
    }

    .editor-head,
    .entry-list__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .editor-head h2,
    .entry-list__head h2 {
      margin: 0;
      font-size: 24px;
      line-height: 1.16;
    }

    .editor-card label {
      display: grid;
      gap: 7px;
      margin-bottom: 14px;
    }

    .editor-card label span {
      color: #456782;
      font-size: 12px;
      font-weight: 720;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .editor-card input,
    .editor-card select,
    .editor-card textarea {
      width: 100%;
      border: 1px solid #d9e4ec;
      border-radius: 8px;
      background: #ffffff;
      color: #0a2540;
      font: inherit;
      padding: 11px 12px;
    }

    .editor-card textarea {
      resize: vertical;
    }

    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .entry-list {
      display: grid;
      gap: 12px;
    }

    .entry-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      border: 1px solid #d9e4ec;
      border-radius: 10px;
      padding: 16px;
    }

    .entry-card small {
      color: #087a46;
      font-size: 11px;
      font-weight: 760;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .entry-card h3 {
      margin: 8px 0 8px;
      font-size: 18px;
      line-height: 1.24;
    }

    .entry-card p {
      margin: 0;
      color: #63758a;
      font-size: 14px;
      line-height: 1.5;
    }

    .entry-card span {
      display: block;
      margin-top: 10px;
      color: #456782;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      overflow-wrap: anywhere;
    }

    .entry-card button {
      border-color: rgba(10, 37, 64, 0.14);
      background: #ffffff;
      color: #0a2540;
      box-shadow: none;
    }

    .empty-state {
      border: 1px dashed #c8d6df;
      border-radius: 10px;
      color: #63758a;
      margin: 0;
      padding: 20px;
    }

    .cms-admin--locked {
      display: grid;
      place-items: center;
    }

    .locked-card {
      width: min(620px, 100%);
      padding: 28px;
    }

    @media (max-width: 860px) {
      .cms-admin {
        padding: 20px;
      }

      .cms-hero,
      .cms-layout {
        grid-template-columns: 1fr;
      }

      .cms-hero,
      .editor-head {
        flex-direction: column;
      }

      .stat-grid,
      .field-grid {
        grid-template-columns: 1fr;
      }

      .entry-card {
        grid-template-columns: 1fr;
      }
    }
  `;
}
