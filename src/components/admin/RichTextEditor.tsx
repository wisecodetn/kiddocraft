"use client";

import "quill/dist/quill.snow.css";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type Quill from "quill";

/**
 * WordPress-style visual editor (Quill 2) for long content: product descriptions, blog articles.
 * Submits clean semantic HTML through a hidden input named `name`; the server sanitizes it again.
 * SEO choices: headings start at H2 (the page title is the H1), every uploaded image asks for alt text,
 * and the hidden input fires `input` events so the SEO analysis updates live.
 */
export function RichTextEditor({
  name,
  defaultValue,
  dir = "ltr",
  placeholder,
  minHeight = 320,
}: {
  name: string;
  defaultValue: string;
  dir?: "ltr" | "rtl";
  placeholder?: string;
  minHeight?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const output = useRef<HTMLInputElement>(null);
  // Controlled: on a hidden input, defaultValue and value are the same attribute, so React re-renders
  // would otherwise put the original content back.
  const [html, setHtml] = useState(defaultValue);
  const quillRef = useRef<Quill | null>(null);
  const syncRef = useRef<() => void>(() => {});
  const pickImageRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0 });
  const [dialog, setDialog] = useState<null | { mode: "insert" | "edit"; url: string; alt: string; index: number }>(null);
  // The image being edited (a DOM node of the editor, so kept out of React state).
  const editedImage = useRef<HTMLImageElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    let disposed = false;
    (async () => {
      const { default: QuillCtor } = await import("quill");
      if (disposed || !host.current || !toolbar.current || quillRef.current) return;

      const quill = new QuillCtor(host.current, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: {
            container: toolbar.current,
            handlers: { image: () => pickImageRef.current() },
          },
          clipboard: { matchVisual: false },
          history: { delay: 800, maxStack: 200, userOnly: true },
        },
      });
      quillRef.current = quill;
      quill.root.setAttribute("dir", dir);
      quill.root.setAttribute("lang", dir === "rtl" ? "ar" : "fr");
      quill.root.style.minHeight = `${minHeight}px`;
      if (defaultValue) quill.clipboard.dangerouslyPasteHTML(defaultValue, "silent");
      quill.history.clear();

      const sync = () => {
        const text = quill.getText().trim();
        // Quill 2.0.3 writes every space as &nbsp; in semantic HTML; keep normal spaces.
        const html = text || quill.root.querySelector("img, iframe") ? quill.getSemanticHTML().replace(/&nbsp;/g, " ") : "";
        setHtml(html);
        setStats({ words: text ? text.split(/\s+/).length : 0, chars: text.length });
      };
      syncRef.current = sync;
      quill.on("text-change", sync);
      sync();

      // Click an image in the editor to edit its alt text.
      quill.root.addEventListener("click", (e) => {
        const img = e.target as HTMLElement;
        if (img.tagName !== "IMG") return;
        editedImage.current = img as HTMLImageElement;
        setDialog({ mode: "edit", url: (img as HTMLImageElement).src, alt: (img as HTMLImageElement).alt, index: 0 });
      });

      setReady(true);
    })();
    return () => {
      disposed = true;
    };
    // The editor is created once; later prop changes don't recreate it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Toolbar image button: choose a file, upload it, then ask for its alt text. */
  function pickImage() {
    const quill = quillRef.current;
    if (!quill) return;
    const index = quill.getSelection(true)?.index ?? quill.getLength();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/avif,image/gif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadError("");
      setUploading(true);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/admin/api/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error ?? "Échec de l'envoi");
        const guess = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
        setDialog({ mode: "insert", url: data.url, alt: guess, index });
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "Échec de l'envoi");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  useEffect(() => {
    pickImageRef.current = pickImage;
  });

  useEffect(() => {
    output.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [html]);

  function confirmImage() {
    const quill = quillRef.current;
    if (!quill || !dialog) return;
    const alt = dialog.alt.trim();
    if (dialog.mode === "insert") {
      quill.insertEmbed(dialog.index, "image", dialog.url, "user");
      const [leaf] = quill.getLeaf(dialog.index + 1);
      const img = leaf?.domNode as HTMLImageElement | undefined;
      if (img?.tagName === "IMG") img.alt = alt;
      quill.setSelection(dialog.index + 1, 0, "silent");
    } else if (editedImage.current) {
      editedImage.current.alt = alt;
    }
    quill.update("user");
    // An alt change alone doesn't fire text-change: resync the hidden field.
    syncRef.current();
    setDialog(null);
  }

  function removeImage() {
    const quill = quillRef.current;
    const img = editedImage.current;
    if (!quill || !img) return;
    const blot = (quill.constructor as typeof Quill).find(img);
    if (blot && !(blot instanceof (quill.constructor as typeof Quill))) quill.deleteText(quill.getIndex(blot as Parameters<Quill["getIndex"]>[0]), 1, "user");
    setDialog(null);
  }

  const wordsLabel = `${stats.words} mot${stats.words > 1 ? "s" : ""} · ${stats.chars} caractères · ~${Math.max(1, Math.round(stats.words / 200))} min de lecture`;

  return (
    <div className="kc-editor" dir="ltr">
      <div ref={toolbar} className="kc-editor-toolbar">
        <span className="ql-formats">
          <select className="ql-header" defaultValue="" title="Titre / paragraphe">
            <option value="2">Titre 2</option>
            <option value="3">Titre 3</option>
            <option value="4">Titre 4</option>
            <option value="">Paragraphe</option>
          </select>
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-bold" title="Gras (Ctrl+B)" />
          <button type="button" className="ql-italic" title="Italique (Ctrl+I)" />
          <button type="button" className="ql-underline" title="Souligné (Ctrl+U)" />
          <button type="button" className="ql-strike" title="Barré" />
        </span>
        <span className="ql-formats">
          <select className="ql-color" title="Couleur du texte" />
          <select className="ql-background" title="Surlignage" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-list" value="ordered" title="Liste numérotée" />
          <button type="button" className="ql-list" value="bullet" title="Liste à puces" />
          <button type="button" className="ql-indent" value="-1" title="Diminuer le retrait" />
          <button type="button" className="ql-indent" value="+1" title="Augmenter le retrait" />
        </span>
        <span className="ql-formats">
          <select className="ql-align" title="Alignement" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-blockquote" title="Citation" />
          <button type="button" className="ql-link" title="Lien (Ctrl+K)" />
          <button type="button" className="ql-image" title="Image (avec texte alternatif)" />
          <button type="button" className="ql-video" title="Vidéo YouTube" />
        </span>
        <span className="ql-formats">
          <button type="button" className="ql-clean" title="Effacer la mise en forme" />
        </span>
        {uploading && (
          <span className="ms-auto inline-flex items-center gap-1.5 px-2 text-xs font-bold text-sky-600">
            <Loader2 className="size-3.5 animate-spin" /> Envoi de l&apos;image…
          </span>
        )}
      </div>
      <div ref={host} dir={dir} className="kc-editor-body" style={{ minHeight }} />
      {!ready && <div className="h-0 -translate-y-full px-4 pb-4 text-sm text-muted">Chargement de l&apos;éditeur…</div>}
      <div className="kc-editor-footer">
        <span>{wordsLabel}</span>
        {uploadError && <span className="font-bold text-coral-600">{uploadError}</span>}
      </div>
      <input ref={output} type="hidden" name={name} value={html} readOnly />

      {dialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-label="Image">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <ImagePlus className="size-5 text-sky-500" /> {dialog.mode === "insert" ? "Insérer l’image" : "Modifier l’image"}
              </h3>
              <button type="button" onClick={() => setDialog(null)} className="rounded-full p-1.5 hover:bg-cloud" aria-label="Fermer">
                <X className="size-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dialog.url} alt="" className="mt-4 max-h-48 w-full rounded-2xl bg-cloud object-contain" />
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-bold text-ink-soft">Texte alternatif (SEO) *</span>
              <input
                autoFocus
                dir={dir}
                value={dialog.alt}
                onChange={(e) => setDialog({ ...dialog, alt: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (dialog.alt.trim()) confirmImage();
                  }
                }}
                placeholder="Ex. : enfant construisant une tour en tuiles magnétiques"
                className="w-full rounded-xl border-2 border-line px-3.5 py-2.5 outline-none focus:border-sky-400"
              />
              <span className="mt-1 block text-xs text-muted">Décrivez ce que montre l’image, avec votre mot-clé si c’est naturel. Utilisé par Google Images et les lecteurs d’écran.</span>
            </label>
            <div className="mt-5 flex items-center justify-between gap-3">
              {dialog.mode === "edit" ? (
                <button type="button" onClick={removeImage} className="rounded-full px-3 py-2 text-sm font-bold text-coral-600 hover:bg-coral-50">
                  Supprimer l’image
                </button>
              ) : (
                <span />
              )}
              <button type="button" disabled={!dialog.alt.trim()} onClick={confirmImage} className="btn btn-sky btn-sm">
                {dialog.mode === "insert" ? "Insérer" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
