export const siteConfig = {
  defaultDescription:
    "ZIDER builds lightweight components, useful app features, and practical solutions for creator websites.",
  defaultOgImage: "/opengraph-image",
  email: "support@zider.ink",
  locale: "en_US",
  name: "ZIDER",
  shortName: "ZIDER",
  url: getSiteUrl(),
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "https://zider.ink")
    .replace(/^([^/.]+\.vercel\.app)$/i, "https://$1")
    .replace(/\/$/, "");
}
