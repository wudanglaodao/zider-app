import type { CmsEntry } from "@/lib/cms/content";

export type ForumModule = {
  aliases: string[];
  description: string;
  group: ForumModuleGroupKey;
  icon: ForumModuleIconKey;
  key: string;
  name: string;
  status: string;
};

export type ForumModuleGroupKey = "community" | "components" | "workspace";

export type ForumModuleGroup = {
  description: string;
  key: ForumModuleGroupKey;
  modules: ForumModule[];
  name: string;
};

export type ForumModuleIconKey =
  | "columns"
  | "copy"
  | "file-text"
  | "gauge"
  | "image"
  | "message-square"
  | "printer"
  | "repeat"
  | "shopping-bag";

export const forumCommunitySpace: ForumModule = {
  key: "community",
  name: "Community",
  status: "Public",
  description: "Announcements, posting rules, and general notes for everyone using ZIDER apps.",
  group: "community",
  icon: "message-square",
  aliases: ["community", "announcement", "rules"],
};

const componentForumModules: ForumModule[] = [
  {
    key: "beforeafter_slider_x",
    name: "BeforeAfter Slider X",
    status: "Listed",
    description: "Image comparison setup, slider behavior, layout issues, and responsive display support.",
    group: "components",
    icon: "columns",
    aliases: ["beforeafter slider x", "slider x", "image compare"],
  },
  {
    key: "zider_copy_button_clipboard",
    name: "Zider Copy Button / Clipboard",
    status: "Listed",
    description: "One-click copy buttons, clipboard setup, style options, and embed troubleshooting.",
    group: "components",
    icon: "copy",
    aliases: ["copy button", "clipboard"],
  },
  {
    key: "zider_countup",
    name: "Zider CountUp",
    status: "Listed",
    description: "Animated counters, key stat displays, trigger behavior, and styling support.",
    group: "components",
    icon: "gauge",
    aliases: ["countup", "counter", "animated number"],
  },
  {
    key: "store_content_suite",
    name: "Store Content Suite",
    status: "Listed",
    description: "Rich product-page content, flexible store sections, setup questions, and content display notes.",
    group: "components",
    icon: "shopping-bag",
    aliases: ["store content suite", "store content"],
  },
  {
    key: "zider_loop_logo",
    name: "Zider Loop Logo",
    status: "Listed",
    description: "Auto-scrolling clickable logo carousels, loop timing, image sizing, and link setup.",
    group: "components",
    icon: "repeat",
    aliases: ["loop logo", "logo marquee", "carousel"],
  },
  {
    key: "zider_product_detail_enhancer",
    name: "Zider Product Detail Enhancer",
    status: "Listed",
    description: "Product detail sections, trust-building content, display issues, and store detail workflows.",
    group: "components",
    icon: "file-text",
    aliases: ["product detail", "detail enhancer", "商品詳細"],
  },
  {
    key: "before_and_after",
    name: "Before And After",
    status: "Listed",
    description: "Before-and-after visuals, comparison messaging, image setup, and responsive behavior.",
    group: "components",
    icon: "image",
    aliases: ["before and after", "違い", "image comparison"],
  },
];

const workspaceForumModules: ForumModule[] = [
  {
    key: "printops",
    name: "PrintOps",
    status: "Workspace",
    description: "PrintOps setup, template center notes, order printing workflows, and workspace help docs.",
    group: "workspace",
    icon: "printer",
    aliases: ["printops", "print ops", "print", "printing", "order printing", "template center", "workspace"],
  },
];

export const forumModuleGroups: ForumModuleGroup[] = [
  {
    key: "components",
    name: "Components",
    description: "Published Wix app components and widget support spaces.",
    modules: componentForumModules,
  },
  {
    key: "workspace",
    name: "Workspace",
    description: "Operational tools and workspace product help docs.",
    modules: workspaceForumModules,
  },
];

export const forumModules: ForumModule[] = forumModuleGroups.flatMap((group) => group.modules);

const forumModuleByEntrySlug: Record<string, string> = {
  "beforeafter-slider-x": "beforeafter_slider_x",
  "how-do-you-create-a-before-and-after-slider-in-wix": "before_and_after",
  "is-there-a-good-before-and-after-slider-app-for-wix-websites": "before_and_after",
  "where-can-i-find-a-before-and-after-slider-on-wix-is-free": "before_and_after",
  "what-is-the-best-wix-before-and-after-slider-for-showing-visual-comparisons": "before_and_after",
  "looking-for-a-simple-before-after-slider-app-for-wix": "before_and_after",
  "how-do-you-show-renovation-or-redesign-results-on-a-wix-site": "before_and_after",
  "how-to-set-before-and-after": "before_and_after",
};

export function getForumEntryModule(entry: Pick<CmsEntry, "excerpt" | "slug" | "tags" | "title">) {
  const moduleKey = forumModuleByEntrySlug[entry.slug];

  if (moduleKey) {
    return forumModules.find((module) => module.key === moduleKey) ?? null;
  }

  const haystack = [entry.title, entry.excerpt, ...entry.tags].filter(Boolean).join(" ").toLowerCase();
  return forumModules.find((module) => module.aliases.some((alias) => haystack.includes(alias)));
}

export function getForumModuleHref(module: Pick<ForumModule, "key">) {
  return `/forum/apps/${getForumModuleSlug(module)}`;
}

export function isForumCommunityEntry(entry: Pick<CmsEntry, "excerpt" | "slug" | "tags" | "title">) {
  const hasCommunityTag = entry.tags.some((tag) =>
    ["community", "announcement", "rules"].includes(tag.toLowerCase()),
  );

  return hasCommunityTag || !getForumEntryModule(entry);
}

export function getForumModuleBySlug(slug: string) {
  return forumModules.find((module) => module.key === slug || getForumModuleSlug(module) === slug) ?? null;
}

export function getForumModuleGroup(module: Pick<ForumModule, "group">) {
  return forumModuleGroups.find((group) => group.key === module.group) ?? null;
}

function getForumModuleSlug(module: Pick<ForumModule, "key">) {
  return module.key.replaceAll("_", "-");
}
