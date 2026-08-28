/**
 * Generate Google Ads Editor import files from the live catalogue.
 *
 * Ads Editor imports plain CSV: one file per entity type, each keyed by the
 * campaign and ad group names. Everything here is emitted PAUSED — an import
 * that goes live the moment it lands is an import nobody reviewed.
 *
 * Prices and final URLs are read from src/data/woo.js rather than typed in, so
 * an ad can never quote a number the shop will not honour. That is the same
 * rule the storefront follows, and it matters more in an ad: a price mismatch
 * between the ad and the landing page is a Google "misrepresentation" finding,
 * not just a bad look.
 *
 *   node scripts/build-ads.mjs            # writes ads/
 *   DAILY_BUDGET=300 node scripts/build-ads.mjs
 *
 * Copy is validated against Google's limits on every run and the script exits
 * non-zero if anything is over, so a too-long headline is caught here instead
 * of being silently truncated in the Ads UI.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import WOO from '../src/data/woo.js';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'ads');

/* MX$ per day for the whole campaign. Google treats this as an AVERAGE: daily
   spend can reach 2x and the monthly charging limit is budget x 30.4. */
const DAILY_BUDGET = Number(process.env.DAILY_BUDGET || 300);

/* Manual CPC ceiling. Deliberately low: these are exact-match brand+product
   searches with almost no competition, and the account has zero conversion
   history, so there is nothing for a smart bidding strategy to learn from yet. */
const MAX_CPC = Number(process.env.MAX_CPC || 6);

const CAMPAIGN = 'MX | Vital Suplementos | Skincare | Busqueda';

