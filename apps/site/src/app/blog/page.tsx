import { BookOpenText } from "lucide-react";

import { PublicPage } from "@/app/_components/PublicChrome";
import { getCmsCategoryName, getDisplayTagLabels } from "@/lib/cms/categories";
import { listCmsEntries, type CmsEntry } from "@/lib/cms/content";
import { getEntryDescription } from "@/lib/cms/descriptions";
import { loadMigratedBlogEntries, mergeEntriesBySlug } from "@/lib/cms/migrated-blog";
import { sampleBlogEntries, type BlogEntry } from "@/lib/cms/sample-blog";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const entries = await loadEntries();

  return (
    <PublicPage>
      <main className="blogPage">
        <style>{getContentListCss()}</style>
        <section className="blogHero" aria-labelledby="blog-title">
          <div className="blogHeroCopy">
            <p className="blogEyebrow">Blog</p>
            <h1 id="blog-title">Blog</h1>
            <p>Guides, product notes, and practical ideas for building better creator websites.</p>
          </div>

          <aside className="blogHeroVisual" aria-label="Blog preview">
            <div className="blogVisualHeader">
              <BookOpenText size={18} />
              <span>Latest notes</span>
            </div>
            <div className="blogVisualRows" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </aside>
        </section>

        <section className="contentList" aria-label="Latest blog posts">
          {entries.map((entry) => (
            <ContentCard entry={entry} href={`/blog/${entry.slug}`} key={entry.id} />
          ))}
        </section>
      </main>
    </PublicPage>
  );
}

async function loadEntries() {
  const migratedEntries = await loadMigratedBlogEntries();
  const fallbackEntries = migratedEntries.length ? migratedEntries : sampleBlogEntries;

  try {
    const entries = await listCmsEntries({ contentType: "blog", publishedOnly: true });
    return mergeEntriesBySlug(entries, fallbackEntries);
  } catch (error) {
    console.warn("Failed to load blog entries", error);
    return fallbackEntries;
  }
}

function ContentCard({ entry, href }: { entry: BlogEntry | CmsEntry; href: string }) {
  const coverImageUrl = getCoverImageUrl(entry);

  return (
    <a className={`contentCard${coverImageUrl ? "" : " contentCard--plain"}`} href={href}>
      <div className="contentCard__body">
        <div className="contentCard__meta">
          <span>{getCmsCategoryName(entry)}</span>
          <time>{getMeta(entry)}</time>
        </div>
        <h2>{entry.title}</h2>
        <p>{getEntryDescription(entry)}</p>
        <div className="contentTags" aria-label="Article tags">
          {getDisplayTagLabels(entry).map((tag) => (
            <small key={tag}>{tag}</small>
          ))}
        </div>
      </div>
      {coverImageUrl ? (
        <figure className="contentThumb">
          <img alt="" src={coverImageUrl} />
        </figure>
      ) : null}
    </a>
  );
}

function getCoverImageUrl(entry: BlogEntry | CmsEntry) {
  return entry.coverImageUrl;
}

function getMeta(entry: BlogEntry | CmsEntry) {
  const readingTime = "readingTime" in entry ? entry.readingTime : undefined;
  const label = "publishedLabel" in entry ? entry.publishedLabel : undefined;
  return [label || formatPublishedDate(entry.publishedAt || entry.createdAt), readingTime].filter(Boolean).join(" · ");
}

function formatPublishedDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

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

