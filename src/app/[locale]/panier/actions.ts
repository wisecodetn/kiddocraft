"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isLocale } from "@/i18n/locales";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/format";
import { GOVERNORATES } from "@/lib/governorates";
import { getSettings, shippingFor } from "@/lib/settings";

const orderSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), qty: z.number().int().min(1).max(99) })).min(1).max(50),
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  email: z.union([z.literal(""), z.email().max(160)]).optional(),
  governorate: z.string().refine((g) => GOVERNORATES.some((x) => x.fr === g)),
  city: z.string().trim().min(2).max(120),
  address: z.string().trim().min(4).max(400),
  note: z.string().trim().max(1000).optional(),
  locale: z.string(),
  // Honeypot: real visitors never see or fill it.
  website: z.string().max(0).optional(),
});

export type OrderInput = z.input<typeof orderSchema>;
export type OrderResult = { ok: true; id: string } | { ok: false; error: "required" | "phone" | "stock" | "generic"; product?: string };

/** Tunisian mobile/landline: 8 digits, optionally prefixed with +216 / 00216. */
function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00216")) digits = digits.slice(5);
  else if (digits.startsWith("216") && digits.length === 11) digits = digits.slice(3);
  return /^[2-9]\d{7}$/.test(digits) ? digits : null;
}

class StockError extends Error {
  constructor(public product: string) {
    super("stock");
  }
}

/**
 * Places a cash-on-delivery order. Prices, names and shipping come from the database, never from the browser.
 * Stock is reserved atomically (a product can't be oversold by two simultaneous orders).
 */
export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const phoneIssue = parsed.error.issues.some((i) => i.path[0] === "phone");
    return { ok: false, error: phoneIssue ? "phone" : "required" };
  }
  const data = parsed.data;
  if (data.website) return { ok: false, error: "generic" };
  const phone = normalizePhone(data.phone);
  if (!phone) return { ok: false, error: "phone" };
  const locale = isLocale(data.locale) ? data.locale : "fr";

  // Merge duplicate lines.
  const qtyById = new Map<string, number>();
  for (const item of data.items) qtyById.set(item.id, Math.min(99, (qtyById.get(item.id) ?? 0) + item.qty));

  try {
    const settings = await getSettings();
    const order = await db.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: [...qtyById.keys()] }, isActive: true } });
      if (products.length !== qtyById.size) {
        const missing = [...qtyById.keys()].find((id) => !products.some((p) => p.id === id));
        throw new StockError(missing ?? "");
      }

      for (const p of products) {
        const qty = qtyById.get(p.id)!;
        const reserved = await tx.product.updateMany({ where: { id: p.id, stock: { gte: qty } }, data: { stock: { decrement: qty } } });
        if (reserved.count === 0) throw new StockError(locale === "ar" && p.nameAr ? p.nameAr : p.nameFr);
      }

      const lines = products.map((p) => ({
        productId: p.id,
        name: p.nameFr,
        unitPrice: toNumber(p.price),
        quantity: qtyById.get(p.id)!,
      }));
      const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
      const shippingFee = shippingFor(subtotal, settings);

      return tx.order.create({
        data: {
          customerName: data.customerName,
          phone,
          email: data.email || null,
          governorate: data.governorate,
          city: data.city,
          address: data.address,
          note: data.note || null,
          locale,
          subtotal,
          shippingFee,
          total: subtotal + shippingFee,
          items: { create: lines },
        },
        select: { id: true },
      });
    });

    // Stock changed: refresh storefront pages.
    revalidatePath("/[locale]", "layout");
    return { ok: true, id: order.id };
  } catch (error) {
    if (error instanceof StockError) return { ok: false, error: "stock", product: error.product };
    console.error("placeOrder failed", error);
    return { ok: false, error: "generic" };
  }
}