/* ------------------------------------------------------------------ */
/* The launch set                                                     */
/*                                                                    */
/* Only three SKUs, all skincare. The twelve supplements are held back */
/* deliberately: "suplemento alimenticio" advertising in Mexico needs  */
/* a COFEPRIS permiso publicitario, and two of them (glutation         */
/* "blanqueador", crema "aclaradora") are skin-lightening products     */
/* whose own WooCommerce permalinks carry the claim. Those are not a   */
/* copywriting problem — they are a documents problem.                 */
/* ------------------------------------------------------------------ */
const GROUPS = [
  {
    slug: 'serum-anua',
    adGroup: 'Anua | Niacinamida 10 + TXA 4',
    status: 'Paused',
    paths: ['anua', 'serum-30ml'],
    headlines: [
      'Anua Niacinamida 10% + TXA 4%',
      'Sérum Anua de 30 ml',
      'Anua 30 ml: $499 MXN',
      'Vital Suplementos',
      'Niacinamida para tu rutina',
      'Conoce el sérum Anua',
      'Compra Anua en línea',
      'Un paso en tu rutina facial',
      'Descubre su fórmula',
      'Skincare en Vital Suplementos',
      'Envío gratis a todo México',
      'Pago contra entrega',
    ],
    descriptions: [
      'Anua Niacinamida 10% + TXA 4%, 30 ml. Conoce el sérum por $499 MXN.',
      'Un paso para complementar tu rutina facial. Descubre Anua en Vital Suplementos.',
      'Conoce su fórmula, ingredientes y modo de uso antes de elegir tu sérum.',
      'Compra en línea. Revisa disponibilidad y condiciones de entrega antes de pagar.',
    ],
    keywords: [
      ['anua niacinamida 10 txa 4', 'Exact'],
      ['anua niacinamide 10 txa 4 serum', 'Exact'],
      ['anua niacinamida 30 ml', 'Exact'],
      ['comprar anua niacinamida', 'Exact'],
      ['anua niacinamida precio', 'Exact'],
      ['anua niacinamida 10 txa 4', 'Phrase'],
      ['comprar anua niacinamida', 'Phrase'],
      ['serum anua niacinamida', 'Phrase'],
    ],
    callouts: ['Presentación de 30 ml', 'Niacinamida 10% + TXA 4%'],
  },
  {
    slug: 'medicube-colageno',
    adGroup: 'Medicube | Collagen Night',
    status: 'Paused',
    paths: ['medicube', 'mascarilla-75ml'],
    headlines: [
      'Medicube Collagen Night',
      'Mascarilla Medicube 75 ml',
      'Medicube por $599 MXN',
      'Vital Suplementos',
      'Tu rutina de noche',
      'Collagen Night Wrapping Mask',
      'Mascarilla de noche Medicube',
      'Compra Medicube en línea',
      'Descubre Medicube de 75 ml',
      'Un paso en tu rutina facial',
      'Envío gratis a todo México',
      'Pago contra entrega',
    ],
    descriptions: [
      'Medicube Collagen Night Wrapping Mask, 75 ml, por $599 MXN en Vital Suplementos.',
      'Con colágeno, niacinamida y ceramida NP. Descubre esta mascarilla de noche.',
      'Completa tu rutina nocturna. Consulta ingredientes, modo de uso y disponibilidad.',
      'Compra en línea. Revisa las condiciones de entrega y pago antes de confirmar.',
    ],
    keywords: [
      ['medicube collagen night wrapping mask', 'Exact'],
      ['mascarilla nocturna medicube', 'Exact'],
      ['medicube mascarilla colageno 75 ml', 'Exact'],
      ['comprar mascarilla medicube', 'Exact'],
      ['medicube collagen night precio', 'Exact'],
      ['medicube collagen night', 'Phrase'],
      ['mascarilla nocturna medicube', 'Phrase'],
    ],
    callouts: ['Presentación de 75 ml', 'Mascarilla de noche'],
  },
  {
    slug: 'tocobo-barra',
    adGroup: 'Tocobo | Cotton Soft 19 g',
    status: 'Paused',
    /* Held in reserve: two Mexican sellers list this at 349-350, against 599
       here. Advertising into a 250-peso gap buys clicks for a competitor. */
    reserve: true,
    paths: ['tocobo', 'barra-19g'],
    headlines: [
      'Tocobo Cotton Soft Sun Stick',
      'Tocobo en barra, 19 g',
      'Tocobo por $599 MXN',
      'Vital Suplementos',
      'Protector solar en barra',
      'Conoce Tocobo de 19 g',
      'Envío gratis a todo México',
      'Pago contra entrega',
    ],
    descriptions: [
      'Tocobo Cotton Soft Sun Stick, 19 g. Consulta el producto por $599 MXN.',
      'Conoce su presentación en barra, ingredientes y modo de uso en Vital Suplementos.',
      'Revisa precio, disponibilidad y condiciones de entrega antes de comprar.',
    ],
    keywords: [
      ['tocobo cotton soft sun stick 19g', 'Exact'],
      ['comprar protector solar tocobo', 'Exact'],
      ['tocobo cotton soft sun stick', 'Phrase'],
    ],
    callouts: ['Presentación de 19 g', 'Formato en barra'],
  },
];

