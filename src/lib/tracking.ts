// Tracking IDs typed in the admin settings. Admins often paste a whole snippet or a URL:
// these pull the ID out of whatever was pasted ("" = empty, null = nothing valid found).

/** Meta (Facebook/Instagram) Pixel ID: 15–16 digits, e.g. from fbq('init', '123…') or ?id=123… */
export function parseMetaPixelId(input: string): string | null {
  const s = input.trim();
  if (!s) return "";
  const fromInit = s.match(/fbq\(\s*['"]init['"]\s*,\s*['"](\d{10,20})['"]/);
  if (fromInit) return fromInit[1];
  const fromUrl = s.match(/[?&]id=(\d{10,20})/);
  if (fromUrl) return fromUrl[1];
  const digits = s.match(/\b(\d{10,20})\b/);
  return digits ? digits[1] : null;
}

/** Google Analytics 4 measurement ID, e.g. G-AB12CD34EF (from the ID itself, a gtag snippet or a URL). */
export function parseGaMeasurementId(input: string): string | null {
  const s = input.trim();
  if (!s) return "";
  const id = s.toUpperCase().match(/\bG-[A-Z0-9]{6,12}\b/);
  return id ? id[0] : null;
}
