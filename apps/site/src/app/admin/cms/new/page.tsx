import type { Metadata } from "next";

import { requireAdminSession } from "@/lib/account/session";
import type { CmsContentType } from "@/lib/cms/content";

import { CmsAdminChrome } from "../_components/CmsAdminChrome";
import { CmsEntryForm } from "../_components/CmsEntryForm";

export const metadata: Metadata = {
  title: "New CMS Entry - ZIDER",
};

type NewCmsEntryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewCmsEntryPage({ searchParams }: NewCmsEntryPageProps) {
  const params = (await searchParams) ?? {};
  const type = readSearchParam(params.type) === "forum" ? "forum" : "blog";

  await requireAdminSession(`/admin/cms/new?type=${type}`);

  return (
    <CmsAdminChrome
      actions={
        <>
          <a className="cms-button-secondary" href="/admin/cms">
            Back to list
          </a>
          <a className="cms-button-secondary" href="/">
            View site
          </a>
        </>
      }
      description="Create a Blog post or Forum answer with rich text, links, and inline images."
      title="New content"
    >
      <section className="cms-section">
        <CmsEntryForm type={type as CmsContentType} />
      </section>
    </CmsAdminChrome>
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
