import type { Metadata } from "next";
import { localeMeta, localePrefix, type Locale } from "@/i18n/locales";
import type { PagePaths } from "./paths";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "KiddoCraft";
export const DEFAULT_OG_IMAGE = "/brand/og-default.jpg";

/**
 * Path of a page in a locale: ("ar", "/produit/x") → "/ar/produit/x"; ("fr", "/") → "/".
 * Percent-encoded, so Arabic slugs are valid in redirects, canonical links and the sitemap.
 */
export function localePath(locale: Locale, path: string): string {
  const p = path === "/" ? "" : path;
  return encodeURI(`${localePrefix(locale)}${p}` || "/");
}

export const absoluteUrl = (locale: Locale, path: string) => `${SITE_URL}${localePath(locale, path)}`;

export const absolute = (pathOrUrl: string) => (pathOrUrl.startsWith("http") ? pathOrUrl : `${SITE_URL}${pathOrUrl}`);


/** canonical + hreflang (fr, ar, x-default → French). */
export function alternates(locale: Locale, paths: PagePaths): Metadata["alternates"] {
  return {
    canonical: absoluteUrl(locale, paths[locale]),
    languages: {
      fr: absoluteUrl("fr", paths.fr),
      ar: absoluteUrl("ar", paths.ar),
      "x-default": absoluteUrl("fr", paths.fr),
    },
  };
}

/** Title, description, canonical, hreflang, Open Graph and Twitter in one go. */
export function pageMetadata(opts: {
  locale: Locale;
  paths: PagePaths;
  title: string;
  description: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const { locale, paths, title, description } = opts;
  const image = absolute(opts.image || DEFAULT_OG_IMAGE);
  return {
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: alternates(locale, paths),
    openGraph: {
      type: opts.type ?? "website",
      siteName: SITE_NAME,
      locale: localeMeta[locale].og,
      alternateLocale: Object.values(localeMeta).map((m) => m.og).filter((og) => og !== localeMeta[locale].og),
      url: absoluteUrl(locale, paths[locale]),
      title,
      description,
      images: [{ url: image, alt: opts.imageAlt ?? title }],
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    ...(opts.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Meta description: first ~155 characters of plain text (from HTML or Markdown), cut on a word. */
export function describe(...candidates: (string | null | undefined)[]): string {
  const text = (candidates.find((c) => c && c.trim()) ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[#*_>`[\]()!-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 158) return text;
  return text.slice(0, 155).replace(/\s+\S*$/, "") + "…";
}

/** Safe JSON-LD for <script type="application/ld+json">. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\u003c") };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}

/** Offers stay valid for a year (Google recommends a priceValidUntil on Product offers). */
export function priceValidUntil(): string {
  return new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10);
}
