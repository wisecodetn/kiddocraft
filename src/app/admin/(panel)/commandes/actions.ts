"use server";

import type { OrderStatus } from "@/generated/prisma/client";
import { ORDER_STATUS, revalidateStore, type FormState } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Changes an order's status. Cancelling puts the items back in stock;
 * re-opening a cancelled order takes them out again (if still available).
 */
export async function updateOrderStatus(orderId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const next = String(fd.get("status") ?? "") as OrderStatus;
  if (!(next in ORDER_STATUS)) return { error: "Statut invalide." };

  try {
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
      if (order.status === next) return;
      const wasCancelled = order.status === "CANCELLED";
      const nowCancelled = next === "CANCELLED";

      for (const item of order.items) {
        if (!item.productId) continue;
        if (nowCancelled && !wasCancelled) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        } else if (wasCancelled && !nowCancelled) {
          const taken = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
          if (taken.count === 0) throw new Error(`Stock insuffisant pour « ${item.name} ».`);
        }
      }
      await tx.order.update({ where: { id: orderId }, data: { status: next } });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "La mise à jour a échoué." };
  }

  revalidateStore();
  return { ok: `Statut mis à jour : ${ORDER_STATUS[next].label}.` };
}
