import { notFound } from "next/navigation";

import { PublicPage } from "@/app/_components/PublicChrome";
import { getCmsCategoryName } from "@/lib/cms/categories";
import { getPublishedCmsEntry, listCmsEntries, type CmsEntry } from "@/lib/cms/content";
import { getEntryDescription } from "@/lib/cms/descriptions";
import { loadMigratedBlogEntries, mergeEntriesBySlug } from "@/lib/cms/migrated-blog";
import { getSampleBlogEntry, sampleBlogEntries, type BlogEntry } from "@/lib/cms/sample-blog";

export const dynamic = "force-dynamic";

type BlogEntryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogEntryPage({ params }: BlogEntryPageProps) {
  const { slug } = await params;
  const [entry, recommendedEntries] = await Promise.all([loadEntry(slug), loadRecommendedEntries(slug)]);

  if (!entry) {
    notFound();
  }

  const coverImageUrl = getCoverImageUrl(entry);

  return (
    <PublicPage>
      <main className="blogEntryPage">
        <style>{getEntryCss()}</style>
        <div className="entryLayout">
          <article className="entryArticle">
            <a className="backLink" href="/blog">
              {getCmsCategoryName(entry)}
            </a>
            <h1 className="entryTitle">{entry.title}</h1>
            <div className="entryMeta">{getMeta(entry)}</div>
            <p className="entrySummary">{getEntryDescription(entry, "Read the latest ZIDER guide.", 190)}</p>
            {coverImageUrl ? <img alt="" className="entryCover" src={coverImageUrl} /> : null}
            <RichEntryBody body={entry.body || ""} coverImageUrl={coverImageUrl} entryId={entry.id} />
          </article>

          <RecommendedArticles entries={recommendedEntries} />
        </div>
      </main>
    </PublicPage>
  );
}

function RecommendedArticles({ entries }: { entries: Array<BlogEntry | CmsEntry> }) {
  if (!entries.length) {
    return null;
  }

  return (
    <aside className="recommendedArticles" aria-label="Recommended articles">
      <h2>Recommended</h2>
      <div>
        {entries.map((entry) => (
          <a className="recommendedLink" href={`/blog/${entry.slug}`} key={entry.id}>
            <span>{getCmsCategoryName(entry)}</span>
            <strong>{entry.title}</strong>
            <p>{getEntryDescription(entry, "Read the latest ZIDER guide.", 118)}</p>
          </a>
        ))}
      </div>
    </aside>
  );
}

