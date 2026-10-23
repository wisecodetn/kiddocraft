import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="sky-bg grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-soft">
        <Image src="/brand/logo.png" alt="KiddoCraft" width={520} height={363} priority className="mx-auto h-20 w-auto" />
        <h1 className="mt-6 text-center font-display text-2xl font-semibold">Espace administration</h1>
        <p className="mt-1 text-center text-sm text-muted">Connectez-vous pour gérer la boutique.</p>
        <LoginForm />
      </div>
    </div>
  );
}
