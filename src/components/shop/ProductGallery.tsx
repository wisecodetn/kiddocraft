"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ProductGallery({ images, badge }: { images: { url: string; alt: string }[]; badge?: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const t = useTranslations("product");
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-24">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-sky-50 shadow-card">
        {current && <Image key={current.url} src={current.url} alt={current.alt} fill preload sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover animate-slide-in" />}
        {badge && <div className="absolute start-4 top-4 flex flex-col items-start gap-2">{badge}</div>}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto" role="tablist">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={t("image", { index: i + 1 })}
              onClick={() => setActive(i)}
              className={`relative size-20 shrink-0 overflow-hidden rounded-2xl border-4 transition sm:size-24 ${i === active ? "border-sun-400" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
