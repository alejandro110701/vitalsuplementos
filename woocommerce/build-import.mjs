// Generates the WooCommerce product-importer CSV from the storefront catalogue.
// Pack tiers become a "Paquete" variation axis, so the 2- and 3-piece discounts
// are real WooCommerce prices rather than front-end arithmetic.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS, GOALS } from '../src/data/products.js';
import { PACK_DISCOUNT } from '../src/config.js';

const here = dirname(fileURLToPath(import.meta.url));

const TIERS = [
  { k: 1, label: '1 pieza', off: 0 },
  { k: 2, label: '2 piezas', off: PACK_DISCOUNT },
  { k: 3, label: '3 piezas', off: PACK_DISCOUNT + 6 }
];

const goalLabel = (id) => GOALS.find((g) => g.id === id)?.label ?? id;
const worldCat = (w) => (w === 'sup' ? 'Suplementos' : 'Skincare');
const img = (p) => (p.noImg ? 'magnesio-cup.png' : `${p.slug}.png`);

const COLUMNS = [
  'Type', 'SKU', 'Name', 'Published', 'Is featured?', 'Visibility in catalog',
  'Short description', 'Description', 'In stock?', 'Backorders allowed?',
  'Regular price', 'Sale price', 'Categories', 'Tags', 'Images', 'Parent',
  'Position', 'Attribute 1 name', 'Attribute 1 value(s)', 'Attribute 1 visible',
  'Attribute 1 global', 'Attribute 1 default'
];

const esc = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

const rows = [];

for (const p of PRODUCTS) {
  const cats = [worldCat(p.w), ...p.goals.map((g) => `${worldCat(p.w)} > ${goalLabel(g)}`)].join(', ');
  const tags = p.goals.map(goalLabel).join(', ');

  const description = [
    `<p>${p.claim}</p>`,
    '<ul>',
    ...p.bullets.map((b) => `<li>${b}</li>`),
    '</ul>',
    '<h3>Modo de uso</h3>',
    `<p>${p.uso}</p>`,
    '<h3>Presentación</h3>',
    `<p>${p.spec}</p>`,
    '<p class="vs-legal"><strong>Suplemento alimenticio. No es medicamento.</strong> El consumo de este producto es responsabilidad de quien lo recomienda y de quien lo usa. Este sitio no ofrece diagnóstico ni tratamiento.</p>'
  ].join('\n');

  // Parent (variable) product
  rows.push({
    Type: 'variable',
    SKU: p.sku ?? `VS-${p.slug.slice(0, 3).toUpperCase()}-${String(p.price).slice(0, 3)}`,
    Name: p.n,
    Published: 1,
    'Is featured?': p.best ? 1 : 0,
    'Visibility in catalog': 'visible',
    'Short description': `<p>${p.claim}</p>`,
    Description: description,
    'In stock?': 1,
    'Backorders allowed?': 0,
    'Regular price': '',
    'Sale price': '',
    Categories: cats,
    Tags: tags,
    Images: img(p),
    Parent: '',
    Position: p.best ?? 0,
    'Attribute 1 name': 'Paquete',
    'Attribute 1 value(s)': TIERS.map((t) => t.label).join(', '),
    'Attribute 1 visible': 1,
    'Attribute 1 global': 1,
    'Attribute 1 default': '1 pieza'
  });

  // One variation per pack tier
  const parentSku = rows[rows.length - 1].SKU;
  for (const t of TIERS) {
    const listUnit = p.was || p.price;
    const regular = listUnit * t.k;
    const sale = Math.round(p.price * (1 - t.off / 100)) * t.k;
    rows.push({
      Type: 'variation',
      SKU: `${parentSku}-P${t.k}`,
      Name: `${p.n} — ${t.label}`,
      Published: 1,
      'Is featured?': 0,
      'Visibility in catalog': 'visible',
      'Short description': '',
      Description: '',
      'In stock?': 1,
      'Backorders allowed?': 0,
      'Regular price': regular,
      'Sale price': sale < regular ? sale : '',
      Categories: '',
      Tags: '',
      Images: '',
      Parent: parentSku,
      Position: t.k,
      'Attribute 1 name': 'Paquete',
      'Attribute 1 value(s)': t.label,
      'Attribute 1 visible': 1,
      'Attribute 1 global': 1,
      'Attribute 1 default': ''
    });
  }
}

const csv = [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => esc(r[c])).join(','))].join('\n') + '\n';
writeFileSync(join(here, 'productos-woocommerce.csv'), csv, 'utf8');

console.log(
  `${PRODUCTS.length} products -> ${rows.length} rows ` +
  `(${rows.filter((r) => r.Type === 'variable').length} variable + ${rows.filter((r) => r.Type === 'variation').length} variations)`
);
