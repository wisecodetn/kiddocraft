"use client";

import { useEffect, useState } from "react";

/**
 * Live Google result preview for one language, reading the form's own fields
 * (meta title/description, falling back to name and short description).
 */
export function SeoPreview({ formId, lang, urlPrefix }: { formId: string; lang: "Fr" | "Ar"; urlPrefix: string }) {
  const [view, setView] = useState({ title: "", desc: "", slug: "" });

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    const read = () => {
      const v = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value?.trim() ?? "";
      setView({
        title: v(`metaTitle${lang}`) || v(`name${lang}`) || v(`title${lang}`),
        desc: v(`metaDesc${lang}`) || v(`shortDesc${lang}`) || v(`excerpt${lang}`) || v(`desc${lang}`),
        slug: v(`slug${lang}`),
      });
    };
    read();
    form.addEventListener("input", read);
    return () => form.removeEventListener("input", read);
  }, [formId, lang]);

  const title = view.title ? `${view.title} | KiddoCraft` : "Titre de la page | KiddoCraft";
  const desc = view.desc.replace(/[#*_>`]/g, "").replace(/\s+/g, " ");
  return (
    <div dir={lang === "Ar" ? "rtl" : "ltr"} className="rounded-2xl border-2 border-line bg-white p-4">
      <p className="text-xs font-extrabold uppercase tracking-wider text-muted" dir="ltr">
        Aperçu Google · {lang === "Ar" ? "arabe" : "français"}
      </p>
      <p className="mt-2 truncate text-xs text-[#4d5156]" dir="ltr">
        kiddocraft.tn{lang === "Ar" ? "/ar" : ""}
        {urlPrefix}
        {view.slug || "…"}
      </p>
      <p className="mt-0.5 truncate text-lg text-[#1a0dab]">{title}</p>
      <p className="line-clamp-2 text-sm text-[#4d5156]">{desc || "La description apparaîtra ici. Rédigez une phrase qui donne envie de cliquer."}</p>
    </div>
  );
}
