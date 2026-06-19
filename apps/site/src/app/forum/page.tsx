import { MessageSquareText } from "lucide-react";

import { ForumContentList, ForumPagination, ForumSortTabs } from "@/app/forum/_components/ForumPostList";
import { ForumSearchForm } from "@/app/forum/_components/ForumSearchForm";
import { ForumSpaceIcon } from "@/app/forum/_components/ForumSpaceIcon";
import {
  FORUM_PAGE_SIZE,
  formatPostCount,
  loadForumEntries,
  parseForumSort,
  parsePageParam,
  sortForumEntries,
} from "@/app/forum/_lib/forum-listing";
import { PublicPage } from "@/app/_components/PublicChrome";
import type { CmsEntry } from "@/lib/cms/content";
import {
  forumCommunitySpace,
  forumModuleGroups,
  getForumEntryModule,
  getForumModuleHref,
  isForumCommunityEntry,
  type ForumModuleGroup,
  type ForumModule,
} from "@/lib/cms/forum-modules";

export const dynamic = "force-dynamic";

type ForumPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
    sort?: string | string[];
  }>;
};

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const query = searchParams ? await searchParams : {};
  const sort = parseForumSort(query.sort);
  const entries = await loadForumEntries();
  const sortedEntries = sortForumEntries(entries, sort);
  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / FORUM_PAGE_SIZE));
  const currentPage = Math.min(parsePageParam(query.page), totalPages);
  const pageEntries = sortedEntries.slice((currentPage - 1) * FORUM_PAGE_SIZE, currentPage * FORUM_PAGE_SIZE);
  const moduleCounts = getModuleCounts(entries);
  const communityCount = entries.filter(isForumCommunityEntry).length;

  return (
    <PublicPage>
      <main className="forumPage">
        <style>{getContentListCss()}</style>
        <section className="forumHero" aria-labelledby="forum-title">
          <div className="forumHeroCopy">
            <p className="forumEyebrow">Community</p>
            <h1 id="forum-title">Forum</h1>
            <p>Community notes, setup guides, and reusable answers by ZIDER app.</p>
          </div>

          <aside className="forumHeroVisual" aria-label="Forum preview">
            <div className="forumVisualHeader">
              <MessageSquareText size={18} />
              <span>Latest answers</span>
            </div>
            <div className="forumVisualRows" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </aside>
        </section>

        <section className="forumSearchBlock" aria-label="Search forum">
          <ForumSearchForm sort={sort} />
        </section>

        <section className="forumModules" id="app-modules" aria-labelledby="app-modules-title">
          <div className="forumSectionHeader forumSectionHeaderInline">
            <div>
              <p id="app-modules-title">Spaces</p>
            </div>
          </div>

          <div className="forumSpaceGroups">
            <section className="forumSpaceGroup" data-group="community" aria-labelledby="forum-space-community">
              <ForumSpaceGroupHeader
                countLabel={formatSpaceCount(1)}
                description="Public notes, posting rules, and shared community updates."
                id="forum-space-community"
                label="Announcements"
                title={forumCommunitySpace.name}
              />
              <div className="forumModuleList">
                <ForumModuleCard count={communityCount} module={forumCommunitySpace} />
              </div>
            </section>

            {forumModuleGroups.map((group) => (
              <ForumModuleGroupSection group={group} key={group.key} moduleCounts={moduleCounts} />
            ))}
          </div>
        </section>

        <section className="forumPosts" aria-label="Latest answers" id="forum-posts">
          <div className="forumPostToolbar">
            <ForumSortTabs baseHref="/forum" sort={sort} totalCount={entries.length} />
          </div>
          <ForumContentList emptyLabel="No published community answers yet." entries={pageEntries} />
          <ForumPagination baseHref="/forum" currentPage={currentPage} sort={sort} totalPages={totalPages} />
        </section>
      </main>
    </PublicPage>
  );
}

function ForumModuleGroupSection({
  group,
  moduleCounts,
}: {
  group: ForumModuleGroup;
  moduleCounts: Map<string, number>;
}) {
  return (
    <section className="forumSpaceGroup" data-group={group.key} aria-labelledby={`forum-space-${group.key}`}>
      <ForumSpaceGroupHeader
        countLabel={formatSpaceCount(group.modules.length)}
        description={group.description}
        id={`forum-space-${group.key}`}
        label={group.name}
        title={group.name}
      />
      <div className="forumModuleList">
        {group.modules.map((module) => (
          <ForumModuleCard count={moduleCounts.get(module.key) ?? 0} key={module.key} module={module} />
        ))}
      </div>
    </section>
  );
}

