/**
 * Hand the storefront's cart over to WooCommerce.
 *
 * This front end cannot create an order by itself. Doing that needs the shop's
 * REST consumer key, and a key that ships inside a JavaScript bundle is a
 * published key. So instead of pretending, we load the cart into WooCommerce's
 * own session through its public Store API and send the shopper to the shop's
 * checkout, where a real order is created, stock moves, and the confirmation
 * email actually goes out.
 *
 * The Store API needs no key: it is the same public API the shop's own blocks
 * use, authenticated by the visitor's session cookie plus a nonce it hands out.
 * Every request here is same-origin, because the storefront is deployed onto
 * the WordPress site itself.
 */

/* Root-absolute, not relative: WordPress serves these from the site root
   whether this build sits at / or at /tienda/. */
const STORE_API = '/wp-json/wc/store/v1';
export const SHOP_CHECKOUT_URL = '/checkout/';

export class HandoffError extends Error {
  constructor(reason, detail) {
    super(reason);
    this.reason = reason;
    this.detail = detail;
  }
}

/** The Store API rotates its nonce, returning a fresh one on most responses. */
function freshNonce(res, current) {
  return res.headers.get('Nonce') || current;
}

async function storeApi(path, { method = 'GET', nonce, body } = {}) {
  let res;
  try {
    res = await fetch(`${STORE_API}${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(nonce ? { Nonce: nonce } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (cause) {
    throw new HandoffError('sin-conexion', cause.message);
  }
  return res;
}

/**
 * Replace the WooCommerce cart with these lines, then return its checkout URL.
 *
 * Replace, not append. The shop's cart lives in a session cookie and outlives
 * this page, so a shopper who hands off, comes back and hands off again would
 * otherwise arrive at checkout with everything counted twice.
 *
 * Sequential on purpose: WooCommerce mutates one session cart and rotates the
 * nonce as it goes, so firing these in parallel drops lines.
 *
 * @param {Array<{p: object, units: number}>} lines cart lines from useCart()
 * @returns {Promise<string>} URL of the shop's checkout
 */
export async function handOffToShop(lines) {
  if (!lines.length) throw new HandoffError('carrito-vacio');

  // Anything without a wooId is not in the shop's catalogue, so WooCommerce
  // could not charge for it and the order would silently come up short.
  const missing = lines.filter((l) => !l.p || !l.p.wooId);
  if (missing.length) {
    throw new HandoffError('productos-no-disponibles', missing.map((l) => (l.p ? l.p.n : '?')));
  }

  const opening = await storeApi('/cart');
  if (!opening.ok) throw new HandoffError('tienda-rechazo', `cart: HTTP ${opening.status}`);
  let nonce = freshNonce(opening, null);

  const emptied = await storeApi('/cart/items', { method: 'DELETE', nonce });
  // A failed clear is not worth blocking a sale over — the shopper reviews the
  // full cart on the shop's checkout before paying — but it must not be silent.
  if (emptied.ok) nonce = freshNonce(emptied, nonce);
  else console.warn('handoff: could not empty the shop cart', emptied.status);

  for (const line of lines) {
    const added = await storeApi('/cart/add-item', {
      method: 'POST',
      nonce,
      body: { id: line.p.wooId, quantity: line.units }
    });
    if (!added.ok) throw new HandoffError('tienda-rechazo', `${line.p.n}: HTTP ${added.status}`);
    nonce = freshNonce(added, nonce);
  }

  return SHOP_CHECKOUT_URL;
}
