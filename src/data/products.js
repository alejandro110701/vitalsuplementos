import WOO from './woo.js';
import { asset } from '../lib/assetBase.js';
import { FREE_SHIPPING_FROM } from '../config.js';

// Catalogue transcribed from the "Vital Suplementos" design canvas.
// `w` is the world (sup = suplementos, skin = skincare); `goals` drives the
// objective filter; `best` orders the "más pedidos" rail on the home page.
export const PRODUCTS = [
  {
    slug: 'serum-anua',
    n: 'Serum Anua Niacinamida 10 + TXA 4',
    kicker: 'Skincare · Serum',
    w: 'skin',
    goals: ['piel'],
    price: 499,
    was: 749,
    spec: '30 ml',
    best: 6,
    claim: 'Niacinamida al 10% con ácido tranexámico al 4%, en base ligera de agua de arroz.',
    bullets: [
      'Niacinamida 10% + TXA 4% — porcentajes declarados en etiqueta',
      'Textura fluida, sin siliconas ni fragancia añadida',
      'Coreano original, importación verificada'
    ],
    uso: '2 a 3 gotas sobre rostro limpio, mañana y noche. De día, sellar con protector solar.'
  },
  {
    slug: 'glutation-gomas',
    n: 'Glutatión Pro en Gomas',
    kicker: 'Suplemento · Gomas',
    w: 'sup',
    goals: ['piel'],
    price: 749,
    was: 999,
    spec: '60 gomas',
    best: 7,
    claim: '300 mg de glutatión con aminoácidos y colágeno, en goma de pectina de fruta.',
    bullets: [
      '300 mg glutatión · 100 mg aminoácidos · 50 mg colágeno',
      'Base de pectina, sin gelatina animal',
      'Dos gomas al día equivalen a una porción'
    ],
    uso: '2 gomas al día, con o sin alimentos. Un frasco rinde 30 días.'
  },
  {
    slug: 'creatina',
    n: 'Creatina Monohidratada Dropi Cup',
    kicker: 'Suplemento · Polvo',
    w: 'sup',
    goals: ['energia', 'peso'],
    price: 599,
    was: 0,
    spec: '300 g',
    best: 30,
    claim: 'Creatina monohidratada sin sabor, un solo ingrediente por porción.',
    bullets: [
      '5 g de creatina monohidratada por medida',
      'Sin sabor: se mezcla en agua, jugo o batido',
      '60 porciones por bote'
    ],
    uso: '5 g al día, a cualquier hora. En días de entrenamiento, después de entrenar.'
  },
  {
    slug: 'nad-mens',
    n: 'NAD+ Men’s Complex Selerb',
    kicker: 'Suplemento · Cápsulas',
    w: 'sup',
    goals: ['energia'],
    price: 1099,
    was: 1499,
    spec: '60 cáps',
    best: 8,
    claim: 'Complejo con precursores de NAD+ formulado para hombres, en cápsula vegetal.',
    bullets: [
      '60 cápsulas · 30 días de toma',
      'Fórmula con zinc, vitaminas del grupo B y extractos',
      'Etiqueta con dosis por porción, sin mezclas propietarias'
    ],
    uso: '2 cápsulas al día con el desayuno.'
  },
  {
    slug: 'magnesio-cup',
    n: 'Cápsulas de Magnesio Dropi Cup',
    kicker: 'Suplemento · Cápsulas',
    w: 'sup',
    goals: ['movilidad'],
    price: 479,
    was: 0,
    spec: '120 cáps',
    claim: 'Magnesio en cápsula, formato diario para acompañar la cena.',
    bullets: [
      '120 cápsulas por frasco',
      'Formato pequeño, fácil de tragar',
      'Cuatro meses de toma a una cápsula diaria'
    ],
    uso: '1 cápsula al día, de preferencia por la noche con alimentos.'
  },
  {
    slug: 'joint-support',
    n: 'Joint Support Windboss',
    kicker: 'Suplemento · Cápsulas',
    w: 'sup',
    goals: ['movilidad'],
    price: 699,
    was: 0,
    spec: '60 cáps',
    claim: 'Glucosamina, condroitina y MSM en una sola cápsula.',
    bullets: ['Glucosamina + condroitina + MSM', '60 cápsulas · 30 días', 'Pensado para quien entrena con carga'],
    uso: '2 cápsulas al día con alimentos.'
  },
  {
    slug: 'bloom-mango',
    n: 'Bloom Greens Mango',
    kicker: 'Suplemento · Polvo',
    w: 'sup',
    goals: ['energia', 'peso'],
    price: 899,
    was: 0,
    spec: '225 g',
    claim: 'Mezcla de verdes en polvo sabor mango, con probióticos y enzimas digestivas.',
    bullets: ['30 porciones por bote', 'Sabor mango, se disuelve en agua fría', 'Con probióticos y fibra'],
    uso: '1 medida en 250 ml de agua fría, en ayunas o a media mañana.'
  },
  {
    slug: 'mentas-cafeina',
    n: 'Mentas de Cafeína Energy Focus',
    kicker: 'Suplemento · Mentas',
    w: 'sup',
    goals: ['energia', 'peso'],
    price: 259,
    was: 0,
    spec: '90 piezas',
    claim: '40 mg de cafeína natural y 60 mg de L-teanina por pieza, sin azúcar.',
    bullets: [
      '40 mg de cafeína natural y 60 mg de L-teanina por pieza',
      'Con vitaminas B6 y B12, sin azúcar y sin aspartame',
      'Bolsa resellable de 90 piezas, sabor menta'
    ],
    uso: '1 pieza cuando la necesites. Máximo 4 al día.'
  },
  {
    slug: 'magnesio-180',
    n: 'Magnesio Complex 180 Cápsulas',
    kicker: 'Suplemento · Cápsulas',
    w: 'sup',
    goals: ['movilidad'],
    price: 649,
    was: 0,
    spec: '180 cáps',
    claim: 'Tres formas de magnesio en un solo frasco de 180 cápsulas.',
    bullets: ['Citrato, glicinato y óxido de magnesio', '180 cápsulas · hasta 90 días', 'Frasco de vidrio ámbar'],
    uso: '2 cápsulas al día con la cena.'
  },
  {
    slug: 'gel-salicilico',
    n: 'Gel Limpiador Ácido Salicílico',
    kicker: 'Skincare · Limpiador',
    w: 'skin',
    goals: ['piel'],
    price: 299,
    was: 429,
    spec: '80 g',
    claim: 'Gel de limpieza con ácido salicílico para piel mixta y grasa.',
    bullets: ['Ácido salicílico en base de gel', 'Enjuaga sin dejar película', '80 g · uso diario'],
    uso: 'Aplicar sobre piel húmeda, masajear 30 segundos y enjuagar. Una o dos veces al día.'
  },
  {
    slug: 'holy-basil',
    n: 'Mascarilla Holy Basil Bubble Deep',
    kicker: 'Skincare · Mascarilla',
    w: 'skin',
    goals: ['piel'],
    price: 349,
    was: 499,
    spec: '90 g',
    claim: 'Mascarilla de burbujas con albahaca sagrada y PHA, para limpieza profunda.',
    bullets: [
      'Holy basil con PHA, el exfoliante más suave de los ácidos',
      'Pomo de 90 g, incluye espátula aplicadora',
      'Se enjuaga: no es mascarilla de tela'
    ],
    uso: 'Aplica una capa fina sobre rostro limpio con la espátula, deja que burbujee y enjuaga con agua tibia.'
  },
  {
    slug: 'medicube-colageno',
    n: 'Mascarilla de Noche Medicube Colágeno',
    kicker: 'Skincare · Mascarilla',
    w: 'skin',
    goals: ['piel'],
    price: 429,
    was: 0,
    spec: '75 ml',
    claim: 'Mascarilla de noche con colágeno, niacinamida y ceramida NP, en tubo de 75 ml.',
    bullets: [
      'Extracto de colágeno con niacinamida y ceramida NP',
      'Tubo de 75 ml: rinde muchas aplicaciones, no es de un solo uso',
      'Coreano original, se queda puesta toda la noche'
    ],
    uso: 'Aplica una capa como último paso de la rutina de noche y déjala puesta hasta la mañana.'
  },
  {
    slug: 'tocobo-barra',
    n: 'Protector Solar Tocobo en Barra',
    kicker: 'Skincare · SPF',
    w: 'skin',
    goals: ['piel'],
    price: 459,
    was: 0,
    spec: '19 g',
    claim: 'Protector solar en barra, acabado seco, para reaplicar sobre maquillaje.',
    bullets: ['Barra de 19 g, cabe en la bolsa', 'Acabado seco, sin brillo', 'Se reaplica sin desmaquillar'],
    uso: 'Pasar la barra 2 o 3 veces sobre la piel. Reaplicar cada 2 horas de sol.'
  },
  {
    slug: 'crema-chillab',
    n: 'Crema Aclaradora Chillab',
    kicker: 'Skincare · Crema',
    w: 'skin',
    goals: ['piel'],
    price: 389,
    was: 0,
    spec: '50 g',
    claim: 'Crema de tratamiento para zonas con manchas y tono desigual.',
    bullets: ['Uso localizado en manchas', 'Textura de crema, absorbe rápido', '50 g · dos a tres meses'],
    uso: 'Aplicar en la zona por la noche, sobre piel limpia y seca.'
  },
  {
    slug: 'serum-4en1',
    n: 'Serum 4 en 1 Antiarrugas',
    kicker: 'Skincare · Serum',
    w: 'skin',
    goals: ['piel'],
    price: 399,
    was: 0,
    spec: '30 ml',
    claim: 'Serum con cuatro activos en una sola aplicación: líneas finas y manchas.',
    bullets: ['Cuatro activos en una fórmula', 'Base ligera, sin residuo graso', '30 ml · gotero de vidrio'],
    uso: '3 gotas por la noche, después del limpiador.'
  },
  {
    slug: 'parches-ojeras',
    n: 'Parches para Ojeras Wokali',
    kicker: 'Skincare · Contorno',
    w: 'skin',
    goals: ['piel'],
    price: 229,
    was: 0,
    spec: '30 pares',
    claim: 'Parches de hidrogel con ácido hialurónico para el contorno de ojos.',
    bullets: ['30 pares por frasco', 'Hidrogel con hialurónico', 'Se usan fríos, del refrigerador'],
    uso: 'Colocar bajo los ojos 20 minutos. Retirar y dar toques con el dedo.'
  },
  {
    slug: 'cosrx-snail-96',
    n: 'COSRX Advanced Snail 96 Mucin Power Essence',
    kicker: 'Skincare · Esencia',
    w: 'skin',
    goals: ['piel'],
    price: 699,
    was: 0,
    spec: '100 ml',
    best: 1,
    claim: 'Esencia coreana con 96 % de filtrado de mucina de caracol, sin fragancia añadida.',
    bullets: [
      '96 % de filtrado de mucina de caracol',
      'Fórmula corta, sin fragancia ni colorantes',
      'En existencia — es de los coreanos con más desabasto en México'
    ],
    uso: 'Una capa fina sobre rostro limpio, después del tónico y antes de la crema, mañana y noche.'
  },
  {
    slug: 'anua-pdrn-mist',
    n: 'Anua PDRN Hyaluronic Acid Capsule Mist',
    kicker: 'Skincare · Bruma',
    w: 'skin',
    goals: ['piel'],
    price: 599,
    was: 0,
    spec: '100 ml',
    best: 4,
    claim: 'Bruma-serum con PDRN y ácido hialurónico, en cápsulas que se rompen al contacto.',
    bullets: [
      'PDRN y ácido hialurónico',
      'Atomizador de niebla fina, se usa encima del maquillaje',
      'Textura acuosa, sin residuo graso'
    ],
    uso: 'Agita, aplica a 20 cm del rostro y da toques con la yema de los dedos. Las veces que quieras.'
  },
  {
    slug: 'anua-azelaico',
    n: 'Anua Azelaic Acid 10 + Hyaluron Serum Calmante',
    kicker: 'Skincare · Serum',
    w: 'skin',
    goals: ['piel'],
    price: 599,
    was: 0,
    spec: '30 ml',
    claim: 'Serum con ácido azelaico al 10 % y ácido hialurónico, en base ligera y sin fragancia.',
    bullets: [
      'Ácido azelaico 10 % + ácido hialurónico',
      'Gotero de vidrio de 30 ml',
      'Sin fragancia añadida'
    ],
    uso: '2 o 3 gotas por la noche sobre rostro limpio. Empieza en días alternos. De día, siempre protector solar.'
  },
  {
    slug: 'medicube-zero-pore',
    n: 'Medicube Zero Pore Blackhead Mud Mask',
    kicker: 'Skincare · Mascarilla',
    w: 'skin',
    goals: ['piel'],
    price: 549,
    was: 0,
    spec: '100 g',
    claim: 'Mascarilla de arcilla al 30 % con complejo AHA + BHA + PHA, de enjuague.',
    bullets: [
      '30 % de arcilla purificante',
      'AHA + BHA + PHA en un solo paso',
      'Tubo de 100 g, formato de enjuague'
    ],
    uso: 'Capa delgada sobre rostro seco, 10 a 15 minutos, y retira con agua tibia. Una o dos veces por semana.'
  },
  {
    slug: 'neocell-colageno',
    n: 'NeoCell Collagen Bio-Peptides Protein',
    kicker: 'Suplemento · Polvo',
    w: 'sup',
    goals: ['piel', 'movilidad'],
    price: 699,
    was: 0,
    spec: '567 g',
    best: 3,
    claim: '20 g de colágeno hidrolizado por porción, de res de libre pastoreo, sin sabor.',
    bullets: [
      '20 g de colágeno por porción',
      'Bote grande de 567 g · ~28 porciones',
      'Sin sabor y sin azúcar añadida'
    ],
    uso: 'Un scoop en 250 ml de agua, café o batido, una vez al día.'
  },
  {
    slug: 'megared-krill',
    n: 'MegaRed Omega-3 de Krill',
    kicker: 'Suplemento · Cápsulas',
    w: 'sup',
    goals: ['energia', 'movilidad'],
    price: 699,
    was: 0,
    spec: '90 cáps',
    claim: 'Aceite de krill con omega-3 en forma de fosfolípidos, EPA, DHA y astaxantina.',
    bullets: [
      '90 cápsulas blandas',
      'Omega-3 con EPA y DHA, más astaxantina',
      'Cápsula pequeña, sin regusto a pescado'
    ],
    uso: '1 cápsula al día con alimentos.'
  },
  {
    slug: 'beast-bites-creatina',
    n: 'Beast Bites Gomitas de Creatina',
    kicker: 'Suplemento · Gomas',
    w: 'sup',
    goals: ['energia', 'peso'],
    price: 699,
    was: 0,
    spec: '150 gomitas',
    best: 2,
    claim: '5 g de creatina monohidratada Creapure por porción, en gomita.',
    bullets: [
      '150 gomitas · 30 porciones',
      '5 g de Creapure por porción de 5 gomitas',
      'Sabor frambuesa azul, bolsa resellable'
    ],
    uso: '5 gomitas al día, a cualquier hora. En días de entrenamiento, después de entrenar.'
  },
  {
    slug: 'goli-ashwagandha',
    n: 'Goli Ashwagandha KSM-66',
    kicker: 'Suplemento · Gomas',
    w: 'sup',
    goals: ['energia'],
    price: 599,
    was: 0,
    spec: '60 gomitas',
    claim: 'Gomitas veganas con extracto de ashwagandha KSM-66 y vitamina D.',
    bullets: [
      '60 gomitas · 30 días de toma',
      'Ashwagandha KSM-66 con vitamina D',
      'Veganas, sin gelatina animal'
    ],
    uso: '2 gomitas al día, con o sin alimentos.'
  },
  {
    slug: 'peach-inositol',
    n: 'Peach Perfect Inositol Multivitamin',
    kicker: 'Suplemento · Polvo',
    w: 'sup',
    goals: ['energia', 'peso'],
    price: 629,
    was: 0,
    spec: '135 g',
    best: 5,
    claim: 'Myo-inositol y D-chiro-inositol con DIM, magnesio, zinc y vitamina D3.',
    bullets: [
      '135 g · 30 porciones',
      'Myo-inositol + D-chiro-inositol',
      'Con DIM, magnesio, zinc y vitamina D3'
    ],
    uso: 'Un scoop en 250 ml de agua fría al día.'
  }
];

