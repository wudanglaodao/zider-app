import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAdminSession } from "@/lib/account/session";
import { getCmsEntryById } from "@/lib/cms/content";

import { CmsAdminChrome } from "../../_components/CmsAdminChrome";
import { CmsEntryForm } from "../../_components/CmsEntryForm";

export const metadata: Metadata = {
  title: "Edit CMS Entry - ZIDER",
};

type EditCmsEntryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCmsEntryPage({ params }: EditCmsEntryPageProps) {
  const { id } = await params;

  await requireAdminSession(`/admin/cms/${id}/edit`);

  const entry = await loadEntry(id);

  if (!entry) {
    notFound();
  }

  return (
    <CmsAdminChrome
      actions={
        <>
          <a className="cms-button-secondary" href="/admin/cms">
            Back to list
          </a>
          <a className="cms-button-secondary" href={`/${entry.contentType}/${entry.slug}`}>
            View entry
          </a>
        </>
      }
      description={`Editing /${entry.contentType}/${entry.slug}`}
      title="Edit content"
    >
      <section className="cms-section">
        <CmsEntryForm entry={entry} />
      </section>
    </CmsAdminChrome>
  );
}

async function loadEntry(id: string) {
  try {
    return await getCmsEntryById(id);
  } catch {
    return null;
  }
}
