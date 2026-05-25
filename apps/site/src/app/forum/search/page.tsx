import { ForumContentList, ForumPagination, ForumSortTabs } from "@/app/forum/_components/ForumPostList";
import { ForumSearchForm } from "@/app/forum/_components/ForumSearchForm";
import {
  FORUM_PAGE_SIZE,
  getFirstQueryValue,
  loadForumEntries,
  parseForumSort,
  parsePageParam,
  searchForumEntries,
  sortForumEntries,
} from "@/app/forum/_lib/forum-listing";
import { PublicPage } from "@/app/_components/PublicChrome";

export const dynamic = "force-dynamic";

type ForumSearchPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
    q?: string | string[];
    sort?: string | string[];
  }>;
};

export default async function ForumSearchPage({ searchParams }: ForumSearchPageProps) {
  const queryParams = searchParams ? await searchParams : {};
  const searchQuery = getFirstQueryValue(queryParams.q);
  const sort = parseForumSort(queryParams.sort);
  const entries = await loadForumEntries();
  const matchingEntries = searchForumEntries(entries, searchQuery);
  const sortedEntries = sortForumEntries(matchingEntries, sort);
  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / FORUM_PAGE_SIZE));
  const currentPage = Math.min(parsePageParam(queryParams.page), totalPages);
  const pageEntries = sortedEntries.slice((currentPage - 1) * FORUM_PAGE_SIZE, currentPage * FORUM_PAGE_SIZE);

  return (
    <PublicPage>
      <main className="forumSearchPage">
        <style>{getSearchPageCss()}</style>

        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/forum">Forum</a>
          <span>/</span>
          <strong>Search</strong>
        </nav>

        <section className="searchHero" aria-labelledby="forum-search-title">
          <p>Search</p>
          <h1 id="forum-search-title">{searchQuery ? `Results for "${searchQuery}"` : "Search the community"}</h1>
        </section>

        <section className="forumSearchBlock" aria-label="Search forum">
          <ForumSearchForm defaultQuery={searchQuery} sort={sort} />
        </section>

        <section className="forumPosts" aria-label="Search results">
          <div className="forumPostToolbar">
            <ForumSortTabs baseHref="/forum/search" query={searchQuery} sort={sort} totalCount={matchingEntries.length} />
          </div>
          <ForumContentList
            emptyLabel={searchQuery ? "No matching community posts yet." : "Search by topic, tag, or app category."}
            entries={pageEntries}
          />
          <ForumPagination
            baseHref="/forum/search"
            currentPage={currentPage}
            query={searchQuery}
            sort={sort}
            totalPages={totalPages}
          />
        </section>
      </main>
    </PublicPage>
  );
}

