import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, nameFr: true } });
  return (
    <div className="space-y-6">
      <Link href="/admin/produits" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Produits
      </Link>
      <h1 className="font-display text-3xl font-semibold">Nouveau produit</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.nameFr }))}
        product={{
          nameFr: "",
          nameAr: "",
          slugFr: "",
          slugAr: "",
          shortDescFr: "",
          shortDescAr: "",
          descFr: "",
          descAr: "",
          focusKeywordFr: "",
          focusKeywordAr: "",
          metaTitleFr: "",
          metaTitleAr: "",
          metaDescFr: "",
          metaDescAr: "",
          price: "",
          compareAtPrice: "",
          sku: "",
          stock: 10,
          ageMin: "",
          ageMax: "",
          pieces: "",
          categoryId: categories[0]?.id ?? "",
          isActive: true,
          isFeatured: false,
          images: [],
        }}
      />
    </div>
  );
}
