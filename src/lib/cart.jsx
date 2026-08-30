import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { findProduct, shippingFor } from '../data/products.js';
import { activeBundles, bundleDiscount, bundleMembers } from '../data/bundles.js';
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

  /**
   * Add every product in a kit at one piece each.
   *
   * The kit is not a line of its own: the cart holds the two real products, and
   * the discount is worked out from what is in the cart. That way a shopper who
   * later removes one of the two simply stops qualifying, and the total falls
   * back to list — instead of keeping a discount for a kit that is no longer
   * there.
   */
  const addBundle = useCallback((bundle) => {
    setCart((prev) => {
      const next = { ...prev };
      for (const p of bundleMembers(bundle)) {
        const key = p.slug + '|1';
        if (!next[key]) next[key] = { slug: p.slug, pack: 1, n: 1 };
      }
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

  // Kits are priced by what the cart contains, not by a flag set when the kit
  // was added — see src/data/bundles.js for why.
  const kits = useMemo(() => activeBundles(lines), [lines]);
  const discount = useMemo(() => bundleDiscount(lines), [lines]);
  const coupons = useMemo(() => kits.map((b) => b.coupon), [kits]);
  // Whatever the shop says, not a number of our own invention. Delivery now
  // depends on the basket, and WooCommerce measures the threshold after the
  // kit discount — so this must be measured the same way or the cart total and
  // the checkout total disagree.
  const shipping = lines.length ? shippingFor(subtotal - discount) : 0;

  const value = useMemo(
    () => ({
      lines,
      count,
      subtotal,
      discount,
      kits,
      coupons,
      shipping,
      total: subtotal - discount + (shipping || 0),
      add,
      addBundle,
      bump,
      drop,
      clear
    }),
    [lines, count, subtotal, discount, kits, coupons, shipping, add, addBundle, bump, drop, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