/* ------------------------------------------------------------------ */
/* Campaign negatives                                                 */
/*                                                                    */
/* "gratis" is deliberately NOT blocked: the shop genuinely offers     */
/* free delivery, so "envio gratis" is a query we want. What is        */
/* blocked is intent that cannot convert on a retail product page.     */
/* ------------------------------------------------------------------ */
const NEGATIVES = [
  /* Not shopping at all */
  ['empleo', 'Phrase'], ['vacantes', 'Phrase'], ['trabajo', 'Phrase'],
  ['curso', 'Phrase'], ['pdf', 'Phrase'], ['descargar', 'Phrase'],
  /* Wants to make it, not buy it */
  ['receta casera', 'Phrase'], ['hacer en casa', 'Phrase'], ['como preparar', 'Phrase'],
  ['formula casera', 'Phrase'], ['diy', 'Phrase'],
  /* Wants it free, or wants a sample */
  ['muestras gratis', 'Phrase'], ['gratis sin costo', 'Phrase'], ['regalo', 'Phrase'],
  /* Buying somewhere else — these are informational, not our traffic */
  ['mercado libre', 'Phrase'], ['amazon', 'Phrase'], ['shein', 'Phrase'],
  ['temu', 'Phrase'], ['aliexpress', 'Phrase'], ['sams', 'Phrase'],
  ['costco', 'Phrase'], ['liverpool', 'Phrase'], ['sephora', 'Phrase'],
  /* Wholesale / resale — the shop sells single units at retail */
  ['mayoreo', 'Phrase'], ['al por mayor', 'Phrase'], ['distribuidor', 'Phrase'],
  ['proveedor', 'Phrase'], ['revendedor', 'Phrase'],
  /* Counterfeit-seeking and price-floor queries */
  ['replica', 'Phrase'], ['imitacion', 'Phrase'], ['falso', 'Phrase'],
  ['clon', 'Phrase'], ['generico', 'Phrase'],
  /* Wrong country: the shop only delivers inside Mexico */
  ['colombia', 'Phrase'], ['peru', 'Phrase'], ['chile', 'Phrase'],
  ['argentina', 'Phrase'], ['espana', 'Phrase'], ['estados unidos', 'Phrase'],
  /* Claims we must never be seen answering — these protect the account
     as much as the budget. A supplement/cosmetic ad served against a
     medical query is how a healthcare-policy suspension starts. */
  ['cura', 'Phrase'], ['curar', 'Phrase'], ['tratamiento medico', 'Phrase'],
  ['receta medica', 'Phrase'], ['medicamento', 'Phrase'], ['dermatologo', 'Phrase'],
  ['efectos secundarios', 'Phrase'], ['contraindicaciones', 'Phrase'],
  ['embarazo', 'Phrase'], ['lactancia', 'Phrase'], ['ninos', 'Phrase'],
];

/**
 * Pages confirmed published on the live WordPress site, read through the
 * WordPress.com connector on 2026-08-28.
 *
 * Worth writing down rather than trusting: the React app routes /nosotros
 * behind a fragment (#/nosotros) and the mu-plugin only serves the storefront
 * at / and /tienda/, which makes a bare /nosotros/ look like it must 404. It
 * does not — WordPress serves its own page there, independently of the SPA.
 * A sitelink to a genuinely dead URL is a destination-policy finding, so the
 * allowlist below is what the shop actually publishes, not what the routing
 * implies.
 */
const LIVE_PAGES = new Set([
  'https://vitalsuplementos.com.mx/shop/',      // id 10
  'https://vitalsuplementos.com.mx/nosotros/',  // id 15
  'https://vitalsuplementos.com.mx/peptidos/',  // id 16
  'https://vitalsuplementos.com.mx/inicio/',    // id 108
]);

/* Sitelinks. Every destination below must exist and be reachable before the
   campaign is enabled — a sitelink to a 404 is a destination-policy finding. */
const SITELINKS = [
  ['Todo el catálogo', 'Suplementos y skincare', 'Importación directa a México', 'https://vitalsuplementos.com.mx/shop/'],
  ['Skincare coreano', 'Sérums, mascarillas y solar', 'Etiqueta y presentación a la vista', 'https://vitalsuplementos.com.mx/shop/'],
  ['Cómo compras', 'Pago contra entrega', 'Pagas al recibir tu paquete', 'https://vitalsuplementos.com.mx/nosotros/'],
  ['Quiénes somos', 'Importación directa', 'Lote y caducidad visibles', 'https://vitalsuplementos.com.mx/nosotros/'],
];

const CALLOUTS = ['Envío gratis', 'Pago contra entrega', 'Importación directa', 'Entrega de 2 a 5 días'];

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */
const LIMITS = { headline: 30, description: 90, path: 15, sitelinkText: 25, sitelinkDesc: 35, callout: 25 };
const problems = [];

