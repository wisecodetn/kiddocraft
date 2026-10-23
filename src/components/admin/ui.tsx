"use client";

import { Loader2, Trash2 } from "lucide-react";
import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

// Small building blocks for the admin forms.

export function Field({ label, hint, children, className = "" }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-bold text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border-2 border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-muted/60 focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

/** Input with a live character counter (titles ≈ 60, descriptions ≈ 155 for Google). */
export function CountedField({
  label,
  name,
  defaultValue = "",
  max,
  multiline = false,
  dir,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  max: number;
  multiline?: boolean;
  dir?: "rtl" | "ltr";
  placeholder?: string;
}) {
  const [len, setLen] = useState(defaultValue.length);
  const color = len === 0 ? "text-muted" : len > max ? "text-coral-600" : "text-mint-600";
  return (
    <Field label={label} hint={<span className={color}>{len} / {max} caractères recommandés</span>}>
      {multiline ? (
        <textarea name={name} defaultValue={defaultValue} rows={2} dir={dir} placeholder={placeholder} onChange={(e) => setLen(e.target.value.length)} className={inputClass} />
      ) : (
        <input name={name} defaultValue={defaultValue} dir={dir} placeholder={placeholder} onChange={(e) => setLen(e.target.value.length)} className={inputClass} />
      )}
    </Field>
  );
}

/**
 * Admin form submission without React's automatic form reset, so a validation error never wipes
 * what the admin typed. Use: <form onSubmit={form.onSubmit}> … <SubmitButton pending={form.pending}>.
 */
type FormState = { error?: string; ok?: string } | undefined;

export function useAdminForm(action: (prev: FormState, fd: FormData) => Promise<FormState>, initial: FormState) {
  const [state, dispatch, pending] = useActionState(action, initial);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return { state, pending, onSubmit };
}

export function SubmitButton({ children, className = "", pending: pendingProp }: { children: ReactNode; className?: string; pending?: boolean }) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" disabled={pending} className={`btn btn-sky ${className}`}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (state?.error) return <p role="alert" className="rounded-xl bg-coral-50 px-4 py-3 font-bold text-coral-600">{state.error}</p>;
  if (state?.ok) return <p role="status" className="rounded-xl bg-mint-50 px-4 py-3 font-bold text-mint-600">{state.ok}</p>;
  return null;
}

/** Delete button that asks for confirmation before submitting its server action. */
export function DeleteButton({ action, label = "Supprimer", confirmText }: { action: () => Promise<void>; label?: string; confirmText: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <DeleteSubmit label={label} />
    </form>
  );
}

function DeleteSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-coral-600 hover:bg-coral-50 disabled:opacity-50">
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      {label}
    </button>
  );
}

/** Two columns: French (primary) and Arabic (right-to-left). */
export function Bilingual({ fr, ar }: { fr: ReactNode; ar: ReactNode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <fieldset className="space-y-4 rounded-2xl border-2 border-sky-100 bg-sky-50/40 p-4 sm:p-5">
        <legend className="rounded-full bg-sky-500 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">Français · principal</legend>
        {fr}
      </fieldset>
      <fieldset className="space-y-4 rounded-2xl border-2 border-sun-200 bg-sun-50/50 p-4 sm:p-5">
        <legend className="rounded-full bg-sun-400 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ink">العربية · Arabe</legend>
        {ar}
      </fieldset>
    </div>
  );
}

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-card sm:p-7">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
