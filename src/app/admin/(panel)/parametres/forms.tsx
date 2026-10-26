"use client";

import { Bilingual, Field, FormMessage, Section, SubmitButton, inputClass, useAdminForm } from "@/components/admin/ui";
import { changePassword, saveSettings } from "./actions";

type Values = Record<
  "shippingFee" | "freeShippingFrom" | "phone" | "whatsapp" | "email" | "instagram" | "facebook" | "tiktok" | "announcementFr" | "announcementAr" | "metaPixelId" | "gaMeasurementId",
  string
>;

export function SettingsForm({ values: v }: { values: Values }) {
  const { state, pending, onSubmit } = useAdminForm(saveSettings, undefined);
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section title="Livraison" description="Paiement à la livraison partout en Tunisie.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Frais de livraison (DT)">
            <input name="shippingFee" defaultValue={v.shippingFee} inputMode="decimal" className={inputClass} />
          </Field>
          <Field label="Livraison offerte à partir de (DT)" hint="0 = jamais offerte">
            <input name="freeShippingFrom" defaultValue={v.freeShippingFrom} inputMode="decimal" className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Bandeau d'annonce" description="Le message affiché tout en haut du site. Vide = « Livraison offerte dès … » automatiquement.">
        <Bilingual
          fr={
            <Field label="Message">
              <input name="announcementFr" defaultValue={v.announcementFr} placeholder="Ex. -10 % sur les tuiles magnétiques ce week-end !" className={inputClass} />
            </Field>
          }
          ar={
            <Field label="الرسالة">
              <input name="announcementAr" defaultValue={v.announcementAr} dir="rtl" className={inputClass} />
            </Field>
          }
        />
      </Section>

      <Section title="Contact & réseaux sociaux" description="Affichés dans le pied de page et utilisés par Google (données structurées).">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone">
            <input name="phone" defaultValue={v.phone} placeholder="+216 20 000 000" className={inputClass} />
          </Field>
          <Field label="WhatsApp" hint="Numéro au format international, ex. 21620000000">
            <input name="whatsapp" defaultValue={v.whatsapp} className={inputClass} />
          </Field>
          <Field label="E-mail">
            <input name="email" type="email" defaultValue={v.email} className={inputClass} />
          </Field>
          <Field label="Instagram (lien)">
            <input name="instagram" defaultValue={v.instagram} placeholder="https://instagram.com/…" className={inputClass} />
          </Field>
          <Field label="Facebook (lien)">
            <input name="facebook" defaultValue={v.facebook} placeholder="https://facebook.com/…" className={inputClass} />
          </Field>
          <Field label="TikTok (lien)">
            <input name="tiktok" defaultValue={v.tiktok} placeholder="https://tiktok.com/@…" className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section
        title="Suivi & statistiques"
        description="Collez l’ID (ou tout le code fourni par Meta / Google : l’ID est extrait automatiquement). Laissez vide pour désactiver. Les visites de l’administration ne sont jamais comptées."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Meta Pixel (Facebook / Instagram)"
            hint="Gestionnaire d’événements Meta → Sources de données → votre pixel → ID (15–16 chiffres). Événements envoyés : PageView, ViewContent, AddToCart, InitiateCheckout, Purchase."
          >
            <input name="metaPixelId" defaultValue={v.metaPixelId} placeholder="123456789012345" className={inputClass} />
          </Field>
          <Field
            label="Google Analytics 4"
            hint="Google Analytics → Admin → Flux de données → Web → ID de mesure (G-…). Événements e-commerce : view_item, add_to_cart, begin_checkout, purchase."
          >
            <input name="gaMeasurementId" defaultValue={v.gaMeasurementId} placeholder="G-XXXXXXXXXX" className={inputClass} />
          </Field>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pending={pending}>Enregistrer les paramètres</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const { state, pending, onSubmit } = useAdminForm(changePassword, undefined);
  return (
    <form onSubmit={onSubmit}>
      <Section title="Mot de passe administrateur">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mot de passe actuel">
            <input name="current" type="password" required autoComplete="current-password" className={inputClass} />
          </Field>
          <Field label="Nouveau mot de passe" hint="10 caractères minimum">
            <input name="next" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton pending={pending}>Changer le mot de passe</SubmitButton>
          <FormMessage state={state} />
        </div>
      </Section>
    </form>
  );
}
