import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

/** Uploaded images live outside /public so they're served even after a production build. */
export const UPLOAD_DIR = join(process.cwd(), "uploads");
export const UPLOAD_URL_PREFIX = "/uploads/";

const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Stores an uploaded image as WebP (max 1600px wide, metadata stripped) and returns its public URL.
 * Returns null for empty file inputs.
 */
export async function saveImage(file: File | null | undefined, prefix = "img"): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (!ACCEPTED.has(file.type)) throw new Error(`Format non supporté : ${file.type || "inconnu"} (JPG, PNG, WebP, AVIF ou GIF)`);
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (10 Mo maximum)");

  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${prefix}-${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.webp`;
  await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(join(UPLOAD_DIR, name));
  return `${UPLOAD_URL_PREFIX}${name}`;
}

/** Deletes a previously uploaded file (seed images in /public are left alone). */
export async function deleteImage(url: string | null | undefined) {
  if (!url?.startsWith(UPLOAD_URL_PREFIX)) return;
  const name = url.slice(UPLOAD_URL_PREFIX.length);
  if (!/^[\w.-]+$/.test(name)) return;
  await unlink(join(UPLOAD_DIR, name)).catch(() => {});
}
