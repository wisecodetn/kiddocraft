import { localeMeta, type Locale } from "@/i18n/locales";

type Decimalish = number | string | { toString(): string };

export const toNumber = (v: Decimalish | null | undefined): number => (v == null ? 0 : Number(v.toString()));

/** "89 DT", "89,900 DT" — millimes only when there are some. */
export function formatPrice(value: Decimalish, locale: Locale = "fr"): string {
  const n = toNumber(value);
  const whole = Number.isInteger(n);
  const amount = new Intl.NumberFormat(locale === "ar" ? "fr-TN" : localeMeta[locale].intl, {
    minimumFractionDigits: whole ? 0 : 3,
    maximumFractionDigits: 3,
  }).format(n);
  return locale === "ar" ? `${amount} د.ت` : `${amount} DT`;
}

export function formatDate(date: Date | string, locale: Locale = "fr"): string {
  return new Intl.DateTimeFormat(localeMeta[locale].intl, { dateStyle: "long", timeZone: "Africa/Tunis" }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Tunis" }).format(new Date(date));
}

export const orderRef = (n: number) => `KC-${1000 + n}`;
