import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdminPage() {
  const posts = await db.blogPost.findMany({ orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }] });
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Blog</h1>
          <p className="mt-1 text-muted">Des articles réguliers attirent des visiteurs depuis Google.</p>
        </div>
        <Link href="/admin/blog/nouveau" className="btn btn-sun">
          <Plus className="size-5" /> Nouvel article
        </Link>
      </header>
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        {posts.length === 0 ? (
          <p className="p-10 text-center text-muted">Aucun article pour le moment.</p>
        ) : (
          <ul className="divide-y divide-line">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/blog/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-cloud/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <span className="hidden h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-cloud sm:block">{p.coverImage && <img src={p.coverImage} alt="" className="size-full object-cover" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{p.titleFr}</span>
                    <span className="block truncate text-sm text-muted" dir="rtl">
                      {p.titleAr}
                    </span>
                  </span>
                  <span className="hidden text-sm text-muted md:block">{p.publishedAt ? formatDate(p.publishedAt) : "—"}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${p.isPublished ? "bg-mint-100 text-mint-600" : "bg-line text-muted"}`}>{p.isPublished ? "Publié" : "Brouillon"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
