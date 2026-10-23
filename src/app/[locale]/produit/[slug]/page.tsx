import type { Metadata } from "next";
import { Banknote, RefreshCw, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { PurchaseBox } from "@/components/shop/PurchaseBox";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Markdown } from "@/components/ui/Markdown";
import { SectionHeading } from "@/components/ui/Tiles";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatPrice, toNumber } from "@/lib/format";
import { slugOf, t as tr } from "@/lib/localize";
import { paths } from "@/lib/paths";
import { getProductBySlug, getProducts } from "@/lib/queries";
import { SITE_NAME, absolute, absoluteUrl, describe, jsonLd, localePath, pageMetadata, priceValidUntil } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/produit/[slug]">): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const found = await getProductBySlug(locale, slug);
  if (!found) return {};
  const p = found.product;
  const name = tr(p, "name", locale);
  return pageMetadata({
    locale,
    paths: paths.product(p),
    title: tr(p, "metaTitle", locale) || name,
    description: describe(tr(p, "metaDesc", locale), tr(p, "shortDesc", locale), tr(p, "desc", locale)),
    image: p.images[0]?.url,
    imageAlt: name,
  });
}

export default async function ProductPage({ params }: PageProps<"/[locale]/produit/[slug]">) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const found = await getProductBySlug(locale, slug);
  if (!found) notFound();
  const p = found.product;
  if (!found.exact) permanentRedirect(localePath(locale, paths.product(p)[locale]));

  const [t, tn, related] = await Promise.all([
    getTranslations("product"),
    getTranslations("nav"),
    getProducts(locale, { categoryId: p.categoryId ?? undefined, excludeId: p.id, take: 4 }),
  ]);

  const name = tr(p, "name", locale);
  const price = toNumber(p.price);
  const compareAt = p.compareAtPrice ? toNumber(p.compareAtPrice) : null;
  const discount = compareAt && compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0;
  const images = p.images.map((img) => ({ url: img.url, alt: tr(img, "alt", locale) || name }));
  const href = paths.product(p)[locale];
  const desc = tr(p, "desc", locale);
  const ageText = p.ageMin != null ? (p.ageMax != null ? t("age", { min: p.ageMin, max: p.ageMax }) : t("ageFrom", { min: p.ageMin })) : null;

  const crumbs: Crumb[] = [{ name: tn("shop"), href: "/boutique" }];
  if (p.category) crumbs.push({ name: tr(p.category, "name", locale), href: `/categorie/${slugOf(p.category, locale)}` });
  crumbs.push({ name, href });

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: describe(tr(p, "shortDesc", locale), desc),
    image: images.map((i) => absolute(i.url)),
    sku: p.sku ?? p.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(p.category ? { category: tr(p.category, "name", locale) } : {}),
    ...(p.ageMin != null
      ? { audience: { "@type": "PeopleAudience", suggestedMinAge: p.ageMin, ...(p.ageMax != null ? { suggestedMaxAge: p.ageMax } : {}) } }
      : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(locale, href),
      priceCurrency: "TND",
      price: price.toFixed(3),
      priceValidUntil: priceValidUntil(),
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "TN" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        },
      },
    },
  };

  return (
    <div className="container-x py-8 lg:py-12">
      <Breadcrumbs locale={locale} items={crumbs} />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery
          images={images}
          badge={
            <>
              {discount > 0 && <span className="chip bg-coral-500 px-4 py-1.5 text-sm text-white">{t("save", { percent: discount })}</span>}
              {p.isFeatured && <span className="chip bg-sun-400 px-4 py-1.5 text-sm text-ink">★ {t("featured")}</span>}
            </>
          }
        />

        <div>
          {p.category && (
            <Link href={`/categorie/${slugOf(p.category, locale)}`} className="chip bg-sky-50 px-3 py-1.5 text-sm text-sky-700 hover:bg-sky-100">
              {tr(p.category, "name", locale)}
            </Link>
          )}
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{name}</h1>
          {tr(p, "shortDesc", locale) && <p className="mt-4 text-lg text-ink-soft">{tr(p, "shortDesc", locale)}</p>}

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="font-display text-4xl font-bold text-sky-600">{formatPrice(price, locale)}</span>
            {discount > 0 && <s className="pb-1 text-xl text-muted">{formatPrice(compareAt!, locale)}</s>}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {ageText && <span className="chip bg-sun-50 px-3 py-1.5 text-sm text-sun-700">{ageText}</span>}
            {p.pieces != null && <span className="chip bg-sky-50 px-3 py-1.5 text-sm text-sky-700">{t("pieces", { count: p.pieces })}</span>}
            {p.stock > 0 && (
              <span className={`chip px-3 py-1.5 text-sm ${p.stock <= 5 ? "bg-coral-50 text-coral-600" : "bg-mint-50 text-mint-600"}`}>
                ● {p.stock <= 5 ? t("lowStock", { count: p.stock }) : t("inStock")}
              </span>
            )}
          </div>

          <div className="mt-8">
            <PurchaseBox item={{ id: p.id, nameFr: p.nameFr, nameAr: p.nameAr || p.nameFr, slugFr: p.slugFr, slugAr: p.slugAr, price, image: images[0]?.url ?? null, stock: p.stock }} />
          </div>

          <ul className="mt-6 grid gap-3 rounded-3xl bg-cloud p-5 text-sm font-bold text-ink-soft sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Truck className="size-5 shrink-0 text-sky-500" aria-hidden /> {t("delivery")}
            </li>
            <li className="flex items-center gap-2">
              <Banknote className="size-5 shrink-0 text-mint-500" aria-hidden /> {t("cod")}
            </li>
            <li className="flex items-center gap-2">
              <RefreshCw className="size-5 shrink-0 text-coral-500" aria-hidden /> {t("exchange")}
            </li>
          </ul>

          {desc && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold">{t("description")}</h2>
              <Markdown className="mt-4">{desc}</Markdown>
            </section>
          )}

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">{t("details")}</h2>
            <dl className="mt-4 divide-y divide-line overflow-hidden rounded-3xl border-2 border-line bg-white">
              {[
                ageText && [t("ageLabel"), ageText],
                p.pieces != null && [t("piecesLabel"), String(p.pieces)],
                p.category && [t("category"), tr(p.category, "name", locale)],
                p.sku && [t("sku"), p.sku],
              ]
                .filter((row): row is [string, string] => Array.isArray(row))
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-5 py-3">
                    <dt className="font-bold text-muted">{k}</dt>
                    <dd className="font-bold">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading title={t("related")} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productLd)} />
    </div>
  );
}
