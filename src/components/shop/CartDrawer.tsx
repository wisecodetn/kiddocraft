"use client";

import Image from "next/image";
import { ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatPrice } from "@/lib/format";
import { useCart } from "./cart-context";
import { QtyStepper } from "./QtyStepper";

export function CartDrawer() {
  const cart = useCart();
  const t = useTranslations("cart");
  const tn = useTranslations("nav");
  const locale = useLocale() as Locale;
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cart.isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cart.isOpen, cart]);

  if (!cart.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t("title")}>
      <button type="button" aria-label={tn("close")} onClick={cart.close} className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
      <div
        ref={panel}
        tabIndex={-1}
        className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-cream shadow-2xl outline-none animate-slide-in"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <ShoppingBag className="size-5 text-sky-500" aria-hidden />
            {t("title")}
            {cart.count > 0 && <span className="chip bg-sun-100 text-sun-700">{t("items", { count: cart.count })}</span>}
          </h2>
          <button type="button" onClick={cart.close} className="rounded-full p-2 hover:bg-sky-50" aria-label={tn("close")}>
            <X className="size-5" />
          </button>
        </header>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <Image src="/brand/mark.png" alt="" width={96} height={96} className="opacity-80" />
            <p className="font-display text-lg font-semibold">{t("empty")}</p>
            <p className="text-muted">{t("emptyHint")}</p>
            <Link href="/boutique" onClick={cart.close} className="btn btn-sun">
              {t("continue")}
            </Link>
          </div>
        ) : (
          <>
            <FreeShippingMeter />
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {cart.items.map((item) => {
                const name = locale === "ar" ? item.nameAr : item.nameFr;
                return (
                  <li key={item.id} className="flex gap-4 py-4">
                    <Link
                      href={`/produit/${locale === "ar" ? item.slugAr : item.slugFr}`}
                      onClick={cart.close}
                      className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-sky-50"
                    >
                      {item.image && <Image src={item.image} alt={name} fill sizes="80px" className="object-cover" />}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 font-bold leading-snug">{name}</p>
                        <button
                          type="button"
                          onClick={() => cart.remove(item.id)}
                          className="rounded-full p-1.5 text-muted hover:bg-coral-50 hover:text-coral-600"
                          aria-label={`${t("remove")} ${name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <QtyStepper value={item.qty} max={item.stock} onChange={(q) => cart.setQty(item.id, q)} size="sm" />
                        <span className="font-display font-semibold text-sky-600">{formatPrice(item.price * item.qty, locale)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <footer className="space-y-3 border-t border-line bg-white px-5 py-5">
              <Row label={t("subtotal")} value={formatPrice(cart.subtotal, locale)} />
              <Row label={t("shipping")} value={cart.shipping === 0 ? t("free") : formatPrice(cart.shipping, locale)} />
              <Row label={t("total")} value={formatPrice(cart.total, locale)} strong />
              <Link href="/panier" onClick={cart.close} className="btn btn-sun w-full text-lg">
                {t("checkout")}
              </Link>
              <button type="button" onClick={cart.close} className="w-full text-center text-sm font-bold text-muted hover:text-ink">
                {t("continue")}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "font-display text-xl font-semibold text-ink" : "text-ink-soft"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function FreeShippingMeter() {
  const cart = useCart();
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const goal = cart.rules.freeShippingFrom;
  if (goal <= 0 || cart.subtotal <= 0) return null;
  const left = Math.max(0, goal - cart.subtotal);
  const pct = Math.min(100, (cart.subtotal / goal) * 100);
  return (
    <div className="bg-sky-50 px-5 py-3">
      <p className="flex items-center gap-2 text-sm font-bold text-sky-700">
        <Truck className="size-4" aria-hidden />
        {left > 0 ? t("freeShippingHint", { amount: formatPrice(left, locale) }) : t("freeShippingDone")}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gradient-to-r from-sun-400 to-mint-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
