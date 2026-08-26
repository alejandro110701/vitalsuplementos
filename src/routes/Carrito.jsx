import { Link, useNavigate } from 'react-router-dom';
import { Button, Eyebrow } from '../ds/index.js';
import { productImage, productSrcSet } from '../data/products.js';
import { useCart } from '../lib/cart.jsx';
import { money } from '../lib/format.js';

export default function Carrito() {
  const navigate = useNavigate();
  const { lines, count, subtotal, shipping, total, bump, drop } = useCart();

  return (
    <div className="vs-wrap" style={{ padding: '64px 24px 96px' }}>
      <Eyebrow>Carrito</Eyebrow>
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
        Tu pedido
      </h1>

      {lines.length === 0 ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: 16, background: 'var(--card)', padding: '80px 40px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 20px', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--muted-foreground)' }}>
            Todavía no hay nada aquí
          </p>
          <Button variant="default" size="xl" onClick={() => navigate('/tienda')}>
            Ver el catálogo
          </Button>
        </div>
      ) : (
        <div className="vs-cart-layout">
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {lines.map((l) => (
              <div key={l.key} className="vs-cart-line">
                <Link
                  to={`/producto/${l.p.slug}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: 999,
                    overflow: 'hidden',
                    background: 'var(--halo-teal)',
                    boxShadow: 'inset 0 0 0 1px var(--border)',
                    display: 'block'
                  }}
                >
                  <img src={productImage(l.p)} srcSet={productSrcSet(l.p)} sizes="72px" alt={l.p.n} width={1000} height={1000} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>

                <div>
                  <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--muted-foreground)' }}>
                    {l.p.kicker}
                  </p>
                  <Link to={`/producto/${l.p.slug}`} style={{ display: 'block', margin: '6px 0 0', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {l.p.n}
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {l.pack === 1 ? '1 pieza' : `${l.pack} piezas`} · {money(l.unit)} c/u
                    </span>
                    <button
                      type="button"
                      onClick={() => drop(l.key)}
                      className="vs-plain-link"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        color: 'var(--muted-foreground)',
                        borderBottom: '1px solid var(--border)'
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, height: 40, background: 'var(--card)' }}>
                    <button type="button" className="vs-stepper-btn" style={{ width: 38 }} onClick={() => bump(l.key, -1)} aria-label={`Quitar un ${l.p.n}`}>
                      −
                    </button>
                    <span style={{ width: 30, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>{l.n}</span>
                    <button type="button" className="vs-stepper-btn" style={{ width: 38 }} onClick={() => bump(l.key, 1)} aria-label={`Agregar un ${l.p.n}`}>
                      +
                    </button>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, minWidth: 84, textAlign: 'right' }}>
                    {money(l.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="vs-summary">
            <p style={{ margin: '0 0 24px', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--muted-foreground)' }}>
              Resumen · {count} {count === 1 ? 'pieza' : 'piezas'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 12 }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{money(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Envío</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{shipping ? money(shipping) : 'Gratis'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 0 24px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', fontSize: 18, letterSpacing: '-0.02em' }}>
                Total
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700 }}>{money(total)}</span>
            </div>
            <Button variant="default" size="xl" onClick={() => navigate('/checkout')} style={{ width: '100%' }}>
              Continuar al pago
            </Button>
            <p style={{ margin: '16px 0 0', fontSize: 12, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
              Pago contra entrega: no se cobra nada ahora. Confirmamos por WhatsApp antes de enviar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
