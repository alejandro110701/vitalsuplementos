// Commercial + brand knobs. These mirror the editable props declared on the
// "Vital Suplementos" design canvas, so tuning the storefront here matches
// tuning it in the design.
export const PEPTIDES_URL = 'https://vitalpeptides.app';

/*
 * There is deliberately no SHIPPING_COST here any more.
 *
 * It used to be 149 while WooCommerce had no shipping zones and charged
 * nothing, so the total the shopper saw was never the total they were asked
 * for. Delivery is now probed from the shop by `npm run sync:woo` and read
 * through shippingFor() in src/data/products.js — change it in WooCommerce and
 * re-sync, exactly like prices.
 *
 * Worth knowing when you do: Dropi bills the freight against you either way.
 * It is billable weight (the greater of real and volumetric), route and service
 * type, quoted only inside the Dropi panel — so nothing here can compute it.
 * Offering free delivery is a pricing decision, not a Dropi feature.
 */

/**
 * Per-piece discount (%) on the 2-piece pack; the 3-piece pack adds 6 more.
 *
 * Zero, because the shop is the source of truth and it sells these as simple
 * products with no pack variations and no sale prices — quoting a discount
 * WooCommerce will not honour is worse than not offering one. Add variations to
 * the products in WooCommerce, set this to match, and the pack picker returns.
 */
export const PACK_DISCOUNT = 0;

/**
 * False because cash on delivery is not the ONLY method: the shop has both the
 * `cod` gateway and Clip's card redirect enabled, and the shopper picks between
 * them on WooCommerce's checkout. The storefront may promise pago contra
 * entrega because it is genuinely offered — it just must not promise it is the
 * only option. Nothing reads this today; it documents the shop's state.
 */
export const COD_ONLY = false;
