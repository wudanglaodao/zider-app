"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/account/session";
import { archiveCmsEntry, parseTagInput, upsertCmsEntry } from "@/lib/cms/content";
import { applyCmsFaqItemsToBody, parseCmsFaqInput } from "@/lib/cms/faq";

export async function saveCmsEntryAction(formData: FormData) {
  await requireAdminSession("/admin/cms");

  const contentType = stringValue(formData, "contentType") === "forum" ? "forum" : "blog";
  const body = stringValue(formData, "body");
  const faqItems = parseCmsFaqInput(stringValue(formData, "faqItems"));

  const savedEntry = await upsertCmsEntry({
    authorName: stringValue(formData, "authorName"),
    body: contentType === "forum" ? applyCmsFaqItemsToBody(body, faqItems) : body,
    contentType,
    coverImageUrl: stringValue(formData, "coverImageUrl"),
    excerpt: stringValue(formData, "excerpt"),
    id: stringValue(formData, "id"),
    locale: stringValue(formData, "locale") || "en",
    slug: stringValue(formData, "slug"),
    sourceUrl: stringValue(formData, "sourceUrl"),
    status: parseStatus(stringValue(formData, "status")),
    tags: parseTagInput(stringValue(formData, "tags")),
    title: stringValue(formData, "title"),
  });

  revalidatePath("/admin/cms");
  revalidatePath("/blog");
  revalidatePath("/forum");
  revalidatePath(`/${savedEntry.contentType}/${savedEntry.slug}`);
  redirect("/admin/cms?saved=1");
}

export async function archiveCmsEntryAction(formData: FormData) {
  await requireAdminSession("/admin/cms");

  await archiveCmsEntry(stringValue(formData, "id"));
  revalidatePath("/admin/cms");
  revalidatePath("/blog");
  revalidatePath("/forum");
  redirect("/admin/cms?saved=1");
}

function parseStatus(value: string) {
  if (value === "published" || value === "archived") {
    return value;
  }

  return "draft";
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
