import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "../login/actions";
import { AdminNav } from "./AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const pending = await db.order.count({ where: { status: "PENDING" } });

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-e">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/brand/logo.png" alt="KiddoCraft" width={520} height={363} className="h-11 w-auto" priority />
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-extrabold text-sky-700">Admin</span>
          </Link>
          <form action={logout} className="lg:hidden">
            <button type="submit" className="grid size-10 place-items-center rounded-full bg-cloud hover:bg-coral-50 hover:text-coral-600" aria-label="Déconnexion">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
        <AdminNav pendingOrders={pending} />
        <div className="hidden border-t border-line p-4 lg:mt-auto lg:block">
          <p className="truncate text-sm font-bold">{admin.name}</p>
          <p className="truncate text-xs text-muted">{admin.email}</p>
          <div className="mt-3 flex gap-2">
            <a href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-full bg-cloud px-3 py-1.5 text-xs font-bold hover:bg-sky-50">
              <ExternalLink className="size-3.5" /> Voir le site
            </a>
            <form action={logout}>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-cloud px-3 py-1.5 text-xs font-bold hover:bg-coral-50 hover:text-coral-600">
                <LogOut className="size-3.5" /> Déconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
