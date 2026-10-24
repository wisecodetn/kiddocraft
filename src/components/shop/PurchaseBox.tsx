"use client";

import { Check, ShoppingBag, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatPrice } from "@/lib/format";
import { useCart, type CartItem } from "./cart-context";
import { QtyStepper } from "./QtyStepper";

/**
 * Quantity + "add to cart" + one-tap "order now" (adds and goes straight to checkout).
 * On phones, once these buttons scroll out of view, a bar pinned to the bottom keeps "order now" in reach.
 */
export function PurchaseBox({ item }: { item: Omit<CartItem, "qty"> }) {
  const cart = useCart();
  const router = useRouter();
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const soldOut = item.stock <= 0;

  useEffect(() => {
    if (!box.current) return;
    // Only once the buttons have scrolled up past the top of the screen.
    const observer = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);

  const buyNow = () => {
    cart.add(item, qty, { silent: true });
    router.push("/panier");
  };

  if (soldOut) {
    return (
      <div className="rounded-2xl bg-line/60 px-5 py-4 text-center font-display text-lg font-semibold text-ink-soft">{t("outOfStock")}</div>
    );
  }

  return (
    <>
      <div ref={box} className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <QtyStepper value={qty} max={item.stock} onChange={setQty} />
          <button
            type="button"
            className="btn btn-sky flex-1"
            onClick={() => {
              cart.add(item, qty);
              setAdded(true);
              setTimeout(() => setAdded(false), 1800);
            }}
          >
            {added ? <Check className="size-5 animate-pop" /> : <ShoppingBag className="size-5" />}
            {added ? t("added") : t("addToCart")}
          </button>
        </div>
        <button type="button" className="btn btn-sun w-full py-4 text-lg" onClick={buyNow}>
          <Zap className="size-5" /> {t("buyNow")}
        </button>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgb(31_45_61/0.25)] backdrop-blur transition-transform duration-300 lg:hidden ${
          showBar ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
        aria-hidden={!showBar}
      >
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap font-display text-xl font-bold text-sky-600">{formatPrice(item.price * qty, locale)}</span>
          <button type="button" tabIndex={showBar ? 0 : -1} className="btn btn-sun flex-1 py-3" onClick={buyNow}>
            <Zap className="size-5" /> {t("buyNow")}
          </button>
        </div>
      </div>
    </>
  );
}
