"use client";

import { Check, Plus, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCart, type CartItem } from "./cart-context";

export function AddToCartButton({ item, compact = false, disabled = false }: { item: Omit<CartItem, "qty">; compact?: boolean; disabled?: boolean }) {
  const cart = useCart();
  const t = useTranslations("product");
  const [done, setDone] = useState(false);

  const onClick = () => {
    cart.add(item, 1);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="grid size-11 place-items-center rounded-full bg-sun-400 text-ink shadow-[0_3px_0_var(--color-sun-600)] transition hover:bg-sun-500 active:translate-y-0.5 active:shadow-[0_1px_0_var(--color-sun-600)] disabled:bg-line disabled:shadow-none"
        aria-label={disabled ? t("outOfStock") : t("addToCart")}
        title={disabled ? t("outOfStock") : t("addToCart")}
      >
        {done ? <Check className="size-5 animate-pop" /> : <Plus className="size-5" />}
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn btn-sun">
      {done ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
      {disabled ? t("outOfStock") : t("addToCart")}
    </button>
  );
}
