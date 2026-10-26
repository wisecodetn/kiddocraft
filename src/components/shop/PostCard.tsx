import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import type { BlogPost } from "@/generated/prisma/client";
import { formatDate } from "@/lib/format";
import { slugOf, t as tr } from "@/lib/localize";
import { richTextPlain } from "@/lib/richtext";

export function readingMinutes(content: string) {
  return Math.max(1, Math.round(richTextPlain(content).split(/\s+/).length / 200));
}

export async function PostCard({ post, locale }: { post: BlogPost; locale: Locale }) {
  const t = await getTranslations("blog");
  const href = `/blog/${slugOf(post, locale)}`;
  return (
    <article className="group card relative flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[1200/630] overflow-hidden bg-sky-50">
        {post.coverImage && (
          <Image src={post.coverImage} alt={tr(post, "title", locale)} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-sm font-bold text-muted">
          {post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt, locale)}</time>}
          {" · "}
          {t("readingTime", { minutes: readingMinutes(tr(post, "content", locale)) })}
        </p>
        <h3 className="font-display text-xl font-semibold leading-snug">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] group-hover:text-sky-600">
            {tr(post, "title", locale)}
          </Link>
        </h3>
        <p className="line-clamp-3 text-ink-soft">{tr(post, "excerpt", locale)}</p>
        <span className="mt-auto font-bold text-sky-600">{t("readMore")} →</span>
      </div>
    </article>
  );
}
