type CategoryEntry = {
  authorName?: string | null;
  excerpt?: string | null;
  tags: string[];
  title?: string;
};

const ignoredTags = new Set(["en", "zh", "zh-cn", "zh-hans", "zh-hant", "cn", "yangxi", "zider", "team", "admin"]);

const categoryAliases: Record<string, string> = {
  ai: "AI",
  api: "API",
  app: "Apps",
  apps: "Apps",
  architecture: "Architecture",
  cms: "CMS",
  component: "Components",
  components: "Components",
  forum: "Forum",
  guide: "Guides",
  guides: "Guides",
  migration: "Migration",
  seo: "SEO",
  shopify: "Shopify",
  solution: "Solutions",
  solutions: "Solutions",
  ui: "UI",
  ux: "UX",
  vercel: "Vercel",
  wix: "Wix",
  "wix studio": "Wix Studio",
  wordpress: "WordPress",
};

const inferredCategories = [
  { label: "Solutions", keywords: ["solution", "integration", "workflow", "zenstores", "fulfillment"] },
  { label: "Apps", keywords: ["app", "product detail", "slider", "before & after", "before and after"] },
  { label: "Components", keywords: ["component", "interaction", "widget", "block"] },
  { label: "CMS", keywords: ["cms", "migration"] },
  { label: "Wix", keywords: ["wix", "wix studio"] },
];

export function getCmsCategoryName(entry: CategoryEntry) {
  const authorTag = normalizeCategoryToken(entry.authorName || "");
  const category = getDisplayTags(entry).find((tag) => normalizeCategoryToken(tag) !== authorTag);

  if (category) {
    return formatCategory(category);
  }

  return inferCategoryName(entry) ?? "Article";
}

export function getDisplayTags(entry: CategoryEntry) {
  const authorTag = normalizeCategoryToken(entry.authorName || "");

  return entry.tags.filter((tag) => {
    const normalized = normalizeCategoryToken(tag);
    return normalized && normalized !== authorTag && !ignoredTags.has(normalized);
  });
}

export function getDisplayTagLabels(entry: CategoryEntry, limit = 3) {
  const labels = getDisplayTags(entry).map(formatCategory);
  const uniqueLabels = Array.from(new Set(labels));

  return uniqueLabels.length ? uniqueLabels.slice(0, limit) : [getCmsCategoryName(entry)];
}

function inferCategoryName(entry: CategoryEntry) {
  const haystack = [entry.title, entry.excerpt, entry.tags.join(" ")].filter(Boolean).join(" ").toLowerCase();
  const match = inferredCategories.find((category) => category.keywords.some((keyword) => haystack.includes(keyword)));
  return match?.label;
}

function formatCategory(value: string) {
  const normalized = normalizeCategoryToken(value);

  if (categoryAliases[normalized]) {
    return categoryAliases[normalized];
  }

  return normalized
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeCategoryToken(value: string) {
  return value.trim().toLowerCase();
}