/**
 * Commerce comes from the live WooCommerce shop; editorial stays here.
 *
 * The shop is the only place a customer can actually pay, so its price and
 * stock always win — advertising a number the shop will not honour is the one
 * failure mode worth designing against. Names, claims, bullets and dosing stay
 * curated in this file: the imported products carry supplier titles, some of
 * which make claims this brand does not.
 *
 * `woo.js` is baked at build time by `npm run sync:woo`, so there is no key
 * in the bundle and no runtime dependency on the shop being reachable. If a
 * product is missing from the sync it keeps its catalogue price and is flagged
 * unlisted rather than silently mispriced.
 */
for (const p of PRODUCTS) {
  const live = WOO.products[p.slug];
  if (!live) {
    p.listed = false;
    continue;
  }
  p.listed = true;
  p.price = live.price;
  p.was = live.was;
  p.inStock = live.inStock;
  p.wooId = live.id;
  p.wooSku = live.sku;
  p.permalink = live.permalink;
}

/**
 * What a shopper is allowed to browse and buy. A product missing from the last
 * WooCommerce sync keeps its catalogue price, and that price is a guess — so it
 * must not sit on a shelf with a number next to it. It stays in PRODUCTS so a
 * direct link still resolves to a page that says it is unavailable.
 */
export const LISTED = PRODUCTS.filter((p) => p.listed);

