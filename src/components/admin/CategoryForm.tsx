"use client";

import { saveCategory } from "@/app/admin/(panel)/categories/actions";
import { ImageField } from "./ImageField";
import { SeoPreview } from "./SeoPreview";
import { Bilingual, CountedField, Field, FormMessage, Section, SubmitButton, inputClass, useAdminForm } from "./ui";

export type CategoryFormValues = {
  id?: string;
  nameFr: string;
  nameAr: string;
  slugFr: string;
  slugAr: string;
  descFr: string;
  descAr: string;
  metaTitleFr: string;
  metaTitleAr: string;
  metaDescFr: string;
  metaDescAr: string;
  image: string | null;
  color: string;
  sortOrder: number;
  isActive: boolean;
};

const COLORS = [
  ["yellow", "Jaune soleil", "bg-sun-400"],
  ["blue", "Bleu ciel", "bg-sky-500"],
  ["coral", "Corail", "bg-coral-500"],
  ["green", "Menthe", "bg-mint-500"],
] as const;

export function CategoryForm({ category, created }: { category: CategoryFormValues; created?: boolean }) {
  const { state, pending, onSubmit } = useAdminForm(saveCategory.bind(null, category.id ?? null), created ? { ok: "Catégorie créée ✔" } : undefined);
  const formId = "category-form";

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-6">
      <Section title="Informations" description="La description apparaît en haut de la page catégorie : quelques phrases riches en mots-clés aident beaucoup le référencement.">
        <Bilingual
          fr={
            <>
              <Field label="Nom *">
                <input name="nameFr" defaultValue={category.nameFr} required className={inputClass} />
              </Field>
              <Field label="Adresse (slug)">
                <input name="slugFr" defaultValue={category.slugFr} placeholder="générée automatiquement" className={inputClass} />
              </Field>
              <Field label="Description" hint="Markdown accepté">
                <textarea name="descFr" defaultValue={category.descFr} rows={5} className={inputClass} />
              </Field>
            </>
          }
          ar={
            <>
              <Field label="الاسم *">
                <input name="nameAr" defaultValue={category.nameAr} required dir="rtl" className={inputClass} />
              </Field>
              <Field label="Adresse arabe (slug)">
                <input name="slugAr" defaultValue={category.slugAr} placeholder="générée automatiquement" dir="rtl" className={inputClass} />
              </Field>
              <Field label="الوصف">
                <textarea name="descAr" defaultValue={category.descAr} rows={5} dir="rtl" className={inputClass} />
              </Field>
            </>
          }
        />
      </Section>

      <Section title="Apparence">
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <ImageField key={category.image ?? "none"} name="image" current={category.image} label="Image de la catégorie" />
          <div className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-ink-soft">Couleur de la carte</legend>
              <div className="flex flex-wrap gap-3">
                {COLORS.map(([value, label, bg]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-line px-3 py-2 font-bold has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50">
                    <input type="radio" name="color" value={value} defaultChecked={category.color === value} className="sr-only" />
                    <span className={`size-5 rounded-md ${bg}`} /> {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Ordre d'affichage" hint="Les plus petits nombres s'affichent en premier.">
              <input name="sortOrder" type="number" defaultValue={category.sortOrder} className={`${inputClass} max-w-32`} />
            </Field>
            <label className="flex items-center gap-2 font-bold">
              <input type="checkbox" name="isActive" defaultChecked={category.isActive} className="size-5 accent-sky-500" /> Visible sur le site
            </label>
          </div>
        </div>
      </Section>

      <Section title="Référencement (SEO)">
        <Bilingual
          fr={
            <>
              <CountedField label="Titre SEO" name="metaTitleFr" defaultValue={category.metaTitleFr} max={60} />
              <CountedField label="Méta-description" name="metaDescFr" defaultValue={category.metaDescFr} max={155} multiline />
              <SeoPreview formId={formId} lang="Fr" urlPrefix="/categorie/" />
            </>
          }
          ar={
            <>
              <CountedField label="عنوان SEO" name="metaTitleAr" defaultValue={category.metaTitleAr} max={60} dir="rtl" />
              <CountedField label="الوصف التعريفي" name="metaDescAr" defaultValue={category.metaDescAr} max={155} multiline dir="rtl" />
              <SeoPreview formId={formId} lang="Ar" urlPrefix="/categorie/" />
            </>
          }
        />
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-3xl bg-white/95 p-4 shadow-soft backdrop-blur">
        <SubmitButton pending={pending}>{category.id ? "Enregistrer" : "Créer la catégorie"}</SubmitButton>
        <div className="min-w-0 flex-1">
          <FormMessage state={state} />
        </div>
      </div>
    </form>
  );
}
