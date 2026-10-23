"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/admin";
import { clearSession, setSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const user = email ? await db.adminUser.findUnique({ where: { email } }) : null;
  // Same message (and roughly the same work) whether the email exists or not.
  const valid = user ? await verifyPassword(password, user.passwordHash) : await verifyPassword(password, "scrypt$AAAAAAAAAAAAAAAAAAAAAA$AAAA");
  if (!user || !valid) return { error: "E-mail ou mot de passe incorrect." };
  await setSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/admin/login");
}
