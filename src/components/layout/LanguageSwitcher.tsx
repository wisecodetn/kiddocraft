"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { MouseEvent } from "react";
import { usePathname } from "@/i18n/navigation";
import { localeMeta, localePrefix, type Locale } from "@/i18n/locales";

/**
 * Links to the same page in the other language. Product, category and blog slugs are translated,
 * so on click the target comes from the page's <link rel="alternate" hreflang> (always rendered by our
 * metadata, possibly streamed into <body>). The plain href (same path, other prefix) is the no-JS fallback;
 * the server redirects it to the right slug.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale() as Locale;
  const target: Locale = locale === "fr" ? "ar" : "fr";
  const pathname = usePathname();
  const t = useTranslations("nav");
  const fallback = `${localePrefix(target)}${pathname === "/" ? "" : pathname}` || "/";

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${target}"]`);
    if (!link) return;
    e.preventDefault();
    const url = new URL(link.href);
    // Keep the current host (the canonical domain may differ in development).
    window.location.assign(url.pathname + window.location.search);
  };

  return (
    <a
      href={fallback}
      onClick={onClick}
      hrefLang={target}
      lang={target}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-white px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:border-sky-200 hover:text-sky-600 ${className}`}
      aria-label={`${t("language")} : ${localeMeta[target].label}`}
    >
      <Globe className="size-4" aria-hidden />
      {localeMeta[target].label}
    </a>
  );
}
