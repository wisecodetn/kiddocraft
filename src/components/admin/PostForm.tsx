"use client";

import { savePost } from "@/app/admin/(panel)/blog/actions";
import { ImageField } from "./ImageField";
import { RichTextEditor } from "./RichTextEditor";
import { SeoAnalysis } from "./SeoAnalysis";
import { SeoPreview } from "./SeoPreview";
import { Bilingual, CountedField, Field, FormMessage, Section, SubmitButton, inputClass, useAdminForm } from "./ui";

export type PostFormValues = {
  id?: string;
  titleFr: string;
  titleAr: string;
  slugFr: string;
  slugAr: string;
  excerptFr: string;
  excerptAr: string;
  contentFr: string;
  contentAr: string;
  focusKeywordFr: string;
  focusKeywordAr: string;
  metaTitleFr: string;
  metaTitleAr: string;
  metaDescFr: string;
  metaDescAr: string;
  coverImage: string | null;
  author: string;
  isPublished: boolean;
  publishedAt: string;
};

export function PostForm({ post, created }: { post: PostFormValues; created?: boolean }) {
  const { state, pending, onSubmit } = useAdminForm(savePost.bind(null, post.id ?? null), created ? { ok: "Article créé ✔" } : undefined);
  const formId = "post-form";

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-6">
      <Section title="Article" description="Le titre est le H1 de la page ; le chapeau résume l’article dans la liste et sous le titre.">
        <Bilingual
          fr={
            <>
              <Field label="Titre *">
                <input name="titleFr" defaultValue={post.titleFr} required className={inputClass} />
              </Field>
              <Field label="Adresse (slug)">
                <input name="slugFr" defaultValue={post.slugFr} placeholder="générée automatiquement" className={inputClass} />
              </Field>
              <Field label="Chapeau (résumé)" hint="Affiché dans la liste des articles et sous le titre.">
                <textarea name="excerptFr" defaultValue={post.excerptFr} rows={3} className={inputClass} />
              </Field>
            </>
          }
          ar={
            <>
              <Field label="العنوان *">
                <input name="titleAr" defaultValue={post.titleAr} required dir="rtl" className={inputClass} />
              </Field>
              <Field label="Adresse arabe (slug)">
                <input name="slugAr" defaultValue={post.slugAr} placeholder="générée automatiquement" dir="rtl" className={inputClass} />
              </Field>
              <Field label="الملخّص">
                <textarea name="excerptAr" defaultValue={post.excerptAr} rows={3} dir="rtl" className={inputClass} />
              </Field>
            </>
          }
        />
      </Section>

      <Section
        title="Contenu"
        description="Conseils SEO : répondez aux questions que se posent les parents, structurez avec des Titres 2 et 3, ajoutez des liens vers vos produits et catégories, et des images avec texte alternatif. Visez 600 mots ou plus."
      >
        <div className="space-y-2">
          <p className="text-sm font-extrabold uppercase tracking-wider text-sky-600">Français</p>
          <RichTextEditor name="contentFr" defaultValue={post.contentFr} minHeight={480} placeholder="Rédigez votre article…" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-extrabold uppercase tracking-wider text-sun-700">العربية · Arabe</p>
          <RichTextEditor name="contentAr" defaultValue={post.contentAr} dir="rtl" minHeight={480} placeholder="اكتب مقالك…" />
        </div>
      </Section>

      <Section title="Publication">
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <ImageField key={post.coverImage ?? "none"} name="cover" current={post.coverImage} label="Image de couverture (1200×630 idéal)" aspect="aspect-[1200/630]" />
          <div className="space-y-4">
            <label className="flex items-center gap-2 font-bold">
              <input type="checkbox" name="isPublished" defaultChecked={post.isPublished} className="size-5 accent-sky-500" /> Publié (visible sur le site)
            </label>
            <Field label="Date de publication" hint="Laissez vide pour utiliser la date du jour à la publication.">
              <input type="date" name="publishedAt" defaultValue={post.publishedAt} className={`${inputClass} max-w-48`} />
            </Field>
            <Field label="Auteur">
              <input name="author" defaultValue={post.author} className={`${inputClass} max-w-xs`} />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Référencement (SEO)">
        <Bilingual
          fr={
            <>
              <CountedField label="Titre SEO" name="metaTitleFr" defaultValue={post.metaTitleFr} max={60} />
              <CountedField label="Méta-description" name="metaDescFr" defaultValue={post.metaDescFr} max={155} multiline />
              <SeoPreview formId={formId} lang="Fr" urlPrefix="/blog/" />
              <SeoAnalysis formId={formId} lang="Fr" fields={{ title: "titleFr", summary: "excerptFr", content: "contentFr" }} defaultKeyword={post.focusKeywordFr} minWords={600} />
            </>
          }
          ar={
            <>
              <CountedField label="عنوان SEO" name="metaTitleAr" defaultValue={post.metaTitleAr} max={60} dir="rtl" />
              <CountedField label="الوصف التعريفي" name="metaDescAr" defaultValue={post.metaDescAr} max={155} multiline dir="rtl" />
              <SeoPreview formId={formId} lang="Ar" urlPrefix="/blog/" />
              <SeoAnalysis formId={formId} lang="Ar" fields={{ title: "titleAr", summary: "excerptAr", content: "contentAr" }} defaultKeyword={post.focusKeywordAr} minWords={600} />
            </>
          }
        />
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-3xl bg-white/95 p-4 shadow-soft backdrop-blur">
        <SubmitButton pending={pending}>{post.id ? "Enregistrer" : "Créer l'article"}</SubmitButton>
        <div className="min-w-0 flex-1">
          <FormMessage state={state} />
        </div>
      </div>
    </form>
  );
}
