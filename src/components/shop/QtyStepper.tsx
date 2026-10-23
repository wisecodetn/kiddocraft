"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function QtyStepper({
  value,
  onChange,
  max = 99,
  size = "md",
}: {
  value: number;
  onChange: (qty: number) => void;
  max?: number;
  size?: "sm" | "md";
}) {
  const t = useTranslations("product");
  const limit = Math.max(1, Math.min(max, 99));
  const btn = size === "sm" ? "size-8" : "size-11";
  return (
    <div className="inline-flex items-center rounded-full border-2 border-line bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className={`${btn} grid place-items-center rounded-full text-ink-soft hover:bg-sky-50 disabled:opacity-40`}
        aria-label={t("decrease")}
      >
        <Minus className="size-4" />
      </button>
      <span className={`min-w-8 text-center font-display font-semibold ${size === "sm" ? "text-sm" : "text-lg"}`} aria-live="polite" aria-label={t("quantity")}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(limit, value + 1))}
        disabled={value >= limit}
        className={`${btn} grid place-items-center rounded-full text-ink-soft hover:bg-sky-50 disabled:opacity-40`}
        aria-label={t("increase")}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
