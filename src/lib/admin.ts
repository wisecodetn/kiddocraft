import "server-only";
import { revalidatePath } from "next/cache";
import { slugify } from "./slug";

/** Result of an admin form action, shown by the form (useActionState). */
export type FormState = { error?: string; ok?: string } | undefined;

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
export const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

export function int(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (v === "") return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

/** Accepts "89,900" or "89.9". */
export function money(fd: FormData, key: string): number | null {
  const v = str(fd, key).replace(/\s/g, "").replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 1000) / 1000 : null;
}

export const files = (fd: FormData, key: string) => fd.getAll(key).filter((f): f is File => f instanceof File && f.size > 0);

/**
 * Slug from the typed value, or from the name when left empty.
 * `taken` checks uniqueness; generated slugs get -2, -3… while a typed slug that's taken is an error.
 */
export async function resolveSlug(typed: string, name: string, taken: (slug: string) => Promise<boolean>): Promise<{ slug: string } | { error: string }> {
  const base = slugify(typed || name);
  if (!base) return { error: "Impossible de générer l'adresse (slug) : renseignez le nom." };
  if (typed) return (await taken(base)) ? { error: `L'adresse « ${base} » est déjà utilisée.` } : { slug: base };
  let slug = base;
  for (let i = 2; await taken(slug); i++) slug = `${base}-${i}`;
  return { slug };
}

/** Storefront pages, the sitemap and the admin show catalogue data: refresh them after any change. */
export function revalidateStore() {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin", "layout");
}

export const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-sun-100 text-sun-700" },
  CONFIRMED: { label: "Confirmée", className: "bg-sky-100 text-sky-700" },
  SHIPPED: { label: "Expédiée", className: "bg-violet-100 text-violet-700" },
  DELIVERED: { label: "Livrée", className: "bg-mint-100 text-mint-600" },
  CANCELLED: { label: "Annulée", className: "bg-coral-100 text-coral-600" },
};
