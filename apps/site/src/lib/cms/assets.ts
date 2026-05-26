import type { CmsEntry } from "@/lib/cms/content";

const legacyUploadUrlPattern = /https?:\/\/(?:www\.)?zider\.ink\/wp-content\/uploads\//gi;
const assetUploadBaseUrl = "https://assets.lopuo.com/app/zider/uploads/";

export function normalizeCmsAssetUrls<T extends string | null | undefined>(value: T): T {
  if (!value) {
    return value;
  }

  return value.replace(legacyUploadUrlPattern, assetUploadBaseUrl) as T;
}

export function normalizeCmsEntryAssetUrls(entry: CmsEntry): CmsEntry {
  return {
    ...entry,
    body: normalizeCmsAssetUrls(entry.body),
    coverImageUrl: normalizeCmsAssetUrls(entry.coverImageUrl),
  };
}
