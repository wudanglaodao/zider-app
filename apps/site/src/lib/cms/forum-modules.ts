import type { CmsEntry } from "@/lib/cms/content";

export type ForumModule = {
  aliases: string[];
  description: string;
  icon: ForumModuleIconKey;
  key: string;
  name: string;
  status: string;
};

export type ForumModuleIconKey =
  | "columns"
  | "copy"
  | "file-text"
  | "gauge"
  | "image"
  | "message-square"
  | "repeat"
  | "shopping-bag";

export const forumCommunitySpace: ForumModule = {
  key: "community",
  name: "Community",
  status: "Public",
  description: "Announcements, posting rules, and general notes for everyone using ZIDER apps.",
  icon: "message-square",
  aliases: ["community", "announcement", "rules"],
};

export const forumModules: ForumModule[] = [
  {
    key: "beforeafter_slider_x",
    name: "BeforeAfter Slider X",
    status: "Listed",
    description: "Image comparison setup, slider behavior, layout issues, and responsive display support.",
    icon: "columns",
    aliases: ["beforeafter slider x", "slider x", "image compare"],
  },
  {
    key: "zider_copy_button_clipboard",
    name: "Zider Copy Button / Clipboard",
    status: "Listed",
    description: "One-click copy buttons, clipboard setup, style options, and embed troubleshooting.",
    icon: "copy",
    aliases: ["copy button", "clipboard"],
  },
  {
    key: "zider_countup",
    name: "Zider CountUp",
    status: "Listed",
    description: "Animated counters, key stat displays, trigger behavior, and styling support.",
    icon: "gauge",
    aliases: ["countup", "counter", "animated number"],
  },
  {
    key: "store_content_suite",
    name: "Store Content Suite",
    status: "Listed",
    description: "Rich product-page content, flexible store sections, setup questions, and content display notes.",
    icon: "shopping-bag",
    aliases: ["store content suite", "store content"],
  },
  {
    key: "zider_loop_logo",
    name: "Zider Loop Logo",
    status: "Listed",
    description: "Auto-scrolling clickable logo carousels, loop timing, image sizing, and link setup.",
    icon: "repeat",
    aliases: ["loop logo", "logo marquee", "carousel"],
  },
  {
    key: "zider_product_detail_enhancer",
    name: "Zider Product Detail Enhancer",
    status: "Listed",
    description: "Product detail sections, trust-building content, display issues, and store detail workflows.",
    icon: "file-text",
    aliases: ["product detail", "detail enhancer", "商品詳細"],
  },
  {
    key: "before_and_after",
    name: "Before And After",
    status: "Listed",
    description: "Before-and-after visuals, comparison messaging, image setup, and responsive behavior.",
    icon: "image",
    aliases: ["before and after", "違い", "image comparison"],
  },
];

export function getForumEntryModule(entry: Pick<CmsEntry, "excerpt" | "tags" | "title">) {
  const haystack = [entry.title, entry.excerpt, ...entry.tags].filter(Boolean).join(" ").toLowerCase();
  return forumModules.find((module) => module.aliases.some((alias) => haystack.includes(alias)));
}

export function getForumModuleHref(module: Pick<ForumModule, "key">) {
  return `/forum/apps/${getForumModuleSlug(module)}`;
}

export function isForumCommunityEntry(entry: Pick<CmsEntry, "excerpt" | "tags" | "title">) {
  const hasCommunityTag = entry.tags.some((tag) =>
    ["community", "announcement", "rules"].includes(tag.toLowerCase()),
  );

  return hasCommunityTag || !getForumEntryModule(entry);
}

export function getForumModuleBySlug(slug: string) {
  return forumModules.find((module) => module.key === slug || getForumModuleSlug(module) === slug) ?? null;
}

function getForumModuleSlug(module: Pick<ForumModule, "key">) {
  return module.key.replaceAll("_", "-");
}
