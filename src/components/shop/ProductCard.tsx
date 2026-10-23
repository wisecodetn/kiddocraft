import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/queries";
import { AddToCartButton } from "./AddToCartButton";

export async function ProductCard({ product: p, locale, priority = false }: { product: ProductCardData; locale: Locale; priority?: boolean }) {
  const t = await getTranslations("product");
  const href = `/produit/${locale === "ar" ? p.slugAr : p.slugFr}`;
  const discount = p.compareAtPrice && p.compareAtPrice > p.price ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  const soldOut = p.stock <= 0;

  return (
    <article className="group card relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-sky-50" tabIndex={-1} aria-hidden>
        {p.image && (
          <Image
            src={p.image}
            alt={p.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
            className={`object-cover transition duration-500 ${p.hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
          />
        )}
        {p.hoverImage && <Image src={p.hoverImage} alt="" fill sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw" className="object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}
        <div className="absolute start-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && <span className="chip bg-coral-500 text-white">{t("save", { percent: discount })}</span>}
          {soldOut && <span className="chip bg-ink/80 text-white">{t("outOfStock")}</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {p.ageMin != null && (
            <span className="chip bg-sun-50 text-sun-700">{p.ageMax != null ? t("age", { min: p.ageMin, max: p.ageMax }) : t("ageFrom", { min: p.ageMin })}</span>
          )}
          {p.pieces != null && <span className="chip bg-sky-50 text-sky-700">{t("pieces", { count: p.pieces })}</span>}
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] hover:text-sky-600">
            {p.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="flex flex-col leading-tight">
            {discount > 0 && <s className="whitespace-nowrap text-sm text-muted">{formatPrice(p.compareAtPrice!, locale)}</s>}
            <span className="whitespace-nowrap font-display text-xl font-bold text-sky-600">{formatPrice(p.price, locale)}</span>
          </p>
          <div className="relative z-10">
            <AddToCartButton
              compact
              disabled={soldOut}
              item={{ id: p.id, nameFr: p.nameFr, nameAr: p.nameAr, slugFr: p.slugFr, slugAr: p.slugAr, price: p.price, image: p.image, stock: p.stock }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
