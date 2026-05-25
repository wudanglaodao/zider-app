# WordPress Blog migration

Use this flow to migrate the old `zider.ink/blog` WordPress export into the new ZIDER CMS.

## Current scope

- Import only WordPress items where `wp:post_type` is `blog`.
- Keep entries as `content_type = blog`.
- Preserve title, slug, status, excerpt, body HTML, tags, author, published time, source URL, and cover image URL.
- Strip WordPress shortcodes such as `mocom_pic` and `post`.
- Generate a media manifest for manual Tencent Cloud COS upload.

## COS media path

Default object key pattern:

```text
app/zider/uploads/YYYY/MM/file-name.ext
```

Example:

```text
app/zider/uploads/2024/12/zider-WIX-Studio-Rental-Agency-02.png
```

## Dry run

```bash
npm run import:wordpress-blog -- \
  --file /Users/yancy/Downloads/zider.WordPress.2026-05-23.xml \
  --out-dir tmp/cms-import
```

Generated files:

```text
tmp/cms-import/blog-entries.json
tmp/cms-import/blog-media-manifest.csv
tmp/cms-import/blog-import.sql
```

## With COS/CDN URL rewrite

After the COS CDN/base URL is ready:

```bash
npm run import:wordpress-blog -- \
  --file /Users/yancy/Downloads/zider.WordPress.2026-05-23.xml \
  --asset-base-url https://cdn.example.com \
  --asset-prefix app/zider/uploads \
  --out-dir tmp/cms-import
```

This rewrites old `https://zider.ink/wp-content/uploads/...` URLs to:

```text
https://cdn.example.com/app/zider/uploads/YYYY/MM/file-name.ext
```

## Import to Supabase

Apply the CMS cover image migration first:

```sql
alter table public.cms_entries
  add column if not exists cover_image_url text;
```

Then run:

```bash
npm run import:wordpress-blog -- \
  --file /Users/yancy/Downloads/zider.WordPress.2026-05-23.xml \
  --asset-base-url https://cdn.example.com \
  --asset-prefix app/zider/uploads \
  --write
```

The script upserts by:

```text
content_type, locale, slug
```
