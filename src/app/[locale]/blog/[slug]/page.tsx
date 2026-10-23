import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { PostCard, readingMinutes } from "@/components/shop/PostCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Markdown } from "@/components/ui/Markdown";
import { SectionHeading } from "@/components/ui/Tiles";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatDate } from "@/lib/format";
import { t as tr } from "@/lib/localize";
import { paths } from "@/lib/paths";
import { getPostBySlug, getPosts, getProducts } from "@/lib/queries";
import { SITE_NAME, SITE_URL, absolute, absoluteUrl, describe, jsonLd, localePath, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const found = await getPostBySlug(locale, slug);
  if (!found) return {};
  const p = found.post;
  return pageMetadata({
    locale,
    paths: paths.post(p),
    title: tr(p, "metaTitle", locale) || tr(p, "title", locale),
    description: describe(tr(p, "metaDesc", locale), tr(p, "excerpt", locale), tr(p, "content", locale)),
    image: p.coverImage,
    type: "article",
    publishedTime: p.publishedAt?.toISOString(),
  });
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const found = await getPostBySlug(locale, slug);
  if (!found) notFound();
  const post = found.post;
  if (!found.exact) permanentRedirect(localePath(locale, paths.post(post)[locale]));

  const [t, tn, more, products] = await Promise.all([
    getTranslations("blog"),
    getTranslations("nav"),
    getPosts({ take: 3, excludeId: post.id }),
    getProducts(locale, { featured: true, take: 4 }),
  ]);
  const title = tr(post, "title", locale);
  const content = tr(post, "content", locale);
  const href = paths.post(post)[locale];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: describe(tr(post, "metaDesc", locale), tr(post, "excerpt", locale)),
    image: post.coverImage ? [absolute(post.coverImage)] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: locale,
    mainEntityOfPage: absoluteUrl(locale, href),
    author: { "@type": "Organization", name: post.author || SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo.png` } },
  };

  return (
    <article className="py-8 lg:py-12">
      <div className="container-x max-w-4xl">
        <Breadcrumbs
          locale={locale}
          items={[
            { name: tn("blog"), href: "/blog" },
            { name: title, href },
          ]}
        />
        <header className="mt-6">
          <p className="text-sm font-bold text-muted">
            {post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt, locale)}</time>}
            {" · "}
            {t("readingTime", { minutes: readingMinutes(content) })}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
          {tr(post, "excerpt", locale) && <p className="mt-5 text-xl text-ink-soft">{tr(post, "excerpt", locale)}</p>}
        </header>
        {post.coverImage && (
          <div className="relative mt-8 aspect-[1200/630] overflow-hidden rounded-[2rem] shadow-soft">
            <Image src={post.coverImage} alt={title} fill priority sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
          </div>
        )}
        <Markdown className="mx-auto mt-10 max-w-3xl">{content}</Markdown>
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap gap-3">
          <Link href="/boutique" className="btn btn-sun">
            {t("shopCta")}
          </Link>
          <Link href="/blog" className="btn btn-ghost">
            {t("back")}
          </Link>
        </div>
      </div>

      {products.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading title={t("shopCta")} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading title={t("related")} />
          <div className="grid gap-6 md:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.id} post={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(articleLd)} />
    </article>
  );
}
