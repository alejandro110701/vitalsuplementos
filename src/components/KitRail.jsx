import { Link, useNavigate } from 'react-router-dom';
import { Button, Eyebrow } from '../ds/index.js';
import { KITS, bundleList, bundleMembers, bundlePrice } from '../data/bundles.js';
import { productImage, productSrcSet } from '../data/products.js';
import { money } from '../lib/format.js';
import { useCart } from '../lib/cart.jsx';

/**
 * The kits rail.
 *
 * Two products photographed side by side, the list price struck through and
 * the kit price next to it. Adding a kit puts its two real products in the
 * cart — there is no "kit" line, because there is no kit SKU. See
 * src/data/bundles.js.
 */
function KitCard({ b }) {
  const navigate = useNavigate();
  const { addBundle } = useCart();
  const members = bundleMembers(b);
  const list = bundleList(b);
  const price = bundlePrice(b);

  return (
    <article
      style={{
        border: '1px solid var(--border)',
        borderRadius: 16,
        background: 'var(--card)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        {members.map((p) => (
          <Link
            key={p.slug}
            to={`/producto/${p.slug}`}
            style={{
              flex: 1,
              aspectRatio: '1 / 1',
              borderRadius: 12,
              overflow: 'hidden',
              background: 'var(--halo-teal)',
              boxShadow: 'inset 0 0 0 1px var(--border)',
              display: 'block'
            }}
          >
            <img
              src={productImage(p)}
              srcSet={productSrcSet(p)}
              sizes="(max-width: 720px) 40vw, 160px"
              alt={p.n}
              width={1000}
              height={1000}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Link>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: 'var(--muted-foreground)'
          }}
        >
          {b.kicker}
        </p>
        <h3
          style={{
            margin: '8px 0 0',
            fontSize: 15,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 1.2
          }}
        >
          {b.n}
        </h3>
        <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>{b.claim}</p>
        <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
          {members.map((p) => p.n).join(' + ')}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700 }}>{money(price)}</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--muted-foreground)',
            textDecoration: 'line-through'
          }}
        >
          {money(list)}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--teal, #0f766e)'
          }}
        >
          Ahorras {money(b.save)}
        </span>
      </div>

      <Button
        variant="default"
        size="lg"
        style={{ width: '100%' }}
        onClick={() => {
          addBundle(b);
          navigate('/carrito');
        }}
      >
        Agregar kit
      </Button>
    </article>
  );
}

export default function KitRail({ title = 'Kits', heading = 'Sale más barato junto', eyebrowNote = null }) {
  if (!KITS.length) return null;

  return (
    <section className="vs-wrap" style={{ paddingTop: 96 }}>
      <div style={{ paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
        <Eyebrow>{title}</Eyebrow>
        <h2
          style={{
            margin: '14px 0 0',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}
        >
          {heading}
        </h2>
        {eyebrowNote && (
          <p style={{ margin: '14px 0 0', maxWidth: 620, fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
            {eyebrowNote}
          </p>
        )}
      </div>
      <div className="vs-grid-4" style={{ paddingTop: 40 }}>
        {KITS.map((b) => (
          <KitCard key={b.slug} b={b} />
        ))}
      </div>
    </section>
  );
}
