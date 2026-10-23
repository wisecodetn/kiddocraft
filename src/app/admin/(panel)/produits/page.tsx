import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, Star } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Produits" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/produits">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const cat = typeof sp.categorie === "string" ? sp.categorie : "";
  const where: Prisma.ProductWhereInput = {};
  if (q) where.OR = [{ nameFr: { contains: q, mode: "insensitive" } }, { nameAr: { contains: q } }, { sku: { contains: q, mode: "insensitive" } }];
  if (cat) where.categoryId = cat;

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: { select: { nameFr: true } } },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, nameFr: true } }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Produits</h1>
          <p className="mt-1 text-muted">{products.length} produit(s)</p>
        </div>
        <Link href="/admin/produits/nouveau" className="btn btn-sun">
          <Plus className="size-5" /> Nouveau produit
        </Link>
      </header>

      <form className="flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Rechercher par nom ou référence…" className="w-full rounded-full border-2 border-line bg-white py-2.5 pe-4 ps-10 outline-none focus:border-sky-400" />
        </div>
        <select name="categorie" defaultValue={cat} className="rounded-full border-2 border-line bg-white px-4 py-2.5 font-bold outline-none focus:border-sky-400">
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameFr}
            </option>
          ))}
        </select>
        <button className="btn btn-ghost btn-sm">Filtrer</button>
      </form>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        {products.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted">Aucun produit.</p>
            <Link href="/admin/produits/nouveau" className="btn btn-sun mt-4">
              Ajouter le premier produit
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-cloud text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 text-start">Produit</th>
                  <th className="px-5 py-3 text-start">Catégorie</th>
                  <th className="px-5 py-3 text-start">Prix</th>
                  <th className="px-5 py-3 text-start">Stock</th>
                  <th className="px-5 py-3 text-start">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-cloud/60">
                    <td className="px-5 py-3">
                      <Link href={`/admin/produits/${p.id}`} className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-cloud">{p.images[0] && <img src={p.images[0].url} alt="" className="size-full object-cover" />}</span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 font-bold hover:text-sky-600">
                            {p.isFeatured && <Star className="size-3.5 shrink-0 fill-sun-400 text-sun-500" aria-label="Coup de cœur" />}
                            <span className="truncate">{p.nameFr}</span>
                          </span>
                          <span className="block truncate text-muted" dir="rtl">
                            {p.nameAr}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{p.category?.nameFr ?? "—"}</td>
                    <td className="px-5 py-3 font-display font-semibold">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${p.stock === 0 ? "bg-coral-100 text-coral-600" : p.stock <= 5 ? "bg-sun-100 text-sun-700" : "bg-mint-100 text-mint-600"}`}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${p.isActive ? "bg-sky-100 text-sky-700" : "bg-line text-muted"}`}>{p.isActive ? "En ligne" : "Masqué"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
