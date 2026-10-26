"use server";

import { redirect } from "next/navigation";
import { bool, resolveSlug, revalidateStore, str, type FormState } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeRichText } from "@/lib/richtext";
import { deleteImage, saveImage } from "@/lib/uploads";

export async function savePost(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const titleFr = str(fd, "titleFr");
  const titleAr = str(fd, "titleAr");
  if (!titleFr) return { error: "Le titre en français est obligatoire." };
  if (!titleAr) return { error: "Le titre en arabe est obligatoire (العنوان بالعربية)." };

  const notSelf = id ? { id } : undefined;
  const slugFr = await resolveSlug(str(fd, "slugFr"), titleFr, async (s) => !!(await db.blogPost.findFirst({ where: { slugFr: s, NOT: notSelf }, select: { id: true } })));
  if ("error" in slugFr) return slugFr;
  const slugAr = await resolveSlug(str(fd, "slugAr"), titleAr, async (s) => !!(await db.blogPost.findFirst({ where: { slugAr: s, NOT: notSelf }, select: { id: true } })));
  if ("error" in slugAr) return slugAr;

  const current = id ? await db.blogPost.findUnique({ where: { id }, select: { coverImage: true, publishedAt: true } }) : null;
  let coverImage = current?.coverImage ?? null;
  let oldImage: string | null = null;
  try {
    const uploaded = await saveImage(fd.get("coverFile") as File | null, `blog-${slugFr.slug.slice(0, 30)}`);
    if (uploaded || bool(fd, "coverRemove")) {
      oldImage = coverImage;
      coverImage = uploaded;
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'envoi de l'image." };
  }

  const isPublished = bool(fd, "isPublished");
  const typedDate = str(fd, "publishedAt");
  const publishedAt = typedDate ? new Date(typedDate) : isPublished ? (current?.publishedAt ?? new Date()) : (current?.publishedAt ?? null);

  const data = {
    titleFr,
    titleAr,
    slugFr: slugFr.slug,
    slugAr: slugAr.slug,
    excerptFr: str(fd, "excerptFr"),
    excerptAr: str(fd, "excerptAr"),
    contentFr: sanitizeRichText(str(fd, "contentFr")),
    contentAr: sanitizeRichText(str(fd, "contentAr")),
    focusKeywordFr: str(fd, "focusKeywordFr"),
    focusKeywordAr: str(fd, "focusKeywordAr"),
    metaTitleFr: str(fd, "metaTitleFr"),
    metaTitleAr: str(fd, "metaTitleAr"),
    metaDescFr: str(fd, "metaDescFr"),
    metaDescAr: str(fd, "metaDescAr"),
    author: str(fd, "author") || "KiddoCraft",
    coverImage,
    isPublished,
    publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
  };

  const saved = id ? await db.blogPost.update({ where: { id }, data }) : await db.blogPost.create({ data });
  if (oldImage && oldImage !== coverImage) await deleteImage(oldImage);
  revalidateStore();
  if (!id) redirect(`/admin/blog/${saved.id}?cree=1`);
  return { ok: isPublished ? "Article enregistré et publié ✔" : "Brouillon enregistré ✔" };
}

export async function deletePost(id: string) {
  await requireAdmin();
  const post = await db.blogPost.delete({ where: { id } });
  await deleteImage(post.coverImage);
  revalidateStore();
  redirect("/admin/blog");
}
