import { notFound } from "next/navigation";

import { PublicPage } from "@/app/_components/PublicChrome";
import { isVisibleForumEntry, loadForumEntries } from "@/app/forum/_lib/forum-listing";
import { getPublishedCmsEntry, type CmsEntry } from "@/lib/cms/content";
import { extractCmsFaqItems, stripCmsFaqBlock, type CmsFaqItem } from "@/lib/cms/faq";
import { getForumEntryModule, getForumModuleHref } from "@/lib/cms/forum-modules";
import { getSampleForumEntry } from "@/lib/cms/sample-forum";

export const dynamic = "force-dynamic";

type RelatedForumPosts = {
  entries: CmsEntry[];
  heading: string;
  href: string | null;
  label: string;
};

type ForumEntryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ForumEntryPage({ params }: ForumEntryPageProps) {
  const { slug } = await params;
  const entry = await loadEntry(slug);

  if (!entry) {
    notFound();
  }

  const module = getForumEntryModule(entry);
  const relatedPosts = await loadRelatedEntries(entry);
  const publishedDate = formatPublishedDate(entry.publishedAt || entry.createdAt);
  const faqItems = extractCmsFaqItems(entry.body);

  return (
    <PublicPage>
      <main className="forumEntryPage">
        <style>{getEntryCss()}</style>
        <div className="forumEntryLayout">
          <article className="entryArticle">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <a href="/forum">Forum</a>
              <span>/</span>
              {module ? <a href={getForumModuleHref(module)}>{module.name}</a> : <strong>Article</strong>}
            </nav>
            {publishedDate ? <p className="entryDate">{publishedDate}</p> : null}
            <h1 className="entryTitle">{entry.title}</h1>
            {entry.excerpt ? <p className="entrySummary">{entry.excerpt}</p> : null}
            <RichEntryBody body={entry.body || ""} entryId={entry.id} />
            <ForumFaq items={faqItems} pageTitle={entry.title} />
          </article>

          <RelatedArticles relatedPosts={relatedPosts} />
        </div>
      </main>
    </PublicPage>
  );
}

