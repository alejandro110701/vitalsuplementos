import { Link, useSearchParams } from 'react-router-dom';
import { Button, Eyebrow, ProductCard } from '../ds/index.js';
import { GOALS, PRODUCTS, productImage } from '../data/products.js';
import { norm } from '../lib/format.js';

const WORLDS = [
  { id: 'todo', label: 'Todo' },
  { id: 'sup', label: 'Suplementos' },
  { id: 'skin', label: 'Skincare' }
];

function chipStyle(active) {
  return active
    ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' }
    : { background: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' };
}

const chipBase = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  padding: '8px 14px',
  borderRadius: 6,
  cursor: 'pointer',
  border: '1px solid',
  transition: 'var(--transition-smooth)'
};

export default function Tienda() {
  const [params, setParams] = useSearchParams();
  const world = params.get('mundo') || 'todo';
  const goal = params.get('objetivo') || 'todo';
  const q = params.get('q') || '';

  /** Filters live in the URL so a filtered catalogue is a shareable link. */
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'todo') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const needle = norm(q);
  let grid = PRODUCTS.filter(
    (p) => (world === 'todo' || p.w === world) && (goal === 'todo' || p.goals.includes(goal))
  );
  if (needle) grid = grid.filter((p) => norm(`${p.n} ${p.kicker} ${p.claim}`).includes(needle));

  const title = world === 'sup' ? 'Suplementos' : world === 'skin' ? 'Skincare' : 'Todo el catálogo';

  return (
    <div>
      <section className="vs-wrap" style={{ padding: '64px 24px 32px' }}>
        <Eyebrow>16 productos · envío a todo méxico</Eyebrow>
        <h1
          style={{
            margin: '18px 0 0',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: 'clamp(2.5rem, 7vw, 3.625rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.025em'
          }}
        >
          {title}
        </h1>
      </section>

      <div
        style={{
          position: 'sticky',
          top: 68,
          zIndex: 40,
          background: 'color-mix(in oklab, var(--vp-paper) 90%, transparent)',
          backdropFilter: 'blur(18px)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div className="vs-wrap" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {WORLDS.map((c) => (
              <button key={c.id} type="button" onClick={() => setParam('mundo', c.id)} style={{ ...chipBase, ...chipStyle(world === c.id) }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[{ id: 'todo', label: 'Cualquier objetivo' }, ...GOALS.map((g) => ({ id: g.id, label: g.label }))].map((c) => (
              <button key={c.id} type="button" onClick={() => setParam('objetivo', c.id)} style={{ ...chipBase, ...chipStyle(goal === c.id) }}>
                {c.label}
              </button>
            ))}
          </div>

          <label
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--card)',
              padding: '8px 14px',
              minWidth: 230,
              flex: '1 1 230px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="Buscar producto o marca"
              aria-label="Buscar producto o marca"
              style={{ border: 0, outline: 'none', background: 'transparent', fontSize: 13, width: '100%', color: 'var(--foreground)' }}
            />
          </label>
        </div>
      </div>

      <section className="vs-wrap" style={{ padding: '32px 24px 96px' }}>
        <p style={{ margin: '0 0 40px', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted-foreground)' }}>
          {grid.length} {grid.length === 1 ? 'producto' : 'productos'}
        </p>

        <div className="vs-catalog-grid">
          {grid.map((p) => (
            <ProductCard
              key={p.slug}
              as={Link}
              to={`/producto/${p.slug}`}
              title={p.n}
              image={productImage(p)}
              imageAlt={p.n}
              price={p.price}
              compareAt={p.was || null}
              kicker={p.kicker}
              purityLabel={p.spec}
              soldOut={p.inStock === false}
              cta="Ver producto"
            />
          ))}
        </div>

        {grid.length === 0 && (
          <div style={{ padding: '96px 0', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', fontSize: 30, letterSpacing: '-0.02em' }}>
              Sin resultados
            </h3>
            <p style={{ margin: '12px 0 24px', fontSize: 14, color: 'var(--muted-foreground)' }}>
              Prueba con “magnesio”, “niacinamida” o “cafeína”.
            </p>
            <Button variant="outline" size="lg" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
