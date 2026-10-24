import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, Package, ShoppingCart, Wallet } from "lucide-react";
import { ORDER_STATUS } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice, orderRef, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [pending, today, month, products, lowStock, recent] = await Promise.all([
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { createdAt: { gte: dayStart }, status: { not: "CANCELLED" } } }),
    db.order.aggregate({ where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } }, _sum: { total: true }, _count: true }),
    db.product.count({ where: { isActive: true } }),
    db.product.findMany({ where: { isActive: true, stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 6, select: { id: true, nameFr: true, stock: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const stats = [
    { label: "Commandes en attente", value: String(pending), icon: Clock, color: "bg-sun-100 text-sun-700", href: "/admin/commandes?statut=PENDING" },
    { label: "Commandes aujourd'hui", value: String(today), icon: ShoppingCart, color: "bg-sky-100 text-sky-700", href: "/admin/commandes" },
    { label: "Chiffre d'affaires du mois", value: formatPrice(toNumber(month._sum.total)), icon: Wallet, color: "bg-mint-100 text-mint-600", hint: `${month._count} commande(s)` },
    { label: "Produits en ligne", value: String(products), icon: Package, color: "bg-coral-100 text-coral-600", href: "/admin/produits" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Bonjour 👋</h1>
        <p className="mt-1 text-muted">Voici l’activité de votre boutique.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, href, hint }) => {
          const body = (
            <>
              <span className={`grid size-12 place-items-center rounded-2xl ${color}`}>
                <Icon className="size-6" />
              </span>
              <p className="mt-4 font-display text-3xl font-semibold">{value}</p>
              <p className="text-sm font-bold text-muted">{label}</p>
              {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
            </>
          );
          return href ? (
            <Link key={label} href={href} className="rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-0.5">
              {body}
            </Link>
          ) : (
            <div key={label} className="rounded-3xl bg-white p-5 shadow-card">
              {body}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="min-w-0 rounded-3xl bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Dernières commandes</h2>
            <Link href="/admin/commandes" className="inline-flex items-center gap-1 text-sm font-bold text-sky-600 hover:underline">
              Tout voir <ArrowRight className="size-4" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-cloud p-6 text-center text-muted">Aucune commande pour le moment. Elles apparaîtront ici dès le premier achat.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/commandes/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl px-2 py-3 hover:bg-cloud">
                    <span className="font-display font-semibold">{orderRef(o.number)}</span>
                    <span className="min-w-0 flex-1 truncate font-bold text-ink-soft">
                      {o.customerName} · {o.governorate}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${ORDER_STATUS[o.status].className}`}>{ORDER_STATUS[o.status].label}</span>
                    <span className="w-24 text-end font-display font-semibold">{formatPrice(o.total)}</span>
                    <span className="w-full text-xs text-muted sm:w-auto">{formatDateTime(o.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="min-w-0 rounded-3xl bg-white p-5 shadow-card sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <AlertTriangle className="size-5 text-sun-500" /> Stock faible
          </h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-muted">Tous les produits ont un stock suffisant.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/produits/${p.id}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-cloud">
                    <span className="truncate font-bold">{p.nameFr}</span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${p.stock === 0 ? "bg-coral-100 text-coral-600" : "bg-sun-100 text-sun-700"}`}>
                      {p.stock === 0 ? "Épuisé" : `${p.stock} restant(s)`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
