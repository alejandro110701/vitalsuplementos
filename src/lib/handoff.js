/**
 * Hand the storefront's cart over to WooCommerce.
 *
 * This front end cannot create an order by itself. Doing that needs the shop's
 * REST consumer key, and a key that ships inside a JavaScript bundle is a
 * published key. So instead of pretending, we replay each cart line into
 * WooCommerce's own session with ordinary add-to-cart requests and then send
 * the shopper to the shop's checkout, where a real order is created, stock
 * moves, and the confirmation emails actually go out.
 *
 * The requests go to /cart/ rather than /. Once this build is deployed to the
 * site root, / is our static index.html and would never reach WordPress at all,
 * while /cart/ is a WordPress page wherever the build happens to live. Same
 * origin either way, so the session cookie WooCommerce sets is kept.
 */

/** A WordPress page, so it reaches PHP whether we sit at / or at /tienda/. */
const ADD_TO_CART_PATH = 'cart/';

/** WooCommerce's own checkout, which collects the address and takes payment. */
export const SHOP_CHECKOUT_PATH = 'checkout/';

/** Resolve against the document, so this works at any deploy depth. */
function shopUrl(path) {
  return new URL(path, window.location.href.split('#')[0]).toString();
}

export class HandoffError extends Error {
  constructor(reason, detail) {
    super(reason);
    this.reason = reason;
    this.detail = detail;
  }
}

/**
 * Push every line into the WooCommerce cart, then return the checkout URL.
 *
 * Sequential on purpose: WooCommerce mutates one session cart, and firing the
 * adds in parallel makes the last writer win and silently drops lines.
 *
 * @param {Array<{p: object, units: number}>} lines cart lines from useCart()
 * @returns {Promise<string>} absolute URL of the shop's checkout
 */
export async function handOffToShop(lines) {
  const sellable = lines.filter((l) => l.p && l.p.wooId);

  // Anything without a wooId is not in the shop's catalogue, so WooCommerce
  // could not charge for it and the order would silently come up short.
  if (sellable.length !== lines.length) {
    throw new HandoffError(
      'productos-no-disponibles',
      lines.filter((l) => !l.p || !l.p.wooId).map((l) => (l.p ? l.p.n : '?'))
    );
  }
  if (!sellable.length) throw new HandoffError('carrito-vacio');

  for (const line of sellable) {
    const url = shopUrl(`${ADD_TO_CART_PATH}?add-to-cart=${line.p.wooId}&quantity=${line.units}`);
    let res;
    try {
      res = await fetch(url, { credentials: 'same-origin', redirect: 'follow' });
    } catch (cause) {
      throw new HandoffError('sin-conexion', cause.message);
    }
    if (!res.ok) throw new HandoffError('tienda-rechazo', `${line.p.n}: HTTP ${res.status}`);
  }

  return shopUrl(SHOP_CHECKOUT_PATH);
}
