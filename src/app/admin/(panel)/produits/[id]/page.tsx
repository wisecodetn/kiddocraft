import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/format";
import { deleteProduct } from "../actions";

export const metadata: Metadata = { title: "Modifier le produit" };

const num = (v: number | null) => (v == null ? "" : String(v));

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/produits/[id]">) {
  const { id } = await params;
  const created = (await searchParams).cree === "1";
  const [p, categories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, nameFr: true } }),
  ]);
  if (!p) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/produits" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Produits
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">{p.nameFr}</h1>
        <div className="flex items-center gap-2">
          {p.isActive && (
            <a href={`/produit/${p.slugFr}`} target="_blank" className="btn btn-ghost btn-sm">
              <ExternalLink className="size-4" /> Voir sur le site
            </a>
          )}
          <DeleteButton action={deleteProduct.bind(null, p.id)} confirmText={`Supprimer définitivement « ${p.nameFr} » ? Les commandes passées sont conservées.`} />
        </div>
      </header>
      <ProductForm
        created={created}
        categories={categories.map((c) => ({ id: c.id, name: c.nameFr }))}
        product={{
          id: p.id,
          nameFr: p.nameFr,
          nameAr: p.nameAr,
          slugFr: p.slugFr,
          slugAr: p.slugAr,
          shortDescFr: p.shortDescFr,
          shortDescAr: p.shortDescAr,
          descFr: p.descFr,
          descAr: p.descAr,
          metaTitleFr: p.metaTitleFr,
          metaTitleAr: p.metaTitleAr,
          metaDescFr: p.metaDescFr,
          metaDescAr: p.metaDescAr,
          price: String(toNumber(p.price)),
          compareAtPrice: p.compareAtPrice ? String(toNumber(p.compareAtPrice)) : "",
          sku: p.sku ?? "",
          stock: p.stock,
          ageMin: num(p.ageMin),
          ageMax: num(p.ageMax),
          pieces: num(p.pieces),
          categoryId: p.categoryId ?? "",
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          images: p.images.map((i) => ({ id: i.id, url: i.url, altFr: i.altFr, altAr: i.altAr })),
        }}
      />
    </div>
  );
}
