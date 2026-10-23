import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Catégories" };

const dot: Record<string, string> = { yellow: "bg-sun-400", blue: "bg-sky-500", coral: "bg-coral-500", green: "bg-mint-500" };

export default async function CategoriesPage() {
  const categories = await db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { nameFr: "asc" }], include: { _count: { select: { products: true } } } });
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Catégories</h1>
          <p className="mt-1 text-muted">Les univers de la boutique, en français et en arabe.</p>
        </div>
        <Link href="/admin/categories/nouveau" className="btn btn-sun">
          <Plus className="size-5" /> Nouvelle catégorie
        </Link>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.id} href={`/admin/categories/${c.id}`} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card transition hover:-translate-y-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <span className="size-20 shrink-0 overflow-hidden rounded-2xl bg-cloud">{c.image && <img src={c.image} alt="" className="size-full object-cover" />}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-display text-lg font-semibold">
                <span className={`size-3 rounded-sm ${dot[c.color] ?? dot.blue}`} />
                <span className="truncate">{c.nameFr}</span>
              </span>
              <span className="block truncate text-muted" dir="rtl">
                {c.nameAr}
              </span>
              <span className="mt-1 flex gap-2 text-xs font-bold">
                <span className="rounded-full bg-cloud px-2 py-0.5">{c._count.products} produit(s)</span>
                {!c.isActive && <span className="rounded-full bg-line px-2 py-0.5 text-muted">Masquée</span>}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
