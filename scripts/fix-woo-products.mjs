/**
 * Push the curated catalogue onto the live WooCommerce products.
 *
 * The shop was seeded from the supplier, so its products carry supplier titles,
 * supplier copy and — for all 16 — a zero-byte image file. Prices and stock stay
 * exactly as the shop has them: this script never touches money.
 *
 * Credentials are read from the environment and are never written to the repo:
 *
 *   WOO_URL=https://vitalsuplementos.com.mx \
 *   WOO_KEY=ck_... WOO_SECRET=cs_... \
 *   node scripts/fix-woo-products.mjs [--dry]
 *
 * The key must have Read/Write permission. A read-only key fails with
 * `woocommerce_rest_authentication_error`.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS, worldLabel } from '../src/data/products.js';

const here = dirname(fileURLToPath(import.meta.url));
const { WOO_URL, WOO_KEY, WOO_SECRET } = process.env;
const DRY = process.argv.includes('--dry');
// WooCommerce sideloads images from an http(s) URL only — it rejects data URIs
// with "No URL Provided" — so images are uploaded separately to the media
// library and attached by id via --image-map.
const NO_IMAGES = process.argv.includes('--no-images');
const MAP_ARG = process.argv.find((a) => a.startsWith('--image-map='));
const IMAGE_MAP = MAP_ARG ? JSON.parse(readFileSync(MAP_ARG.split('=')[1], 'utf8')) : {};

if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
  console.error('Set WOO_URL, WOO_KEY and WOO_SECRET in the environment.');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString('base64');

async function woo(path, init = {}) {
  const res = await fetch(`${WOO_URL}/wp-json/wc/v3${path}`, {
    ...init,
    headers: { Authorization: auth, 'Content-Type': 'application/json', ...(init.headers || {}) }
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${body.code || ''} ${body.message || ''}`);
  return body;
}

/*
 * NOTE: do not put a <style> tag in a product description. The REST product
 * endpoint strips the tag but keeps its text, so the whole stylesheet renders
 * as visible copy on the product page. Pages accept style blocks; products do
 * not. The design is carried by the page-level blocks instead.
 */

/**
 * The supplier descriptions make claims this brand refuses. This rebuilds each
 * one from the curated catalogue: what it is, what it contains, how it is used,
 * and nothing about what it will do for you.
 */
function description(p) {
  return [
    `<p>${p.claim}</p>`,
    '<ul>',
    ...p.bullets.map((b) => `<li>${b}</li>`),
    '</ul>',
    '<h3>Modo de uso</h3>',
    `<p>${p.uso}</p>`,
    '<h3>Presentación</h3>',
    `<p>${p.spec} · ${worldLabel(p.w)}</p>`,
    legend(p)
  ].join('\n');
}

/**
 * Half the catalogue is cosmetic. The Mexican supplement legend is required for
 * what it covers and simply wrong for a 75 ml night mask — it has no "consumo".
 */
function legend(p) {
  return p.w === 'skin'
    ? '<p><strong>Producto cosmético de uso externo. No es medicamento.</strong> Evita el contacto con los ojos y suspende su uso si aparece irritación. Este sitio no ofrece diagnóstico ni tratamiento.</p>'
    : '<p><strong>Suplemento alimenticio. No es medicamento.</strong> El consumo de este producto es responsabilidad de quien lo recomienda y de quien lo usa. Este sitio no ofrece diagnóstico ni tratamiento.</p>';
}

let changed = 0;
let failed = 0;

for (const p of PRODUCTS) {
  if (!p.wooId) {
    console.log(`  ${p.slug.padEnd(18)} no live product — skipped`);
    continue;
  }

  const payload = {
    name: p.n,
    description: description(p),
    short_description: `<p>${p.claim}</p>`
  };
  const mediaId = IMAGE_MAP[p.slug];
  if (!NO_IMAGES && mediaId) payload.images = [{ id: mediaId, name: p.n, alt: p.n }];

  if (DRY) {
    console.log(`  ${p.slug.padEnd(18)} would set name="${p.n}"${payload.images ? ' + image ' + payload.images[0].id : ''}`);
    changed++;
    continue;
  }

  try {
    const out = await woo(`/products/${p.wooId}`, { method: 'PUT', body: JSON.stringify(payload) });
    const img = out.images?.[0];
    console.log(`  ${p.slug.padEnd(18)} ok · "${out.name}" · image ${img ? img.id : 'NONE'}`);
    changed++;
  } catch (err) {
    console.log(`  ${p.slug.padEnd(18)} FAILED · ${err.message}`);
    failed++;
  }
}

console.log(`\n${changed} products ${DRY ? 'would be updated' : 'updated'}, ${failed} failed`);
console.log('Prices and stock were not touched — the shop remains the source of truth.');
