import type { Metadata } from "next";

import { requireAdminSession } from "@/lib/account/session";
import { getCmsStats, listCmsEntries, type CmsEntry } from "@/lib/cms/content";

import { archiveCmsEntryAction } from "./actions";
import { CmsAdminChrome, StatCard } from "./_components/CmsAdminChrome";

export const metadata: Metadata = {
  title: "ZIDER CMS",
};

type AdminCmsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCmsPage({ searchParams }: AdminCmsPageProps) {
  const params = (await searchParams) ?? {};
  const saved = readSearchParam(params.saved);

  await requireAdminSession("/admin/cms");

  const { entries, setupError, stats } = await loadCmsAdminData();

  return (
    <CmsAdminChrome
      actions={
        <>
          <a className="cms-button-secondary" href="/">
            View site
          </a>
          <a className="cms-button" href="/admin/cms/new?type=blog">
            New Blog
          </a>
          <a className="cms-button" href="/admin/cms/new?type=forum">
            New Forum
          </a>
        </>
      }
      description="Browse, edit, and publish migrated Blog and Forum content."
      title="Content library"
    >
      {saved ? <p className="save-banner">Content saved.</p> : null}
      {setupError ? <p className="setup-banner">{setupError}</p> : null}

      <section className="stat-grid" aria-label="CMS stats">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Draft" value={stats.draft} />
        <StatCard label="Blog" value={stats.blog} />
        <StatCard label="Forum" value={stats.forum} />
      </section>

      <section className="cms-section table-card" aria-labelledby="entries-heading">
        <div className="table-head">
          <div>
            <p className="table-card__eyebrow">Entries</p>
            <h2 id="entries-heading">All content</h2>
          </div>
          <div className="inline-actions">
            <a className="cms-button-secondary" href="/admin/cms/new?type=blog">
              Add blog
            </a>
            <a className="cms-button-secondary" href="/admin/cms/new?type=forum">
              Add forum
            </a>
          </div>
        </div>

        {entries.length ? (
          <ContentTable entries={entries} />
        ) : (
          <p className="empty-state">No CMS entries yet. Add a Blog post or Forum answer to get started.</p>
        )}
      </section>
    </CmsAdminChrome>
  );
}

function ContentTable({ entries }: { entries: CmsEntry[] }) {
  return (
    <table className="cms-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Status</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id}>
            <td>
              <div className="entry-title">
                {entry.title}
                <span>/{entry.contentType}/{entry.slug}</span>
              </div>
            </td>
            <td>
              <span className="type-pill">{entry.contentType}</span>
            </td>
            <td>
              <span className="status-pill" data-status={entry.status}>
                {entry.status}
              </span>
            </td>
            <td>
              <span className="entry-meta">{formatDate(entry.updatedAt)}</span>
            </td>
            <td>
              <div className="row-actions">
                <a className="cms-button-secondary" href={`/admin/cms/${entry.id}/edit`}>
                  Edit
                </a>
                <a className="cms-button-muted" href={`/${entry.contentType}/${entry.slug}`}>
                  View
                </a>
                <form action={archiveCmsEntryAction}>
                  <input name="id" type="hidden" value={entry.id} />
                  <button type="submit">Archive</button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

async function loadCmsAdminData() {
  try {
    const [entries, stats] = await Promise.all([listCmsEntries({ includeArchived: true }), getCmsStats()]);

    return {
      entries,
      setupError: "",
      stats,
    };
  } catch (error) {
    return {
      entries: [],
      setupError:
        error instanceof Error
          ? `CMS data is not ready yet: ${error.message}`
          : "CMS data is not ready yet.",
      stats: {
        archived: 0,
        blog: 0,
        draft: 0,
        forum: 0,
        published: 0,
        total: 0,
      },
    };
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
