import { PACK_DISCOUNT } from '../config.js';

/**
 * How to write the delivery line. Three genuinely different answers: the shop
 * delivers free, the shop charges a known amount, or the amount depends on
 * something only the checkout knows. Saying "Gratis" for the third would be a
 * lie, and that is exactly the mistake this replaces.
 */
export function shippingLabel(shipping, money) {
  if (shipping === 0) return 'Gratis';
  if (typeof shipping === 'number') return money(shipping);
  return 'Se calcula al pagar';
}

export function money(n) {
  return '$' + Math.round(n).toLocaleString('es-MX');
}

/** Accent- and case-insensitive normalisation, for catalogue search. */
export function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** True only while the shop actually offers a multi-pack price. */
export const packTiersEnabled = PACK_DISCOUNT > 0;

/** The three pack tiers. Buying more drops the per-piece price. */
export function packs() {
  const d = PACK_DISCOUNT;
  return [
    { k: 1, label: '1 pieza', off: 0, note: 'Precio de lista' },
    { k: 2, label: '2 piezas', off: d, note: 'Para dos meses' },
    { k: 3, label: '3 piezas', off: d ? d + 6 : 0, note: 'El mejor precio' }
  ];
}

/** Per-piece price for a product at a given pack tier. */
export function unitPrice(p, pack) {
  const tier = packs().find((x) => x.k === pack) || packs()[0];
  return Math.round(p.price * (1 - tier.off / 100));
}
