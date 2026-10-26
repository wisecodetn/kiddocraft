// Browser-side e-commerce events, sent to whichever trackers are loaded (Meta Pixel, Google Analytics 4).
// Every function is a no-op when a tracker isn't configured in the admin settings.

type Item = { id: string; name: string; price: number; qty: number };

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const CURRENCY = "TND";
const value = (items: Item[]) => Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 1000) / 1000;
const gaItems = (items: Item[]) => items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.qty }));

function send(pixelEvent: string, pixelData: Record<string, unknown>, gaEvent: string, gaData: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", pixelEvent, pixelData, eventId ? { eventID: eventId } : undefined);
    window.gtag?.("event", gaEvent, gaData);
  } catch {
    /* a blocked or broken tracker must never break the shop */
  }
}

export function trackViewItem(item: Item) {
  send(
    "ViewContent",
    { content_ids: [item.id], content_name: item.name, content_type: "product", value: item.price, currency: CURRENCY },
    "view_item",
    { currency: CURRENCY, value: item.price, items: gaItems([item]) },
  );
}

export function trackAddToCart(item: Item) {
  send(
    "AddToCart",
    { content_ids: [item.id], content_name: item.name, content_type: "product", value: value([item]), currency: CURRENCY },
    "add_to_cart",
    { currency: CURRENCY, value: value([item]), items: gaItems([item]) },
  );
}

export function trackBeginCheckout(items: Item[]) {
  send(
    "InitiateCheckout",
    { content_ids: items.map((i) => i.id), num_items: items.reduce((n, i) => n + i.qty, 0), value: value(items), currency: CURRENCY },
    "begin_checkout",
    { currency: CURRENCY, value: value(items), items: gaItems(items) },
  );
}

/** Purchase, once per order (the confirmation page can be reloaded). */
export function trackPurchase(order: { reference: string; total: number; shipping: number; items: Item[] }) {
  const key = `kc-tracked-${order.reference}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    /* storage unavailable: send anyway */
  }
  send(
    "Purchase",
    { content_ids: order.items.map((i) => i.id), content_type: "product", num_items: order.items.reduce((n, i) => n + i.qty, 0), value: order.total, currency: CURRENCY },
    "purchase",
    { transaction_id: order.reference, currency: CURRENCY, value: order.total, shipping: order.shipping, items: gaItems(order.items) },
    order.reference,
  );
}
