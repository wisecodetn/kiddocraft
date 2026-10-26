"use client";

import { useEffect, useRef } from "react";
import { trackPurchase, trackViewItem } from "@/lib/analytics";

type Item = { id: string; name: string; price: number; qty: number };

/** Product page: ViewContent / view_item. */
export function TrackViewItem({ item }: { item: Item }) {
  useEffect(() => {
    // Trackers load after hydration: give them a moment.
    const timer = setTimeout(() => trackViewItem(item), 1500);
    return () => clearTimeout(timer);
  }, [item]);
  return null;
}

/** Order confirmation: Purchase / purchase, once per order. */
export function TrackPurchase({ order }: { order: { reference: string; total: number; shipping: number; items: Item[] } }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const timer = setTimeout(() => trackPurchase(order), 1500);
    return () => clearTimeout(timer);
  }, [order]);
  return null;
}
