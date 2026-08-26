import { Link, useNavigate } from 'react-router-dom';
import { LogoMark } from '../ds/index.js';
import { useCart } from '../lib/cart.jsx';

const NAV = [
  { label: 'Tienda', to: '/tienda' },
  { label: 'Suplementos', to: '/tienda?mundo=sup' },
  { label: 'Skincare', to: '/tienda?mundo=skin' },
  { label: 'Péptidos', to: '/peptidos', accent: true },
  { label: 'Nosotros', to: '/nosotros' }
];

export default function Header() {
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        height: 68,
        background: 'color-mix(in oklab, var(--vp-paper) 88%, transparent)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div
        className="vs-wrap"
        style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 32 }}
      >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <LogoMark style={{ height: 26 }} />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontSize: 15
            }}
          >
            Vital<span style={{ color: 'var(--secondary)' }}>·</span>
            <span style={{ fontWeight: 500 }}>Suplementos</span>
          </span>
        </Link>

        <nav
          style={{ display: 'flex', alignItems: 'center', gap: 28, marginLeft: 'auto', flexWrap: 'wrap' }}
          aria-label="Principal"
        >
          {NAV.map((item) => (
            <Link key={item.label} to={item.to} className="vs-nav-link" data-accent={item.accent ? 'true' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <button type="button" className="vs-cart-btn" onClick={() => navigate('/carrito')} aria-label={`Carrito, ${count} piezas`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
            {count}
          </span>
        </button>
      </div>
    </header>
  );
}
