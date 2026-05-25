#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const defaultAssetPrefix = "app/zider/uploads";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.file) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

await loadDotEnv(path.resolve(".env.local"));
await loadDotEnv(path.resolve(".env"));

const inputPath = path.resolve(args.file);
const outputDir = path.resolve(args.outDir || "tmp/cms-import");
const assetPrefix = stripSlashes(args.assetPrefix || process.env.CMS_ASSET_PREFIX || defaultAssetPrefix);
const assetBaseUrl = stripTrailingSlash(args.assetBaseUrl || process.env.CMS_ASSET_BASE_URL || "");
const xml = await readFile(inputPath, "utf8");
const parsed = parseWordPressExport(xml, { assetBaseUrl, assetPrefix, forceDraft: Boolean(args.draft) });

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "blog-entries.json"), `${JSON.stringify(parsed.entries, null, 2)}\n`);
await writeFile(path.join(outputDir, "blog-media-manifest.csv"), toMediaCsv(parsed.media));
await writeFile(path.join(outputDir, "blog-import.sql"), toSql(parsed.entries));

if (args.write) {
  await writeEntries(parsed.entries);
}

console.log(
  [
    `Parsed ${parsed.entries.length} WordPress Blog entries.`,
    `Found ${parsed.media.length} unique media URLs.`,
    `Output: ${outputDir}`,
    args.write ? "Supabase write: complete." : "Supabase write: skipped. Re-run with --write after reviewing the preview.",
  ].join("\n"),
);

function parseWordPressExport(source, options) {
  const itemBlocks = [...source.matchAll(/<item>[\s\S]*?<\/item>/g)].map((match) => match[0]);
  const blogBlocks = itemBlocks.filter((block) => getTag(block, "wp:post_type") === "blog");
  const mediaByUrl = new Map();

  const entries = blogBlocks.map((block) => {
    const sourceUrl = decodeEntities(getTag(block, "link"));
    const rawContent = getTag(block, "content:encoded");
    const originalImageUrls = extractImageUrls(rawContent);
    const content = normalizeContent(rewriteUploadUrls(cleanWordPressContent(rawContent), options, mediaByUrl, sourceUrl));
    const coverImageUrl = originalImageUrls[0] ? rewriteUploadUrl(originalImageUrls[0], options, mediaByUrl, sourceUrl) : null;
    const postDate = getTag(block, "wp:post_date_gmt") || getTag(block, "wp:post_date") || getTag(block, "pubDate");
    const status = getTag(block, "wp:status") === "publish" && !options.forceDraft ? "published" : "draft";
    const tags = getCategories(block);
    const excerpt = getTag(block, "excerpt:encoded") || excerptFromContent(content);

    return {
      author_name: getTag(block, "dc:creator") || "ZIDER Team",
      body: content,
      content_type: "blog",
      cover_image_url: coverImageUrl,
      excerpt,
      locale: "en",
      published_at: status === "published" ? toIsoDate(postDate) : null,
      slug: normalizeSlug(decodeUriComponentSafe(getTag(block, "wp:post_name")) || getTag(block, "title")),
      source_url: sourceUrl || null,
      status,
      tags,
      title: decodeEntities(getTag(block, "title")),
      updated_at: toIsoDate(getTag(block, "wp:post_modified_gmt") || getTag(block, "wp:post_modified")) || new Date().toISOString(),
    };
  });

  return {
    entries,
    media: [...mediaByUrl.values()].sort((a, b) => a.original_url.localeCompare(b.original_url)),
  };
}

function cleanWordPressContent(value) {
  return decodeEntities(value)
    .replace(/\r\n/g, "\n")
    .replace(/\[mocom_pic[\s\S]*?\]/g, "")
    .replace(/\[post\s+[^\]]*]/g, "")
    .replace(/\[(?:\/)?[a-zA-Z_][^\]]*]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeContent(value) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (isBlockHtmlLine(line)) {
        return line;
      }

      return `<p>${containsHtml(line) ? line : escapeHtml(line)}</p>`;
    })
    .join("\n");
}

function isBlockHtmlLine(value) {
  return /^<\/?(?:h[1-6]|p|ul|ol|li|img|figure|figcaption|blockquote|table|thead|tbody|tr|td|th|pre|code|div|hr|iframe)\b/i.test(value);
}

function containsHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function extractImageUrls(value) {
  return [...value.matchAll(/\bsrc=["']([^"']+)["']/gi)]
    .map((match) => decodeEntities(match[1]))
    .filter((url) => /\/wp-content\/uploads\//.test(url));
}

function rewriteUploadUrls(value, options, mediaByUrl, sourceUrl) {
  return value.replace(/https?:\/\/zider\.ink\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s<)]+/gi, (url) =>
    rewriteUploadUrl(url, options, mediaByUrl, sourceUrl),
  );
}

function rewriteUploadUrl(url, options, mediaByUrl, sourceUrl) {
  const normalizedUrl = decodeEntities(url);
  const target = getUploadTarget(normalizedUrl, options);
  const existing = mediaByUrl.get(normalizedUrl);

  if (existing) {
    if (sourceUrl && !existing.posts.includes(sourceUrl)) {
      existing.posts.push(sourceUrl);
    }
  } else {
    mediaByUrl.set(normalizedUrl, {
      file_name: target.fileName,
      month: target.month,
      original_url: normalizedUrl,
      posts: sourceUrl ? [sourceUrl] : [],
      target_key: target.key,
      target_url: target.url,
      year: target.year,
    });
  }

  return target.url || normalizedUrl;
}