function ForumFaq({ items, pageTitle }: { items: CmsFaqItem[]; pageTitle: string }) {
  if (!items.length) {
    return null;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
      name: item.question,
    })),
  };

  return (
    <section className="entryFaq" aria-labelledby="entry-faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <p>FAQ</p>
      <h2 id="entry-faq-heading">{pageTitle} FAQ</h2>
      <div className="entryFaqList">
        {items.map((item, index) => (
          <details className="entryFaqItem" key={`${item.question}-${index}`}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function RelatedArticles({ relatedPosts }: { relatedPosts: RelatedForumPosts }) {
  const { entries, heading, href, label } = relatedPosts;

  if (!entries.length) {
    return null;
  }

  return (
    <aside className="relatedArticles" aria-label={`${label} ${heading}`}>
      <p>{label}</p>
      <h2>{href ? <a href={href}>{heading}</a> : heading}</h2>
      <div className="relatedList">
        {entries.map((entry) => (
          <a className="relatedLink" href={`/forum/${entry.slug}`} key={entry.id}>
            <strong>{entry.title}</strong>
            {entry.excerpt ? <span>{entry.excerpt}</span> : null}
          </a>
        ))}
      </div>
    </aside>
  );
}

function RichEntryBody({ body, entryId }: { body: string; entryId: string }) {
  const visibleBody = stripCmsFaqBlock(body);

  if (looksLikeHtml(visibleBody)) {
    return <div className="entryBody" dangerouslySetInnerHTML={{ __html: normalizeImportedForumBody(visibleBody) }} />;
  }

  return (
    <div className="entryBody">
      {visibleBody.split(/\n{2,}/).map((paragraph, index) => (
        <p key={`${entryId}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function normalizeImportedForumBody(value: string) {
  return value
    .replace(/<span[^>]*data-mce-type="bookmark"[^>]*>[\s\S]*?<\/span>/gi, "")
    .replace(/<video(?![^>]*\ssrc=)([^>]*)>\s*<source[^>]*src="([^"]+)"[^>]*>\s*<\/video>/gi, '<video src="$2" controls></video>')
    .replace(/\s(?:id|class|style|dir|data-[a-z-]+|aria-[a-z-]+|width|height|fetchpriority|loading|decoding|sizes|srcset)="[^"]*"/gi, "")
    .replace(/\scontrols="controls"/gi, " controls")
    .replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1")
    .replace(/<figure[^>]*>|<\/figure>/gi, "")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "\n")
    .replace(/<p>\s*(<img[^>]+>)\s*([^<]+?)\s*<\/p>/gi, "$1\n<p>$2</p>")
    .replace(/<p>\s*(?:&nbsp;|\u00a0|\s)*<\/p>/gi, "")
    .replace(/<(p|blockquote|li)>\s*(?:&nbsp;|\u00a0|\s)*<\/\1>/gi, "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadEntry(slug: string) {
  try {
    const entry = (await getPublishedCmsEntry("forum", slug)) ?? getSampleForumEntry(slug);
    return entry && isVisibleForumEntry(entry) ? entry : null;
  } catch (error) {
    console.warn("Failed to load forum entry", error);
    const entry = getSampleForumEntry(slug);
    return entry && isVisibleForumEntry(entry) ? entry : null;
  }
}

async function loadRelatedEntries(entry: CmsEntry): Promise<RelatedForumPosts> {
  const module = getForumEntryModule(entry);
  const candidateEntries = await loadPublishedForumEntries();
  const otherEntries = candidateEntries.filter((candidate) => candidate.slug !== entry.slug);
  const recommendedEntries = otherEntries.slice(0, 4);

  if (!module) {
    return {
      entries: recommendedEntries,
      heading: "Community posts",
      href: "/forum",
      label: "Recommended",
    };
  }

  const relatedEntries = otherEntries.filter((candidate) => getForumEntryModule(candidate)?.key === module.key).slice(0, 4);

  if (relatedEntries.length) {
    return {
      entries: relatedEntries,
      heading: module.name,
      href: getForumModuleHref(module),
      label: "Related",
    };
  }

  return {
    entries: recommendedEntries,
    heading: "Community posts",
    href: "/forum",
    label: "Recommended",
  };
}

async function loadPublishedForumEntries() {
  return loadForumEntries();
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

function getEntryCss() {
  return `
    .forumEntryPage {
      width: var(--public-page-width);
      margin: 0 auto;
      padding: 74px 0 108px;
    }

    .forumEntryLayout {
      display: grid;
      grid-template-columns: minmax(0, 760px) minmax(240px, 320px);
      align-items: start;
      gap: clamp(44px, 6vw, 92px);
    }

    .entryArticle {
      min-width: 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;
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

    .entryDate,
    .relatedArticles > p {
      margin: 0 0 12px;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 820;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .entryTitle {
      max-width: 760px;
      margin: 0;
      color: #060b3c;
      font-size: clamp(34px, 3.2vw, 52px);
      font-weight: 680;
      line-height: 1.06;
      letter-spacing: 0;
      text-wrap: balance;
    }

    .entrySummary {
      max-width: 660px;
      margin: 22px 0 0;
      color: var(--zider-muted);
      font-size: clamp(17px, 1.5vw, 20px);
      line-height: 1.58;
    }

    .entryBody {
      margin-top: 42px;
      color: var(--zider-ink);
      font-size: 17px;
      line-height: 1.76;
    }

    .entryBody p {
      margin: 0 0 24px;
    }

    .entryBody strong,
    .entryBody b {
      font-weight: 760;
    }

    .entryBody h1,
    .entryBody h2,
    .entryBody h3 {
      margin: 42px 0 14px;
      color: var(--zider-ink);
      line-height: 1.16;
    }

    .entryBody h1 {
      font-size: 34px;
    }

    .entryBody h2 {
      font-size: 26px;
    }

    .entryBody h3 {
      font-size: 21px;
    }

    .entryBody a {
      color: var(--zider-green);
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    .entryBody ul,
    .entryBody ol {
      margin: 0 0 26px;
      padding-left: 1.35em;
    }

    .entryBody li {
      margin: 8px 0;
      padding-left: 2px;
    }

    .entryBody li > p {
      margin: 0;
    }

    .entryBody blockquote {
      margin: 28px 0;
      border-left: 3px solid var(--zider-green);
      border-radius: 0 8px 8px 0;
      background: #f8fcfa;
      padding: 16px 18px;
      color: #53677e;
    }

    .entryBody blockquote p,
    .entryBody blockquote div {
      margin: 0;
    }

    .entryBody hr {
      height: 1px;
      border: 0;
      background: var(--zider-line);
      margin: 34px 0;
    }

    .entryBody img,
    .entryBody video,
    .entryBody iframe {
      max-width: 100%;
      display: block;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 10px;
      margin: 26px 0;
      box-shadow: 0 12px 34px rgba(10, 37, 64, 0.07);
    }

    .entryBody p > img {
      margin-top: 10px;
    }

    .entryBody video,
    .entryBody iframe {
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #f5f7fa;
    }

    .entryBody pre {
      overflow-x: auto;
      border: 1px solid rgba(10, 37, 64, 0.08);
      border-radius: 10px;
      background: #f8fafc;
      margin: 24px 0;
      padding: 14px 16px;
      font-size: 14px;
      line-height: 1.55;
    }

    .entryBody code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }

    .entryFaq {
      border-top: 1px solid var(--zider-line);
      margin-top: 48px;
      padding-top: 28px;
    }

    .entryFaq > p {
      margin: 0 0 10px;
      color: var(--zider-green);
      font-size: 12px;
      font-weight: 820;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .entryFaq h2 {
      margin: 0;
      color: var(--zider-ink);
      font-size: 25px;
      font-weight: 700;
      line-height: 1.18;
      letter-spacing: 0;
    }

    .entryFaqList {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }

    .entryFaqItem {
      border: 1px solid rgba(10, 37, 64, 0.09);
      border-radius: 8px;
      background: #fbfdfc;
      padding: 0 16px;
    }

    .entryFaqItem summary {
      min-height: 52px;
      display: flex;
      align-items: center;
      color: var(--zider-ink);
      cursor: pointer;
      font-size: 15px;
      font-weight: 720;
      line-height: 1.35;
    }

    .entryFaqItem p {
      margin: 0;
      border-top: 1px solid var(--zider-line);
      color: var(--zider-muted);
      font-size: 15px;
      line-height: 1.62;
      padding: 14px 0 16px;
    }

    .relatedArticles {
      position: sticky;
      top: 112px;
      border-top: 1px solid var(--zider-line);
      padding-top: 18px;
    }

    .relatedArticles h2 {
      margin: 0;
      color: #0a2540;
      font-size: 22px;
      font-weight: 680;
      line-height: 1.18;
      letter-spacing: 0;
    }

    .relatedArticles h2 a {
      transition: color 160ms ease;
    }

    .relatedArticles h2 a:hover {
      color: var(--zider-green);
    }

    .relatedList {
      display: grid;
      gap: 0;
      margin-top: 18px;
      border-top: 1px solid var(--zider-line);
    }

    .relatedLink {
      display: grid;
      gap: 8px;
      border-bottom: 1px solid var(--zider-line);
      padding: 16px 0;
    }

    .relatedLink strong {
      color: var(--zider-ink);
      font-size: 15px;
      font-weight: 700;
      line-height: 1.32;
      transition: color 160ms ease;
    }

    .relatedLink span {
      color: var(--zider-muted);
      font-size: 13px;
      line-height: 1.48;
    }

    .relatedLink:hover strong {
      color: var(--zider-green);
    }

    @media (max-width: 980px) {
      .forumEntryPage {
        width: calc(100% - 36px);
        padding: 54px 0 86px;
      }

      .forumEntryLayout {
        grid-template-columns: 1fr;
        gap: 42px;
      }

      .relatedArticles {
        position: static;
      }
    }
  `;
}
