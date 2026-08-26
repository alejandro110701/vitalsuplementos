/**
 * Attach the storefront's product photos to the live WooCommerce products.
 *
 * All 16 products were imported with zero-byte image files, so every one shows
 * a broken image. WooCommerce sideloads an image from any public http(s) URL —
 * it refuses data URIs with "No URL Provided" — so this needs the photos
 * reachable on the web. Point IMAGE_BASE at wherever they are served from:
 *
 *   IMAGE_BASE=https://raw.githubusercontent.com/<owner>/<repo>/main/public/shop \
 *   WOO_URL=... WOO_KEY=ck_... WOO_SECRET=cs_... \
 *   node scripts/attach-woo-images.mjs [--dry]
 *
 * Uploading through the WordPress media API instead works but needs the file
 * base64-encoded in the request, which is why this URL route exists.
 */
import { PRODUCTS } from '../src/data/products.js';

const { WOO_URL, WOO_KEY, WOO_SECRET, IMAGE_BASE } = process.env;
const DRY = process.argv.includes('--dry');

if (!WOO_URL || !WOO_KEY || !WOO_SECRET || !IMAGE_BASE) {
  console.error('Set WOO_URL, WOO_KEY, WOO_SECRET and IMAGE_BASE.');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString('base64');
let done = 0;
let failed = 0;

for (const p of PRODUCTS) {
  if (!p.wooId) continue;
  const src = `${IMAGE_BASE.replace(/\/$/, '')}/${p.slug}.png`;

  if (DRY) {
    console.log(`  ${p.slug.padEnd(18)} -> ${src}`);
    done++;
    continue;
  }

  // Fail loudly if the image is not actually reachable: WooCommerce would
  // otherwise store another broken reference, which is what got us here.
  const head = await fetch(src, { method: 'HEAD' });
  if (!head.ok || Number(head.headers.get('content-length')) === 0) {
    console.log(`  ${p.slug.padEnd(18)} SKIPPED · ${src} is not reachable (${head.status})`);
    failed++;
    continue;
  }

  const res = await fetch(`${WOO_URL}/wp-json/wc/v3/products/${p.wooId}`, {
    method: 'PUT',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: [{ src, name: p.n, alt: p.n }] })
  });
  const body = await res.json();

  if (!res.ok) {
    console.log(`  ${p.slug.padEnd(18)} FAILED · ${body.code || res.status} ${body.message || ''}`);
    failed++;
  } else {
    const img = body.images?.[0];
    console.log(`  ${p.slug.padEnd(18)} ok · image ${img ? img.id : 'NONE'}`);
    done++;
  }
}

console.log(`\n${done} attached, ${failed} failed`);