function getContentListCss() {
  return `
    .blogPage {
      width: 100%;
      margin: 0;
      padding: 0 0 104px;
    }

    .blogHero {
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

    .blogHero::before {
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

    .blogHeroCopy {
      min-width: 0;
    }

    .blogEyebrow,
    .blogVisualHeader span {
      margin: 0;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 820;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .blogHero h1 {
      margin: 12px 0 14px;
      color: #060b3c;
      font-size: clamp(44px, 6vw, 72px);
      font-weight: 720;
      line-height: 0.98;
      letter-spacing: 0;
    }

    .blogHeroCopy > p:last-of-type {
      max-width: 620px;
      margin: 0;
      color: var(--zider-muted);
      font-size: clamp(16px, 1.55vw, 20px);
      line-height: 1.55;
    }

    .blogHeroVisual {
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

    .blogVisualHeader {
      display: flex;
      align-items: center;
      gap: 9px;
      color: var(--zider-green);
    }

    .blogVisualRows {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }

    .blogVisualRows span {
      display: block;
      height: 28px;
      border: 1px solid rgba(8, 122, 70, 0.13);
      border-radius: 7px;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(235, 248, 241, 0.74));
    }

    .blogVisualRows span:nth-child(1) {
      width: 92%;
    }

    .blogVisualRows span:nth-child(2) {
      width: 100%;
    }

    .blogVisualRows span:nth-child(3) {
      width: 74%;
    }

    .contentList {
      width: var(--public-page-width);
      display: grid;
      gap: 0;
      margin: 0 auto;
    }

    .contentCard {
      min-height: 176px;
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 206px;
      gap: clamp(28px, 4.6vw, 72px);
      align-items: center;
      border: 1px solid transparent;
      border-bottom: 1px solid var(--zider-line);
      border-radius: 10px;
      background: #ffffff;
      margin: 0 -14px;
      padding: 28px 14px;
      transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
    }

    .contentCard:hover {
      border-color: rgba(8, 122, 70, 0.14);
      background: rgba(249, 252, 250, 0.86);
      box-shadow: 0 16px 42px rgba(10, 37, 64, 0.035);
    }

    .contentCard__body {
      min-width: 0;
      order: 1;
    }

    .contentCard--plain {
      grid-template-columns: 1fr;
    }

    .contentCard__meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .contentCard__meta span {
      min-height: 22px;
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(8, 122, 70, 0.12);
      border-radius: 999px;
      background: rgba(223, 247, 234, 0.5);
      padding: 0 9px;
      color: var(--zider-green);
      font-size: 10px;
      font-weight: 760;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .contentCard__meta time {
      color: #7b8b9d;
      font-size: 11px;
      font-weight: 650;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .contentThumb {
      width: 206px;
      height: 128px;
      order: 2;
      margin: 0;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 12px;
      background: #f4f8f6;
      padding: 6px;
      overflow: hidden;
    }

    .contentThumb img {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 8px;
      object-fit: cover;
      background: #edf5f0;
      transition: transform 180ms ease, opacity 180ms ease;
    }

    .contentCard:hover .contentThumb img {
      opacity: 0.92;
      transform: scale(1.025);
    }

    .contentCard img {
      order: 2;
    }

    .contentCard h2 {
      max-width: 760px;
      margin: 12px 0 8px;
      color: var(--zider-ink);
      font-size: clamp(20px, 1.7vw, 26px);
      line-height: 1.22;
      font-weight: 620;
      letter-spacing: 0;
      text-wrap: pretty;
      transition: color 160ms ease;
    }

    .contentCard:hover h2 {
      color: #07683f;
    }

    .contentCard p {
      max-width: 680px;
      display: -webkit-box;
      margin: 0;
      overflow: hidden;
      color: var(--zider-muted);
      font-size: 14.5px;
      line-height: 1.58;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .contentTags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 15px;
    }

    .contentTags small {
      min-height: 22px;
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(99, 117, 138, 0.16);
      border-radius: 999px;
      background: #ffffff;
      padding: 0 8px;
      color: var(--zider-muted);
      font-size: 10px;
      font-weight: 680;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    @media (max-width: 820px) {
      .blogPage {
        width: 100%;
        padding: 0 0 84px;
      }

      .blogHero {
        grid-template-columns: 1fr;
        gap: 28px;
        padding: 34px 18px;
      }

      .contentList {
        width: calc(100% - 36px);
      }

      .blogHero h1 {
        font-size: clamp(42px, 15vw, 64px);
      }

      .blogHeroVisual {
        max-width: 420px;
        min-height: 150px;
      }

      .contentCard {
        min-height: 0;
        grid-template-columns: 112px minmax(0, 1fr);
        gap: 16px;
        align-items: start;
        margin: 0;
        padding: 22px 0;
        border-right: 0;
        border-left: 0;
        border-radius: 0;
      }

      .contentCard__body {
        order: 2;
      }

      .contentThumb {
        width: 112px;
        height: 82px;
        order: 1;
        padding: 4px;
      }

      .contentCard h2 {
        margin-top: 10px;
        font-size: 20px;
      }

      .contentCard p {
        font-size: 14px;
      }
    }

    @media (max-width: 560px) {
      .blogHeroVisual {
        display: none;
      }
    }
  `;
}
