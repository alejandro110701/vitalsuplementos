import GALLERY from '../data/gallery.json';
import { sku, worldLabel } from '../data/products.js';
import { asset } from './assetBase.js';

/**
 * Beats past the fifth stop earning their scroll, so the tail becomes a static
 * contact sheet instead. Caps the section at roughly four screens for every
 * product, however many photographs it happens to have.
 */
export const CAP = 5;

/** gallery.json stores root-relative paths; rebase them onto the deploy base. */
const rebase = (im) => ({
  ...im,
  src: asset(im.src),
  srcSmall: asset(im.srcSmall)
});

export function galleryFor(product) {
  const ok = (GALLERY[product.slug] || []).filter((im) => im.ok !== false).map(rebase);
  return { beats: ok.slice(0, CAP), sheet: ok.slice(CAP), n: Math.min(ok.length, CAP) };
}

/**
 * Each rung states what the product IS, CONTAINS, or how it SHIPS — never what
 * it does. A product with fewer photographs uses the first n rungs, so
 * truncation always drops the least load-bearing layer rather than the claim.
 */
const LADDER = [
  {
    id: 'que-es',
    title: 'Qué es',
    body: (p) => p.claim,
    rows: (p) => [['Presentación', p.spec]]
  },
  {
    id: 'contiene',
    title: 'Qué contiene',
    body: (p) => p.bullets[0],
    rows: (p) => [['Categoría', worldLabel(p.w)]]
  },
  {
    id: 'uso',
    // Half the catalogue is skincare. A serum, a gel or an eye patch is
    // applied, not swallowed, so this rung picks its verb from the world.
    title: (p) => (p.w === 'skin' ? 'Cómo se aplica' : 'Cómo se toma'),
    body: (p) => p.uso,
    rows: (p) => [['Presentación', p.spec]]
  },
  {
    id: 'etiqueta',
    title: 'Qué dice la etiqueta',
    body: (p) => p.bullets[1] ?? p.bullets[0],
    rows: (p) => [['SKU', sku(p)]]
  },
  {
    id: 'entrega',
    title: 'Cómo llega',
    body: () => 'Envío $200 a todo México. Pagas en efectivo cuando el repartidor te lo entrega, en 2 a 5 días.',
    rows: () => [['Envío', '$200'], ['Entrega', '2–5 días']]
  }
];

export function beatCopy(product, image, index) {
  const rung = (image.beat && LADDER.find((r) => r.id === image.beat)) || LADDER[index] || LADDER[0];
  return {
    id: rung.id,
    eyebrow: image.eyebrow || null,
    title: image.title || (typeof rung.title === 'function' ? rung.title(product) : rung.title),
    body: image.body || rung.body(product),
    rows: rung.rows(product),
    disclose: image.kind !== 'PACKSHOT' && image.kind !== 'GENERATED'
  };
}

export function altFor(product, image, index, n) {
  if (image.alt) return image.alt;
  if (image.kind === 'PACKSHOT') return `${product.n} — fotografía de producto ${index + 1} de ${n}`;
  if (image.kind === 'GENERATED') return `${product.n} — imagen de referencia del formato, ${index + 1} de ${n}`;
  return `Material gráfico del fabricante para ${product.n}. El texto que aparece en la imagen es del fabricante y no está transcrito.`;
}
