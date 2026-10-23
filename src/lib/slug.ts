/**
 * URL slug from any text. Keeps Arabic letters (Google indexes Arabic URLs well)
 * and strips French accents: "Tuiles magnétiques" → "tuiles-magnetiques".
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}
