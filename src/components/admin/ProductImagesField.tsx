"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { inputClass } from "./ui";

type Existing = { id: string; url: string; altFr: string; altAr: string };

/**
 * Product photos: reorder (first = main photo), edit alt texts (SEO), remove, and add new uploads.
 * Submits imageIds[] in display order with alt texts, plus newImages[] files.
 */
export function ProductImagesField({ images }: { images: Existing[] }) {
  const [items, setItems] = useState(images);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => () => newPreviews.forEach((u) => URL.revokeObjectURL(u)), [newPreviews]);

  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((img, i) => (
            <li key={img.id} className="rounded-2xl border-2 border-line bg-white p-3">
              <input type="hidden" name="imageIds" value={img.id} />
              <div className="relative aspect-square overflow-hidden rounded-xl bg-cloud">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="size-full object-cover" />
                {i === 0 && (
                  <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-sun-400 px-2.5 py-1 text-xs font-extrabold text-ink">
                    <Star className="size-3 fill-current" /> Principale
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-2">
                <input name={`alt_fr_${img.id}`} defaultValue={img.altFr} placeholder="Texte alternatif (FR)" className={inputClass} />
                <input name={`alt_ar_${img.id}`} defaultValue={img.altAr} placeholder="النص البديل (AR)" dir="rtl" className={inputClass} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-full p-2 hover:bg-cloud disabled:opacity-30" aria-label="Déplacer avant">
                    <ArrowLeft className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-full p-2 hover:bg-cloud disabled:opacity-30" aria-label="Déplacer après">
                    <ArrowRight className="size-4" />
                  </button>
                </div>
                <button type="button" onClick={() => setItems((prev) => prev.filter((x) => x.id !== img.id))} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold text-coral-600 hover:bg-coral-50">
                  <Trash2 className="size-4" /> Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 px-4 py-8 text-center hover:border-sky-400">
        <ImagePlus className="size-8 text-sky-500" />
        <span className="font-bold text-ink">Ajouter des photos</span>
        <span className="text-sm text-muted">Plusieurs fichiers possibles · JPG, PNG, WebP · 10 Mo max chacun</span>
        <input
          type="file"
          name="newImages"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="sr-only"
          onChange={(e) => setNewPreviews(Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)))}
        />
      </label>
      {newPreviews.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-ink-soft">Nouvelles photos (ajoutées à l’enregistrement) :</p>
          <div className="flex flex-wrap gap-2">
            {newPreviews.map((u) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={u} src={u} alt="" className="size-20 rounded-xl object-cover" />
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-muted">La première photo est l’image principale (boutique, Google, réseaux sociaux). Le texte alternatif décrit la photo pour Google Images et l’accessibilité ; laissé vide, le nom du produit est utilisé.</p>
    </div>
  );
}
