import { LISTED, findProduct } from './products.js';

/**
 * Kits: two products sold together for less than the sum of their prices.
 *
 * The shop cannot sell a kit as its own SKU. Fulfilment runs through Dropi, and
 * Dropi ships the supplier's products — an invented "kit" SKU has nothing
 * behind it in the supplier's catalogue, so the order would arrive at Dropi
 * pointing at a product that does not exist. So a kit here is not a product at
 * all: it is two real products plus a WooCommerce coupon that takes the
 * difference off the cart. The order that reaches Dropi contains the two real
 * lines, exactly as if the shopper had added them by hand.
 *
 * `coupon` must match a coupon that exists in WooCommerce with:
 *   discount_type  fixed_cart
 *   amount         = `save` below
 *   product_ids    = the members' WooCommerce ids
 *   individual_use false, so two kits in one cart both apply
 *
 * `save` is duplicated here on purpose: this file is what the storefront shows,
 * the coupon is what the shop charges, and a mismatch between them is a lie the
 * shopper discovers at checkout. Keep them equal.
 */
export const BUNDLES = [
  {
    slug: 'kit-anua',
    coupon: 'kit-anua',
    n: 'Rutina Anua completa',
    kicker: 'Kit · Skincare coreano',
    items: ['serum-anua', 'anua-pdrn-mist'],
    save: 199,
    claim: 'El serum de niacinamida para las manchas y la bruma PDRN para el resto del día.'
  },
  {
    slug: 'kit-poros',
    coupon: 'kit-poros',
    n: 'Kit calma y poros',
    kicker: 'Kit · Skincare coreano',
    items: ['anua-azelaico', 'medicube-zero-pore'],
    save: 149,
    claim: 'La mascarilla de arcilla una o dos veces por semana; el serum de azelaico las noches restantes.'
  },
  {
    slug: 'kit-longevidad',
    coupon: 'kit-longevidad',
    n: 'Kit longevidad',
    kicker: 'Kit · Suplementos',
    items: ['nad-mens', 'neocell-colageno'],
    save: 249,
    claim: 'Precursores de NAD+ por la mañana y 20 g de colágeno al día.'
  },
  {
    slug: 'kit-fuerza',
    coupon: 'kit-fuerza',
    n: 'Kit fuerza',
    kicker: 'Kit · Suplementos',
    items: ['beast-bites-creatina', 'megared-krill'],
    save: 199,
    claim: 'Creatina en gomita y omega-3 de krill: las dos que sí se toman todos los días.'
  },
  {
    slug: 'kit-mujer',
    coupon: 'kit-mujer',
    n: 'Kit equilibrio',
    kicker: 'Kit · Suplementos',
    items: ['peach-inositol', 'goli-ashwagandha'],
    save: 129,
    claim: 'Inositol con DIM y magnesio, más ashwagandha KSM-66 en gomita.'
  }
];

/** A kit is only offerable when every member is live in the shop. */
function membersOf(b) {
  return b.items.map(findProduct).filter(Boolean);
}

export function bundleMembers(b) {
  return membersOf(b);
}

/** List price: what the same two products cost bought separately, today. */
export function bundleList(b) {
  return membersOf(b).reduce((s, p) => s + p.price, 0);
}

export function bundlePrice(b) {
  return bundleList(b) - b.save;
}

/**
 * Kits whose members are all listed. A kit missing a member would quote a
 * price for something the shopper cannot complete, so it simply disappears.
 */
export const KITS = BUNDLES.filter((b) => {
  const ms = membersOf(b);
  return ms.length === b.items.length && ms.every((p) => LISTED.includes(p));
});

/**
 * Which kits a cart currently qualifies for.
 *
 * One kit counts once however many copies of its members are in the cart,
 * because the WooCommerce coupon behind it is a fixed cart discount and
 * WooCommerce applies it once. Counting twice here would show a total the
 * checkout will not honour.
 */
export function activeBundles(lines) {
  const have = new Set(lines.filter((l) => l.units > 0).map((l) => l.p.slug));
  return KITS.filter((b) => b.items.every((s) => have.has(s)));
}

export function bundleDiscount(lines) {
  return activeBundles(lines).reduce((s, b) => s + b.save, 0);
}
