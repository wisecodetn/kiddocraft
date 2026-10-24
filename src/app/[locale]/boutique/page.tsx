import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { ProductListing } from "@/components/shop/ProductListing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { slugOf, t as tr } from "@/lib/localize";
import { paths } from "@/lib/paths";
import { AGE_RANGES, PRODUCT_SORTS, getCategories, getProducts, type ProductSort } from "@/lib/queries";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("meta");
  // Filtered/sorted variants canonicalise to the plain listing.
  return pageMetadata({ locale, paths: paths.shop, title: t("shopTitle"), description: t("shopDescription") });
}

export default async function ShopPage({ searchParams }: PageProps<"/[locale]/boutique">) {
  const locale = (await rootLocale()) as Locale;
  const sp = await searchParams;
  const sort = (PRODUCT_SORTS as readonly string[]).includes(String(sp.sort)) ? (sp.sort as ProductSort) : "featured";
  const age = (AGE_RANGES as readonly string[]).includes(String(sp.age)) ? String(sp.age) : undefined;

  const [t, tn, products, categories] = await Promise.all([
    getTranslations("shop"),
    getTranslations("nav"),
    getProducts(locale, { sort, age }),
    getCategories(),
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(locale, locale === "ar" ? `/produit/${p.slugAr}` : `/produit/${p.slugFr}`), name: p.name })),
  };

  return (
    <div className="container-x py-8 lg:py-12">
      <Breadcrumbs locale={locale} items={[{ name: tn("shop"), href: "/boutique" }]} />
      <header className="mb-6 mt-6 sm:mb-8">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{t("subtitle")}</p>
        <nav className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" aria-label={tn("categories")}>
          {categories.map((c) => (
            <Link key={c.id} href={`/categorie/${slugOf(c, locale)}`} className="shrink-0 rounded-2xl bg-white px-4 py-2.5 font-display font-semibold shadow-card transition hover:-translate-y-0.5 hover:text-sky-600">
              {tr(c, "name", locale)}
            </Link>
          ))}
        </nav>
      </header>
      <ProductListing locale={locale} products={products} basePath="/boutique" sort={sort} age={age} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(itemList)} />
    </div>
  );
}
