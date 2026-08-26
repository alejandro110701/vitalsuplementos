import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SHIPPING_COST } from '../config.js';
import { findProduct } from '../data/products.js';
import { unitPrice } from './format.js';

const STORAGE_KEY = 'vs.cart.v1';

const CartContext = createContext(null);

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function CartProvider({ children }) {
  // Cart shape: { "<slug>|<pack>": { slug, pack, n } } — `n` counts packs, not pieces.
  const [cart, setCart] = useState(readStoredCart);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* private mode / storage disabled — the cart just won't survive a reload */
    }
  }, [cart]);

  const add = useCallback((slug, pack, qty) => {
    setCart((prev) => {
      const key = slug + '|' + pack;
      const next = { ...prev };
      next[key] = { slug, pack, n: (next[key] ? next[key].n : 0) + qty };
      return next;
    });
  }, []);

  const bump = useCallback((key, d) => {
    setCart((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      const n = next[key].n + d;
      if (n <= 0) delete next[key];
      else next[key] = { ...next[key], n };
      return next;
    });
  }, []);

  const drop = useCallback((key) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clear = useCallback(() => setCart({}), []);

  const lines = useMemo(
    () =>
      Object.keys(cart)
        .map((key) => {
          const c = cart[key];
          const p = findProduct(c.slug);
          // a stored cart can outlive a product leaving the catalogue
          if (!p) return null;
          const unit = unitPrice(p, c.pack);
          return { key, p, pack: c.pack, n: c.n, units: c.pack * c.n, unit, total: unit * c.pack * c.n };
        })
        .filter(Boolean),
    [cart]
  );

  const count = useMemo(() => lines.reduce((s, l) => s + l.units, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.total, 0), [lines]);
  const shipping = lines.length ? SHIPPING_COST : 0;

  const value = useMemo(
    () => ({ lines, count, subtotal, shipping, total: subtotal + shipping, add, bump, drop, clear, order, setOrder }),
    [lines, count, subtotal, shipping, add, bump, drop, clear, order]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
