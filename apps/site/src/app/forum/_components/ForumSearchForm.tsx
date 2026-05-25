import { Search } from "lucide-react";

import type { ForumSort } from "@/app/forum/_lib/forum-listing";

export function ForumSearchForm({ defaultQuery = "", sort = "new" }: { defaultQuery?: string; sort?: ForumSort }) {
  return (
    <form action="/forum/search" className="forumSearchForm" role="search">
      <label className="srOnly" htmlFor="forum-search-input">
        Search community
      </label>
      <span className="forumSearchIcon" aria-hidden="true">
        <Search size={18} strokeWidth={2} />
      </span>
      <input
        autoComplete="off"
        defaultValue={defaultQuery}
        id="forum-search-input"
        name="q"
        placeholder="Search by topic, tag or category"
        type="search"
      />
      {sort === "hot" ? <input name="sort" type="hidden" value="hot" /> : null}
      <button type="submit">Search</button>
    </form>
  );
}
