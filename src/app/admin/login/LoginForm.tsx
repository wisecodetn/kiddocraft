"use client";

import { Field, FormMessage, SubmitButton, inputClass, useAdminForm } from "@/components/admin/ui";
import { login } from "./actions";

export function LoginForm() {
  const { state, pending, onSubmit } = useAdminForm(login, undefined);
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Field label="E-mail">
        <input name="email" type="email" required autoComplete="username" className={inputClass} />
      </Field>
      <Field label="Mot de passe">
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="w-full">Se connecter</SubmitButton>
    </form>
  );
}
