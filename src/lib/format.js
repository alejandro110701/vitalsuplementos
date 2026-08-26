import { PACK_DISCOUNT } from '../config.js';

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

/** The three pack tiers. Buying more drops the per-piece price. */
export function packs() {
  const d = PACK_DISCOUNT;
  return [
    { k: 1, label: '1 pieza', off: 0, note: 'Precio de lista' },
    { k: 2, label: '2 piezas', off: d, note: 'Para dos meses' },
    { k: 3, label: '3 piezas', off: d + 6, note: 'El mejor precio' }
  ];
}

/** Per-piece price for a product at a given pack tier. */
export function unitPrice(p, pack) {
  const tier = packs().find((x) => x.k === pack) || packs()[0];
  return Math.round(p.price * (1 - tier.off / 100));
}
