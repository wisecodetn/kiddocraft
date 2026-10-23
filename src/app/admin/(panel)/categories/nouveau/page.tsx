import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Nouvelle catégorie" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/categories" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Catégories
      </Link>
      <h1 className="font-display text-3xl font-semibold">Nouvelle catégorie</h1>
      <CategoryForm
        category={{ nameFr: "", nameAr: "", slugFr: "", slugAr: "", descFr: "", descAr: "", metaTitleFr: "", metaTitleAr: "", metaDescFr: "", metaDescAr: "", image: null, color: "blue", sortOrder: 0, isActive: true }}
      />
    </div>
  );
}
