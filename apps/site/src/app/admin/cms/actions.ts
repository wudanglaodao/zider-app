"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/account/session";
import { archiveCmsEntry, parseTagInput, upsertCmsEntry } from "@/lib/cms/content";

export async function saveCmsEntryAction(formData: FormData) {
  await requireAdminSession("/admin/cms");

  await upsertCmsEntry({
    authorName: stringValue(formData, "authorName"),
    body: stringValue(formData, "body"),
    contentType: stringValue(formData, "contentType") === "forum" ? "forum" : "blog",
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
