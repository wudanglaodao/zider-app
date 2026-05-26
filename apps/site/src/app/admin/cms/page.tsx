import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BookOpenText, FileText, MessageSquareText, Search } from "lucide-react";

import { requireAdminSession } from "@/lib/account/session";
import { getCmsCategoryName } from "@/lib/cms/categories";
import { getCmsStats, listCmsEntries, type CmsContentType, type CmsEntry, type CmsEntryStatus } from "@/lib/cms/content";
import { forumCommunitySpace, getForumEntryModule } from "@/lib/cms/forum-modules";

import { archiveCmsEntryAction } from "./actions";
import { CmsAdminChrome, StatCard } from "./_components/CmsAdminChrome";

export const metadata: Metadata = {
  title: "ZIDER CMS",
};

type AdminCmsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type CmsTypeFilter = CmsContentType | "all";
type CmsStatusFilter = CmsEntryStatus | "all";

type CmsAdminFilters = {
  group: string;
  query: string;
  status: CmsStatusFilter;
  type: CmsTypeFilter;
};

type StructureGroup = {
  count: number;
  icon: "blog" | "forum";
  key: string;
  label: string;
  type: CmsContentType;
};

export default async function AdminCmsPage({ searchParams }: AdminCmsPageProps) {
  const params = (await searchParams) ?? {};
  const saved = readSearchParam(params.saved);
  const filters = parseCmsFilters(params);

  await requireAdminSession("/admin/cms");

  const { entries, setupError, stats } = await loadCmsAdminData();
  const structureGroups = buildStructureGroups(entries);
  const filteredEntries = filterCmsEntries(entries, filters);

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
        <StatCard label="Archived" value={stats.archived} />
        <StatCard label="Blog" value={stats.blog} />
        <StatCard label="Forum" value={stats.forum} />
      </section>

      <section className="cms-section control-card" aria-label="Content filters">
        <div className="filter-row">
          <div className="filter-tabs" aria-label="Content type">
            <a aria-current={filters.type === "all" ? "page" : undefined} href={buildCmsAdminHref(filters, { type: "all", group: "" })}>
              All
              <span>{stats.total}</span>
            </a>
            <a aria-current={filters.type === "blog" ? "page" : undefined} href={buildCmsAdminHref(filters, { type: "blog", group: "" })}>
              Blog
              <span>{stats.blog}</span>
            </a>
            <a aria-current={filters.type === "forum" ? "page" : undefined} href={buildCmsAdminHref(filters, { type: "forum", group: "" })}>
              Forum
              <span>{stats.forum}</span>
            </a>
          </div>

          <form action="/admin/cms" className="cms-search-form">
            <input name="type" type="hidden" value={filters.type} />
            <input name="status" type="hidden" value={filters.status} />
            <input name="group" type="hidden" value={filters.group} />
            <label>
              <Search aria-hidden="true" size={17} />
              <span className="sr-only">Search CMS content</span>
              <input defaultValue={filters.query} name="q" placeholder="Search title, slug, tag, or module" />
            </label>
            <button className="cms-button" type="submit">
              Search
            </button>
          </form>
        </div>

        <div className="status-tabs" aria-label="Content status">
          {(["all", "published", "draft", "archived"] as const).map((status) => (
            <a
              aria-current={filters.status === status ? "page" : undefined}
              href={buildCmsAdminHref(filters, { status })}
              key={status}
            >
              {status === "all" ? "All status" : capitalize(status)}
            </a>
          ))}
        </div>
      </section>

      <section className="cms-section structure-card" aria-labelledby="content-structure-heading">
        <div className="table-head">
          <div>
            <p className="table-card__eyebrow">Structure</p>
            <h2 id="content-structure-heading">Content spaces</h2>
          </div>
          <a className="cms-button-muted" href="/admin/cms">
            Clear filters
          </a>
        </div>

        <div className="structure-grid">
          <StructureColumn
            filters={filters}
            groups={structureGroups.filter((group) => group.type === "blog")}
            icon={<BookOpenText aria-hidden="true" size={18} />}
            title="Blog categories"
          />
          <StructureColumn
            filters={filters}
            groups={structureGroups.filter((group) => group.type === "forum")}
            icon={<MessageSquareText aria-hidden="true" size={18} />}
            title="Forum spaces"
          />
        </div>
      </section>

      <section className="cms-section table-card" aria-labelledby="entries-heading">
        <div className="table-head">
          <div>
            <p className="table-card__eyebrow">Entries</p>
            <h2 id="entries-heading">{filteredEntries.length} content items</h2>
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

        {filteredEntries.length ? (
          <ContentLibrary entries={filteredEntries} />
        ) : (
          <p className="empty-state">No matching CMS entries. Clear filters or add a Blog post or Forum answer.</p>
        )}
      </section>
    </CmsAdminChrome>
  );
}

