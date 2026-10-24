"use client";

import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export type NavCategory = { href: string; name: string; color: string };

const dot: Record<string, string> = { yellow: "bg-sun-400", blue: "bg-sky-500", coral: "bg-coral-500", green: "bg-mint-500" };

export function MobileMenu({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const pathname = usePathname();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close after navigating
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full border-2 border-line bg-white lg:hidden" aria-label={t("menu")} aria-expanded={open}>
        <Menu className="size-5" />
      </button>
      {/* Portal: the sticky header's backdrop-blur would otherwise confine this fixed overlay to the header box. */}
      {open &&
        createPortal(
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t("menu")}>
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label={t("close")} onClick={() => setOpen(false)} />
          <nav className="absolute inset-y-0 start-0 flex w-[85%] max-w-sm flex-col gap-1 overflow-y-auto bg-cream p-5 shadow-2xl animate-slide-in">
            <div className="mb-4 flex items-center justify-between">
              <Image src="/brand/logo.png" alt="KiddoCraft" width={120} height={84} className="h-12 w-auto" />
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-sky-50" aria-label={t("close")}>
                <X className="size-6" />
              </button>
            </div>
            {[
              ["/", t("home")],
              ["/boutique", t("shop")],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-2xl px-4 py-3 font-display text-lg font-semibold hover:bg-sky-50">
                {label}
              </Link>
            ))}
            <p className="mt-3 px-4 text-xs font-extrabold uppercase tracking-wider text-muted">{t("categories")}</p>
            {categories.map((c) => (
              <Link key={c.href} href={c.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold hover:bg-sky-50">
                <span className={`size-3 rounded-sm ${dot[c.color] ?? dot.blue}`} aria-hidden />
                {c.name}
              </Link>
            ))}
            <div className="my-3 border-t border-line" />
            {[
              ["/blog", t("blog")],
              ["/a-propos", t("about")],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-2xl px-4 py-3 font-display text-lg font-semibold hover:bg-sky-50">
                {label}
              </Link>
            ))}
            <div className="mt-auto pt-6">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>,
          document.body,
        )}
    </>
  );
}