function ForumSpaceGroupHeader({
  countLabel,
  description,
  id,
  label,
  title,
}: {
  countLabel: string;
  description: string;
  id: string;
  label: string;
  title: string;
}) {
  return (
    <div className="forumSpaceGroupHeader">
      <div>
        <p>{label}</p>
        <h2 id={id}>{title}</h2>
        <span>{description}</span>
      </div>
      <small>{countLabel}</small>
    </div>
  );
}

function ForumModuleCard({ count, module }: { count: number; module: ForumModule }) {
  const isCommunitySpace = module.key === forumCommunitySpace.key;

  return (
    <a
      className={`forumModuleCard${isCommunitySpace ? " forumModuleCardPublic" : ""}`}
      href={getForumModuleHref(module)}
    >
      <span className="forumModuleTop">
        <span className="forumModuleIcon">
          <ForumSpaceIcon icon={module.icon} />
        </span>
        <small>{formatPostCount(count)}</small>
      </span>
      <strong>{module.name}</strong>
      <span className="forumModuleDescription">{module.description}</span>
    </a>
  );
}

function getModuleCounts(entries: CmsEntry[]) {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const module = getForumEntryModule(entry);

    if (module) {
      counts.set(module.key, (counts.get(module.key) ?? 0) + 1);
    }
  }

  return counts;
}

function formatSpaceCount(count: number) {
  return `${count} ${count === 1 ? "space" : "spaces"}`;
}

