import type { CmsEntry } from "@/lib/cms/content";

export type BlogEntry = CmsEntry & {
  publishedLabel?: string;
  readingTime?: string;
};

export const sampleBlogEntries: BlogEntry[] = [
  {
    authorName: "ZIDER Team",
    body: `
      <p>Small interaction details can make a creator website feel more deliberate without turning it into a heavy app.</p>
      <h2>Start with the moments users repeat</h2>
      <p>Navigation, product cards, forms, copied text, image comparisons, and small confirmations are usually the best places to add lightweight components.</p>
      <p>A good component should make the page easier to use first, and more polished second. That order keeps performance, clarity, and accessibility from becoming afterthoughts.</p>
      <img src="https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80" alt="Interface component sketches on a design workspace" />
      <h2>Keep the install path simple</h2>
      <p>For ZIDER, the ideal component has a clear preview, a few practical settings, and a safe publishing flow. The creator should understand the result before touching production.</p>
      <p>See how the product line is organized in <a href="/components">Components</a>.</p>
    `,
    contentType: "blog",
    coverImageUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-01T08:00:00.000Z",
    excerpt: "A practical framework for deciding where lightweight components should improve a creator website.",
    id: "sample-blog-interaction-components",
    locale: "en",
    publishedAt: "2026-05-01T08:00:00.000Z",
    publishedLabel: "May 1, 2026",
    readingTime: "4 min read",
    slug: "interaction-components-for-creator-sites",
    sourceUrl: null,
    status: "published",
    tags: ["components", "ux", "performance"],
    title: "How lightweight interactions make creator sites feel complete",
    updatedAt: "2026-05-01T08:00:00.000Z",
  },
  {
    authorName: "ZIDER Team",
    body: `
      <p>Content migration is not only a database task. It is a chance to make Blog and Forum answers easier to find, link, and maintain.</p>
      <h2>Separate content type from presentation</h2>
      <p>Keep titles, slugs, locale, status, excerpt, tags, and body structured. Then the same entry can power list pages, search, language routes, and related content modules.</p>
      <h2>Use Forum answers as reusable knowledge</h2>
      <p>Forum posts often answer high-intent questions. With a clean slug and excerpt, they can become durable support pages instead of hidden conversations.</p>
      <p>The first CMS version should stay small: list, create, edit, publish, and archive. Anything more can come after the migration flow is proven.</p>
    `,
    contentType: "blog",
    coverImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-08T08:00:00.000Z",
    excerpt: "A simple content model for moving old Blog and Forum material into a cleaner ZIDER site.",
    id: "sample-blog-content-migration",
    locale: "en",
    publishedAt: "2026-05-08T08:00:00.000Z",
    publishedLabel: "May 8, 2026",
    readingTime: "5 min read",
    slug: "blog-forum-content-migration-model",
    sourceUrl: null,
    status: "published",
    tags: ["cms", "migration", "forum"],
    title: "A cleaner model for Blog and Forum migration",
    updatedAt: "2026-05-08T08:00:00.000Z",
  },
  {
    authorName: "ZIDER Team",
    body: `
      <p>ZIDER's product structure works best when the brand site, data app, and product workspace each have a clear job.</p>
      <h2>The brand site owns public content</h2>
      <p>The homepage, Blog, Forum, Docs, account entry, and CMS belong together because they build search value and brand trust.</p>
      <h2>The app project stays operational</h2>
      <p>Webhook receivers, analytics, revenue imports, and system dashboards should stay away from marketing and product editing surfaces.</p>
      <h2>The workspace owns product tools</h2>
      <p>Components and Solutions can share a workspace project while still routing users by domain and product line.</p>
    `,
    contentType: "blog",
    coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-15T08:00:00.000Z",
    excerpt: "How the three-project structure keeps ZIDER's website, app runtime, and product workspace clean.",
    id: "sample-blog-zider-architecture",
    locale: "en",
    publishedAt: "2026-05-15T08:00:00.000Z",
    publishedLabel: "May 15, 2026",
    readingTime: "3 min read",
    slug: "zider-three-project-architecture",
    sourceUrl: null,
    status: "published",
    tags: ["architecture", "vercel", "products"],
    title: "Why ZIDER uses separate site, app, and workspace projects",
    updatedAt: "2026-05-15T08:00:00.000Z",
  },
];

export function getSampleBlogEntry(slug: string) {
  return sampleBlogEntries.find((entry) => entry.slug === slug) ?? null;
}
