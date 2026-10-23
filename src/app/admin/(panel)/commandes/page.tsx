import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { ORDER_STATUS } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice, orderRef } from "@/lib/format";

export const metadata: Metadata = { title: "Commandes" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/commandes">) {
  const sp = await searchParams;
  const status = typeof sp.statut === "string" && sp.statut in ORDER_STATUS ? (sp.statut as OrderStatus) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (q) {
    const ref = Number(q.replace(/^KC-/i, "")) - 1000;
    where.OR = [
      { customerName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\s/g, "") } },
      { city: { contains: q, mode: "insensitive" } },
      ...(Number.isInteger(ref) && ref > 0 ? [{ number: ref }] : []),
    ];
  }

  const [orders, counts] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { _count: { select: { items: true } } } }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((n, c) => n + c._count, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Commandes</h1>
          <p className="mt-1 text-muted">Paiement à la livraison : appelez le client pour confirmer, puis suivez l’expédition.</p>
        </div>
        <form className="relative w-full sm:w-72">
          {status && <input type="hidden" name="statut" value={status} />}
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Nom, téléphone, KC-1001…" className="w-full rounded-full border-2 border-line bg-white py-2.5 pe-4 ps-10 outline-none focus:border-sky-400" />
        </form>
      </header>

      <nav className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Filtrer par statut">
        <StatusTab href="/admin/commandes" active={!status} label="Toutes" count={total} />
        {Object.entries(ORDER_STATUS).map(([key, s]) => (
          <StatusTab key={key} href={`/admin/commandes?statut=${key}`} active={status === key} label={s.label} count={countOf(key)} />
        ))}
      </nav>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        {orders.length === 0 ? (
          <p className="p-10 text-center text-muted">Aucune commande trouvée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-start text-sm">
              <thead className="bg-cloud text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 text-start">Réf.</th>
                  <th className="px-5 py-3 text-start">Client</th>
                  <th className="px-5 py-3 text-start">Ville</th>
                  <th className="px-5 py-3 text-start">Articles</th>
                  <th className="px-5 py-3 text-start">Total</th>
                  <th className="px-5 py-3 text-start">Statut</th>
                  <th className="px-5 py-3 text-start">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-cloud/60">
                    <td className="px-5 py-3">
                      <Link href={`/admin/commandes/${o.id}`} className="font-display font-semibold text-sky-600 hover:underline">
                        {orderRef(o.number)}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold">{o.customerName}</p>
                      <p className="text-muted">{o.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">
                      {o.city}, {o.governorate}
                    </td>
                    <td className="px-5 py-3">{o._count.items}</td>
                    <td className="px-5 py-3 font-display font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${ORDER_STATUS[o.status].className}`}>{ORDER_STATUS[o.status].label}</span>
                    </td>
                    <td className="px-5 py-3 text-muted">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusTab({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link href={href} className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold ${active ? "border-sky-500 bg-sky-500 text-white" : "border-line bg-white text-ink-soft hover:border-sky-200"}`}>
      {label}
      <span className={`rounded-full px-2 text-xs ${active ? "bg-white/25" : "bg-cloud"}`}>{count}</span>
    </Link>
  );
}
