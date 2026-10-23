"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Single image (category picture, blog cover): shows the current image, lets the admin
 * replace it with an upload or remove it. Submits `${name}File` and `${name}Remove`.
 */
export function ImageField({ name, current, label, aspect = "aspect-square" }: { name: string; current?: string | null; label: string; aspect?: string }) {
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [removed, setRemoved] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  useEffect(() => () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <div>
      <span className="mb-1.5 block text-sm font-bold text-ink-soft">{label}</span>
      <div className={`relative w-full max-w-xs overflow-hidden rounded-2xl border-2 border-dashed border-line bg-cloud ${aspect}`}>
        {preview && !removed ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setRemoved(true);
                setPreview(null);
                setInputKey((k) => k + 1);
              }}
              className="absolute end-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-coral-600 shadow hover:bg-white"
              aria-label="Retirer l'image"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <span className="absolute inset-0 grid place-items-center text-muted">
            <span className="flex flex-col items-center gap-2 text-sm font-bold">
              <ImagePlus className="size-8" /> Choisir une image
            </span>
          </span>
        )}
        <input
          key={inputKey}
          type="file"
          name={`${name}File`}
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className={`absolute inset-0 cursor-pointer opacity-0 ${preview && !removed ? "pointer-events-none" : ""}`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setRemoved(false);
            setPreview(URL.createObjectURL(file));
          }}
        />
      </div>
      <input type="hidden" name={`${name}Remove`} value={removed ? "true" : "false"} />
      <p className="mt-1.5 text-xs text-muted">JPG, PNG ou WebP · converti automatiquement en WebP optimisé</p>
    </div>
  );
}