function getSearchPageCss() {
  return `
    .forumSearchPage {
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

    .searchHero {
      border-bottom: 1px solid var(--zider-line);
      padding: 26px 0 22px;
    }

    .searchHero p {
      margin: 0;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 820;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .searchHero h1 {
      max-width: 820px;
      margin: 8px 0 0;
      color: #060b3c;
      font-size: clamp(30px, 4vw, 48px);
      font-weight: 700;
      line-height: 1.06;
      letter-spacing: 0;
      text-wrap: balance;
    }

    .forumSearchBlock {
      margin: 22px 0 24px;
      padding: 20px 0;
      background-image: radial-gradient(rgba(10, 37, 64, 0.12) 1px, transparent 1px);
      background-size: 12px 12px;
    }

    .forumSearchForm {
      width: min(760px, 100%);
      min-height: 58px;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      border: 1px solid rgba(10, 37, 64, 0.16);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.96);
      margin: 0 auto;
      padding: 5px 5px 5px 18px;
      box-shadow: 0 14px 34px rgba(10, 37, 64, 0.06);
    }

    .forumSearchForm:focus-within {
      border-color: rgba(8, 122, 70, 0.34);
      box-shadow: 0 16px 36px rgba(8, 122, 70, 0.09);
    }

    .forumSearchIcon {
      display: inline-flex;
      color: #0a2540;
    }

    .forumSearchForm input[type="search"] {
      min-width: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: #0a2540;
      font: inherit;
      font-size: 15px;
    }

    .forumSearchForm input[type="search"]::placeholder {
      color: #76879a;
    }

    .forumSearchForm button {
      min-width: 92px;
      min-height: 46px;
      border: 0;
      border-radius: 999px;
      background: #030303;
      color: #ffffff;
      font: inherit;
      font-size: 14px;
      font-weight: 720;
      cursor: pointer;
      transition: background 160ms ease, transform 160ms ease;
    }

    .forumSearchForm button:hover {
      background: #141414;
      transform: translateY(-1px);
    }

    .forumPosts {
      margin-top: 18px;
    }

    .forumPostToolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .forumSortTabs {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 999px;
      background: #f7faf9;
      padding: 4px;
    }

    .forumSortTabs a {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      color: #53677e;
      font-size: 14px;
      font-weight: 680;
      line-height: 1;
      padding: 0 14px;
      transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
    }

    .forumSortTabs a:hover {
      color: var(--zider-green);
    }

    .forumSortTabs a[aria-current="page"] {
      background: #ffffff;
      color: var(--zider-green);
      box-shadow: 0 6px 16px rgba(10, 37, 64, 0.08);
    }

    .contentList {
      display: grid;
      gap: 10px;
      border-top: 0;
    }

    .contentCard {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: 14px;
      min-height: 0;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 8px;
      background: linear-gradient(180deg, #ffffff 0%, #fdfefd 100%);
      padding: 16px;
      transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    }

    .contentCard:hover {
      border-color: rgba(8, 122, 70, 0.22);
      background: #ffffff;
      box-shadow: 0 12px 28px rgba(10, 37, 64, 0.055);
      transform: translateY(-1px);
    }

    .contentCardIcon {
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

    .contentCardCopy {
      display: grid;
      gap: 9px;
      min-width: 0;
    }

    .contentCardMeta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .contentCardMeta span,
    .contentCardMeta time {
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .contentCardMeta time {
      color: #7b8b9d;
      letter-spacing: 0.04em;
    }

    .contentCardMeta time::before {
      content: "";
      width: 4px;
      height: 4px;
      display: inline-block;
      margin: 0 8px 2px 0;
      border-radius: 999px;
      background: rgba(83, 103, 126, 0.45);
    }

    .contentCard h2 {
      max-width: 780px;
      margin: 0;
      color: var(--zider-ink);
      font-size: clamp(18px, 1.45vw, 23px);
      font-weight: 650;
      line-height: 1.2;
      letter-spacing: 0;
      transition: color 160ms ease;
    }

    .contentCard:hover h2 {
      color: #07683f;
    }

    .contentCard p,
    .emptyState {
      margin: 0;
      color: var(--zider-muted);
      line-height: 1.62;
    }

    .contentCard p {
      max-width: 760px;
      display: -webkit-box;
      overflow: hidden;
      font-size: 14px;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }

    .contentCardArrow {
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

    .contentCard:hover .contentCardArrow {
      border-color: rgba(8, 122, 70, 0.2);
      color: var(--zider-green);
      opacity: 1;
      transform: translateX(0);
    }

    .emptyState {
      border: 1px solid var(--zider-line);
      border-radius: 8px;
      padding: 18px;
      font-size: 15px;
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
      .forumSearchPage {
        width: calc(100% - 36px);
        padding: 46px 0 86px;
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

      .contentCard {
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
      }

      .contentCardIcon,
      .contentCardArrow {
        display: none;
      }
    }

    @media (max-width: 560px) {
      .forumSearchForm {
        min-height: auto;
        grid-template-columns: auto minmax(0, 1fr);
        border-radius: 18px;
        padding: 12px;
      }

      .forumSearchForm button {
        grid-column: 1 / -1;
        width: 100%;
      }

      .contentCard:hover {
        transform: none;
      }
    }
  `;
}
