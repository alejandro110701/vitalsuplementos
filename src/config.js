// Commercial + brand knobs. These mirror the editable props declared on the
// "Vital Suplementos" design canvas, so tuning the storefront here matches
// tuning it in the design.
export const PEPTIDES_URL = 'https://vitalpeptides.app';

/**
 * Flat shipping fee in MXN, charged once per order with at least one line.
 *
 * Zero, for the same reason PACK_DISCOUNT is zero: the shop is the source of
 * truth and it has no shipping zones configured — the Store API reports
 * shipping_rates: [] and needs_shipping: false — so WooCommerce charges nothing
 * for delivery. Quoting a fee the shop will not collect made our total differ
 * from the one the customer is actually asked to pay. Configure a shipping zone
 * in WooCommerce and the shop's own checkout will show it.
 */
export const SHIPPING_COST = 0;

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
 * Payment is not chosen here any more — WooCommerce's checkout offers whatever
 * gateways the shop has enabled, and this front end must not claim otherwise.
 * Kept only so the value's absence is deliberate rather than an oversight.
 */
export const COD_ONLY = false;
