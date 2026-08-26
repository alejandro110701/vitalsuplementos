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
import { PRODUCTS, findProduct, worldLabel } from '../src/data/products.js';

const here = dirname(fileURLToPath(import.meta.url));
const { WOO_URL, WOO_KEY, WOO_SECRET } = process.env;
const DRY = process.argv.includes('--dry');

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

/** The product photo we ship, inlined so WooCommerce sideloads it. */
function heroDataUri(slug) {
  const buf = readFileSync(join(here, '..', 'public', 'shop', `${slug}.png`));
  return 'data:image/png;base64,' + buf.toString('base64');
}

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
    '<p><strong>Suplemento alimenticio. No es medicamento.</strong> El consumo de este producto es responsabilidad de quien lo recomienda y de quien lo usa. Este sitio no ofrece diagnóstico ni tratamiento.</p>'
  ].join('\n');
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
    short_description: `<p>${p.claim}</p>`,
    images: [{ src: heroDataUri(p.slug), name: p.n, alt: p.n }]
  };

  if (DRY) {
    console.log(`  ${p.slug.padEnd(18)} would set name="${p.n}" + description + 1 image`);
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
