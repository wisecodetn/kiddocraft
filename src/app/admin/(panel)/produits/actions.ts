"use server";

import { redirect } from "next/navigation";
import { bool, files, int, money, resolveSlug, revalidateStore, str, type FormState } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeRichText } from "@/lib/richtext";
import { deleteImage, saveImage } from "@/lib/uploads";

/** Creates (id = null) or updates a product, its photos included. */
export async function saveProduct(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  const nameFr = str(fd, "nameFr");
  const nameAr = str(fd, "nameAr");
  const price = money(fd, "price");
  if (!nameFr) return { error: "Le nom en français est obligatoire." };
  if (!nameAr) return { error: "Le nom en arabe est obligatoire (الاسم بالعربية)." };
  if (price == null) return { error: "Le prix est obligatoire." };
  const compareAtPrice = money(fd, "compareAtPrice");
  if (compareAtPrice != null && compareAtPrice <= price) return { error: "Le prix barré doit être supérieur au prix de vente." };
  const ageMin = int(fd, "ageMin");
  const ageMax = int(fd, "ageMax");
  if (ageMin != null && ageMax != null && ageMin > ageMax) return { error: "L'âge minimum doit être inférieur à l'âge maximum." };

  const slugFr = await resolveSlug(str(fd, "slugFr"), nameFr, async (s) => !!(await db.product.findFirst({ where: { slugFr: s, NOT: id ? { id } : undefined }, select: { id: true } })));
  if ("error" in slugFr) return slugFr;
  const slugAr = await resolveSlug(str(fd, "slugAr"), nameAr, async (s) => !!(await db.product.findFirst({ where: { slugAr: s, NOT: id ? { id } : undefined }, select: { id: true } })));
  if ("error" in slugAr) return slugAr;

  const sku = str(fd, "sku") || null;
  if (sku && (await db.product.findFirst({ where: { sku, NOT: id ? { id } : undefined }, select: { id: true } }))) return { error: `La référence « ${sku} » est déjà utilisée.` };

  const data = {
    nameFr,
    nameAr,
    slugFr: slugFr.slug,
    slugAr: slugAr.slug,
    shortDescFr: str(fd, "shortDescFr"),
    shortDescAr: str(fd, "shortDescAr"),
    descFr: sanitizeRichText(str(fd, "descFr")),
    descAr: sanitizeRichText(str(fd, "descAr")),
    focusKeywordFr: str(fd, "focusKeywordFr"),
    focusKeywordAr: str(fd, "focusKeywordAr"),
    metaTitleFr: str(fd, "metaTitleFr"),
    metaTitleAr: str(fd, "metaTitleAr"),
    metaDescFr: str(fd, "metaDescFr"),
    metaDescAr: str(fd, "metaDescAr"),
    price,
    compareAtPrice,
    sku,
    stock: Math.max(0, int(fd, "stock") ?? 0),
    ageMin,
    ageMax,
    pieces: int(fd, "pieces"),
    categoryId: str(fd, "categoryId") || null,
    isActive: bool(fd, "isActive"),
    isFeatured: bool(fd, "isFeatured"),
  };

  // Upload new photos first; if the database write fails they're removed again.
  let uploaded: string[] = [];
  try {
    uploaded = (await Promise.all(files(fd, "newImages").map((f) => saveImage(f, slugFr.slug.slice(0, 40))))).filter((u): u is string => !!u);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'envoi des images." };
  }

  const keepIds = fd.getAll("imageIds").map(String);
  let removedUrls: string[] = [];
  let productId = id;

  try {
    await db.$transaction(async (tx) => {
      if (productId) {
        await tx.product.update({ where: { id: productId }, data });
        const removed = await tx.productImage.findMany({ where: { productId, id: { notIn: keepIds } }, select: { url: true } });
        removedUrls = removed.map((r) => r.url);
        await tx.productImage.deleteMany({ where: { productId, id: { notIn: keepIds } } });
        for (const [i, imageId] of keepIds.entries()) {
          await tx.productImage.updateMany({
            where: { id: imageId, productId },
            data: { sortOrder: i, altFr: str(fd, `alt_fr_${imageId}`), altAr: str(fd, `alt_ar_${imageId}`) },
          });
        }
      } else {
        productId = (await tx.product.create({ data, select: { id: true } })).id;
      }
      if (uploaded.length) {
        await tx.productImage.createMany({
          data: uploaded.map((url, i) => ({ productId: productId!, url, altFr: nameFr, altAr: nameAr, sortOrder: keepIds.length + i })),
        });
      }
    });
  } catch (e) {
    await Promise.all(uploaded.map(deleteImage));
    console.error("saveProduct failed", e);
    return { error: "L'enregistrement a échoué. Vérifiez les champs et réessayez." };
  }

  await Promise.all(removedUrls.map(deleteImage));
  revalidateStore();
  if (!id) redirect(`/admin/produits/${productId}?cree=1`);
  return { ok: "Produit enregistré ✔" };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const images = await db.productImage.findMany({ where: { productId: id }, select: { url: true } });
  // Order lines keep their name/price snapshot; their product link is set to null.
  await db.product.delete({ where: { id } });
  await Promise.all(images.map((i) => deleteImage(i.url)));
  revalidateStore();
  redirect("/admin/produits");
}
