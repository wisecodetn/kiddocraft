import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { deleteCategory } from "../actions";

export const metadata: Metadata = { title: "Modifier la catégorie" };

export default async function EditCategoryPage({ params, searchParams }: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;
  const created = (await searchParams).cree === "1";
  const c = await db.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!c) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/categories" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Catégories
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">{c.nameFr}</h1>
        <div className="flex items-center gap-2">
          {c.isActive && (
            <a href={`/categorie/${c.slugFr}`} target="_blank" className="btn btn-ghost btn-sm">
              <ExternalLink className="size-4" /> Voir sur le site
            </a>
          )}
          <DeleteButton
            action={deleteCategory.bind(null, c.id)}
            confirmText={`Supprimer « ${c.nameFr} » ? ${c._count.products} produit(s) resteront en ligne, sans catégorie.`}
          />
        </div>
      </header>
      <CategoryForm
        created={created}
        category={{
          id: c.id,
          nameFr: c.nameFr,
          nameAr: c.nameAr,
          slugFr: c.slugFr,
          slugAr: c.slugAr,
          descFr: c.descFr,
          descAr: c.descAr,
          metaTitleFr: c.metaTitleFr,
          metaTitleAr: c.metaTitleAr,
          metaDescFr: c.metaDescFr,
          metaDescAr: c.metaDescAr,
          image: c.image,
          color: c.color,
          sortOrder: c.sortOrder,
          isActive: c.isActive,
        }}
      />
    </div>
  );
}
