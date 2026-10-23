import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { CheckoutView } from "@/components/shop/CheckoutView";
import type { Locale } from "@/i18n/locales";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("meta");
  return pageMetadata({ locale, paths: paths.cart, title: t("cartTitle"), description: t("homeDescription"), noIndex: true });
}

export default async function CartPage() {
  const t = await getTranslations("cart");
  return (
    <div className="container-x py-8 lg:py-12">
      <h1 className="font-display text-4xl font-bold">{t("title")}</h1>
      <CheckoutView />
    </div>
  );
}
