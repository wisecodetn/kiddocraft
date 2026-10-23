import type { Locale } from "@/i18n/locales";

type Suffix = "Fr" | "Ar";
const suffix = (locale: Locale): Suffix => (locale === "ar" ? "Ar" : "Fr");

/**
 * Reads a bilingual field (`nameFr` / `nameAr`) for a locale.
 * Arabic falls back to French when it hasn't been translated yet.
 */
export function t<T extends object, K extends string>(row: T, field: K, locale: Locale): string {
  const r = row as Record<string, unknown>;
  const value = r[`${field}${suffix(locale)}`];
  if (typeof value === "string" && value.trim()) return value;
  const fallback = r[`${field}Fr`];
  return typeof fallback === "string" ? fallback : "";
}

export function slugOf(row: { slugFr: string; slugAr: string }, locale: Locale): string {
  return locale === "ar" ? row.slugAr : row.slugFr;
}