function StructureColumn({
  filters,
  groups,
  icon,
  title,
}: {
  filters: CmsAdminFilters;
  groups: StructureGroup[];
  icon: ReactNode;
  title: string;
}) {
  return (
    <article className="structure-column">
      <div className="structure-column__head">
        <span>{icon}</span>
        <strong>{title}</strong>
      </div>
      <div className="structure-links">
        {groups.length ? (
          groups.map((group) => (
            <a
              aria-current={filters.group === group.key && filters.type === group.type ? "page" : undefined}
              href={buildCmsAdminHref(filters, { group: group.key, type: group.type })}
              key={`${group.type}-${group.key}`}
            >
              <span>{group.label}</span>
              <small>{group.count}</small>
            </a>
          ))
        ) : (
          <p>No content yet.</p>
        )}
      </div>
    </article>
  );
}

function ContentLibrary({ entries }: { entries: CmsEntry[] }) {
  return (
    <div className="content-library-list">
      {entries.map((entry) => {
        const structure = getEntryStructure(entry);

        return (
          <article className="content-library-card" key={entry.id}>
            <div className="content-library-icon" data-type={entry.contentType}>
              {entry.contentType === "blog" ? (
                <BookOpenText aria-hidden="true" size={19} />
              ) : (
                <MessageSquareText aria-hidden="true" size={19} />
              )}
            </div>

            <div className="content-library-main">
              <div className="content-library-meta">
                <span className="type-pill">{entry.contentType}</span>
                <span className="status-pill" data-status={entry.status}>
                  {entry.status}
                </span>
                <span>{structure.label}</span>
                <span>{formatDate(entry.updatedAt)}</span>
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.excerpt || "No excerpt yet."}</p>
              <div className="entry-route">
                <FileText aria-hidden="true" size={14} />
                <span>/{entry.contentType}/{entry.slug}</span>
              </div>
            </div>

            <div className="content-library-actions">
              <a className="cms-button-secondary" href={`/admin/cms/${entry.id}/edit`}>
                Edit
              </a>
              <a className="cms-button-muted" href={`/${entry.contentType}/${entry.slug}`}>
                View
              </a>
              {entry.status !== "archived" ? (
                <form action={archiveCmsEntryAction}>
                  <input name="id" type="hidden" value={entry.id} />
                  <button type="submit">Archive</button>
                </form>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
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

function parseCmsFilters(params: Record<string, string | string[] | undefined>): CmsAdminFilters {
  const type = readSearchParam(params.type);
  const status = readSearchParam(params.status);

  return {
    group: readSearchParam(params.group),
    query: readSearchParam(params.q),
    status: isCmsStatusFilter(status) ? status : "all",
    type: isCmsTypeFilter(type) ? type : "all",
  };
}

function filterCmsEntries(entries: CmsEntry[], filters: CmsAdminFilters) {
  const query = normalizeFilterValue(filters.query);

  return entries.filter((entry) => {
    const structure = getEntryStructure(entry);

    if (filters.type !== "all" && entry.contentType !== filters.type) {
      return false;
    }

    if (filters.status !== "all" && entry.status !== filters.status) {
      return false;
    }

    if (filters.group && structure.key !== filters.group) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = normalizeFilterValue(
      [entry.title, entry.slug, entry.excerpt, entry.tags.join(" "), structure.label, entry.authorName]
        .filter(Boolean)
        .join(" "),
    );

    return query.split(" ").every((term) => haystack.includes(term));
  });
}

function buildStructureGroups(entries: CmsEntry[]) {
  const groups = new Map<string, StructureGroup>();

  for (const entry of entries) {
    const structure = getEntryStructure(entry);
    const groupKey = `${entry.contentType}:${structure.key}`;
    const current = groups.get(groupKey);

    if (current) {
      current.count += 1;
    } else {
      groups.set(groupKey, {
        count: 1,
        icon: entry.contentType,
        key: structure.key,
        label: structure.label,
        type: entry.contentType,
      });
    }
  }

  return Array.from(groups.values()).sort((first, second) => {
    if (first.type !== second.type) {
      return first.type.localeCompare(second.type);
    }

    return second.count - first.count || first.label.localeCompare(second.label);
  });
}

function getEntryStructure(entry: CmsEntry) {
  if (entry.contentType === "blog") {
    const label = getCmsCategoryName(entry);

    return {
      key: slugifyFilterValue(label),
      label,
    };
  }

  const module = getForumEntryModule(entry) ?? forumCommunitySpace;

  return {
    key: module.key,
    label: module.name,
  };
}

function buildCmsAdminHref(current: CmsAdminFilters, updates: Partial<CmsAdminFilters>) {
  const next = {
    ...current,
    ...updates,
  };
  const params = new URLSearchParams();

  if (next.type !== "all") {
    params.set("type", next.type);
  }

  if (next.status !== "all") {
    params.set("status", next.status);
  }

  if (next.group) {
    params.set("group", next.group);
  }

  if (next.query) {
    params.set("q", next.query);
  }

  const query = params.toString();

  return query ? `/admin/cms?${query}` : "/admin/cms";
}

function normalizeFilterValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, " ")
    .trim();
}

function slugifyFilterValue(value: string) {
  return normalizeFilterValue(value).replace(/\s+/g, "-") || "article";
}

function isCmsTypeFilter(value: string): value is CmsTypeFilter {
  return value === "all" || value === "blog" || value === "forum";
}

function isCmsStatusFilter(value: string): value is CmsStatusFilter {
  return value === "all" || value === "published" || value === "draft" || value === "archived";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
