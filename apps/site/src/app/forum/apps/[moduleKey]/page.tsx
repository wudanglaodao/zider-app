import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { loadForumEntries } from "@/app/forum/_lib/forum-listing";
import { ForumSpaceIcon } from "@/app/forum/_components/ForumSpaceIcon";
import { PublicPage } from "@/app/_components/PublicChrome";
import type { CmsEntry } from "@/lib/cms/content";
import {
  forumCommunitySpace,
  getForumEntryModule,
  getForumModuleBySlug,
  getForumModuleHref,
  isForumCommunityEntry,
  type ForumModule,
} from "@/lib/cms/forum-modules";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type ForumModuleSearchParams = {
  page?: string | string[];
};

type ForumModulePageProps = {
  params: Promise<{
    moduleKey: string;
  }>;
  searchParams?: Promise<ForumModuleSearchParams>;
};

export default async function ForumModulePage({ params, searchParams }: ForumModulePageProps) {
  const { moduleKey } = await params;
  const query: ForumModuleSearchParams = searchParams ? await searchParams : {};
  const module = getForumSpaceBySlug(moduleKey);

  if (!module) {
    notFound();
  }

  const isCommunitySpace = module.key === forumCommunitySpace.key;
  const entries = await loadModuleEntries(module.key);
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(parsePageParam(query.page), totalPages);
  const pageEntries = entries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const moduleHref = getForumModuleHref(module);

  return (
    <PublicPage>
      <main className="forumModulePage">
        <style>{getModulePageCss()}</style>

        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/forum">Forum</a>
          <span>/</span>
          <strong>{module.name}</strong>
        </nav>

        <section className="moduleHero" aria-labelledby="module-title">
          <div className="moduleHeroLabel">
            <span className="moduleHeroIcon">
              <ForumSpaceIcon icon={module.icon} />
            </span>
            <p>{isCommunitySpace ? "Public space" : "App module"}</p>
          </div>
          <div className="moduleHeroTitle">
            <h1 id="module-title">{module.name}</h1>
            <span>{formatPostCount(entries.length)}</span>
          </div>
          <p className="moduleHeroDescription">{module.description}</p>
        </section>

        <section className="modulePosts" aria-labelledby="module-posts">
          <h2 className="srOnly" id="module-posts">
            {module.name} articles
          </h2>

          <div className="modulePostList">
            {pageEntries.length ? (
              pageEntries.map((entry) => <ModulePostCard entry={entry} key={entry.id} module={module} />)
            ) : (
              <p className="emptyState">No published answers in this app module yet.</p>
            )}
          </div>

          <Pagination baseHref={moduleHref} currentPage={currentPage} totalPages={totalPages} />
        </section>
      </main>
    </PublicPage>
  );
}

function getForumSpaceBySlug(slug: string) {
  return slug === forumCommunitySpace.key ? forumCommunitySpace : getForumModuleBySlug(slug);
}

async function loadModuleEntries(moduleKey: string) {
  const filterByModule = (entries: CmsEntry[]) =>
    moduleKey === forumCommunitySpace.key
      ? entries.filter(isForumCommunityEntry)
      : entries.filter((entry) => getForumEntryModule(entry)?.key === moduleKey);

  return filterByModule(await loadForumEntries());
}

