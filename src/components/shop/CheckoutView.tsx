"use client";

import Image from "next/image";
import { Banknote, Loader2, Lock, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { placeOrder, type OrderResult } from "@/app/[locale]/panier/actions";
import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatPrice } from "@/lib/format";
import { GOVERNORATES } from "@/lib/governorates";
import { FreeShippingMeter } from "./CartDrawer";
import { useCart } from "./cart-context";
import { QtyStepper } from "./QtyStepper";

/** One-page checkout: cart lines on one side, a short cash-on-delivery form on the other. */
export function CheckoutView() {
  const cart = useCart();
  const t = useTranslations("cart");
  const tc = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!cart.ready) {
    return <div className="mt-8 h-64 animate-pulse rounded-3xl bg-white" />;
  }

  if (cart.items.length === 0) {
    return (
      <div className="card mt-8 flex flex-col items-center gap-4 px-6 py-16 text-center">
        <Image src="/brand/mark.png" alt="" width={120} height={120} />
        <p className="font-display text-2xl font-semibold">{t("empty")}</p>
        <p className="text-muted">{t("emptyHint")}</p>
        <Link href="/boutique" className="btn btn-sun mt-2">
          {t("continue")}
        </Link>
      </div>
    );
  }

  const errorText = (r: Extract<OrderResult, { ok: false }>) => {
    switch (r.error) {
      case "phone":
        return tc("errorPhone");
      case "required":
        return tc("errorRequired");
      case "stock":
        return tc("errorStock", { name: r.product ?? "" });
      default:
        return tc("errorGeneric");
    }
  };

  const onSubmit = (form: FormData) => {
    setError(null);
    const get = (k: string) => String(form.get(k) ?? "");
    startTransition(async () => {
      const result = await placeOrder({
        items: cart.items.map((i) => ({ id: i.id, qty: i.qty })),
        customerName: get("customerName"),
        phone: get("phone"),
        email: get("email"),
        governorate: get("governorate"),
        city: get("city"),
        address: get("address"),
        note: get("note"),
        website: get("website"),
        locale,
      }).catch(() => ({ ok: false, error: "generic" }) as const);
      if (result.ok) {
        cart.clear();
        router.push(`/commande/${result.id}`);
      } else {
        setError(errorText(result));
      }
    });
  };

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.15fr_1fr]">
      {/* ---------------------------------------------------------- form */}
      <form action={onSubmit} className="card order-2 p-5 sm:p-8 lg:order-1">
        <h2 className="font-display text-2xl font-semibold">{tc("title")}</h2>
        <p className="mt-1 text-muted">{tc("subtitle")}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={tc("name")} className="sm:col-span-2">
            <input name="customerName" required minLength={2} autoComplete="name" className="field" />
          </Field>
          <Field label={tc("phone")} hint={tc("phoneHint")}>
            <input name="phone" type="tel" required inputMode="tel" autoComplete="tel" placeholder="2X XXX XXX" dir="ltr" className="field text-start" />
          </Field>
          <Field label={tc("email")}>
            <input name="email" type="email" autoComplete="email" dir="ltr" className="field text-start" />
          </Field>
          <Field label={tc("governorate")}>
            <select name="governorate" required defaultValue="" className="field">
              <option value="" disabled>
                {tc("chooseGovernorate")}
              </option>
              {GOVERNORATES.map((g) => (
                <option key={g.fr} value={g.fr}>
                  {locale === "ar" ? g.ar : g.fr}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tc("city")}>
            <input name="city" required minLength={2} autoComplete="address-level2" className="field" />
          </Field>
          <Field label={tc("address")} className="sm:col-span-2">
            <input name="address" required minLength={4} autoComplete="street-address" className="field" />
          </Field>
          <Field label={tc("note")} className="sm:col-span-2">
            <textarea name="note" rows={2} placeholder={tc("notePlaceholder")} className="field resize-none" />
          </Field>
          {/* Honeypot */}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </div>

        <fieldset className="mt-6">
          <legend className="label">{tc("payment")}</legend>
          <div className="flex items-center gap-4 rounded-2xl border-2 border-mint-400 bg-mint-50 p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
              <Banknote className="size-6" aria-hidden />
            </span>
            <span>
              <span className="block font-bold">{tc("cod")}</span>
              <span className="text-sm text-ink-soft">{tc("codHint")}</span>
            </span>
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="mt-5 rounded-2xl bg-coral-50 px-4 py-3 font-bold text-coral-600">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-sun mt-6 w-full py-4 text-lg">
          {pending ? <Loader2 className="size-5 animate-spin" /> : null}
          {pending ? (
            tc("sending")
          ) : (
            <>
              {tc("submit")}
              <span className="hidden sm:inline">· {formatPrice(cart.total, locale)}</span>
            </>
          )}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted">
          <Lock className="size-3.5" aria-hidden /> {tc("secure")}
        </p>
      </form>

      {/* ---------------------------------------------------------- summary */}
      <aside className="card order-1 overflow-hidden lg:sticky lg:top-24 lg:order-2">
        <h2 className="px-6 pt-6 font-display text-2xl font-semibold">
          {tc("summary")} <span className="text-base font-bold text-muted">({t("items", { count: cart.count })})</span>
        </h2>
        <ul className="mt-4 divide-y divide-line px-6">
          {cart.items.map((item) => {
            const name = locale === "ar" ? item.nameAr : item.nameFr;
            return (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-sky-50">
                  {item.image && <Image src={item.image} alt={name} fill sizes="80px" className="object-cover" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/produit/${locale === "ar" ? item.slugAr : item.slugFr}`} className="line-clamp-2 font-bold leading-snug hover:text-sky-600">
                      {name}
                    </Link>
                    <button type="button" onClick={() => cart.remove(item.id)} className="rounded-full p-1.5 text-muted hover:bg-coral-50 hover:text-coral-600" aria-label={`${t("remove")} ${name}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <QtyStepper size="sm" value={item.qty} max={item.stock} onChange={(q) => cart.setQty(item.id, q)} />
                    <span className="font-display font-semibold text-sky-600">{formatPrice(item.price * item.qty, locale)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <FreeShippingMeter />
        <dl className="space-y-2 px-6 py-5">
          <div className="flex justify-between text-ink-soft">
            <dt>{t("subtotal")}</dt>
            <dd>{formatPrice(cart.subtotal, locale)}</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>{t("shipping")}</dt>
            <dd>{cart.shipping === 0 ? <span className="font-bold text-mint-600">{t("free")}</span> : formatPrice(cart.shipping, locale)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 font-display text-2xl font-semibold">
            <dt>{t("total")}</dt>
            <dd>{formatPrice(cart.total, locale)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
