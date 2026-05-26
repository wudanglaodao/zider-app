import { readFile } from "node:fs/promises";
import path from "node:path";

import { normalizeCmsEntryAssetUrls } from "@/lib/cms/assets";
import type { CmsEntry } from "@/lib/cms/content";

export async function loadMigratedBlogEntries() {
  try {
    const filePath = path.join(process.cwd(), "data", "wordpress-blog-preview.json");
    const rawValue = await readFile(filePath, "utf8");
    const rows = JSON.parse(rawValue);

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map(mapMigratedBlogEntry).sort(sortByPublishedDate);
  } catch {
    console.warn("Failed to load migrated blog entries");
    return [];
  }
}

export function mergeEntriesBySlug(primaryEntries: CmsEntry[], fallbackEntries: CmsEntry[]) {
  const seenSlugs = new Set(primaryEntries.map((entry) => entry.slug));
  return [...primaryEntries, ...fallbackEntries.filter((entry) => !seenSlugs.has(entry.slug))].sort(sortByPublishedDate);
}

function mapMigratedBlogEntry(row: Record<string, unknown>): CmsEntry {
  const now = new Date().toISOString();

  return normalizeCmsEntryAssetUrls({
    authorName: stringOrNull(row.author_name),
    body: stringOrNull(row.body),
    contentType: "blog",
    coverImageUrl: stringOrNull(row.cover_image_url),
    createdAt: stringOrFallback(row.published_at, now),
    excerpt: stringOrNull(row.excerpt),
    id: `wordpress-migrated-${stringOrFallback(row.slug, row.title, now)}`,
    locale: stringOrFallback(row.locale, "en"),
    publishedAt: stringOrNull(row.published_at),
    slug: stringOrFallback(row.slug, `wordpress-migrated-${Date.now()}`),
    sourceUrl: stringOrNull(row.source_url),
    status: row.status === "draft" || row.status === "archived" ? row.status : "published",
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
    title: stringOrFallback(row.title, "Untitled"),
    updatedAt: stringOrFallback(row.updated_at, now),
  });
}

function sortByPublishedDate(firstEntry: CmsEntry, secondEntry: CmsEntry) {
  return (
    Date.parse(secondEntry.publishedAt || secondEntry.updatedAt || secondEntry.createdAt) -
    Date.parse(firstEntry.publishedAt || firstEntry.updatedAt || firstEntry.createdAt)
  );
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function stringOrFallback(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}