function Pagination({ baseHref, currentPage, totalPages }: { baseHref: string; currentPage: number; totalPages: number }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(currentPage, totalPages);
  let lastPage = 0;

  return (
    <nav className="pagination" aria-label="Article pagination">
      <PaginationLink
        className="paginationStep"
        disabled={currentPage === 1}
        href={getPageHref(baseHref, currentPage - 1)}
      >
        Previous
      </PaginationLink>

      <div className="paginationPages">
        {pages.map((page) => {
          const showEllipsis = page - lastPage > 1;
          lastPage = page;

          return (
            <span className="paginationGroup" key={page}>
              {showEllipsis ? <span className="paginationEllipsis">...</span> : null}
              {page === currentPage ? (
                <span className="paginationCurrent" aria-current="page">
                  {page}
                </span>
              ) : (
                <a className="paginationPage" href={getPageHref(baseHref, page)}>
                  {page}
                </a>
              )}
            </span>
          );
        })}
      </div>

      <PaginationLink
        className="paginationStep"
        disabled={currentPage === totalPages}
        href={getPageHref(baseHref, currentPage + 1)}
      >
        Next
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  children,
  className,
  disabled,
  href,
}: {
  children: ReactNode;
  className: string;
  disabled: boolean;
  href: string;
}) {
  if (disabled) {
    return <span className={`${className} paginationDisabled`}>{children}</span>;
  }

  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

function parsePageParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(rawValue || "1", 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

function getPageHref(baseHref: string, page: number) {
  return page <= 1 ? baseHref : `${baseHref}?page=${page}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  return Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]))
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

function ModulePostCard({ entry, module }: { entry: CmsEntry; module: ForumModule }) {
  return (
    <a className="modulePostCard" href={`/forum/${entry.slug}`}>
      <span className="modulePostIcon">
        <ForumSpaceIcon icon={module.icon} size={18} />
      </span>
      <div className="modulePostCopy">
        <span className="modulePostDate">{formatPublishedDate(entry.publishedAt || entry.createdAt)}</span>
        <h3>{entry.title}</h3>
        <p>{getCompactExcerpt(entry)}</p>
      </div>
      <span className="modulePostArrow">
        <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2.2} />
      </span>
    </a>
  );
}

function getCompactExcerpt(entry: CmsEntry) {
  const excerpt = entry.excerpt || "Read the latest community answer.";
  return excerpt.length > 150 ? `${excerpt.slice(0, 147).trim()}...` : excerpt;
}

function formatPostCount(count: number) {
  return `${count} ${count === 1 ? "post" : "posts"}`;
}

function formatPublishedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getModulePageCss() {
  return `
    .forumModulePage {
      width: var(--public-page-width);
      margin: 0 auto;
      padding: 44px 0 108px;
    }

    .srOnly {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      color: #7b8b9d;
      font-size: 13px;
      font-weight: 650;
      line-height: 1.4;
    }

    .breadcrumb a {
      color: #53677e;
      transition: color 160ms ease;
    }

    .breadcrumb a:hover {
      color: var(--zider-green);
    }

    .breadcrumb strong {
      color: var(--zider-green);
      font-weight: 760;
    }

    .moduleHero {
      max-width: none;
      border-bottom: 1px solid var(--zider-line);
      padding: 22px 0 24px;
    }

    .moduleHeroLabel p,
    .modulePostDate {
      margin: 0;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 820;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .moduleHeroLabel {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .moduleHeroIcon {
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(8, 122, 70, 0.12);
      border-radius: 8px;
      background: #f1f8f4;
      color: var(--zider-green);
    }

    .moduleHeroTitle {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 18px;
      margin-top: 8px;
    }

    .moduleHero h1 {
      max-width: 640px;
      margin: 0;
      color: #060b3c;
      font-size: clamp(27px, 2.9vw, 40px);
      font-weight: 700;
      line-height: 1.08;
      letter-spacing: 0;
      text-wrap: balance;
    }

    .moduleHeroTitle > span {
      color: var(--zider-muted);
      font-size: 13px;
      font-weight: 720;
      line-height: 1;
      white-space: nowrap;
    }

    .moduleHeroDescription {
      max-width: 620px;
      margin: 12px 0 0;
      color: var(--zider-muted);
      font-size: 15px;
      line-height: 1.54;
    }

    .modulePosts {
      margin-top: 18px;
    }

    .modulePostList {
      display: grid;
      gap: 10px;
      border-top: 0;
    }

    .modulePostCard {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: 14px;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 8px;
      background: linear-gradient(180deg, #ffffff 0%, #fdfefd 100%);
      padding: 16px;
      transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    }

    .modulePostCard:hover {
      border-color: rgba(8, 122, 70, 0.22);
      background: #ffffff;
      box-shadow: 0 12px 28px rgba(10, 37, 64, 0.055);
      transform: translateY(-1px);
    }

    .modulePostIcon {
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(8, 122, 70, 0.12);
      border-radius: 8px;
      background: #f1f8f4;
      color: var(--zider-green);
    }

    .modulePostCopy {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .modulePostCard h3 {
      max-width: 780px;
      margin: 0;
      color: var(--zider-ink);
      font-size: clamp(18px, 1.45vw, 23px);
      font-weight: 650;
      line-height: 1.2;
      letter-spacing: 0;
      transition: color 160ms ease;
    }

    .modulePostCard:hover h3 {
      color: #07683f;
    }

    .modulePostCard p,
    .emptyState {
      max-width: 720px;
      margin: 0;
      color: var(--zider-muted);
      font-size: 14px;
      line-height: 1.56;
    }

    .modulePostCard p {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }

    .modulePostArrow {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 999px;
      color: #7b8b9d;
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 160ms ease, transform 160ms ease, color 160ms ease, border-color 160ms ease;
    }

    .modulePostCard:hover .modulePostArrow {
      border-color: rgba(8, 122, 70, 0.2);
      color: var(--zider-green);
      opacity: 1;
      transform: translateX(0);
    }

    .emptyState {
      border: 1px solid var(--zider-line);
      border-radius: 8px;
      padding: 18px;
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 24px;
    }

    .paginationPages,
    .paginationGroup {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .paginationPages {
      flex-wrap: wrap;
      justify-content: center;
    }

    .paginationStep,
    .paginationPage,
    .paginationCurrent,
    .paginationDisabled,
    .paginationEllipsis {
      min-width: 36px;
      min-height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--zider-line);
      border-radius: 6px;
      color: var(--zider-ink);
      font-size: 14px;
      font-weight: 720;
      line-height: 1;
    }

    .paginationStep {
      min-width: 88px;
      padding: 0 14px;
    }

    .paginationPage,
    .paginationStep {
      transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
    }

    .paginationPage:hover,
    .paginationStep:hover {
      border-color: rgba(8, 122, 70, 0.36);
      background: #f8fcfa;
      color: var(--zider-green);
    }

    .paginationCurrent {
      border-color: var(--zider-green);
      background: var(--zider-green);
      color: #ffffff;
    }

    .paginationDisabled {
      color: #9aa8b7;
      cursor: default;
      opacity: 0.72;
    }

    .paginationEllipsis {
      min-width: auto;
      border-color: transparent;
      color: #8b9aab;
      padding: 0 2px;
    }

    @media (max-width: 820px) {
      .forumModulePage {
        width: calc(100% - 36px);
        padding: 46px 0 86px;
      }

      .moduleHero {
        padding: 20px 0 24px;
      }

      .moduleHeroTitle {
        align-items: flex-start;
        flex-direction: column;
        gap: 10px;
      }

      .modulePostCard:hover {
        transform: none;
      }

      .modulePostCard {
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
      }

      .modulePostIcon,
      .modulePostArrow {
        display: none;
      }

      .pagination {
        justify-content: flex-start;
        flex-wrap: wrap;
      }

      .paginationPages {
        order: 3;
        width: 100%;
        justify-content: flex-start;
      }
    }
  `;
}
