export const locales = ["fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeMeta: Record<Locale, { label: string; dir: "ltr" | "rtl"; og: string; intl: string }> = {
  fr: { label: "Français", dir: "ltr", og: "fr_TN", intl: "fr-TN" },
  ar: { label: "العربية", dir: "rtl", og: "ar_TN", intl: "ar-TN" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** French lives at the root (/), Arabic under /ar. */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}
