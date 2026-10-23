"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/shop/cart-context";

export function CartButton() {
  const cart = useCart();
  const t = useTranslations("nav");
  return (
    <button
      type="button"
      onClick={cart.open}
      className="relative grid size-11 place-items-center rounded-full bg-sun-400 text-ink shadow-[0_3px_0_var(--color-sun-600)] transition hover:bg-sun-500 active:translate-y-0.5 active:shadow-[0_1px_0_var(--color-sun-600)]"
      aria-label={`${t("cart")} (${cart.count})`}
    >
      <ShoppingBag className="size-5" />
      {cart.ready && cart.count > 0 && (
        <span key={cart.count} className="absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full bg-sky-500 px-1 text-[11px] font-extrabold text-white ring-2 ring-white animate-pop">
          {cart.count}
        </span>
      )}
    </button>
  );
}
