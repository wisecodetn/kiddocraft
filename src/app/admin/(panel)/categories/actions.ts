"use server";

import { redirect } from "next/navigation";
import { bool, int, resolveSlug, revalidateStore, str, type FormState } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteImage, saveImage } from "@/lib/uploads";

const COLORS = ["yellow", "blue", "coral", "green"];

export async function saveCategory(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const nameFr = str(fd, "nameFr");
  const nameAr = str(fd, "nameAr");
  if (!nameFr) return { error: "Le nom en français est obligatoire." };
  if (!nameAr) return { error: "Le nom en arabe est obligatoire (الاسم بالعربية)." };

  const notSelf = id ? { id } : undefined;
  const slugFr = await resolveSlug(str(fd, "slugFr"), nameFr, async (s) => !!(await db.category.findFirst({ where: { slugFr: s, NOT: notSelf }, select: { id: true } })));
  if ("error" in slugFr) return slugFr;
  const slugAr = await resolveSlug(str(fd, "slugAr"), nameAr, async (s) => !!(await db.category.findFirst({ where: { slugAr: s, NOT: notSelf }, select: { id: true } })));
  if ("error" in slugAr) return slugAr;

  const current = id ? await db.category.findUnique({ where: { id }, select: { image: true } }) : null;
  let image = current?.image ?? null;
  let oldImage: string | null = null;
  try {
    const uploaded = await saveImage(fd.get("imageFile") as File | null, `cat-${slugFr.slug.slice(0, 30)}`);
    if (uploaded || bool(fd, "imageRemove")) {
      oldImage = image;
      image = uploaded;
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'envoi de l'image." };
  }

  const color = str(fd, "color");
  const data = {
    nameFr,
    nameAr,
    slugFr: slugFr.slug,
    slugAr: slugAr.slug,
    descFr: str(fd, "descFr"),
    descAr: str(fd, "descAr"),
    metaTitleFr: str(fd, "metaTitleFr"),
    metaTitleAr: str(fd, "metaTitleAr"),
    metaDescFr: str(fd, "metaDescFr"),
    metaDescAr: str(fd, "metaDescAr"),
    color: COLORS.includes(color) ? color : "blue",
    sortOrder: int(fd, "sortOrder") ?? 0,
    isActive: bool(fd, "isActive"),
    image,
  };

  const saved = id ? await db.category.update({ where: { id }, data }) : await db.category.create({ data });
  if (oldImage && oldImage !== image) await deleteImage(oldImage);
  revalidateStore();
  if (!id) redirect(`/admin/categories/${saved.id}?cree=1`);
  return { ok: "Catégorie enregistrée ✔" };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const cat = await db.category.delete({ where: { id } });
  await deleteImage(cat.image);
  revalidateStore();
  redirect("/admin/categories");
}
