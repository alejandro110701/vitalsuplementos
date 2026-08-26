import WOO from './woo.js';

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
    best: 1,
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
    best: 2,
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
    best: 3,
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
    best: 4,
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
    spec: '50 mentas',
    claim: '40 mg de cafeína por menta, sin azúcar añadida.',
    bullets: ['40 mg de cafeína por pieza', 'Sin azúcar, endulzadas con xilitol', 'Lata de bolsillo, 50 piezas'],
    uso: '1 menta cuando la necesites. Máximo 4 al día.'
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
    n: 'Mascarilla Facial Holy Basil',
    kicker: 'Skincare · Mascarilla',
    w: 'skin',
    goals: ['piel'],
    price: 349,
    was: 499,
    spec: '1 pieza',
    claim: 'Mascarilla de tela con extracto de albahaca sagrada, para piel reactiva.',
    bullets: ['Extracto de holy basil y pantenol', 'Tela de celulosa, ajuste completo', 'Uso puntual: 15 a 20 minutos'],
    uso: 'Sobre rostro limpio, dejar 15–20 minutos y retirar. No enjuagar.'
  },
  {
    slug: 'medicube-colageno',
    n: 'Mascarilla Medicube de Colágeno',
    kicker: 'Skincare · Mascarilla',
    w: 'skin',
    goals: ['piel'],
    price: 429,
    was: 0,
    spec: '1 pieza',
    claim: 'Mascarilla facial con colágeno, en formato de un solo uso.',
    bullets: ['Colágeno hidrolizado y ácido hialurónico', 'Formato individual, sellado', 'Coreano original'],
    uso: 'Aplicar 20 minutos por la noche, dos veces por semana.'
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

export const GOALS = [
  { id: 'energia', label: 'Energía', sub: 'Creatina, cafeína, NAD+ y verdes.', icon: 'M4 14h6l-2 7 10-11h-6l2-7z' },
  { id: 'piel', label: 'Piel', sub: 'Serums con porcentaje declarado y SPF.', icon: 'M12 3s6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 6-10 6-10z' },
  { id: 'movilidad', label: 'Movilidad', sub: 'Magnesio, glucosamina y colágeno.', icon: 'M3 12h4l3-8 4 16 3-8h4' },
  { id: 'peso', label: 'Peso', sub: 'Apoyo a la rutina de entrenamiento.', icon: 'M6 7h12l2 12H4z M9 7V5a3 3 0 0 1 6 0v2' }
];

export function findProduct(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
}

/**
 * Vite rewrites asset URLs inside the bundle to match `base`, but not string
 * literals like this one — so the base is applied by hand. Without it every
 * product image 404s the moment the app is served from a subdirectory.
 */
export function productImage(p) {
  return `${import.meta.env.BASE_URL}shop/${p.slug}.png`;
}

export function worldLabel(w) {
  return w === 'sup' ? 'Suplementos' : 'Skincare';
}

export function sku(p) {
  return 'VS-' + p.slug.slice(0, 3).toUpperCase() + '-' + String(p.price).slice(0, 3);
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
  const scored = PRODUCTS.filter((p) => p.slug !== cur.slug).map((p) => {
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
