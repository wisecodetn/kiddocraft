import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { PostCard } from "@/components/shop/PostCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { Locale } from "@/i18n/locales";
import { slugOf, t as tr } from "@/lib/localize";
import { paths } from "@/lib/paths";
import { getPosts } from "@/lib/queries";
import { SITE_NAME, absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("meta");
  return pageMetadata({ locale, paths: paths.blog, title: t("blogTitle"), description: t("blogDescription") });
}

export default async function BlogPage() {
  const locale = (await rootLocale()) as Locale;
  const [t, tn, posts] = await Promise.all([getTranslations("blog"), getTranslations("nav"), getPosts()]);
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} — ${t("title")}`,
    url: absoluteUrl(locale, "/blog"),
    inLanguage: locale,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: tr(p, "title", locale),
      url: absoluteUrl(locale, `/blog/${slugOf(p, locale)}`),
      datePublished: p.publishedAt?.toISOString(),
    })),
  };

  return (
    <div className="container-x py-8 lg:py-12">
      <Breadcrumbs locale={locale} items={[{ name: tn("blog"), href: "/blog" }]} />
      <header className="mb-10 mt-6 max-w-2xl">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        <p className="mt-3 text-lg text-muted">{t("subtitle")}</p>
      </header>
      {posts.length === 0 ? (
        <p className="card p-10 text-center text-lg text-muted">{t("empty")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(blogLd)} />
    </div>
  );
}
