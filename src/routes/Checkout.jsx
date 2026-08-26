import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button, Eyebrow } from '../ds/index.js';
import { productImage, productSrcSet } from '../data/products.js';
import { useCart } from '../lib/cart.jsx';
import { money } from '../lib/format.js';
import { handOffToShop } from '../lib/handoff.js';
import { useTitle } from '../lib/useTitle.js';

const ERROR_COPY = {
  'productos-no-disponibles':
    'Uno de los productos de tu carrito ya no está en la tienda. Quítalo del carrito para continuar.',
  'carrito-vacio': 'Tu carrito está vacío.',
  'sin-conexion': 'No pudimos conectar con la tienda. Revisa tu conexión y vuelve a intentar.',
  'tienda-rechazo': 'La tienda no pudo tomar el pedido. Vuelve a intentar en un momento.'
};

const labelRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 14,
  padding: '16px 0 12px'
};

/**
 * The last step this front end owns. It does not take the address or the money:
 * the shop does, because only the shop can create an order that actually
 * exists. This page confirms what is being bought and hands the cart over.
 */
export default function Checkout() {
  useTitle('Checkout');
  const { lines, count, subtotal } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Nothing to check out — send them back to the cart.
  if (!lines.length) return <Navigate to="/carrito" replace />;

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      // The cart is deliberately NOT cleared here. The shopper is leaving for
      // the shop's checkout and may well come back; throwing away their basket
      // on the way out would strand them.
      window.location.assign(await handOffToShop(lines));
    } catch (err) {
      setError(ERROR_COPY[err.reason] || ERROR_COPY['tienda-rechazo']);
      setBusy(false);
    }
  };

  return (
    <div className="vs-wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
      <Eyebrow>Checkout</Eyebrow>
      <h1
        style={{
          margin: '18px 0 40px',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          textTransform: 'uppercase',
          fontSize: 'clamp(2.25rem, 6vw, 3.25rem)',
          lineHeight: 0.95,
          letterSpacing: '-0.025em'
        }}
      >
        Revisa tu pedido
      </h1>

      <div className="vs-checkout-layout">
        <div>
          <Eyebrow>Cómo se completa</Eyebrow>
          <div
            style={{
              marginTop: 16,
              border: '1px solid var(--secondary)',
              borderRadius: 12,
              background: 'var(--muted)',
              padding: '22px 24px'
            }}
          >
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Terminas en la tienda
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.65, color: 'var(--muted-foreground)' }}>
              Al continuar pasamos tu carrito a la tienda, donde capturas la dirección y eliges cómo pagar. El pedido
              queda registrado ahí y recibes un correo de confirmación con el número de pedido.
            </p>
          </div>

          <ol
            style={{
              margin: '24px 0 0',
              padding: 0,
              listStyle: 'none',
              display: 'grid',
              gap: 14,
              counterReset: 'paso'
            }}
          >
            {[
              'Confirmas los productos y las cantidades aquí.',
              'Capturas la dirección de entrega en la tienda.',
              'Eliges el método de pago y confirmas.',
              'Te llega el correo con tu número de pedido.'
            ].map((paso, i) => (
              <li key={paso} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--secondary-text)',
                    flex: 'none',
                    marginTop: 2
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>{paso}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="vs-summary">
          <p
            style={{
              margin: '0 0 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.24em',
              color: 'var(--muted-foreground)'
            }}
          >
            Tu pedido · {count} {count === 1 ? 'pieza' : 'piezas'}
          </p>

          {lines.map((l) => (
            <div
              key={l.key}
              style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: 'var(--halo-teal)',
                  boxShadow: 'inset 0 0 0 1px var(--border)',
                  flex: 'none'
                }}
              >
                <img
                  src={productImage(l.p)}
                  srcSet={productSrcSet(l.p)}
                  sizes="72px"
                  alt=""
                  width={1000}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.35 }}>
                  {l.p.n}
                </p>
                <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted-foreground)' }}>
                  {l.units} {l.units === 1 ? 'pieza' : 'piezas'}
                </p>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>{money(l.total)}</span>
            </div>
          ))}

          <div style={labelRow}>
            <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{money(subtotal)}</span>
          </div>
          <div style={{ ...labelRow, paddingBottom: 16, paddingTop: 0, borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Envío</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12 }}>Se calcula en la tienda</span>
          </div>

          {error && (
            <p
              role="alert"
              style={{ margin: '16px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--destructive, #b3261e)' }}
            >
              {error}
            </p>
          )}

          <div style={{ marginTop: 24 }}>
            <Button variant="default" size="xl" onClick={go} disabled={busy} style={{ width: '100%' }}>
              {busy ? 'Pasando tu carrito…' : 'Continuar en la tienda'}
            </Button>
          </div>

          <p
            style={{
              margin: '16px 0 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--muted-foreground)',
              lineHeight: 1.8
            }}
          >
            Envío 2–5 días · Confirmación por correo
          </p>
        </div>
      </div>
    </div>
  );
}
