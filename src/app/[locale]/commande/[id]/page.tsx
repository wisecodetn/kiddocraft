import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { db } from "@/lib/db";
import { formatPrice, orderRef } from "@/lib/format";
import { GOVERNORATES } from "@/lib/governorates";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// The order id is an unguessable cuid; the page shows only what the customer just typed.
export default async function OrderConfirmationPage({ params }: PageProps<"/[locale]/commande/[id]">) {
  const { locale: l, id } = await params;
  const locale = l as Locale;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { nameAr: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } } } } },
  });
  if (!order) notFound();
  const [t, tc, settings] = await Promise.all([getTranslations("order"), getTranslations("cart"), getSettings()]);
  const wa = settings.whatsapp.replace(/\D/g, "");
  const gov = GOVERNORATES.find((g) => g.fr === order.governorate);

  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <div className="card relative overflow-hidden p-8 text-center sm:p-12">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-sun-400 via-sky-500 to-mint-400" aria-hidden />
        <CheckCircle2 className="mx-auto size-16 text-mint-500 animate-pop" aria-hidden />
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-ink-soft">{t("text", { name: order.customerName.split(" ")[0], phone: order.phone })}</p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-sun-50 px-5 py-2 font-display text-lg font-semibold text-sun-700">
          {t("reference")} : <span dir="ltr">{orderRef(order.number)}</span>
        </p>
      </div>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">{t("summary")}</h2>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((item) => {
            const img = item.product?.images[0]?.url;
            const name = locale === "ar" && item.product?.nameAr ? item.product.nameAr : item.name;
            return (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sky-50">{img && <Image src={img} alt="" fill sizes="56px" className="object-cover" />}</div>
                <p className="flex-1 font-bold">
                  {name} <span className="text-muted">× {item.quantity}</span>
                </p>
                <p className="font-display font-semibold">{formatPrice(Number(item.unitPrice) * item.quantity, locale)}</p>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4">
          <div className="flex justify-between text-ink-soft">
            <dt>{tc("shipping")}</dt>
            <dd>{Number(order.shippingFee) === 0 ? tc("free") : formatPrice(order.shippingFee, locale)}</dd>
          </div>
          <div className="flex justify-between font-display text-2xl font-semibold">
            <dt>{tc("total")}</dt>
            <dd>{formatPrice(order.total, locale)}</dd>
          </div>
        </dl>
        <p className="mt-6 rounded-2xl bg-cloud p-4 text-ink-soft">
          <strong className="text-ink">{t("deliveryTo")} :</strong> {order.address}, {order.city}, {locale === "ar" ? gov?.ar : gov?.fr}
        </p>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/boutique" className="btn btn-sun">
          {t("continue")}
        </Link>
        {wa && (
          <a href={`https://wa.me/${wa}?text=${encodeURIComponent(orderRef(order.number))}`} target="_blank" rel="noopener" className="btn btn-ghost">
            <MessageCircle className="size-5 text-mint-500" /> {t("whatsapp")}
          </a>
        )}
      </div>
    </div>
  );
}
