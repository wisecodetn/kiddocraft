import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductListing } from "@/components/shop/ProductListing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RichText } from "@/components/ui/RichText";
import type { Locale } from "@/i18n/locales";
import { t as tr } from "@/lib/localize";
import { paths } from "@/lib/paths";
import { AGE_RANGES, PRODUCT_SORTS, getCategoryBySlug, getProducts, type ProductSort } from "@/lib/queries";
import { absoluteUrl, describe, jsonLd, localePath, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/categorie/[slug]">): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const found = await getCategoryBySlug(locale, slug);
  if (!found) return {};
  const c = found.category;
  return pageMetadata({
    locale,
    paths: paths.category(c),
    title: tr(c, "metaTitle", locale) || tr(c, "name", locale),
    description: describe(tr(c, "metaDesc", locale), tr(c, "desc", locale)),
    image: c.image,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[locale]/categorie/[slug]">) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const found = await getCategoryBySlug(locale, slug);
  if (!found) notFound();
  const c = found.category;
  // A French slug opened under /ar (or the reverse): send to the right URL for this language.
  if (!found.exact) permanentRedirect(localePath(locale, paths.category(c)[locale]));

  const sp = await searchParams;
  const sort = (PRODUCT_SORTS as readonly string[]).includes(String(sp.sort)) ? (sp.sort as ProductSort) : "featured";
  const age = (AGE_RANGES as readonly string[]).includes(String(sp.age)) ? String(sp.age) : undefined;
  const [tn, products] = await Promise.all([getTranslations("nav"), getProducts(locale, { categoryId: c.id, sort, age })]);

  const name = tr(c, "name", locale);
  const href = paths.category(c)[locale];
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: describe(tr(c, "metaDesc", locale), tr(c, "desc", locale)),
    url: absoluteUrl(locale, href),
    inLanguage: locale,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(locale, locale === "ar" ? `/produit/${p.slugAr}` : `/produit/${p.slugFr}`), name: p.name })),
    },
  };

  const desc = tr(c, "desc", locale);
  return (
    <div className="container-x py-8 lg:py-12">
      <Breadcrumbs
        locale={locale}
        items={[
          { name: tn("shop"), href: "/boutique" },
          { name, href },
        ]}
      />
      <header className="mb-10 mt-6 grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">{name}</h1>
          {desc && <RichText className="mt-4 max-w-3xl">{desc}</RichText>}
        </div>
        {c.image && (
          <div className="relative hidden size-40 overflow-hidden rounded-[2rem] shadow-soft md:block lg:size-48">
            <Image src={c.image} alt={name} fill sizes="192px" className="object-cover" />
          </div>
        )}
      </header>
      <ProductListing locale={locale} products={products} basePath={href} sort={sort} age={age} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(collection)} />
    </div>
  );
}
