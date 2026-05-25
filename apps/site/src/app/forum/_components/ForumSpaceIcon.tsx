import {
  Columns2,
  Copy,
  FileText,
  Gauge,
  Image,
  MessageSquareText,
  Repeat2,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

import type { ForumModuleIconKey } from "@/lib/cms/forum-modules";

const iconMap: Record<ForumModuleIconKey, LucideIcon> = {
  columns: Columns2,
  copy: Copy,
  "file-text": FileText,
  gauge: Gauge,
  image: Image,
  "message-square": MessageSquareText,
  repeat: Repeat2,
  "shopping-bag": ShoppingBag,
};

export function ForumSpaceIcon({ icon, size = 20 }: { icon: ForumModuleIconKey; size?: number }) {
  const Icon = iconMap[icon];

  return <Icon aria-hidden="true" size={size} strokeWidth={2.1} />;
}
