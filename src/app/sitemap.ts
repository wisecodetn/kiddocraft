import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { paths, type PagePaths } from "@/lib/paths";
import { absolute, absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

/** Every page in French and Arabic, each entry listing its hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, select: { slugFr: true, slugAr: true, updatedAt: true } }),
    db.product.findMany({ where: { isActive: true }, select: { slugFr: true, slugAr: true, updatedAt: true, images: { select: { url: true }, take: 3, orderBy: { sortOrder: "asc" } } } }),
    db.blogPost.findMany({ where: { isPublished: true }, select: { slugFr: true, slugAr: true, updatedAt: true } }),
  ]);

  const entry = (p: PagePaths, opts: { lastModified?: Date; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; images?: string[] }) =>
    (["fr", "ar"] as const).map((locale) => ({
      url: absoluteUrl(locale, p[locale]),
      lastModified: opts.lastModified,
      changeFrequency: opts.changeFrequency,
      priority: locale === "fr" ? opts.priority : Math.round(opts.priority * 0.9 * 10) / 10,
      alternates: { languages: { fr: absoluteUrl("fr", p.fr), ar: absoluteUrl("ar", p.ar) } },
      ...(opts.images?.length ? { images: opts.images.map(absolute) } : {}),
    }));

  return [
    ...entry(paths.home, { priority: 1, changeFrequency: "daily" }),
    ...entry(paths.shop, { priority: 0.9, changeFrequency: "daily" }),
    ...categories.flatMap((c) => entry(paths.category(c), { lastModified: c.updatedAt, priority: 0.8, changeFrequency: "weekly" })),
    ...products.flatMap((p) => entry(paths.product(p), { lastModified: p.updatedAt, priority: 0.8, changeFrequency: "weekly", images: p.images.map((i) => i.url) })),
    ...entry(paths.blog, { priority: 0.6, changeFrequency: "weekly" }),
    ...posts.flatMap((p) => entry(paths.post(p), { lastModified: p.updatedAt, priority: 0.6, changeFrequency: "monthly" })),
    ...entry(paths.about, { priority: 0.4, changeFrequency: "yearly" }),
  ];
}
