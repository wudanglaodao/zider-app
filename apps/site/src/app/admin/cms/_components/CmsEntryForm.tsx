import type { CmsContentType, CmsEntry } from "@/lib/cms/content";
import { extractCmsFaqItems, stripCmsFaqBlock } from "@/lib/cms/faq";

import { saveCmsEntryAction } from "../actions";
import { CmsFaqEditor } from "./CmsFaqEditor";
import { CmsRichTextEditor } from "./CmsRichTextEditor";

export function CmsEntryForm({
  entry,
  type = "blog",
}: {
  entry?: CmsEntry;
  type?: CmsContentType;
}) {
  const contentType = entry?.contentType ?? type;
  const status = entry?.status ?? "draft";
  const tags = entry?.tags.join(", ") ?? "";
  const body = stripCmsFaqBlock(entry?.body);
  const faqItems = extractCmsFaqItems(entry?.body);

  return (
    <form action={saveCmsEntryAction} className="form-card">
      <input name="id" type="hidden" value={entry?.id ?? ""} />

      <div className="form-head">
        <div>
          <p className="form-card__eyebrow">Editor</p>
          <h2>{entry ? "Edit content" : "Create content"}</h2>
        </div>
        <button className="cms-button" type="submit">
          Save content
        </button>
      </div>

      <div className="form-grid">
        <label>
          <span>Type</span>
          <select name="contentType" defaultValue={contentType}>
            <option value="blog">Blog</option>
            <option value="forum">Forum</option>
          </select>
        </label>
        <label>
          <span>Status</span>
          <select name="status" defaultValue={status}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          <span>Locale</span>
          <select name="locale" defaultValue={entry?.locale ?? "en"}>
            <option value="en">English</option>
            <option value="zh-Hant">繁中</option>
            <option value="zh-Hans">简中</option>
          </select>
        </label>
        <label>
          <span>Author</span>
          <input defaultValue={entry?.authorName ?? ""} name="authorName" placeholder="ZIDER Team" />
        </label>
      </div>

      <label>
        <span>Title</span>
        <input defaultValue={entry?.title ?? ""} name="title" placeholder="Content title" required />
      </label>
      <label>
        <span>Slug</span>
        <input defaultValue={entry?.slug ?? ""} name="slug" placeholder="auto-generated when empty" />
      </label>
      <label>
        <span>Excerpt</span>
        <textarea
          defaultValue={entry?.excerpt ?? ""}
          name="excerpt"
          placeholder="Short description for listing pages"
          rows={3}
        />
      </label>
      <label>
        <span>Cover image URL</span>
        <input defaultValue={entry?.coverImageUrl ?? ""} name="coverImageUrl" placeholder="https://cdn.example.com/app/zider/uploads/2024/12/image.png" />
      </label>
      <label>
        <span>Source URL</span>
        <input defaultValue={entry?.sourceUrl ?? ""} name="sourceUrl" placeholder="https://zider.ink/question/example/" />
      </label>

      <CmsRichTextEditor initialHtml={body} />

      {contentType === "forum" ? <CmsFaqEditor initialItems={faqItems} /> : null}

      <div className="field-grid">
        <label>
          <span>Tags</span>
          <input defaultValue={tags} name="tags" placeholder="migration, guide, wix" />
        </label>
      </div>
    </form>
  );
}
