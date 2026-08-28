/**
 * Pull the live catalogue from the WooCommerce Store API and bake it into
 * src/data/woo.js.
 *
 * The Store API is public and needs no credentials, but WordPress.com does not
 * send `access-control-allow-origin`, so a browser cannot read it cross-origin.
 * Syncing at build time sidesteps that entirely: no key in the bundle, no
 * runtime dependency on the shop being up, and the storefront can be hosted
 * anywhere. Re-run whenever prices or stock change.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const STORE = process.env.WOO_STORE || 'https://vitalsuplementos.com.mx';
const here = dirname(fileURLToPath(import.meta.url));

// The live products were imported from the supplier, so their SKUs and names
// are the supplier's. This maps them onto our own catalogue slugs.
const BY_ID = {
  103: 'parches-ojeras',
  98: 'serum-4en1',
  91: 'creatina',
  86: 'mentas-cafeina',
  81: 'bloom-mango',
  75: 'joint-support',
  71: 'glutation-gomas',
  67: 'magnesio-180',
  58: 'tocobo-barra',
  53: 'nad-mens',
  46: 'medicube-colageno',
  41: 'crema-chillab',
  35: 'serum-anua',
  30: 'gel-salicilico',
  21: 'holy-basil',
  17: 'magnesio-cup'
};

const res = await fetch(`${STORE}/wp-json/wc/store/v1/products?per_page=100`, {
  headers: { Accept: 'application/json' }
});
if (!res.ok) throw new Error(`Store API ${res.status} ${res.statusText}`);
const live = await res.json();

const money = (minor, unit) => Math.round(Number(minor) / 10 ** unit);

const out = {};
const unmapped = [];
for (const p of live) {
  const slug = BY_ID[p.id];
  if (!slug) {
    unmapped.push(`${p.id} ${p.name}`);
    continue;
  }
  const u = p.prices.currency_minor_unit;
  const regular = money(p.prices.regular_price, u);
  const price = money(p.prices.price, u);
  out[slug] = {
    id: p.id,
    sku: p.sku || null,
    name: p.name,
    permalink: p.permalink,
    price,
    // only record a strike-through when the shop is actually running a sale
    was: p.on_sale && regular > price ? regular : 0,
    inStock: p.is_in_stock !== false,
    currency: p.prices.currency_code
  };
}

/**
 * Ask the shop what it actually charges for delivery.
 *
 * Shipping used to be a constant in src/config.js, and it drifted: the app
 * quoted a flat 149 while WooCommerce had no shipping zones and charged
 * nothing, so the total the shopper saw was never the total they were asked
 * for. Reading it from the shop, like prices, removes the whole class of bug.
 *
 * The Store API needs a session cookie and a rotating nonce even for a
 * throwaway cart, so this drives one by hand and empties it afterwards.
 * Probes two basket sizes because a shop may offer free delivery above a
 * threshold — if the two disagree, the threshold sits between them.
 */
async function probeShipping(sampleProductId) {
  const api = `${STORE}/wp-json/wc/store/v1`;
  let cookie = '';
  let nonce = '';

  const call = async (path, init = {}) => {
    const res = await fetch(`${api}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...(nonce ? { Nonce: nonce } : {}),
        ...(init.headers || {})
      }
    });
    const set = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    if (set.length) cookie = set.map((c) => c.split(';')[0]).join('; ');
    nonce = res.headers.get('Nonce') || nonce;
    return res;
  };

  const read = async (qty) => {
    await call('/cart/items', { method: 'DELETE' });
    const added = await call('/cart/add-item', {
      method: 'POST',
      body: JSON.stringify({ id: sampleProductId, quantity: qty })
    });
    if (!added.ok) return null;
    const cart = await (await call('/cart')).json();
    const unit = cart.totals.currency_minor_unit;
    return {
      subtotal: Math.round(Number(cart.totals.total_items) / 10 ** unit),
      shipping: Math.round(Number(cart.totals.total_shipping || 0) / 10 ** unit),
      needsShipping: cart.needs_shipping === true,
      rates: (cart.shipping_rates || []).flatMap((p) => (p.shipping_rates || []).map((r) => r.name))
    };
  };

  try {
    await call('/cart');
    const small = await read(1);
    const large = await read(6);
    await call('/cart/items', { method: 'DELETE' });
    if (!small || !large) return null;
    return {
      probedAt: [small, large],
      // What the storefront should quote. Equal at both basket sizes means a
      // single rule; different means the shop has a threshold and the app must
      // not pretend one number covers both.
      flat: small.shipping === large.shipping ? small.shipping : null,
      free: small.shipping === 0 && large.shipping === 0,
      methods: [...new Set([...small.rates, ...large.rates])]
    };
  } catch {
    return null;
  }
}

const missing = Object.values(BY_ID).filter((s) => !out[s]);

/*
 * Refuse to bake a catalogue that lost products.
 *
 * A shop that is *down* throws above, and the deploy workflow's `|| echo`
 * keeps the committed snapshot. A shop that answers 200 with a short list does
 * not: it exits zero, the guard never fires, and the build happily ships a
 * storefront where every absent product is `listed: false` — that is, an empty
 * shelf. The Store API returns exactly that while products are unpublished,
 * while the catalogue is private, and whenever a plugin breaks the endpoint
 * into an empty array.
 *
 * Missing products are the one failure the storefront cannot show honestly, so
 * this exits non-zero and leaves the committed file alone. A stale price is
 * recoverable; paying for clicks that land on "no encontrado" is not.
 *
 * Set WOO_ALLOW_PARTIAL=1 when a product is retired on purpose, then commit
 * the shortened snapshot deliberately.
 */
if (missing.length && process.env.WOO_ALLOW_PARTIAL !== '1') {
  console.error(
    `refusing to write: ${Object.keys(out).length}/${Object.keys(BY_ID).length} products came back from ${STORE}.\n` +
      `  absent: ${missing.join(', ')}\n` +
      '  keeping the committed catalogue. Re-run with WOO_ALLOW_PARTIAL=1 if this is deliberate.'
  );
  process.exit(1);
}

const sampleId = Number(Object.keys(BY_ID)[0]);
const shipping = await probeShipping(sampleId);

const payload = {
  store: STORE,
  syncedAt: new Date().toISOString(),
  shipping,
  products: out
};
writeFileSync(
  join(here, '..', 'src', 'data', 'woo.js'),
  '// GENERATED by scripts/sync-woo.mjs — do not edit. Re-run `npm run sync:woo`.\n' +
    'export default ' + JSON.stringify(payload, null, 1) + ';\n'
);

console.log(`${Object.keys(out).length}/${live.length} products mapped from ${STORE}`);
console.log(shipping
  ? `  delivery: ${shipping.free ? 'free at both basket sizes' : 'charged ' + JSON.stringify(shipping.probedAt.map((p) => p.shipping))}` + `${shipping.methods.length ? ' via ' + shipping.methods.join(', ') : ' — no shipping method configured in the shop'}`
  : '  delivery: could not probe the shop');
if (unmapped.length) console.log('  unmapped in shop:', unmapped.join(', '));
if (missing.length) console.log('  expected but absent:', missing.join(', '));