const check = (kind, value, where) => {
  const max = LIMITS[kind];
  /* Google counts characters, and counts an accented character as one. */
  if ([...value].length > max) {
    problems.push(`${where}: ${kind} is ${[...value].length}/${max} — "${value}"`);
  }
  return value;
};

/* ------------------------------------------------------------------ */
/* CSV                                                                */
/* ------------------------------------------------------------------ */
const cell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const csv = (rows) => rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';

const write = (name, rows) => {
  writeFileSync(join(OUT, name), csv(rows), 'utf8');
  console.log(`  ${name.padEnd(28)} ${rows.length - 1} rows`);
};

/* ------------------------------------------------------------------ */
/* Build                                                              */
/* ------------------------------------------------------------------ */
mkdirSync(OUT, { recursive: true });

const live = (slug) => {
  const p = WOO.products[slug];
  if (!p) {
    problems.push(`${slug}: absent from the last WooCommerce sync — cannot build an ad for a product the shop is not selling`);
    return null;
  }
  return p;
};

console.log(`Building Ads Editor import for "${CAMPAIGN}"`);
console.log(`  budget MX$${DAILY_BUDGET}/day · max CPC MX$${MAX_CPC} · catalogue synced ${WOO.syncedAt}\n`);

/* --- campaign ----------------------------------------------------- */
write('01-campaign.csv', [
  ['Campaign', 'Campaign Type', 'Campaign Daily Budget', 'Budget Type', 'Bid Strategy Type', 'Networks', 'Languages', 'Campaign Status'],
  [CAMPAIGN, 'Search', DAILY_BUDGET.toFixed(2), 'Standard', 'Manual CPC', 'Google search', 'Spanish', 'Paused'],
]);

/* --- location ------------------------------------------------------
 *
 * A campaign with no location rows is not "untargeted" in the harmless
 * sense — Ads Editor imports it as ALL countries, and a shop that only
 * delivers inside Mexico would spend its day buying clicks it cannot
 * fulfil. This must be imported with the campaign, not after it.
 *
 * "Presence" rather than the default "Presence or interest": interest
 * targeting serves people merely *reading about* Mexico from anywhere,
 * which for a cash-on-delivery courier network is pure waste. 2484 is
 * Google's geo target constant for Mexico.
 */
write('01b-location.csv', [
  ['Campaign', 'Location', 'Location ID', 'Reach', 'Location Target Type', 'Status'],
  [CAMPAIGN, 'Mexico', '2484', 'Presence', 'Presence', 'Enabled'],
]);

/* Language is set on the campaign row above, and it is NOT a substitute for
   the rows here: Google matches language on the browser/query, not on where
   the person is, so Spanish alone would serve every Spanish speaker on
   earth. Both are required, and they do different jobs. */

/* --- ad groups ---------------------------------------------------- */
write('02-ad-groups.csv', [
  ['Campaign', 'Ad Group', 'Max CPC', 'Ad Group Status'],
  ...GROUPS.map((g) => [CAMPAIGN, g.adGroup, MAX_CPC.toFixed(2), g.status]),
]);

/* --- keywords ----------------------------------------------------- */
const kwRows = [['Campaign', 'Ad Group', 'Keyword', 'Criterion Type', 'Max CPC', 'Status']];
for (const g of GROUPS) {
  for (const [kw, type] of g.keywords) {
    kwRows.push([CAMPAIGN, g.adGroup, kw, type, MAX_CPC.toFixed(2), 'Paused']);
  }
}
write('03-keywords.csv', kwRows);

/* --- negatives ---------------------------------------------------- */
write('04-negative-keywords.csv', [
  ['Campaign', 'Keyword', 'Criterion Type'],
  ...NEGATIVES.map(([kw, t]) => [CAMPAIGN, kw, `Campaign Negative ${t}`]),
]);

