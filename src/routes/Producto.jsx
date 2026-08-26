import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Anaquel from '../components/Anaquel.jsx';
import BarraCompra from '../components/BarraCompra.jsx';
import Pliego from '../components/Pliego.jsx';
import { Button, Chip } from '../ds/index.js';
import { findProduct, productImage, productSrcSet, sku, worldLabel } from '../data/products.js';
import { useCart } from '../lib/cart.jsx';
import { money, packTiersEnabled, packs, unitPrice } from '../lib/format.js';

const metaLabel = {
  margin: 0,
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: 'var(--muted-foreground)'
};

export default function Producto() {
  const { slug } = useParams();
  const { add } = useCart();
  const cur = findProduct(slug);

  const [qty, setQty] = useState(1);
  const [pack, setPack] = useState(1);
  const [added, setAdded] = useState(false);
  const [barra, setBarra] = useState(false);

  const ctaRef = useRef(null);

  // A different product means a fresh configuration.
  useEffect(() => {
    setQty(1);
    setPack(1);
    setAdded(false);
  }, [slug]);

  // The buy bar docks the moment Act I's add-to-cart leaves the viewport.
  useEffect(() => {
    const node = ctaRef.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(([e]) => setBarra(!e.isIntersecting), { threshold: 0 });
    io.observe(node);
    return () => io.disconnect();
  }, [slug]);

  useEffect(() => {
    if (!added) return undefined;
    const t = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(t);
  }, [added]);

  // Every hook above runs unconditionally, so the guard sits here rather than
  // at the top: an unknown slug is a wrong URL, not a reason to sell a
  // different product at a different price.
  if (!cur) return <Navigate to="/tienda" replace />;

  const packMeta = packs();
  const unit = unitPrice(cur, pack);
  const onSale = !!cur.was;

  const handleAdd = () => {
    add(cur.slug, pack, qty);
    setQty(1);
    setAdded(true);
  };

  return (
    <>
      {/* ---- Act I · the configurator, always above the narrative ---- */}
      <div className="vs-wrap" style={{ paddingTop: 32, paddingBottom: 0 }}>
        <nav
          aria-label="Ruta"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--muted-foreground)',
            marginBottom: 40,
            flexWrap: 'wrap'
          }}
        >
          <Link to="/tienda">Tienda</Link>
          <span>·</span>
          <Link to={`/tienda?mundo=${cur.w}`}>{worldLabel(cur.w)}</Link>
          <span>·</span>
          <span style={{ color: 'var(--foreground)' }}>{cur.n}</span>
        </nav>

        <div className="vs-product-layout">
          <div className="vs-product-media">
            <div
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: 999,
                overflow: 'hidden',
                background: 'var(--halo-teal)',
                boxShadow: 'inset 0 0 0 1px var(--border)'
              }}
            >
              <img
                src={productImage(cur)}
                srcSet={productSrcSet(cur)}
                sizes="(max-width: 900px) 78vw, 520px"
                alt={cur.n}
                width={1000}
                height={1000}
                fetchpriority="high"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Percentages, not a fixed 24px inset: the parent is a circle
                  with overflow hidden, so a corner offset lands outside the arc
                  and the border-radius cuts the chip in half. At 19%/16% the
                  chip stays on the packshot at every circle size. */}
              <span style={{ position: 'absolute', left: '19%', top: '16%' }}>
                <Chip variant="outline">{cur.spec}</Chip>
              </span>
            </div>
          </div>

          <div>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--muted-foreground)' }}>
              {cur.kicker}
            </p>
            <h1
              style={{
                margin: '12px 0 0',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.025em'
              }}
            >
              {cur.n}
            </h1>
            <p style={{ margin: '20px 0 0', fontSize: 16, lineHeight: 1.65, color: 'var(--muted-foreground)', maxWidth: '46ch' }}>
              {cur.claim}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700 }}>{money(unit)}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-foreground)' }}>MXN</span>
              {onSale && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted-foreground)', textDecoration: 'line-through' }}>
                  {money(cur.was)}
                </span>
              )}
              {onSale && <Chip variant="soft">−{Math.round((1 - cur.price / cur.was) * 100)}%</Chip>}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cur.bullets.map((b) => (
                <li key={b} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--secondary)', marginTop: 2, flex: 'none' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* Hidden while the shop sells these as simple products: with no
                multi-pack price the three tiers are the same number, and the
                quantity stepper below already covers buying more than one. */}
            {packTiersEnabled && (
              <>
                <p style={{ margin: '36px 0 12px', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--muted-foreground)' }}>
                  Paquete
                </p>
                <div className="vs-pack-grid">
              {packMeta.map((f) => {
                const active = pack === f.k;
                return (
                  <button
                    key={f.k}
                    type="button"
                    onClick={() => setPack(f.k)}
                    aria-pressed={active}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      padding: '14px 16px',
                      textAlign: 'left',
                      font: 'inherit',
                      color: 'var(--foreground)',
                      border: `1px solid ${active ? 'var(--secondary)' : 'var(--border)'}`,
                      background: active ? 'var(--muted)' : 'var(--card)',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                      {f.label}
                    </div>
                    <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 13, color: active ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                      {money(unitPrice(cur, f.k))} c/u
                    </div>
                    <div style={{ marginTop: 2, fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {f.off ? `−${f.off}% por pieza` : f.note}
                    </div>
                  </button>
                );
              })}
                </div>
              </>
            )}

            {/* the sentinel wraps the controls, never the Button itself */}
            <div ref={ctaRef} style={{ display: 'flex', gap: 12, marginTop: 28, alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, height: 48, background: 'var(--card)', flex: 'none' }}>
                <button type="button" className="vs-stepper-btn" style={{ width: 44, fontSize: 16 }} onClick={() => setQty((n) => Math.max(1, n - 1))} disabled={qty <= 1} aria-label="Quitar uno">
                  −
                </button>
                <span style={{ width: 36, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }} aria-live="polite">
                  {qty}
                </span>
                <button type="button" className="vs-stepper-btn" style={{ width: 44, fontSize: 16 }} onClick={() => setQty((n) => Math.min(9, n + 1))} disabled={qty >= 9} aria-label="Agregar uno">
                  +
                </button>
              </div>
              <Button
                variant="default"
                size="xl"
                onClick={handleAdd}
                disabled={cur.inStock === false}
                style={{ flex: 1, width: '100%', opacity: cur.inStock === false ? 0.5 : 1 }}
              >
                {cur.inStock === false ? 'Agotado' : added ? 'Agregado' : `Agregar · ${money(unit * pack * qty)}`}
              </Button>
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 24, padding: 20, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--muted)' }}>
              <span style={{ color: 'var(--secondary)', flex: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 17h4V5H2v12h3" />
                  <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
                  <circle cx="7.5" cy="17.5" r="2.5" />
                  <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
              </span>
              <div>
                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  Pago contra entrega
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
                  Confirmamos por WhatsApp, llega en 2–5 días y pagas en efectivo al repartidor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Act II · the gallery ---- */}
      <div className="vs-wrap" style={{ paddingTop: 96 }}>
        <Pliego product={cur} />
      </div>

      {/* ---- Act III · the spec sheet ---- */}
      <div className="vs-wrap" style={{ paddingTop: 64, paddingBottom: 0 }}>
        <div id="ficha" style={{ maxWidth: 720, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
          <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <p style={{ ...metaLabel, fontSize: 10, letterSpacing: '0.22em' }}>Modo de uso</p>
            <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.7 }}>{cur.uso}</p>
          </div>
          <div className="vs-meta-grid" style={{ padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p style={metaLabel}>Presentación</p>
              <p style={{ margin: '8px 0 0', fontSize: 14 }}>{cur.spec}</p>
            </div>
            <div>
              <p style={metaLabel}>Categoría</p>
              <p style={{ margin: '8px 0 0', fontSize: 14 }}>{worldLabel(cur.w)}</p>
            </div>
            <div>
              <p style={metaLabel}>SKU</p>
              <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{sku(cur)}</p>
            </div>
          </div>
          {cur.permalink && (
            <p style={{ margin: '20px 0 0', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
              <a href={cur.permalink} target="_blank" rel="noopener noreferrer" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 2 }}>
                Ver en la tienda →
              </a>
            </p>
          )}
          {/* The Mexican supplement legend is required for what it covers and
              wrong for what it does not: half this catalogue is cosmetic, and a
              sheet mask has no "consumo". Each world carries its own wording. */}
          <p style={{ margin: '20px 0 0', fontSize: 12, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
            {cur.w === 'skin'
              ? 'Producto cosmético de uso externo. No es medicamento. Evita el contacto con los ojos y suspende su uso si aparece irritación.'
              : 'Suplemento alimenticio. No es medicamento. El consumo de este producto es responsabilidad de quien lo recomienda y de quien lo usa.'}
          </p>
        </div>
      </div>

      {/* ---- Act IV · the shelf ---- */}
      <div className="vs-wrap">
        <Anaquel current={cur} />
      </div>

      {/* last in the DOM, so keyboard users reach the in-page control first */}
      <BarraCompra
        product={cur}
        image={productImage(cur)}
        imageSrcSet={productSrcSet(cur)}
        unit={unit}
        pack={pack}
        qty={qty}
        onInc={() => setQty((n) => Math.min(9, n + 1))}
        onDec={() => setQty((n) => Math.max(1, n - 1))}
        onAdd={handleAdd}
        added={added}
        show={barra}
      />
    </>
  );
}
