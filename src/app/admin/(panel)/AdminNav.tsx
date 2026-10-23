"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderTree, LayoutDashboard, Package, Settings, ShoppingCart } from "lucide-react";

const items = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: FolderTree },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export function AdminNav({ pendingOrders }: { pendingOrders: number }) {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Administration">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition ${active ? "bg-sky-500 text-white shadow-[0_3px_0_var(--color-sky-700)]" : "text-ink-soft hover:bg-cloud"}`}
          >
            <Icon className="size-5" />
            {label}
            {href === "/admin/commandes" && pendingOrders > 0 && (
              <span className={`ms-auto rounded-full px-2 py-0.5 text-xs font-extrabold ${active ? "bg-white text-sky-700" : "bg-sun-400 text-ink"}`}>{pendingOrders}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
