import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { PasswordForm, SettingsForm } from "./forms";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Paramètres</h1>
        <p className="mt-1 text-muted">Livraison, contact et messages de la boutique.</p>
      </header>
      <SettingsForm
        values={{
          shippingFee: String(s.shippingFee),
          freeShippingFrom: String(s.freeShippingFrom),
          phone: s.phone,
          whatsapp: s.whatsapp,
          email: s.email,
          instagram: s.instagram,
          facebook: s.facebook,
          tiktok: s.tiktok,
          announcementFr: s.announcementFr,
          announcementAr: s.announcementAr,
          metaPixelId: s.metaPixelId,
          gaMeasurementId: s.gaMeasurementId,
        }}
      />
      <PasswordForm />
    </div>
  );
}
