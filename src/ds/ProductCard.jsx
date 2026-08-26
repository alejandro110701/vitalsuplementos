import Chip from './Chip.jsx';

/**
 * Editorial product card — vial photographed inside a circle mask on a soft
 * teal halo, chips floating outside the circle, then a mono kicker,
 * uppercase title, price row and a "ver producto" CTA hint. The signature
 * VitalPeptides commerce tile.
 */
export default function ProductCard({
  title,
  image,
  imageAlt,
  price,
  compareAt,
  currency = 'MXN',
  kicker = 'Péptido · Vial liofilizado',
  purityLabel = '≥99% HPLC',
  soldOut = false,
  cta = 'Ver producto',
  href = '#',
  as: Comp = 'a',
  className = '',
  style = {},
  ...props
}) {
  const onSale = compareAt != null && compareAt > price;
  const savePct = onSale ? Math.round((1 - price / compareAt) * 100) : 0;
  const fmt = (n) => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0 });

  // `href` belongs to an anchor only — as a Link it would fight `to`, and on a
  // div it is an invalid attribute.
  const hrefProp = Comp === 'a' ? { href } : {};

  return (
    <Comp
      {...hrefProp}
      className={`vp-product-card ${className}`}
      style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', ...style }}
      {...props}
    >
      <div style={{ position: 'relative', aspectRatio: '1 / 1', width: '100%' }}>
        {onSale && !soldOut && (
          <span style={{ position: 'absolute', left: 4, top: 8, zIndex: 2 }}>
            <Chip variant="teal">Sale</Chip>
          </span>
        )}
        {soldOut && (
          <span style={{ position: 'absolute', left: 4, top: 8, zIndex: 2 }}>
            <Chip variant="danger">Agotado</Chip>
          </span>
        )}
        <span style={{ position: 'absolute', right: 4, top: 8, zIndex: 2 }}>
          <Chip variant="outline">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--secondary)' }} />
            {purityLabel}
          </Chip>
        </span>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'inset 0 0 0 1px var(--border)',
            background: 'var(--halo-teal)'
          }}
        >
          {image && (
            <img
              src={image}
              alt={imageAlt || title}
              loading="lazy"
              style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: 'var(--muted-foreground)'
          }}
        >
          {kicker}
        </p>
        <h3
          style={{
            margin: '6px 0 0',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--foreground)'
          }}
        >
          {title}
        </h3>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          {onSale && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--muted-foreground)',
                textDecoration: 'line-through'
              }}
            >
              {fmt(compareAt)}
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>
            {fmt(price)}{' '}
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--muted-foreground)' }}>{currency}</span>
          </span>
          {onSale && (
            <span style={{ marginLeft: 'auto' }}>
              <Chip variant="soft">−{savePct}%</Chip>
            </span>
          )}
        </div>
        <span
          style={{
            marginTop: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            borderTop: '1px solid var(--border)',
            paddingTop: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: 'var(--foreground)'
          }}
        >
          {cta} <span aria-hidden>→</span>
        </span>
      </div>
    </Comp>
  );
}
