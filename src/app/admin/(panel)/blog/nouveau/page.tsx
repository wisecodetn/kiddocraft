import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostForm } from "@/components/admin/PostForm";

export const metadata: Metadata = { title: "Nouvel article" };

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Blog
      </Link>
      <h1 className="font-display text-3xl font-semibold">Nouvel article</h1>
      <PostForm
        post={{
          titleFr: "",
          titleAr: "",
          slugFr: "",
          slugAr: "",
          excerptFr: "",
          excerptAr: "",
          contentFr: "",
          contentAr: "",
          focusKeywordFr: "",
          focusKeywordAr: "",
          metaTitleFr: "",
          metaTitleAr: "",
          metaDescFr: "",
          metaDescAr: "",
          coverImage: null,
          author: "KiddoCraft",
          isPublished: false,
          publishedAt: "",
        }}
      />
    </div>
  );
}