/* --- responsive search ads ---------------------------------------- */
const maxH = Math.max(...GROUPS.map((g) => g.headlines.length));
const maxD = Math.max(...GROUPS.map((g) => g.descriptions.length));
const adHeader = [
  'Campaign', 'Ad Group', 'Ad Type',
  ...Array.from({ length: maxH }, (_, i) => `Headline ${i + 1}`),
  ...Array.from({ length: maxD }, (_, i) => `Description ${i + 1}`),
  'Path 1', 'Path 2', 'Final URL', 'Status',
];
const adRows = [adHeader];
for (const g of GROUPS) {
  const p = live(g.slug);
  if (!p) continue;

  g.headlines.forEach((h, i) => check('headline', h, `${g.adGroup} H${i + 1}`));
  g.descriptions.forEach((d, i) => check('description', d, `${g.adGroup} D${i + 1}`));
  g.paths.forEach((x, i) => check('path', x, `${g.adGroup} Path${i + 1}`));

  /* Assert the advertised price still matches the shop. The copy quotes a
     figure; if WooCommerce has repriced since it was written, the ad is now
     wrong and must not ship. */
  const quoted = [...g.headlines, ...g.descriptions].join(' ').match(/\$(\d[\d,]*)/g) || [];
  for (const q of new Set(quoted)) {
    if (Number(q.replace(/[$,]/g, '')) !== p.price) {
      problems.push(`${g.adGroup}: copy quotes ${q} but WooCommerce charges $${p.price} for ${g.slug}`);
    }
  }

  adRows.push([
    CAMPAIGN, g.adGroup, 'Responsive search ad',
    ...Array.from({ length: maxH }, (_, i) => g.headlines[i] || ''),
    ...Array.from({ length: maxD }, (_, i) => g.descriptions[i] || ''),
    g.paths[0], g.paths[1], p.permalink, 'Paused',
  ]);
}
write('05-responsive-search-ads.csv', adRows);

/* --- extensions --------------------------------------------------- */
write('06-sitelinks.csv', [
  ['Campaign', 'Sitelink Text', 'Description Line 1', 'Description Line 2', 'Final URL', 'Status'],
  ...SITELINKS.map(([t, d1, d2, u], i) => {
    check('sitelinkText', t, `Sitelink ${i + 1}`);
    check('sitelinkDesc', d1, `Sitelink ${i + 1} desc1`);
    check('sitelinkDesc', d2, `Sitelink ${i + 1} desc2`);
    if (!LIVE_PAGES.has(u)) {
      problems.push(`Sitelink ${i + 1} ("${t}") points at ${u}, which is not a page confirmed live on the shop`);
    }
    return [CAMPAIGN, t, d1, d2, u, 'Paused'];
  }),
]);

const calloutRows = [['Campaign', 'Ad Group', 'Callout Text', 'Status']];
CALLOUTS.forEach((c, i) => {
  check('callout', c, `Campaign callout ${i + 1}`);
  calloutRows.push([CAMPAIGN, '', c, 'Paused']);
});
for (const g of GROUPS) {
  g.callouts.forEach((c, i) => {
    check('callout', c, `${g.adGroup} callout ${i + 1}`);
    calloutRows.push([CAMPAIGN, g.adGroup, c, 'Paused']);
  });
}
write('07-callouts.csv', calloutRows);

/* ------------------------------------------------------------------ */
if (problems.length) {
  console.error('\nREFUSING TO SHIP — fix these first:\n');
  for (const p of problems) console.error('  ! ' + p);
  process.exit(1);
}

const reserve = GROUPS.filter((g) => g.reserve).map((g) => g.adGroup);
console.log('\nAll copy within Google limits and every quoted price matches the shop.');
if (reserve.length) console.log(`Held in reserve (import, review margin, do not enable): ${reserve.join(', ')}`);
console.log('Everything is PAUSED. Review in Ads Editor before you post.');