/**
 * What the shop charges to deliver, probed from WooCommerce by the sync script
 * rather than declared here. It used to be a constant in config.js and it
 * drifted — the app quoted a flat 149 while the shop had no shipping zones and
 * charged nothing, so the total on the cart was never the total at checkout.
 *
 * Returns a number in MXN, or null when the shop's answer depends on something
 * this front end cannot know (a threshold, a destination), in which case the
 * honest thing is to say it is worked out at checkout rather than guess.
 */
export function shippingFor(subtotal = 0) {
  const s = WOO.shipping;
  if (!s) return null;
  if (s.free) return 0;
  if (subtotal >= FREE_SHIPPING_FROM) return 0;
  return typeof s.flat === 'number' ? s.flat : null;
}

/** True when the shop delivers free — worth saying out loud when it is. */
export const FREE_SHIPPING = Boolean(WOO.shipping && WOO.shipping.free);

/** Re-exported so components can quote the threshold without importing config. */
export { FREE_SHIPPING_FROM };

export const GOALS = [
  { id: 'energia', label: 'Energía', sub: 'Creatina, cafeína, NAD+ y verdes.', icon: 'M4 14h6l-2 7 10-11h-6l2-7z' },
  { id: 'piel', label: 'Piel', sub: 'Serums con porcentaje declarado y SPF.', icon: 'M12 3s6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 6-10 6-10z' },
  { id: 'movilidad', label: 'Movilidad', sub: 'Magnesio, glucosamina y colágeno.', icon: 'M3 12h4l3-8 4 16 3-8h4' },
  { id: 'peso', label: 'Peso', sub: 'Apoyo a la rutina de entrenamiento.', icon: 'M6 7h12l2 12H4z M9 7V5a3 3 0 0 1 6 0v2' }
];

