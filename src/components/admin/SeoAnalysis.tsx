"use client";

import { CheckCircle2, CircleAlert, CircleX, Gauge } from "lucide-react";
import { useEffect, useState } from "react";
import { slugify } from "@/lib/slug";
import { inputClass } from "./ui";

/**
 * Yoast-style SEO analysis for one language of a product or article form.
 * Reads the form's own fields live (title, slug, meta fields, rich text) and scores them against a focus keyword.
 */
type Fields = { title: string; slug: string; metaTitle: string; metaDesc: string; summary: string; content: string; keyword: string };
type Status = "good" | "ok" | "bad";
type Check = { status: Status; text: string };

/** Lowercase, no accents/diacritics, unified Arabic letter variants: matching ignores spelling details. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const contains = (text: string, keyword: string) => !!keyword && ` ${norm(text)} `.includes(` ${norm(keyword)} `);
const countOf = (text: string, keyword: string) => {
  const k = norm(keyword);
  if (!k) return 0;
  return (` ${norm(text)} `.match(new RegExp(` ${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} `, "g")) ?? []).length;
};

function analyse(f: Fields, minWords: number, siteHost: string): Check[] {
  const doc = new DOMParser().parseFromString(f.content || "", "text/html");
  const text = doc.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
  const words = text ? text.split(" ").length : 0;
  const firstParagraph = [...doc.querySelectorAll("p")].map((p) => p.textContent?.trim() ?? "").find(Boolean) ?? "";
  const headings = [...doc.querySelectorAll("h2, h3, h4")].map((h) => h.textContent ?? "");
  const h2 = doc.querySelectorAll("h2").length;
  const images = [...doc.querySelectorAll("img")];
  const missingAlt = images.filter((i) => !i.getAttribute("alt")?.trim()).length;
  const links = [...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? "");
  const internal = links.filter((h) => h.startsWith("/") || h.includes(siteHost)).length;
  const external = links.length - internal;

  const seoTitle = `${f.metaTitle || f.title} | KiddoCraft`;
  const description = f.metaDesc || f.summary;
  const k = f.keyword.trim();
  const checks: Check[] = [];

  if (!k) {
    checks.push({ status: "bad", text: "Définissez un mot-clé principal : la recherche que vous visez sur Google (ex. « tuiles magnétiques »)." });
  } else {
    checks.push(contains(seoTitle, k) ? { status: "good", text: "Le mot-clé apparaît dans le titre SEO." } : { status: "bad", text: "Ajoutez le mot-clé dans le titre SEO (ou le nom)." });
    checks.push(
      contains(description, k)
        ? { status: "good", text: "Le mot-clé apparaît dans la méta-description." }
        : { status: "bad", text: "Ajoutez le mot-clé dans la méta-description (ou l’accroche)." },
    );
    const slugKey = slugify(k);
    checks.push(
      slugKey && f.slug.includes(slugKey)
        ? { status: "good", text: "Le mot-clé apparaît dans l’adresse (slug)." }
        : { status: "ok", text: f.slug ? "Le mot-clé n’est pas dans l’adresse (slug)." : "Adresse vide : elle sera générée depuis le nom." },
    );
    checks.push(
      contains(firstParagraph, k)
        ? { status: "good", text: "Le mot-clé apparaît dès le premier paragraphe." }
        : { status: "bad", text: "Utilisez le mot-clé dans le premier paragraphe." },
    );
    checks.push(
      headings.some((h) => contains(h, k))
        ? { status: "good", text: "Le mot-clé apparaît dans un sous-titre." }
        : { status: "ok", text: "Utilisez le mot-clé dans au moins un sous-titre (Titre 2 ou 3)." },
    );
    const density = words ? ((countOf(text, k) * k.split(/\s+/).length) / words) * 100 : 0;
    const d = density.toFixed(1).replace(".", ",");
    checks.push(
      density > 3
        ? { status: "bad", text: `Densité du mot-clé ${d} % : trop élevée (sur-optimisation). Visez 0,5 à 3 %.` }
        : density >= 0.5
          ? { status: "good", text: `Densité du mot-clé ${d} % : parfait.` }
          : { status: "ok", text: `Densité du mot-clé ${d} % : un peu faible. Visez 0,5 à 3 %.` },
    );
  }

  const titleLen = seoTitle.length;
  checks.push(
    titleLen >= 30 && titleLen <= 65
      ? { status: "good", text: `Longueur du titre : ${titleLen} caractères, idéal.` }
      : { status: titleLen > 75 ? "bad" : "ok", text: `Longueur du titre : ${titleLen} caractères (idéal : 30 à 65).` },
  );
  const descLen = description.trim().length;
  checks.push(
    descLen >= 120 && descLen <= 160
      ? { status: "good", text: `Méta-description : ${descLen} caractères, idéal.` }
      : { status: descLen === 0 || descLen > 175 ? "bad" : "ok", text: `Méta-description : ${descLen} caractères (idéal : 120 à 160).` },
  );
  checks.push(
    words >= minWords
      ? { status: "good", text: `Contenu : ${words} mots.` }
      : { status: words >= minWords / 2 ? "ok" : "bad", text: `Contenu : ${words} mots. Visez au moins ${minWords} mots pour bien vous positionner.` },
  );
  checks.push(
    h2 > 0
      ? { status: "good", text: `${headings.length} sous-titre(s) structurent le texte.` }
      : { status: "bad", text: "Ajoutez des sous-titres (Titre 2) pour structurer le texte." },
  );
  checks.push(
    images.length === 0
      ? { status: "ok", text: "Aucune image dans le texte : une image illustrée aide le lecteur et Google Images." }
      : missingAlt
        ? { status: "bad", text: `${missingAlt} image(s) sans texte alternatif : cliquez sur l’image dans l’éditeur pour en ajouter.` }
        : { status: "good", text: "Toutes les images ont un texte alternatif." },
  );
  checks.push(
    internal > 0
      ? { status: "good", text: `${internal} lien(s) interne(s) vers le site.` }
      : { status: "ok", text: "Ajoutez un lien vers un autre produit, une catégorie ou un article (ex. /categorie/…)." },
  );
  if (external > 0) checks.push({ status: "good", text: `${external} lien(s) externe(s) (ouverts dans un nouvel onglet).` });
  return checks;
}

const ICON = {
  good: <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint-500" />,
  ok: <CircleAlert className="mt-0.5 size-4 shrink-0 text-sun-500" />,
  bad: <CircleX className="mt-0.5 size-4 shrink-0 text-coral-500" />,
};

export function SeoAnalysis({
  formId,
  lang,
  fields,
  defaultKeyword,
  minWords,
}: {
  formId: string;
  lang: "Fr" | "Ar";
  /** Form field names: title, slug, summary (short description/excerpt) and rich content. */
  fields: { title: string; summary: string; content: string };
  defaultKeyword: string;
  minWords: number;
}) {
  const [checks, setChecks] = useState<Check[]>([]);
  const keywordName = `focusKeyword${lang}`;

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    const read = () => {
      const v = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "";
      setChecks(
        analyse(
          {
            title: v(fields.title),
            slug: v(`slug${lang}`),
            metaTitle: v(`metaTitle${lang}`),
            metaDesc: v(`metaDesc${lang}`),
            summary: v(fields.summary),
            content: v(fields.content),
            keyword: v(keywordName),
          },
          minWords,
          window.location.host,
        ),
      );
    };
    read();
    // The rich text editor loads asynchronously and reports changes through `input` events.
    const late = setTimeout(read, 1500);
    form.addEventListener("input", read);
    return () => {
      clearTimeout(late);
      form.removeEventListener("input", read);
    };
  }, [formId, lang, fields.title, fields.summary, fields.content, keywordName, minWords]);

  const points = checks.reduce((n, c) => n + (c.status === "good" ? 2 : c.status === "ok" ? 1 : 0), 0);
  const score = checks.length ? Math.round((points / (checks.length * 2)) * 100) : 0;
  const level = score >= 75 ? { label: "Bon", color: "bg-mint-500", text: "text-mint-600" } : score >= 50 ? { label: "À améliorer", color: "bg-sun-400", text: "text-sun-700" } : { label: "Faible", color: "bg-coral-500", text: "text-coral-600" };

  return (
    <div className="space-y-3 rounded-2xl border-2 border-line bg-white p-4" dir="ltr">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-ink-soft">{lang === "Ar" ? "Mot-clé principal (arabe)" : "Mot-clé principal"}</span>
        <input name={keywordName} defaultValue={defaultKeyword} dir={lang === "Ar" ? "rtl" : "ltr"} placeholder={lang === "Ar" ? "مثال: بلاطات مغناطيسية" : "Ex. : tuiles magnétiques"} className={inputClass} />
      </label>
      <div className="flex items-center gap-3">
        <Gauge className={`size-5 ${level.text}`} />
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cloud">
          <div className={`h-full rounded-full transition-all duration-500 ${level.color}`} style={{ width: `${score}%` }} />
        </div>
        <span className={`text-sm font-extrabold ${level.text}`}>
          {score}/100 · {level.label}
        </span>
      </div>
      <ul className="space-y-1.5 text-sm">
        {checks.map((c, i) => (
          <li key={i} className="flex gap-2 text-ink-soft">
            {ICON[c.status]}
            <span>{c.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
