import { getAdmin } from "@/lib/auth";
import { saveImage } from "@/lib/uploads";

// Images inserted in the rich text editor: stored as optimized WebP, returns the public URL.
export async function POST(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const form = await request.formData();
    const url = await saveImage(form.get("file") as File | null, "contenu");
    if (!url) return Response.json({ error: "Aucune image reçue" }, { status: 400 });
    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Échec de l'envoi" }, { status: 400 });
  }
}
