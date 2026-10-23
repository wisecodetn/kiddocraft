"use server";

import { money, revalidateStore, str, type FormState } from "@/lib/admin";
import { hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const shippingFee = money(fd, "shippingFee");
  const freeShippingFrom = money(fd, "freeShippingFrom");
  if (shippingFee == null || freeShippingFrom == null) return { error: "Frais de livraison et seuil de gratuité sont obligatoires (0 pour désactiver la gratuité)." };
  const url = (key: string) => {
    const v = str(fd, key);
    return v && !/^https?:\/\//.test(v) ? `https://${v}` : v;
  };
  const data = {
    shippingFee,
    freeShippingFrom,
    phone: str(fd, "phone"),
    whatsapp: str(fd, "whatsapp").replace(/\D/g, ""),
    email: str(fd, "email"),
    instagram: url("instagram"),
    facebook: url("facebook"),
    tiktok: url("tiktok"),
    announcementFr: str(fd, "announcementFr"),
    announcementAr: str(fd, "announcementAr"),
  };
  await db.settings.upsert({ where: { id: "site" }, update: data, create: { id: "site", ...data } });
  revalidateStore();
  return { ok: "Paramètres enregistrés ✔" };
}

export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  if (next.length < 10) return { error: "Le nouveau mot de passe doit contenir au moins 10 caractères." };
  const user = await db.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await verifyPassword(current, user.passwordHash))) return { error: "Mot de passe actuel incorrect." };
  await db.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: "Mot de passe modifié ✔" };
}