function getContentListCss() {
  return `
    .forumPage {
      width: 100%;
      margin: 0;
      padding: 0 0 104px;
    }

    .srOnly {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }

    .forumHero {
      position: relative;
      isolation: isolate;
      display: grid;
      grid-template-columns: minmax(0, 760px) minmax(260px, 360px);
      align-items: center;
      gap: clamp(42px, 7vw, 96px);
      overflow: hidden;
      border: 0;
      border-radius: 0;
      background:
        radial-gradient(circle at 82% 18%, rgba(8, 122, 70, 0.12), rgba(8, 122, 70, 0) 34%),
        linear-gradient(135deg, #f8fcfa 0%, #ffffff 56%, #f2faf6 100%);
      margin-bottom: 28px;
      padding: clamp(40px, 4.8vw, 64px) calc((100% - var(--public-page-width)) / 2);
      box-shadow: none;
    }

    .forumHero::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      background-image:
        linear-gradient(rgba(8, 122, 70, 0.055) 1px, transparent 1px),
        linear-gradient(90deg, rgba(8, 122, 70, 0.055) 1px, transparent 1px);
      background-size: 38px 38px;
      opacity: 0.42;
      mask-image: linear-gradient(110deg, transparent 0%, #000 18%, #000 72%, transparent 100%);
    }

    .forumHeroCopy {
      min-width: 0;
    }

    .forumEyebrow,
    .forumVisualHeader span,
    .forumSectionHeader p {
      margin: 0;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 820;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .forumHero h1 {
      margin: 12px 0 14px;
      color: #060b3c;
      font-size: clamp(44px, 6vw, 72px);
      font-weight: 720;
      line-height: 0.98;
      letter-spacing: 0;
    }

    .forumHeroCopy > p:last-of-type {
      max-width: 620px;
      margin: 0;
      color: var(--zider-muted);
      font-size: clamp(16px, 1.55vw, 20px);
      line-height: 1.55;
    }

    .forumHeroVisual {
      min-height: 178px;
      align-self: center;
      border: 1px solid rgba(8, 122, 70, 0.14);
      border-radius: 14px;
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.58)),
        rgba(255, 255, 255, 0.72);
      padding: 20px;
      box-shadow: 0 20px 48px rgba(10, 37, 64, 0.06);
      backdrop-filter: blur(10px);
    }

    .forumVisualHeader {
      display: flex;
      align-items: center;
      gap: 9px;
      color: var(--zider-green);
    }

    .forumVisualRows {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }

    .forumVisualRows span {
      display: block;
      height: 28px;
      border: 1px solid rgba(8, 122, 70, 0.13);
      border-radius: 7px;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(235, 248, 241, 0.74));
    }

    .forumVisualRows span:nth-child(1) {
      width: 92%;
    }

    .forumVisualRows span:nth-child(2) {
      width: 100%;
    }

    .forumVisualRows span:nth-child(3) {
      width: 74%;
    }

    .forumSearchBlock {
      width: var(--public-page-width);
      margin: 0 auto 28px;
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

    .forumModules {
      margin-top: 0;
    }

    .forumModules,
    .forumPosts {
      width: var(--public-page-width);
      margin-right: auto;
      margin-left: auto;
      min-width: 0;
    }

    .forumSectionHeader {
      display: grid;
      gap: 0;
    }

    .forumSectionHeaderInline {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 24px;
    }

    .forumSectionHeader h2,
    .forumSpaceGroupHeader h2 {
      margin: 0;
      color: #0a2540;
      font-size: 24px;
      font-weight: 660;
      line-height: 1.08;
      letter-spacing: 0;
    }

    .forumSpaceGroups {
      display: grid;
      gap: 26px;
      margin-top: 12px;
    }

    .forumSpaceGroup {
      display: grid;
      gap: 14px;
      border-top: 1px solid rgba(10, 37, 64, 0.1);
      padding-top: 18px;
    }

    .forumSpaceGroupHeader {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
    }

    .forumSpaceGroupHeader p {
      margin: 0 0 8px;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 820;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .forumSpaceGroupHeader span {
      display: block;
      max-width: 560px;
      margin-top: 8px;
      color: var(--zider-muted);
      font-size: 13px;
      line-height: 1.45;
    }

    .forumSpaceGroupHeader > small {
      min-height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 999px;
      background: #ffffff;
      color: var(--zider-muted);
      font-size: 11px;
      font-weight: 760;
      line-height: 1;
      letter-spacing: 0.02em;
      padding: 0 9px;
      white-space: nowrap;
    }

    .forumModuleList {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-top: 0;
    }

    .forumSpaceGroup[data-group="community"] .forumModuleList,
    .forumSpaceGroup[data-group="workspace"] .forumModuleList {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .forumModuleCard {
      position: relative;
      min-height: 144px;
      display: grid;
      align-content: start;
      gap: 10px;
      border: 1px solid rgba(10, 37, 64, 0.1);
      border-radius: 8px;
      background: linear-gradient(180deg, #ffffff 0%, #fcfefd 100%);
      padding: 16px;
      box-shadow: 0 1px 0 rgba(10, 37, 64, 0.03);
      transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    }

    .forumModuleCardPublic {
      background:
        linear-gradient(180deg, rgba(248, 252, 250, 0.98) 0%, #ffffff 100%);
      border-color: rgba(8, 122, 70, 0.16);
    }

    .forumModuleCard:hover {
      border-color: rgba(8, 122, 70, 0.28);
      background: #ffffff;
      box-shadow: 0 14px 34px rgba(10, 37, 64, 0.07);
      transform: translateY(-2px);
    }

    .forumModuleTop {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .forumModuleIcon {
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      border: 1px solid rgba(8, 122, 70, 0.12);
      border-radius: 8px;
      background: #f1f8f4;
      color: var(--zider-green);
    }

    .forumModuleCard strong {
      color: #0a2540;
      font-size: 17px;
      font-weight: 700;
      line-height: 1.14;
      letter-spacing: 0;
    }

    .forumModuleDescription {
      display: -webkit-box;
      overflow: hidden;
      color: var(--zider-muted);
      font-size: 13px;
      line-height: 1.42;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .forumModuleCard small {
      min-height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 999px;
      background: #ffffff;
      color: var(--zider-muted);
      font-size: 11px;
      font-weight: 720;
      line-height: 1;
      letter-spacing: 0.02em;
      padding: 0 8px;
      white-space: nowrap;
    }

    .forumPosts {
      margin-top: 26px;
    }

    .forumPostToolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
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
      max-width: 720px;
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      font-size: 14px;
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

    @media (max-width: 900px) {
      .forumPage {
        width: 100%;
        padding: 0 0 86px;
      }

      .forumHero {
        grid-template-columns: 1fr;
        gap: 28px;
        padding: 34px 18px;
      }

      .forumModules,
      .forumSearchBlock,
      .forumPosts {
        width: calc(100% - 36px);
      }

      .forumHero h1 {
        font-size: clamp(42px, 15vw, 64px);
      }

      .forumHeroVisual {
        max-width: 420px;
        min-height: 150px;
      }

      .forumModuleList {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .forumSpaceGroupHeader {
        align-items: flex-start;
        flex-direction: column;
        gap: 10px;
      }

      .contentCard {
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
      }

      .contentCardIcon,
      .contentCardArrow {
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

      .forumModules {
        margin-top: 0;
      }

      .forumSectionHeaderInline {
        align-items: flex-start;
        flex-direction: column;
        gap: 8px;
      }
    }

    @media (max-width: 560px) {
      .forumModuleList {
        grid-template-columns: 1fr;
      }

      .forumSpaceGroup[data-group="community"] .forumModuleList,
      .forumSpaceGroup[data-group="workspace"] .forumModuleList {
        grid-template-columns: 1fr;
      }

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

    @media (max-width: 560px) {
      .forumHeroVisual {
        display: none;
      }
    }
  `;
}
