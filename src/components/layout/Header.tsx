import Image from "next/image";
import { ChevronDown, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatPrice } from "@/lib/format";
import { slugOf, t as tr } from "@/lib/localize";
import { getCategories } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { CartButton } from "./CartButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu, type NavCategory } from "./MobileMenu";

const dot: Record<string, string> = { yellow: "bg-sun-400", blue: "bg-sky-500", coral: "bg-coral-500", green: "bg-mint-500" };

export async function Header({ locale }: { locale: Locale }) {
  const [t, categories, settings] = await Promise.all([getTranslations("nav"), getCategories(), getSettings()]);
  const nav: NavCategory[] = categories.map((c) => ({ href: `/categorie/${slugOf(c, locale)}`, name: tr(c, "name", locale), color: c.color }));
  const announcement =
    tr(settings, "announcement", locale) ||
    (settings.freeShippingFrom > 0 ? t("announcement", { amount: formatPrice(settings.freeShippingFrom, locale) }) : "");

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow-soft">
        {t("skip")}
      </a>
      {announcement && (
        <div className="bg-sky-500 text-white">
          <p className="container-x flex items-center justify-center gap-2 py-2 text-center text-xs font-bold sm:text-sm">
            <Truck className="hidden size-4 shrink-0 sm:block" aria-hidden />
            {announcement}
          </p>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/90 backdrop-blur-md">
        <div className="container-x flex h-16 items-center gap-2 sm:h-[4.5rem] sm:gap-3">
          <MobileMenu categories={nav} />
          <Link href="/" className="shrink-0" aria-label="KiddoCraft">
            <Image src="/brand/logo.png" alt="KiddoCraft" width={520} height={363} priority className="h-12 w-auto sm:h-14" />
          </Link>

          <nav className="ms-6 hidden items-center gap-1 lg:flex" aria-label={t("menu")}>
            <NavLink href="/">{t("home")}</NavLink>
            <NavLink href="/boutique">{t("shop")}</NavLink>
            <div className="group relative">
              <button type="button" className="flex items-center gap-1 rounded-full px-4 py-2 font-display font-semibold text-ink-soft transition hover:bg-sky-50 hover:text-sky-600" aria-haspopup="true">
                {t("categories")}
                <ChevronDown className="size-4 transition group-hover:rotate-180" aria-hidden />
              </button>
              <div className="invisible absolute start-0 top-full z-50 w-72 translate-y-2 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <ul className="card p-2">
                  {nav.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold text-ink-soft hover:bg-sky-50 hover:text-ink">
                        <span className={`size-3 rounded-sm ${dot[c.color] ?? dot.blue}`} aria-hidden />
                        {c.name}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-line pt-1">
                    <Link href="/boutique" className="flex rounded-2xl px-4 py-3 text-sm font-extrabold text-sky-600 hover:bg-sky-50">
                      {t("allProducts")} →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <NavLink href="/blog">{t("blog")}</NavLink>
            <NavLink href="/a-propos">{t("about")}</NavLink>
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher />
            <CartButton />
          </div>
        </div>
      </header>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full px-4 py-2 font-display font-semibold text-ink-soft transition hover:bg-sky-50 hover:text-sky-600">
      {children}
    </Link>
  );
}