function RichEntryBody({ body, coverImageUrl, entryId }: { body: string; coverImageUrl?: string | null; entryId: string }) {
  const normalizedBody = openExternalLinksInNewTab(removeDuplicateLeadingCover(body, coverImageUrl));

  if (looksLikeHtml(normalizedBody)) {
    return <div className="entryBody" dangerouslySetInnerHTML={{ __html: normalizedBody }} />;
  }

  return (
    <div className="entryBody">
      {normalizedBody.split(/\n{2,}/).map((paragraph, index) => (
        <p key={`${entryId}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function removeDuplicateLeadingCover(body: string, coverImageUrl?: string | null) {
  if (!coverImageUrl) {
    return body;
  }

  const escapedCover = escapeRegExp(coverImageUrl);
  const leadingImageParagraphPattern = new RegExp(
    `^\\s*<p\\b[^>]*>\\s*<img\\b[^>]*src=["']${escapedCover}["'][^>]*\\/?>(?:\\s|&nbsp;)*<\\/p>\\s*`,
    "i",
  );
  const leadingImagePattern = new RegExp(`^\\s*<img\\b[^>]*src=["']${escapedCover}["'][^>]*\\/?>\\s*`, "i");

  return body.replace(leadingImageParagraphPattern, "").replace(leadingImagePattern, "");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function openExternalLinksInNewTab(body: string) {
  return body.replace(/<a\b([^>]*?)>/gi, (match, attributes: string) => {
    const href = getAttributeValue(attributes, "href");

    if (!href || !isExternalHref(href)) {
      return match;
    }

    const withTarget = setAttribute(attributes, "target", "_blank");
    const withRel = mergeRelAttribute(withTarget, ["noopener", "noreferrer"]);

    return `<a${withRel}>`;
  });
}

function getAttributeValue(attributes: string, name: string) {
  const quotedMatch = attributes.match(new RegExp(`\\s${name}\\s*=\\s*([\"'])(.*?)\\1`, "i"));

  if (quotedMatch?.[2]) {
    return quotedMatch[2];
  }

  const unquotedMatch = attributes.match(new RegExp(`\\s${name}\\s*=\\s*([^\\s\"'>]+)`, "i"));
  return unquotedMatch?.[1] ?? null;
}

function isExternalHref(href: string) {
  const trimmedHref = href.trim();
  const normalizedHref = trimmedHref.toLowerCase();

  if (
    !trimmedHref ||
    normalizedHref.startsWith("#") ||
    normalizedHref.startsWith("mailto:") ||
    normalizedHref.startsWith("tel:") ||
    normalizedHref.startsWith("sms:") ||
    normalizedHref.startsWith("javascript:") ||
    normalizedHref.startsWith("data:")
  ) {
    return false;
  }

  try {
    const url = new URL(trimmedHref, "https://zider.ink");
    const host = url.hostname.toLowerCase();
    return (url.protocol === "http:" || url.protocol === "https:") && !isZiderHost(host);
  } catch {
    return false;
  }
}

function isZiderHost(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host === "zider.ink" || host.endsWith(".zider.ink");
}

function setAttribute(attributes: string, name: string, value: string) {
  const quotedPattern = new RegExp(`\\s${name}\\s*=\\s*([\"']).*?\\1`, "i");
  const unquotedPattern = new RegExp(`\\s${name}\\s*=\\s*[^\\s\"'>]+`, "i");

  if (quotedPattern.test(attributes)) {
    return attributes.replace(quotedPattern, ` ${name}="${value}"`);
  }

  if (unquotedPattern.test(attributes)) {
    return attributes.replace(unquotedPattern, ` ${name}="${value}"`);
  }

  return `${attributes} ${name}="${value}"`;
}

function mergeRelAttribute(attributes: string, requiredValues: string[]) {
  const relMatch = attributes.match(/\srel\s*=\s*(["'])(.*?)\1/i);

  if (!relMatch?.[2]) {
    return `${attributes} rel="${requiredValues.join(" ")}"`;
  }

  const existingValues = relMatch[2].split(/\s+/).filter(Boolean);
  const mergedValues = Array.from(new Set([...existingValues, ...requiredValues])).join(" ");
  return attributes.replace(/\srel\s*=\s*(["'])(.*?)\1/i, ` rel="${mergedValues}"`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loadEntry(slug: string) {
  try {
    return (await getPublishedCmsEntry("blog", slug)) ?? (await loadMigratedBlogEntry(slug)) ?? getSampleBlogEntry(slug);
  } catch (error) {
    console.warn("Failed to load blog entry", error);
    return (await loadMigratedBlogEntry(slug)) ?? getSampleBlogEntry(slug);
  }
}

async function loadRecommendedEntries(slug: string) {
  const migratedEntries = await loadMigratedBlogEntries();
  const fallbackEntries = migratedEntries.length ? migratedEntries : sampleBlogEntries;
  const fallbackRecommendations = fallbackEntries.filter((entry) => entry.slug !== slug).slice(0, 4);

  try {
    const entries = await listCmsEntries({ contentType: "blog", publishedOnly: true });
    return mergeEntriesBySlug(entries, fallbackEntries)
      .filter((entry) => entry.slug !== slug)
      .slice(0, 4);
  } catch (error) {
    console.warn("Failed to load recommended blog entries", error);
    return fallbackRecommendations;
  }
}

async function loadMigratedBlogEntry(slug: string) {
  return (await loadMigratedBlogEntries()).find((entry) => entry.slug === slug) ?? null;
}

function getCoverImageUrl(entry: BlogEntry | CmsEntry | Awaited<ReturnType<typeof getPublishedCmsEntry>>) {
  return entry?.coverImageUrl;
}

function getMeta(entry: BlogEntry | CmsEntry | Awaited<ReturnType<typeof getPublishedCmsEntry>>) {
  if (!entry) {
    return "";
  }

  const readingTime = "readingTime" in entry ? entry.readingTime : undefined;
  const label = "publishedLabel" in entry ? entry.publishedLabel : undefined;
  return [label || formatPublishedDate(entry.publishedAt || entry.createdAt), readingTime, entry.authorName].filter(Boolean).join(" · ");
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

function getEntryCss() {
  return `
    .blogEntryPage {
      width: var(--public-page-width);
      margin: 0 auto;
      padding: 76px 0 104px;
    }

    .entryLayout {
      display: grid;
      grid-template-columns: minmax(0, 760px) minmax(240px, 320px);
      align-items: start;
      gap: clamp(46px, 6vw, 96px);
    }

    .entryArticle {
      min-width: 0;
    }

    .backLink {
      display: inline-flex;
      width: fit-content;
      min-height: 28px;
      align-items: center;
      border: 1px solid rgba(8, 122, 70, 0.14);
      border-radius: 999px;
      background: rgba(223, 247, 234, 0.42);
      padding: 0 11px;
      margin-bottom: 22px;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 760;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      transition: color 160ms ease;
    }

    .backLink:hover {
      color: #069456;
      border-color: rgba(8, 122, 70, 0.28);
    }

    .entryTitle {
      max-width: 760px;
      margin: 0;
      color: #060b3c;
      font-size: clamp(30px, 2.85vw, 42px);
      font-weight: 620;
      line-height: 1.12;
      letter-spacing: 0;
      text-wrap: balance;
    }

    .entryMeta {
      width: fit-content;
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(8, 122, 70, 0.1);
      border-radius: 999px;
      background: #f7fbf9;
      padding: 5px 10px;
      margin: 16px 0 20px;
      color: #65758a;
      font-size: 11px;
      font-weight: 760;
      letter-spacing: 0.04em;
    }

    .entrySummary {
      max-width: 620px;
      margin: 0;
      color: var(--zider-muted);
      font-size: clamp(16px, 1.35vw, 18px);
      line-height: 1.62;
    }

    .entryCover {
      width: 100%;
      max-height: 330px;
      display: block;
      object-fit: cover;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 12px;
      margin: 30px 0 0;
      box-shadow: 0 18px 46px rgba(10, 37, 64, 0.08);
    }

    .entryBody {
      margin-top: 38px;
      color: var(--zider-ink);
      font-size: 16.5px;
      line-height: 1.74;
    }

    .entryBody > :first-child {
      margin-top: 0;
    }

    .entryBody > :last-child {
      margin-bottom: 0;
    }

    .entryBody p {
      margin: 0 0 18px;
      color: #405975;
    }

    .entryBody p:empty {
      display: none;
    }

    .entryBody h1,
    .entryBody h2,
    .entryBody h3,
    .entryBody h4,
    .entryBody h5,
    .entryBody h6 {
      margin: 38px 0 14px;
      color: var(--zider-ink);
      line-height: 1.16;
      font-weight: 640;
      text-wrap: balance;
    }

    .entryBody h1 {
      font-size: clamp(24px, 2vw, 30px);
    }

    .entryBody h2 {
      font-size: clamp(22px, 1.7vw, 26px);
    }

    .entryBody h3 {
      font-size: 20px;
    }

    .entryBody h4 {
      font-size: 18px;
    }

    .entryBody h5,
    .entryBody h6 {
      font-size: 16px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .entryBody strong,
    .entryBody b {
      color: #0d2745;
      font-weight: 680;
    }

    .entryBody ul,
    .entryBody ol {
      margin: 16px 0 24px;
      padding-left: 1.35em;
    }

    .entryBody li {
      margin: 8px 0;
      padding-left: 2px;
      color: #405975;
    }

    .entryBody li::marker {
      color: var(--zider-green);
      font-weight: 700;
    }

    .entryBody li p {
      margin: 0;
    }

    .entryBody hr,
    .entryBody .wp-block-separator {
      width: 100%;
      height: 1px;
      border: 0;
      border-top: 1px solid rgba(10, 37, 64, 0.14);
      border-radius: 0;
      background: transparent;
      margin: 34px 0;
      opacity: 1;
    }

    .entryBody a {
      color: var(--zider-green);
      font-weight: 620;
      text-decoration: underline;
      text-underline-offset: 4px;
      text-decoration-thickness: 1px;
      transition: color 160ms ease;
    }

    .entryBody a:hover {
      color: #069456;
    }

    .entryBody blockquote {
      border-left: 3px solid var(--zider-green);
      border-radius: 0 12px 12px 0;
      background: linear-gradient(90deg, rgba(223, 247, 234, 0.52), rgba(255, 255, 255, 0));
      margin: 32px 0;
      padding: 18px 22px;
      color: #153451;
      font-size: 17px;
      line-height: 1.64;
    }

    .entryBody blockquote p {
      color: inherit;
      margin-bottom: 12px;
    }

    .entryBody blockquote p:last-child {
      margin-bottom: 0;
    }

    .entryBody code {
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 6px;
      background: #f4f8f6;
      padding: 0.15em 0.38em;
      color: #0d4f35;
      font-size: 0.9em;
    }

    .entryBody pre {
      overflow: auto;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 14px;
      background: #071422;
      margin: 30px 0;
      padding: 18px 20px;
      box-shadow: 0 16px 38px rgba(10, 37, 64, 0.08);
    }

    .entryBody pre code {
      border: 0;
      border-radius: 0;
      background: transparent;
      padding: 0;
      color: #e6f5ee;
      font-size: 14px;
      line-height: 1.72;
    }

    .entryBody table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      overflow: hidden;
      border: 1px solid var(--zider-line);
      border-radius: 14px;
      margin: 30px 0;
      background: #fff;
      box-shadow: 0 14px 34px rgba(10, 37, 64, 0.04);
    }

    .entryBody th,
    .entryBody td {
      border-bottom: 1px solid var(--zider-line);
      padding: 12px 14px;
      text-align: left;
      vertical-align: top;
    }

    .entryBody tr:last-child th,
    .entryBody tr:last-child td {
      border-bottom: 0;
    }

    .entryBody th {
      background: #f6faf8;
      color: #0d2745;
      font-size: 13px;
      font-weight: 720;
    }

    .entryBody td {
      color: #405975;
      font-size: 15px;
    }

    .entryBody figure,
    .entryBody .wp-block-image,
    .entryBody .wp-caption {
      width: 100%;
      margin: 34px 0;
    }

    .entryBody img {
      box-sizing: border-box;
      width: 100%;
      max-width: 100%;
      height: auto;
      max-height: none;
      display: block;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 12px;
      background: #f5f9f7;
      margin: 30px auto;
      padding: 7px;
      object-fit: contain;
      box-shadow: 0 16px 38px rgba(10, 37, 64, 0.07);
    }

    .entryBody figure img,
    .entryBody .wp-block-image img,
    .entryBody .wp-caption img {
      margin: 0 auto;
    }

    .entryBody figcaption,
    .entryBody .wp-caption-text {
      max-width: 620px;
      margin: 10px auto 0;
      color: #7a8ba0;
      font-size: 13px;
      line-height: 1.5;
      text-align: center;
    }

    .entryBody p:has(img) {
      margin: 30px 0;
    }

    .entryBody p:has(> img:only-child) {
      display: flex;
      justify-content: center;
    }

    .entryBody .aligncenter {
      display: block;
      margin-right: auto;
      margin-left: auto;
      text-align: center;
    }

    .entryBody .alignleft {
      float: left;
      width: auto;
      max-width: min(48%, 320px);
      margin: 6px 24px 18px 0;
    }

    .entryBody .alignright {
      float: right;
      width: auto;
      max-width: min(48%, 320px);
      margin: 6px 0 18px 24px;
    }

    .entryBody .size-full,
    .entryBody .size-large {
      max-width: 100%;
    }

    .entryBody .wp-block-gallery,
    .entryBody .gallery,
    .entryBody .blocks-gallery-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin: 34px 0;
      padding: 0;
    }

    .entryBody .wp-block-gallery figure,
    .entryBody .gallery figure,
    .entryBody .blocks-gallery-grid figure,
    .entryBody .wp-block-gallery img,
    .entryBody .gallery img,
    .entryBody .blocks-gallery-grid img {
      width: 100%;
      max-height: 280px;
      margin: 0;
      object-fit: cover;
    }

    .entryBody .wp-block-embed,
    .entryBody .wp-block-video,
    .entryBody .wp-block-audio {
      margin: 32px 0;
    }

    .entryBody iframe {
      width: 100%;
      aspect-ratio: 16 / 9;
      height: auto;
      display: block;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 12px;
      margin: 30px 0;
      background: #f5f9f7;
      box-shadow: 0 16px 38px rgba(10, 37, 64, 0.07);
    }

    .recommendedArticles {
      position: sticky;
      top: 112px;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.78);
      padding: 22px;
      box-shadow: 0 18px 50px rgba(10, 37, 64, 0.04);
    }

    .recommendedArticles h2 {
      margin: 0 0 8px;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .recommendedLink {
      display: block;
      border-bottom: 1px solid var(--zider-line);
      padding: 14px 0;
      transition: border-color 160ms ease;
    }

    .recommendedLink:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .recommendedLink:hover {
      border-color: rgba(8, 122, 70, 0.32);
    }

    .recommendedLink span {
      display: block;
      color: var(--zider-green);
      font-size: 10px;
      font-weight: 760;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .recommendedLink strong {
      display: block;
      margin-top: 8px;
      color: var(--zider-ink);
      font-size: 15px;
      font-weight: 620;
      line-height: 1.34;
      transition: color 160ms ease;
    }

    .recommendedLink:hover strong {
      color: var(--zider-green);
    }

    .recommendedLink p {
      display: -webkit-box;
      margin: 8px 0 0;
      overflow: hidden;
      color: var(--zider-muted);
      font-size: 13px;
      line-height: 1.48;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    @media (max-width: 980px) {
      .blogEntryPage {
        width: calc(100% - 36px);
        padding: 64px 0 92px;
      }

      .entryLayout {
        grid-template-columns: 1fr;
        gap: 54px;
      }

      .recommendedArticles {
        position: static;
        padding: 20px;
      }
    }

    @media (max-width: 640px) {
      .blogEntryPage {
        width: calc(100% - 28px);
        padding: 54px 0 82px;
      }

      .entryTitle {
        font-size: clamp(29px, 8vw, 38px);
      }

      .entryCover {
        max-height: 260px;
      }

      .entryBody blockquote {
        margin: 26px 0;
        padding: 16px 18px;
        font-size: 16px;
      }

      .entryBody img {
        max-height: 340px;
        border-radius: 10px;
        margin: 24px auto;
        padding: 5px;
      }

      .entryBody .alignleft,
      .entryBody .alignright {
        float: none;
        max-width: 100%;
        margin: 24px auto;
      }

      .entryBody .wp-block-gallery,
      .entryBody .gallery,
      .entryBody .blocks-gallery-grid {
        grid-template-columns: 1fr;
      }

      .entryBody table {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
      }

      .entryBody {
        font-size: 16px;
      }
    }
  `;
}
