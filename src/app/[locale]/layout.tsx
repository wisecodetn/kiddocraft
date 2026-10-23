import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CartProvider } from "@/components/shop/cart-context";
import { localeMeta, locales } from "@/i18n/locales";
import { getSettings } from "@/lib/settings";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl, jsonLd } from "@/lib/seo";
import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  // Site-wide defaults only: every page sets its own canonical and hreflang through pageMetadata().
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("homeTitle"), template: `%s | ${SITE_NAME}` },
    description: t("homeDescription"),
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, locale: localeMeta[locale].og, images: [{ url: DEFAULT_OG_IMAGE }] },
    formatDetection: { telephone: false },
    manifest: "/manifest.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: "#048bdc",
  colorScheme: "light",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();
  const [settings, t] = await Promise.all([getSettings(), getTranslations({ locale, namespace: "meta" })]);

  const sameAs = [settings.instagram, settings.facebook, settings.tiktok].filter(Boolean);
  const organization = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${SITE_URL}/#store`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    description: t("homeDescription"),
    areaServed: { "@type": "Country", name: "Tunisia" },
    currenciesAccepted: "TND",
    paymentAccepted: "Cash",
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: absoluteUrl(locale, "/"),
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#store` },
  };

  return (
    <html lang={locale} dir={localeMeta[locale].dir} className={fontVariables}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <CartProvider rules={{ shippingFee: settings.shippingFee, freeShippingFrom: settings.freeShippingFrom }}>
            <Header locale={locale} />
            <main id="main">{children}</main>
            <Footer locale={locale} />
            <CartDrawer />
          </CartProvider>
        </NextIntlClientProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd([organization, website])} />
      </body>
    </html>
  );
}
