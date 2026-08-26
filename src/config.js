// Commercial + brand knobs. These mirror the editable props declared on the
// "Vital Suplementos" design canvas, so tuning the storefront here matches
// tuning it in the design.
export const PEPTIDES_URL = 'https://vitalpeptides.app';

/** Flat shipping fee in MXN, charged once per order with at least one line. */
export const SHIPPING_COST = 149;

/**
 * Per-piece discount (%) on the 2-piece pack; the 3-piece pack adds 6 more.
 *
 * Zero, because the shop is the source of truth and it sells these as simple
 * products with no pack variations and no sale prices — quoting a discount
 * WooCommerce will not honour is worse than not offering one. Add variations to
 * the products in WooCommerce, set this to match, and the pack picker returns.
 */
export const PACK_DISCOUNT = 0;

/** When true, cash on delivery is the only payment method offered at checkout. */
export const COD_ONLY = true;
