import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Phone, StickyNote } from "lucide-react";
import { ORDER_STATUS } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice, orderRef, toNumber } from "@/lib/format";
import { StatusForm } from "./StatusForm";

export const metadata: Metadata = { title: "Commande" };

export default async function OrderPage({ params }: PageProps<"/admin/commandes/[id]">) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { id: true, images: { take: 1, orderBy: { sortOrder: "asc" } } } } } } },
  });
  if (!order) notFound();
  const waPhone = `216${order.phone}`;

  return (
    <div className="space-y-6">
      <Link href="/admin/commandes" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Commandes
      </Link>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold">Commande {orderRef(order.number)}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${ORDER_STATUS[order.status].className}`}>{ORDER_STATUS[order.status].label}</span>
        <span className="text-sm text-muted">
          {formatDateTime(order.createdAt)} · site en {order.locale === "ar" ? "arabe" : "français"}
        </span>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="min-w-0 rounded-3xl bg-white p-5 shadow-card sm:p-6">
          <h2 className="font-display text-xl font-semibold">Articles</h2>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((item) => {
              const img = item.product?.images[0]?.url;
              return (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-cloud">{img && <img src={img} alt="" className="size-full object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    {item.product ? (
                      <Link href={`/admin/produits/${item.product.id}`} className="font-bold hover:text-sky-600">
                        {item.name}
                      </Link>
                    ) : (
                      <p className="font-bold">{item.name}</p>
                    )}
                    <p className="text-sm text-muted">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-display font-semibold">{formatPrice(toNumber(item.unitPrice) * item.quantity)}</p>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4">
            <div className="flex justify-between text-ink-soft">
              <dt>Sous-total</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-soft">
              <dt>Livraison</dt>
              <dd>{toNumber(order.shippingFee) === 0 ? "Offerte" : formatPrice(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between font-display text-2xl font-semibold">
              <dt>Total à encaisser</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="min-w-0 space-y-6">
          <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
            <h2 className="font-display text-xl font-semibold">Statut</h2>
            <StatusForm orderId={order.id} status={order.status} />
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
            <h2 className="font-display text-xl font-semibold">Client</h2>
            <p className="mt-3 text-lg font-bold">{order.customerName}</p>
            {order.email && <p className="text-sm text-muted">{order.email}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:+216${order.phone}`} className="btn btn-sky btn-sm">
                <Phone className="size-4" /> {order.phone}
              </a>
              <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener" className="btn btn-ghost btn-sm">
                <MessageCircle className="size-4 text-mint-500" /> WhatsApp
              </a>
            </div>
            <p className="mt-5 flex gap-2 text-ink-soft">
              <MapPin className="mt-0.5 size-4 shrink-0 text-coral-500" />
              <span>
                {order.address}
                <br />
                {order.city}, {order.governorate}
              </span>
            </p>
            {order.note && (
              <p className="mt-4 flex gap-2 rounded-2xl bg-sun-50 p-3 text-ink-soft">
                <StickyNote className="mt-0.5 size-4 shrink-0 text-sun-600" />
                {order.note}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
