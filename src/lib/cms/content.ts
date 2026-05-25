import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase/server";

export type CmsContentType = "blog" | "forum";
export type CmsEntryStatus = "draft" | "published" | "archived";

export type CmsEntry = {
  id: string;
  contentType: CmsContentType;
  locale: string;
  title: string;
  slug: string;
  status: CmsEntryStatus;
  excerpt: string | null;
  body: string | null;
  tags: string[];
  sourceUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const cmsEntrySelect = `
  id,
  content_type,
  locale,
  title,
  slug,
  status,
  excerpt,
  body,
  tags,
  source_url,
  author_name,
  published_at,
  created_at,
  updated_at
`;

export const cmsEntryInputSchema = z.object({
  authorName: z.string().trim().max(120).optional(),
  body: z.string().trim().optional(),
  contentType: z.enum(["blog", "forum"]),
  excerpt: z.string().trim().max(420).optional(),
  locale: z.string().trim().min(2).max(12).default("en"),
  slug: z.string().trim().max(160).optional(),
  sourceUrl: z.string().trim().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
  title: z.string().trim().min(1).max(180),
});

export type CmsEntryInput = z.input<typeof cmsEntryInputSchema>;

type CmsEntryRow = {
  author_name: string | null;
  body: string | null;
  content_type: CmsContentType;
  created_at: string;
  excerpt: string | null;
  id: string;
  locale: string;
  published_at: string | null;
  slug: string;
  source_url: string | null;
  status: CmsEntryStatus;
  tags: string[] | null;
  title: string;
  updated_at: string;
};

export async function listCmsEntries(options: {
  contentType?: CmsContentType;
  includeArchived?: boolean;
  publishedOnly?: boolean;
} = {}) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("cms_entries")
    .select(cmsEntrySelect)
    .order("updated_at", { ascending: false });

  if (options.contentType) {
    query = query.eq("content_type", options.contentType);
  }

  if (options.publishedOnly) {
    query = query.eq("status", "published");
  } else if (!options.includeArchived) {
    query = query.neq("status", "archived");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load CMS entries: ${error.message}`);
  }

  return (data ?? []).map(mapCmsEntry);
}

export async function getPublishedCmsEntry(contentType: CmsContentType, slug: string, locale = "en") {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_entries")
    .select(cmsEntrySelect)
    .eq("content_type", contentType)
    .eq("slug", slug)
    .eq("locale", locale)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load CMS entry: ${error.message}`);
  }

  return data ? mapCmsEntry(data) : null;
}

export async function getCmsStats() {
  const entries = await listCmsEntries({ includeArchived: true });

  return {
    archived: entries.filter((entry) => entry.status === "archived").length,
    blog: entries.filter((entry) => entry.contentType === "blog").length,
    draft: entries.filter((entry) => entry.status === "draft").length,
    forum: entries.filter((entry) => entry.contentType === "forum").length,
    published: entries.filter((entry) => entry.status === "published").length,
    total: entries.length,
  };
}

export async function upsertCmsEntry(input: CmsEntryInput) {
  const parsed = cmsEntryInputSchema.parse(input);
  const slug = normalizeSlug(parsed.slug || parsed.title);
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("cms_entries")
    .upsert(
      {
        author_name: emptyToNull(parsed.authorName),
        body: emptyToNull(parsed.body),
        content_type: parsed.contentType,
        excerpt: emptyToNull(parsed.excerpt),
        locale: parsed.locale,
        published_at: parsed.status === "published" ? now : null,
        slug,
        source_url: emptyToNull(parsed.sourceUrl),
        status: parsed.status,
        tags: parsed.tags,
        title: parsed.title,
        updated_at: now,
      },
      {
        onConflict: "content_type,locale,slug",
      },
    )
    .select(cmsEntrySelect)
    .single();

  if (error) {
    throw new Error(`Failed to save CMS entry: ${error.message}`);
  }

  return mapCmsEntry(data);
}

export async function archiveCmsEntry(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_entries")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(cmsEntrySelect)
    .single();

  if (error) {
    throw new Error(`Failed to archive CMS entry: ${error.message}`);
  }

  return mapCmsEntry(data);
}

export function normalizeSlug(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);

  return slug || `entry-${Date.now()}`;
}

export function parseTagInput(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function mapCmsEntry(row: CmsEntryRow): CmsEntry {
  return {
    authorName: row.author_name,
    body: row.body,
    contentType: row.content_type,
    createdAt: row.created_at,
    excerpt: row.excerpt,
    id: row.id,
    locale: row.locale,
    publishedAt: row.published_at,
    slug: row.slug,
    sourceUrl: row.source_url,
    status: row.status,
    tags: row.tags ?? [],
    title: row.title,
    updatedAt: row.updated_at,
  };
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
