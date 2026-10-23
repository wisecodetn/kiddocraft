import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("meta");
  return pageMetadata({ locale, paths: paths.about, title: t("aboutTitle"), description: t("aboutDescription") });
}

export default async function AboutPage() {
  const locale = (await rootLocale()) as Locale;
  const [t, tn, th] = await Promise.all([getTranslations("about"), getTranslations("nav"), getTranslations("hero")]);
  return (
    <div className="container-x max-w-5xl py-8 lg:py-12">
      <Breadcrumbs locale={locale} items={[{ name: tn("about"), href: "/a-propos" }]} />
      <div className="relative mt-6 overflow-hidden rounded-[2rem] shadow-soft">
        <Image src="/brand/banner.webp" alt="KiddoCraft" width={1600} height={608} priority className="w-full" />
      </div>
      <div className="mx-auto mt-12 max-w-3xl">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        <p className="mt-5 text-xl font-semibold text-sky-600">{t("intro")}</p>
        <div className="prose-kc mt-6">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
        </div>
        <Link href="/boutique" className="btn btn-sun mt-10">
          {th("ctaShop")}
        </Link>
      </div>
    </div>
  );
}
