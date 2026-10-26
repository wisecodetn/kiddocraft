"use client";

import { saveProduct } from "@/app/admin/(panel)/produits/actions";
import { ProductImagesField } from "./ProductImagesField";
import { RichTextEditor } from "./RichTextEditor";
import { SeoAnalysis } from "./SeoAnalysis";
import { SeoPreview } from "./SeoPreview";
import { Bilingual, CountedField, Field, FormMessage, Section, SubmitButton, inputClass, useAdminForm } from "./ui";

export type ProductFormValues = {
  id?: string;
  nameFr: string;
  nameAr: string;
  slugFr: string;
  slugAr: string;
  shortDescFr: string;
  shortDescAr: string;
  descFr: string;
  descAr: string;
  focusKeywordFr: string;
  focusKeywordAr: string;
  metaTitleFr: string;
  metaTitleAr: string;
  metaDescFr: string;
  metaDescAr: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  stock: number;
  ageMin: string;
  ageMax: string;
  pieces: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  images: { id: string; url: string; altFr: string; altAr: string }[];
};

export function ProductForm({ product, categories, created }: { product: ProductFormValues; categories: { id: string; name: string }[]; created?: boolean }) {
  const { state, pending, onSubmit } = useAdminForm(saveProduct.bind(null, product.id ?? null), created ? { ok: "Produit créé ✔ Vous pouvez continuer à le modifier." } : undefined);
  const formId = "product-form";

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-6">
      <Section title="Informations" description="Le nom et les descriptions sont affichés sur la fiche produit. L'adresse (slug) est générée à partir du nom si vous la laissez vide.">
        <Bilingual
          fr={
            <>
              <Field label="Nom du produit *">
                <input name="nameFr" defaultValue={product.nameFr} required className={inputClass} />
              </Field>
              <Field label="Adresse (slug)" hint="ex. tuiles-magnetiques-60-pieces">
                <input name="slugFr" defaultValue={product.slugFr} placeholder="générée automatiquement" className={inputClass} />
              </Field>
              <Field label="Accroche courte" hint="1–2 phrases, affichées sous le titre et dans les listes.">
                <textarea name="shortDescFr" defaultValue={product.shortDescFr} rows={2} className={inputClass} />
              </Field>
            </>
          }
          ar={
            <>
              <Field label="الاسم *">
                <input name="nameAr" defaultValue={product.nameAr} required dir="rtl" className={inputClass} />
              </Field>
              <Field label="Adresse arabe (slug)" hint="ex. بلاطات-مغناطيسية-60-قطعة">
                <input name="slugAr" defaultValue={product.slugAr} placeholder="générée automatiquement" dir="rtl" className={inputClass} />
              </Field>
              <Field label="وصف قصير">
                <textarea name="shortDescAr" defaultValue={product.shortDescAr} rows={2} dir="rtl" className={inputClass} />
              </Field>
            </>
          }
        />
      </Section>

      <Section
        title="Description détaillée"
        description="Comme dans WordPress : titres (Titre 2, 3), listes, gras, liens vers vos autres produits, images avec texte alternatif, vidéo YouTube. Visez au moins 200 mots par langue."
      >
        <div className="space-y-2">
          <p className="text-sm font-extrabold uppercase tracking-wider text-sky-600">Français</p>
          <RichTextEditor name="descFr" defaultValue={product.descFr} placeholder="Décrivez le produit : ce que l’enfant apprend, le contenu de la boîte, les conseils d’utilisation…" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-extrabold uppercase tracking-wider text-sun-700">العربية · Arabe</p>
          <RichTextEditor name="descAr" defaultValue={product.descAr} dir="rtl" placeholder="صِف المنتج: ما يتعلّمه الطفل، محتوى العلبة، نصائح الاستعمال…" />
        </div>
      </Section>

      <Section title="Photos">
        {/* Remount when the saved photos change so new uploads appear in the list. */}
        <ProductImagesField key={product.images.map((i) => i.id).join()} images={product.images} />
      </Section>

      <Section title="Prix, stock & caractéristiques">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Prix de vente (DT) *">
            <input name="price" defaultValue={product.price} required inputMode="decimal" placeholder="89,900" className={inputClass} />
          </Field>
          <Field label="Prix barré (DT)" hint="Optionnel : affiche une promotion.">
            <input name="compareAtPrice" defaultValue={product.compareAtPrice} inputMode="decimal" className={inputClass} />
          </Field>
          <Field label="Stock">
            <input name="stock" type="number" min={0} defaultValue={product.stock} className={inputClass} />
          </Field>
          <Field label="Référence (SKU)">
            <input name="sku" defaultValue={product.sku} className={inputClass} />
          </Field>
          <Field label="Âge minimum">
            <input name="ageMin" type="number" min={0} max={18} defaultValue={product.ageMin} className={inputClass} />
          </Field>
          <Field label="Âge maximum">
            <input name="ageMax" type="number" min={0} max={18} defaultValue={product.ageMax} className={inputClass} />
          </Field>
          <Field label="Nombre de pièces">
            <input name="pieces" type="number" min={0} defaultValue={product.pieces} className={inputClass} />
          </Field>
          <Field label="Catégorie">
            <select name="categoryId" defaultValue={product.categoryId} className={inputClass}>
              <option value="">— Aucune —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="size-5 accent-sky-500" /> En ligne (visible sur le site)
          </label>
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} className="size-5 accent-sun-500" /> Coup de cœur (mis en avant sur l’accueil)
          </label>
        </div>
      </Section>

      <Section
        title="Référencement (SEO)"
        description="Choisissez le mot-clé principal que les parents tapent sur Google, puis suivez les conseils jusqu’au vert. Titre et description sont optionnels : par défaut, Google affiche le nom et l’accroche."
      >
        <Bilingual
          fr={
            <>
              <CountedField label="Titre SEO" name="metaTitleFr" defaultValue={product.metaTitleFr} max={60} />
              <CountedField label="Méta-description" name="metaDescFr" defaultValue={product.metaDescFr} max={155} multiline />
              <SeoPreview formId={formId} lang="Fr" urlPrefix="/produit/" />
              <SeoAnalysis formId={formId} lang="Fr" fields={{ title: "nameFr", summary: "shortDescFr", content: "descFr" }} defaultKeyword={product.focusKeywordFr} minWords={200} />
            </>
          }
          ar={
            <>
              <CountedField label="عنوان SEO" name="metaTitleAr" defaultValue={product.metaTitleAr} max={60} dir="rtl" />
              <CountedField label="الوصف التعريفي" name="metaDescAr" defaultValue={product.metaDescAr} max={155} multiline dir="rtl" />
              <SeoPreview formId={formId} lang="Ar" urlPrefix="/produit/" />
              <SeoAnalysis formId={formId} lang="Ar" fields={{ title: "nameAr", summary: "shortDescAr", content: "descAr" }} defaultKeyword={product.focusKeywordAr} minWords={200} />
            </>
          }
        />
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-3xl bg-white/95 p-4 shadow-soft backdrop-blur">
        <SubmitButton pending={pending}>{product.id ? "Enregistrer les modifications" : "Créer le produit"}</SubmitButton>
        <div className="min-w-0 flex-1">
          <FormMessage state={state} />
        </div>
      </div>
    </form>
  );
}
