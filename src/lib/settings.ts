import "server-only";
import { cache } from "react";
import { db } from "./db";
import { toNumber } from "./format";

/** Store settings (single row), created with defaults on first read. */
export const getSettings = cache(async () => {
  const s = await db.settings.upsert({ where: { id: "site" }, update: {}, create: { id: "site" } });
  return { ...s, shippingFee: toNumber(s.shippingFee), freeShippingFrom: toNumber(s.freeShippingFrom) };
});

export type StoreSettings = Awaited<ReturnType<typeof getSettings>>;

export function shippingFor(subtotal: number, s: Pick<StoreSettings, "shippingFee" | "freeShippingFrom">): number {
  if (subtotal <= 0) return 0;
  return s.freeShippingFrom > 0 && subtotal >= s.freeShippingFrom ? 0 : s.shippingFee;
}
