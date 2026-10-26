import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PostForm } from "@/components/admin/PostForm";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { richTextHtml } from "@/lib/richtext";
import { deletePost } from "../actions";

export const metadata: Metadata = { title: "Modifier l'article" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  const { id } = await params;
  const created = (await searchParams).cree === "1";
  const p = await db.blogPost.findUnique({ where: { id } });
  if (!p) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Blog
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">{p.titleFr}</h1>
        <div className="flex items-center gap-2">
          {p.isPublished && (
            <a href={`/blog/${p.slugFr}`} target="_blank" className="btn btn-ghost btn-sm">
              <ExternalLink className="size-4" /> Voir sur le site
            </a>
          )}
          <DeleteButton action={deletePost.bind(null, p.id)} confirmText={`Supprimer l'article « ${p.titleFr} » ?`} />
        </div>
      </header>
      <PostForm
        created={created}
        post={{
          id: p.id,
          titleFr: p.titleFr,
          titleAr: p.titleAr,
          slugFr: p.slugFr,
          slugAr: p.slugAr,
          excerptFr: p.excerptFr,
          excerptAr: p.excerptAr,
          // Older articles are Markdown: the editor works in HTML.
          contentFr: richTextHtml(p.contentFr),
          contentAr: richTextHtml(p.contentAr),
          focusKeywordFr: p.focusKeywordFr,
          focusKeywordAr: p.focusKeywordAr,
          metaTitleFr: p.metaTitleFr,
          metaTitleAr: p.metaTitleAr,
          metaDescFr: p.metaDescFr,
          metaDescAr: p.metaDescAr,
          coverImage: p.coverImage,
          author: p.author,
          isPublished: p.isPublished,
          publishedAt: p.publishedAt ? p.publishedAt.toISOString().slice(0, 10) : "",
        }}
      />
    </div>
  );
}
