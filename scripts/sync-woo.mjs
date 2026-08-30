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
import { FREE_SHIPPING_FROM } from '../src/config.js';

const STORE = process.env.WOO_STORE || 'https://vitalsuplementos.com.mx';
const here = dirname(fileURLToPath(import.meta.url));

// The live products were imported from the supplier, so their SKUs and names
// are the supplier's. This maps them onto our own catalogue slugs.
const BY_ID = {
  // added 30 Aug 2026 — the profitable half of the Dropi sweep
  202: 'peach-inositol',
  196: 'goli-ashwagandha',
  189: 'beast-bites-creatina',
  184: 'megared-krill',
  178: 'neocell-colageno',
  172: 'medicube-zero-pore',
  167: 'anua-azelaico',
  160: 'anua-pdrn-mist',
  156: 'cosrx-snail-96',

  // the original import
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

/*
 * Deliberately unpublished in WooCommerce on 30 Aug 2026, kept in the map so
 * their absence from a sync is a fact rather than a mystery:
 *   17  magnesio-cup    91  creatina        103 parches-ojeras
 *   30  gel-salicilico  58  tocobo-barra
 * Each lost money on every order once the freight per placed order is counted.
 * They stay in src/data/products.js as unlisted, so an old link still resolves.
 */

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
    /* A ladder, not two points. The shop now has a free-delivery threshold, and
       two probes can only say "somewhere between these"; a ladder brackets it
       tightly enough for the storefront to quote a number it will honour. */
    const ladder = [];
    for (const qty of [1, 2, 3, 4, 6]) {
      const r = await read(qty);
      if (r) ladder.push(r);
    }
    await call('/cart/items', { method: 'DELETE' });
    if (!ladder.length) return null;

    const charged = ladder.filter((r) => r.shipping > 0);
    const free = ladder.filter((r) => r.shipping === 0);
    const smallest = ladder[0];

    return {
      probedAt: ladder,
      // What a basket below the threshold pays. Every charged basket agreeing
      // is what makes it safe to quote one number.
      flat: charged.length && charged.every((r) => r.shipping === charged[0].shipping) ? charged[0].shipping : null,
      free: ladder.every((r) => r.shipping === 0),
      // The bracket the threshold provably sits inside: dearer than the most
      // expensive basket that still paid, no dearer than the cheapest that did
      // not. The storefront checks its configured number against this.
      chargedUpTo: charged.length ? Math.max(...charged.map((r) => r.subtotal)) : null,
      freeFrom: free.length ? Math.min(...free.map((r) => r.subtotal)) : null,
      smallestBasket: smallest.subtotal,
      methods: [...new Set(ladder.flatMap((r) => r.rates))]
    };
  } catch {
    return null;
  }
}

const missing = Object.values(BY_ID).filter((s) => !out[s]);

/* Probe with something the shop actually sells. Taking the first key of BY_ID
   broke the moment that product was unpublished: the probe silently returned
   null and the storefront fell back to "se calcula al pagar". */
const sampleId = live.length ? live[0].id : Number(Object.keys(BY_ID)[0]);
const shipping = await probeShipping(sampleId);

/*
 * Guard before writing, not after.
 *
 * The deploy workflow runs this with `|| echo "shop unreachable"`, so a
 * non-zero exit at the end is swallowed — and by then the bad file is already
 * on disk. Throwing here means a threshold that no longer matches the shop
 * fails the sync and the build keeps the last known-good woo.js, which is the
 * behaviour the `||` was written for.
 */
if (shipping && !shipping.free && shipping.chargedUpTo !== null && shipping.freeFrom !== null) {
  if (FREE_SHIPPING_FROM <= shipping.chargedUpTo || FREE_SHIPPING_FROM > shipping.freeFrom) {
    throw new Error(
      `config.js says free delivery from $${FREE_SHIPPING_FROM}, but the shop puts the threshold ` +
        `between $${shipping.chargedUpTo + 1} and $${shipping.freeFrom}. Fix one of them.`
    );
  }
}

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
if (!shipping) {
  console.log('  delivery: could not probe the shop');
} else if (shipping.free) {
  console.log('  delivery: free at every basket size probed');
} else {
  console.log(`  delivery: ${shipping.flat === null ? 'inconsistent' : '$' + shipping.flat} below the threshold` +
    (shipping.methods.length ? ` via ${shipping.methods.join(', ')}` : ' — no shipping method configured in the shop'));
  if (shipping.chargedUpTo !== null && shipping.freeFrom !== null) {
    console.log(`  free delivery threshold is between $${shipping.chargedUpTo + 1} and $${shipping.freeFrom}`);
    console.log(`  config.js quotes $${FREE_SHIPPING_FROM} — inside the bracket`);
  }
}
if (unmapped.length) console.log('  unmapped in shop:', unmapped.join(', '));
if (missing.length) console.log('  expected but absent:', missing.join(', '));
