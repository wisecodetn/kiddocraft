import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { absoluteUrl, breadcrumbLd, jsonLd } from "@/lib/seo";

export type Crumb = { name: string; href: string };

/** Visible breadcrumb trail plus its BreadcrumbList structured data. */
export async function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  const t = await getTranslations("breadcrumb");
  const tn = await getTranslations("nav");
  const all = [{ name: tn("home"), href: "/" }, ...items];
  return (
    <>
      <nav aria-label={t("label")} className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-muted">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden />}
              {i === all.length - 1 ? (
                <span aria-current="page" className="font-bold text-ink-soft">
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-sky-600">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbLd(all.map((c) => ({ name: c.name, url: absoluteUrl(locale, c.href) }))))} />
    </>
  );
}