/** Returns undefined for an unknown slug — callers must handle it. Falling back
 *  to the first product silently served one product's page at another's price. */
export function findProduct(slug) {
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Vite rewrites asset URLs inside the bundle to match `base`, but not string
 * literals like this one — so the base is applied by hand. Without it every
 * product image 404s the moment the app is served from a subdirectory.
 */
export function productImage(p) {
  return asset(`packshots/${p.slug}.png`);
}

/* Tiers emitted by scripts/build-packshots.py. The masters are 1000px squares
   but nothing renders one wider than 280 CSS px, so the browser almost always
   takes the 320 or 640 tier — the shop grid drops from 4.7 MB to under 100 KB.
   The PNG stays as `src`, so a browser without webp still gets a picture. */
const PACKSHOT_TIERS = [320, 640, 1000];

export function productSrcSet(p) {
  const base = asset(`packshots/${p.slug}`);
  return PACKSHOT_TIERS.map((t) => `${base}-${t}.webp ${t}w`).join(', ');
}

export function worldLabel(w) {
  return w === 'sup' ? 'Suplementos' : 'Skincare';
}

/**
 * The shop's own SKU, which is what a customer would quote back to us and what
 * we can actually look up. The old form was built out of the price, so it
 * changed identity every time WooCommerce repriced and matched nothing in the
 * store. Products absent from the sync have no real SKU, so fall back to a
 * stable slug-derived code that at least never moves.
 */
export function sku(p) {
  return p.wooSku || 'VS-' + p.slug.slice(0, 3).toUpperCase() + '-' + p.slug.length;
}

/** The sub-type after the "·" in the kicker — "Serum", "Cápsulas", "Mascarilla". */
export function productForm(p) {
  return (p.kicker.split(' · ')[1] || '').trim();
}

/**
 * Rank the rest of the catalogue against one product for the "Va bien con" panel.
 *
 * Shared objective dominates — someone reading the creatina page is far more
 * likely to want another energía product than another powder. Same world and
 * same form are next, and price proximity only breaks ties, so the panel never
 * degenerates into "here are the four cheapest things".
 */
export function relatedProducts(cur, n = 4) {
  const scored = LISTED.filter((p) => p.slug !== cur.slug).map((p) => {
    const sharedGoals = p.goals.filter((g) => cur.goals.includes(g)).length;
    const priceGap = Math.abs(p.price - cur.price) / Math.max(p.price, cur.price);

    const score =
      sharedGoals * 40 +
      (p.w === cur.w ? 25 : 0) +
      (productForm(p) === productForm(cur) ? 12 : 0) +
      (1 - priceGap) * 10 +
      (p.was ? 4 : 0) +
      (p.best ? 3 : 0);

    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score || a.p.slug.localeCompare(b.p.slug));
  return scored.slice(0, n).map((s) => s.p);
}

/** When the catalogue was last reconciled against the live shop. */
export const CATALOG_SYNCED_AT = WOO.syncedAt;
export const STORE_URL = WOO.store;
