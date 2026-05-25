import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import {
  formatPublishedDate,
  getCompactExcerpt,
  getVisiblePages,
  type ForumSort,
} from "@/app/forum/_lib/forum-listing";
import { ForumSpaceIcon } from "@/app/forum/_components/ForumSpaceIcon";
import { forumCommunitySpace, getForumEntryModule } from "@/lib/cms/forum-modules";
import type { CmsEntry } from "@/lib/cms/content";

export function ForumContentList({ emptyLabel, entries }: { emptyLabel: string; entries: CmsEntry[] }) {
  return (
    <div className="contentList" aria-label="Forum posts">
      {entries.length ? (
        entries.map((entry) => <ForumContentCard entry={entry} href={`/forum/${entry.slug}`} key={entry.id} />)
      ) : (
        <p className="emptyState">{emptyLabel}</p>
      )}
    </div>
  );
}

export function ForumSortTabs({
  baseHref,
  query,
  sort,
  totalCount,
}: {
  baseHref: string;
  query?: string;
  sort: ForumSort;
  totalCount: number;
}) {
  return (
    <nav className="forumSortTabs" aria-label="Forum sorting">
      <a aria-current={sort === "new" ? "page" : undefined} href={getSortHref(baseHref, "new", query)}>
        New ({totalCount})
      </a>
      <a aria-current={sort === "hot" ? "page" : undefined} href={getSortHref(baseHref, "hot", query)}>
        Hot
      </a>
    </nav>
  );
}

export function ForumPagination({
  baseHref,
  currentPage,
  query,
  sort,
  totalPages,
}: {
  baseHref: string;
  currentPage: number;
  query?: string;
  sort: ForumSort;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(currentPage, totalPages);
  let lastPage = 0;

  return (
    <nav className="pagination" aria-label="Forum pagination">
      <PaginationLink
        className="paginationStep"
        disabled={currentPage === 1}
        href={getListingHref(baseHref, currentPage - 1, sort, query)}
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
                <a className="paginationPage" href={getListingHref(baseHref, page, sort, query)}>
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
        href={getListingHref(baseHref, currentPage + 1, sort, query)}
      >
        Next
      </PaginationLink>
    </nav>
  );
}

function ForumContentCard({ entry, href }: { entry: CmsEntry; href: string }) {
  const module = getForumEntryModule(entry) ?? forumCommunitySpace;
  const publishedDate = formatPublishedDate(entry.publishedAt || entry.createdAt);

  return (
    <a className="contentCard" href={href}>
      <span className="contentCardIcon">
        <ForumSpaceIcon icon={module.icon} size={18} />
      </span>
      <div className="contentCardCopy">
        <div className="contentCardMeta">
          <span>{module.name}</span>
          {publishedDate ? <time dateTime={entry.publishedAt || entry.createdAt}>{publishedDate}</time> : null}
        </div>
        <h2>{entry.title}</h2>
        <p>{getCompactExcerpt(entry)}</p>
      </div>
      <span className="contentCardArrow">
        <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2.2} />
      </span>
    </a>
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

function getSortHref(baseHref: string, sort: ForumSort, query?: string) {
  return getListingHref(baseHref, 1, sort, query);
}

function getListingHref(baseHref: string, page: number, sort: ForumSort, query?: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (sort === "hot") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${baseHref}?${queryString}` : baseHref;
}
