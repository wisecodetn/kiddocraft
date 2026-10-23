import Image from "next/image";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/ui/BrandIcons";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { slugOf, t as tr } from "@/lib/localize";
import { getCategories } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export async function Footer({ locale }: { locale: Locale }) {
  const [t, tn, categories, s] = await Promise.all([getTranslations("footer"), getTranslations("nav"), getCategories(), getSettings()]);
  const wa = s.whatsapp.replace(/\D/g, "");

  return (
    <footer className="relative mt-24 bg-sky-700 text-sky-50">
      {/* Grass hill + footprints, echoing the banner */}
      <svg className="absolute -top-12 left-0 h-12 w-full text-sky-700" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
        <path d="M0 48 C 360 0 1080 0 1440 48 Z" fill="currentColor" />
      </svg>
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="inline-block rounded-3xl bg-white p-3">
            <Image src="/brand/logo.png" alt="KiddoCraft" width={160} height={112} className="h-16 w-auto" />
          </div>
          <p className="mt-4 max-w-xs text-sky-100">{t("tagline")}</p>
          <div className="mt-5 flex gap-2">
            {s.instagram && (
              <a href={s.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-sun-400 hover:text-ink">
                <InstagramIcon />
              </a>
            )}
            {s.facebook && (
              <a href={s.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-sun-400 hover:text-ink">
                <FacebookIcon />
              </a>
            )}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" aria-label="WhatsApp" className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-sun-400 hover:text-ink">
                <MessageCircle className="size-5" />
              </a>
            )}
          </div>
        </div>

        <nav aria-label={t("shop")}>
          <h2 className="font-display text-lg font-semibold text-white">{t("shop")}</h2>
          <ul className="mt-4 space-y-2.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categorie/${slugOf(c, locale)}`} className="text-sky-100 hover:text-sun-200">
                  {tr(c, "name", locale)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/boutique" className="text-sky-100 hover:text-sun-200">
                {tn("allProducts")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t("help")}>
          <h2 className="font-display text-lg font-semibold text-white">{t("help")}</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/#faq" className="text-sky-100 hover:text-sun-200">
                {t("faq")}
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-sky-100 hover:text-sun-200">
                {t("delivery")}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-sky-100 hover:text-sun-200">
                {tn("blog")}
              </Link>
            </li>
            <li>
              <Link href="/a-propos" className="text-sky-100 hover:text-sun-200">
                {tn("about")}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg font-semibold text-white">{t("contact")}</h2>
          <ul className="mt-4 space-y-3 text-sky-100">
            {s.phone && (
              <li>
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-sun-200" dir="ltr">
                  <Phone className="size-4" aria-hidden /> {s.phone}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={`https://wa.me/${wa}`} className="flex items-center gap-2 hover:text-sun-200" target="_blank" rel="noopener">
                  <MessageCircle className="size-4" aria-hidden /> WhatsApp
                </a>
              </li>
            )}
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-sun-200">
                  <Mail className="size-4" aria-hidden /> {s.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-sm text-sky-200 sm:flex-row">
          <p>
            © {new Date().getFullYear()} KiddoCraft. {t("rights")}
          </p>
          <p>{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
