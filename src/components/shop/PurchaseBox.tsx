"use client";

import { Check, ShoppingBag, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCart, type CartItem } from "./cart-context";
import { QtyStepper } from "./QtyStepper";

/** Quantity + "add to cart" + one-tap "order now" (adds and goes straight to checkout). */
export function PurchaseBox({ item }: { item: Omit<CartItem, "qty"> }) {
  const cart = useCart();
  const router = useRouter();
  const t = useTranslations("product");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = item.stock <= 0;

  if (soldOut) {
    return (
      <div className="rounded-2xl bg-line/60 px-5 py-4 text-center font-display text-lg font-semibold text-ink-soft">{t("outOfStock")}</div>
    );
  }

  return (
    <div className="space-y-3">
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
      <button
        type="button"
        className="btn btn-sun w-full py-4 text-lg"
        onClick={() => {
          cart.add(item, qty, { silent: true });
          router.push("/panier");
        }}
      >
        <Zap className="size-5" /> {t("buyNow")}
      </button>
    </div>
  );
}
