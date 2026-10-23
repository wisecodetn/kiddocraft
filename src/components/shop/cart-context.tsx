"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  nameFr: string;
  nameAr: string;
  slugFr: string;
  slugAr: string;
  price: number;
  image: string | null;
  stock: number;
  qty: number;
};

export type ShippingRules = { shippingFee: number; freeShippingFrom: number };

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  rules: ShippingRules;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "qty">, qty?: number, opts?: { silent?: boolean }) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "kiddocraft-cart-v1";

const clampQty = (qty: number, stock: number) => Math.max(1, Math.min(qty, Math.max(stock, 1), 99));

export function CartProvider({ children, rules }: { children: ReactNode; rules: ShippingRules }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);

  // Restore after hydration so server and first client render match.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from storage
      if (Array.isArray(saved)) setItems(saved.filter((i) => i && typeof i.id === "string" && i.qty > 0));
    } catch {
      /* storage unavailable or corrupted: start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* private mode: cart lives for this tab only */
    }
  }, [items, ready]);

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setItems(JSON.parse(e.newValue ?? "[]"));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback<CartContextValue["add"]>((item, qty = 1, opts) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? { ...i, ...item, qty: clampQty(i.qty + qty, item.stock) } : i));
      return [...prev, { ...item, qty: clampQty(qty, item.stock) }];
    });
    if (!opts?.silent) setOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: clampQty(qty, i.stock) } : i)));
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = subtotal <= 0 ? 0 : rules.freeShippingFrom > 0 && subtotal >= rules.freeShippingFrom ? 0 : rules.shippingFee;
    return {
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      rules,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, ready, rules, isOpen, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
