import { listCmsEntries, type CmsEntry } from "@/lib/cms/content";
import { getForumEntryModule } from "@/lib/cms/forum-modules";
import { sampleForumEntries } from "@/lib/cms/sample-forum";

export const FORUM_PAGE_SIZE = 10;

export type ForumSort = "new" | "hot";

export async function loadForumEntries() {
  try {
    const entries = await listCmsEntries({ contentType: "forum", publishedOnly: true });
    return entries.length ? entries : sampleForumEntries;
  } catch (error) {
    console.warn("Failed to load forum entries", error);
    return sampleForumEntries;
  }
}

export function searchForumEntries(entries: CmsEntry[], query: string) {
  const terms = normalizeSearchValue(query).split(" ").filter(Boolean);

  if (!terms.length) {
    return entries;
  }

  return entries.filter((entry) => {
    const module = getForumEntryModule(entry);
    const searchableValue = normalizeSearchValue(
      [entry.title, entry.excerpt, stripHtml(entry.body), entry.tags.join(" "), module?.name, module?.description]
        .filter(Boolean)
        .join(" "),
    );

    return terms.every((term) => searchableValue.includes(term));
  });
}

export function sortForumEntries(entries: CmsEntry[], sort: ForumSort) {
  const sortedEntries = [...entries];

  if (sort === "hot") {
    return sortedEntries.sort((firstEntry, secondEntry) => getHotScore(secondEntry) - getHotScore(firstEntry));
  }

  return sortedEntries.sort(
    (firstEntry, secondEntry) =>
      Date.parse(secondEntry.publishedAt || secondEntry.updatedAt) -
      Date.parse(firstEntry.publishedAt || firstEntry.updatedAt),
  );
}

export function parseForumSort(value: string | string[] | undefined): ForumSort {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue === "hot" ? "hot" : "new";
}

export function parsePageParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(rawValue || "1", 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function getVisiblePages(currentPage: number, totalPages: number) {
  return Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]))
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export function getCompactExcerpt(entry: CmsEntry) {
  const excerpt = entry.excerpt || "Read the latest community answer.";
  return excerpt.length > 150 ? `${excerpt.slice(0, 147).trim()}...` : excerpt;
}

export function formatPostCount(count: number) {
  return `${count} ${count === 1 ? "post" : "posts"}`;
}

export function formatPublishedDate(value: string) {
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

export function getFirstQueryValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, " ")
    .trim();
}

function stripHtml(value: string | null) {
  return value ? value.replace(/<[^>]*>/g, " ") : "";
}

function getHotScore(entry: CmsEntry) {
  const publishedTime = Date.parse(entry.publishedAt || entry.updatedAt);
  const ageInDays = Number.isNaN(publishedTime) ? 365 : (Date.now() - publishedTime) / 86_400_000;
  const recencyScore = Math.max(0, 90 - ageInDays) / 10;
  const mediaScore = entry.coverImageUrl ? 8 : 0;
  const contentScore = Math.min(stripHtml(entry.body).length, 2_400) / 240;
  const tagScore = Math.min(entry.tags.length, 5);

  return recencyScore + mediaScore + contentScore + tagScore;
}
