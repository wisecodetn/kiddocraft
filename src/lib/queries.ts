import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/locales";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { toNumber } from "./format";
import { t } from "./localize";

/** Route params arrive percent-encoded for Arabic slugs. */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug).normalize("NFC");
  } catch {
    return slug;
  }
}

const slugWhere = (locale: Locale, slug: string) => (locale === "ar" ? { slugAr: decodeSlug(slug) } : { slugFr: decodeSlug(slug) });
const otherLocale = (locale: Locale): Locale => (locale === "ar" ? "fr" : "ar");

// ---------------------------------------------------------------- categories

export const getCategories = cache(async () =>
  db.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameFr: "asc" }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  }),
);

/** Finds a category by its slug in either language, so a French link opened under /ar still resolves (and redirects). */
export const getCategoryBySlug = cache(async (locale: Locale, slug: string) => {
  const own = await db.category.findFirst({ where: { ...slugWhere(locale, slug), isActive: true } });
  if (own) return { category: own, exact: true };
  const other = await db.category.findFirst({ where: { ...slugWhere(otherLocale(locale), slug), isActive: true } });
  return other ? { category: other, exact: false } : null;
});

// ---------------------------------------------------------------- products

const cardInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 2 },
  category: { select: { nameFr: true, nameAr: true, slugFr: true, slugAr: true } },
} satisfies Prisma.ProductInclude;

type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

/** Plain, serialisable product for cards and the cart (both languages, so the cart survives a language switch). */
export function toCard(p: CardRow, locale: Locale) {
  const img = p.images[0];
  return {
    id: p.id,
    nameFr: p.nameFr,
    nameAr: p.nameAr || p.nameFr,
    name: t(p, "name", locale),
    shortDesc: t(p, "shortDesc", locale),
    slugFr: p.slugFr,
    slugAr: p.slugAr,
    price: toNumber(p.price),
    compareAtPrice: p.compareAtPrice ? toNumber(p.compareAtPrice) : null,
    stock: p.stock,
    ageMin: p.ageMin,
    ageMax: p.ageMax,
    pieces: p.pieces,
    image: img?.url ?? null,
    imageAlt: img ? t(img, "alt", locale) || t(p, "name", locale) : t(p, "name", locale),
    hoverImage: p.images[1]?.url ?? null,
    categoryName: p.category ? t(p.category, "name", locale) : null,
    isFeatured: p.isFeatured,
  };
}
export type ProductCardData = ReturnType<typeof toCard>;

export const PRODUCT_SORTS = ["featured", "new", "price-asc", "price-desc"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];
export const AGE_RANGES = ["1-3", "3-5", "6-8", "9-12"] as const;

const sortOrder = (sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] => {
  switch (sort) {
    case "new":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    default:
      // Featured first, then in the order they were added (the catalogue owner's own ordering).
      return [{ isFeatured: "desc" }, { createdAt: "asc" }];
  }
};

export async function getProducts(
  locale: Locale,
  opts: { categoryId?: string; featured?: boolean; take?: number; sort?: ProductSort; excludeId?: string; age?: string } = {},
) {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (opts.categoryId) where.categoryId = opts.categoryId;
  if (opts.featured) where.isFeatured = true;
  if (opts.excludeId) where.id = { not: opts.excludeId };
  // Age filter "3-5": products whose age range overlaps it.
  const age = opts.age?.match(/^(\d+)-(\d+)$/);
  if (age) {
    const [from, to] = [Number(age[1]), Number(age[2])];
    where.AND = [{ OR: [{ ageMin: null }, { ageMin: { lte: to } }] }, { OR: [{ ageMax: null }, { ageMax: { gte: from } }] }];
  }
  const rows = await db.product.findMany({ where, include: cardInclude, orderBy: sortOrder(opts.sort ?? "featured"), take: opts.take });
  return rows.map((p) => toCard(p, locale));
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" } },
  category: true,
} satisfies Prisma.ProductInclude;

export const getProductBySlug = cache(async (locale: Locale, slug: string) => {
  const own = await db.product.findFirst({ where: { ...slugWhere(locale, slug), isActive: true }, include: productInclude });
  if (own) return { product: own, exact: true };
  const other = await db.product.findFirst({ where: { ...slugWhere(otherLocale(locale), slug), isActive: true }, include: productInclude });
  return other ? { product: other, exact: false } : null;
});

// ---------------------------------------------------------------- blog

export async function getPosts(opts: { take?: number; excludeId?: string } = {}) {
  return db.blogPost.findMany({
    where: { isPublished: true, ...(opts.excludeId ? { id: { not: opts.excludeId } } : {}) },
    orderBy: { publishedAt: "desc" },
    take: opts.take,
  });
}

export const getPostBySlug = cache(async (locale: Locale, slug: string) => {
  const own = await db.blogPost.findFirst({ where: { ...slugWhere(locale, slug), isPublished: true } });
  if (own) return { post: own, exact: true };
  const other = await db.blogPost.findFirst({ where: { ...slugWhere(otherLocale(locale), slug), isPublished: true } });
  return other ? { post: other, exact: false } : null;
});
