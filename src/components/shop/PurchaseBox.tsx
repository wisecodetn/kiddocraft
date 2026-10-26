"use client";

import { Check, ShoppingBag, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatPrice } from "@/lib/format";
import { useCart, type CartItem } from "./cart-context";
import { QtyStepper } from "./QtyStepper";

/**
 * Quantity + "add to cart" + one-tap "order now" (adds and goes straight to checkout).
 * Desktop: the buttons sit in the page. Phones: they live in a bar pinned to the bottom of the screen,
 * always visible while the product page is open (body gets bottom padding so the footer isn't hidden).
 */
export function PurchaseBox({ item }: { item: Omit<CartItem, "qty"> }) {
  const cart = useCart();
  const router = useRouter();
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = item.stock <= 0;

  useEffect(() => {
    document.body.classList.add("has-buy-bar");
    return () => document.body.classList.remove("has-buy-bar");
  }, []);

  const addToCart = () => {
    cart.add(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const buyNow = () => {
    cart.add(item, qty, { silent: true });
    router.push("/panier");
  };

  return (
    <>
      {soldOut ? (
        <div className="hidden rounded-2xl bg-line/60 px-5 py-4 text-center font-display text-lg font-semibold text-ink-soft lg:block">{t("outOfStock")}</div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} max={item.stock} onChange={setQty} />
            <button type="button" className="btn btn-sky hidden flex-1 lg:inline-flex" onClick={addToCart}>
              {added ? <Check className="size-5 animate-pop" /> : <ShoppingBag className="size-5" />}
              {added ? t("added") : t("addToCart")}
            </button>
          </div>
          <button type="button" className="btn btn-sun hidden w-full py-4 text-lg lg:inline-flex" onClick={buyNow}>
            <Zap className="size-5" /> {t("buyNow")}
          </button>
        </div>
      )}

      {/* Phones: always-visible buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgb(31_45_61/0.25)] backdrop-blur lg:hidden">
        {soldOut ? (
          <p className="rounded-2xl bg-line/60 py-3 text-center font-display text-lg font-semibold text-ink-soft">{t("outOfStock")}</p>
        ) : (
          <>
            <p className="mb-2 flex items-baseline justify-between text-sm font-bold text-muted">
              <span>
                {t("quantity")} : {qty}
              </span>
              <span className="font-display text-lg text-sky-600">{formatPrice(item.price * qty, locale)}</span>
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-sky flex-1 px-3 py-3 text-[15px]" onClick={addToCart}>
                {added ? <Check className="size-5 shrink-0 animate-pop" /> : <ShoppingBag className="size-5 shrink-0" />}
                <span className="truncate">{added ? t("added") : t("addToCart")}</span>
              </button>
              <button type="button" className="btn btn-sun flex-1 px-3 py-3 text-[15px]" onClick={buyNow}>
                <Zap className="size-5 shrink-0" />
                <span className="truncate">{t("buyNowShort")}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