function getUploadTarget(url, options) {
  const parsedUrl = new URL(url);
  const match = parsedUrl.pathname.match(/\/wp-content\/uploads\/(\d{4})\/(\d{2})\/(.+)$/);
  const year = match?.[1] || "unknown";
  const month = match?.[2] || "unknown";
  const fileName = decodeURIComponent(path.posix.basename(match?.[3] || parsedUrl.pathname));
  const key = `${options.assetPrefix}/${year}/${month}/${fileName}`;
  return {
    fileName,
    key,
    month,
    url: options.assetBaseUrl ? `${options.assetBaseUrl}/${key}` : "",
    year,
  };
}

function getCategories(block) {
  return [...block.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/g)]
    .map((match) => decodeCdata(match[1]))
    .map(normalizeTag)
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index)
    .slice(0, 12);
}

function excerptFromContent(content) {
  const text = content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 220 ? `${text.slice(0, 217).trim()}...` : text;
}

function getTag(block, tagName) {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp(`<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}>`));
  return match ? decodeCdata(match[1]).trim() : "";
}

function decodeCdata(value) {
  return decodeEntities(value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, ""));
}

function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function normalizeSlug(value) {
  return decodeEntities(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function normalizeTag(value) {
  const tag = decodeEntities(value).trim().toLowerCase();
  const tagMap = {
    "app&blcok": "apps",
    "app&block": "apps",
    "system integration": "solutions",
  };

  return tagMap[tag] || tag;
}

function decodeUriComponentSafe(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(`${value.replace(" ", "T")}Z`).toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toMediaCsv(items) {
  const rows = [["original_url", "target_key", "target_url", "year", "month", "file_name", "posts"]];

  for (const item of items) {
    rows.push([
      item.original_url,
      item.target_key,
      item.target_url,
      item.year,
      item.month,
      item.file_name,
      item.posts.join(" | "),
    ]);
  }

  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function toSql(entries) {
  const values = entries
    .map(
      (entry) => `(
  ${sqlString(entry.content_type)},
  ${sqlString(entry.locale)},
  ${sqlString(entry.title)},
  ${sqlString(entry.slug)},
  ${sqlString(entry.status)},
  ${sqlString(entry.excerpt)},
  ${sqlString(entry.body)},
  ${sqlString(entry.cover_image_url)},
  ${sqlArray(entry.tags)},
  ${sqlString(entry.source_url)},
  ${sqlString(entry.author_name)},
  ${sqlString(entry.published_at)},
  ${sqlString(entry.updated_at)}
)`,
    )
    .join(",\n");

  return `insert into public.cms_entries (
  content_type,
  locale,
  title,
  slug,
  status,
  excerpt,
  body,
  cover_image_url,
  tags,
  source_url,
  author_name,
  published_at,
  updated_at
) values
${values}
on conflict (content_type, locale, slug)
do update set
  title = excluded.title,
  status = excluded.status,
  excerpt = excluded.excerpt,
  body = excluded.body,
  cover_image_url = excluded.cover_image_url,
  tags = excluded.tags,
  source_url = excluded.source_url,
  author_name = excluded.author_name,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;
`;
}

function sqlString(value) {
  if (!value) {
    return "null";
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArray(values) {
  if (!values.length) {
    return "'{}'";
  }

  return `array[${values.map(sqlString).join(", ")}]::text[]`;
}

async function writeEntries(entries) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for --write.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("cms_entries").upsert(entries, {
    onConflict: "content_type,locale,slug",
  });

  if (error) {
    throw new Error(`Failed to import CMS entries: ${error.message}`);
  }
}

async function loadDotEnv(filePath) {
  let content = "";

  try {
    content = await readFile(filePath, "utf8");
  } catch {
    return;
  }

  for (const line of content.split(/\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--write") {
      parsed.write = true;
    } else if (arg === "--draft") {
      parsed.draft = true;
    } else if (arg === "--file") {
      parsed.file = argv[++index];
    } else if (arg === "--out-dir") {
      parsed.outDir = argv[++index];
    } else if (arg === "--asset-base-url") {
      parsed.assetBaseUrl = argv[++index];
    } else if (arg === "--asset-prefix") {
      parsed.assetPrefix = argv[++index];
    }
  }

  return parsed;
}

function stripSlashes(value) {
  return value.replace(/^\/+|\/+$/g, "");
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/g, "");
}

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function printHelp() {
  console.log(`Usage:
  node scripts/import-wordpress-blog.mjs --file /path/to/wordpress.xml

Options:
  --asset-base-url https://cdn.example.com  Rewrite wp-content uploads to this COS/CDN base URL.
  --asset-prefix app/zider/uploads           COS object key prefix. Default: ${defaultAssetPrefix}
  --out-dir tmp/cms-import                   Preview output directory.
  --draft                                    Import entries as drafts.
  --write                                    Upsert into Supabase cms_entries.

The script always writes:
  blog-entries.json
  blog-media-manifest.csv
  blog-import.sql
`);
}
