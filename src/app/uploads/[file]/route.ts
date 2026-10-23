import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { UPLOAD_DIR } from "@/lib/uploads";

const TYPES: Record<string, string> = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", avif: "image/avif", gif: "image/gif" };

// Serves images uploaded from the admin. File names are random and never reused, so they cache forever.
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[file]">) {
  const { file } = await params;
  if (!/^[\w.-]+$/.test(file)) return new Response("Not found", { status: 404 });
  const type = TYPES[file.split(".").pop()?.toLowerCase() ?? ""];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(join(UPLOAD_DIR, file));
    return new Response(body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
