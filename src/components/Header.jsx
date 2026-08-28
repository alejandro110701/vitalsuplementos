import { Link, useNavigate } from 'react-router-dom';
import { LogoMark } from '../ds/index.js';
import { useCart } from '../lib/cart.jsx';

/*
 * "Péptidos" was the fourth item here, accented teal. Removed 28 Aug 2026.
 *
 * Not because the peptide business should be hidden — it keeps its brand
 * section on the home page, both footer links and the legal line, and that
 * referral is the point. The primary nav is specifically the thing an
 * automated policy classifier and a human reviewer read as the shop's product
 * categories, and research peptides are not advertisable alongside suplementos
 * alimenticios: the same adjacency is a problem for Google Ads, for Merchant
 * Center and for the COFEPRIS permiso de publicidad at once.
 *
 * Prominence is the lever, not presence. Anyone looking for the peptide line
 * still finds it one scroll down and in the footer of every page.
 */
const NAV = [
  { label: 'Tienda', to: '/tienda' },
  { label: 'Suplementos', to: '/tienda?mundo=sup' },
  { label: 'Skincare', to: '/tienda?mundo=skin' },
  { label: 'Nosotros', to: '/nosotros' }
];

/**
 * Brand and cart share one row; the nav is a sibling of that row, not a child.
 * On a phone the row keeps brand and cart on the top line and the nav drops
 * beneath as a scrollable strip — four items, a wordmark and a cart cannot fit
 * across 375px, and the cart is the one thing that must never be pushed off.
 */
export default function Header() {
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="vs-header">
      <div className="vs-wrap vs-header__inner">
        <div className="vs-header__row">
          <Link to="/" className="vs-header__brand">
            <LogoMark style={{ height: 26 }} />
            <span className="vs-header__wordmark">
              Vital<span style={{ color: 'var(--secondary)' }}>·</span>
              <span style={{ fontWeight: 500 }}>Suplementos</span>
            </span>
          </Link>

          <button
            type="button"
            className="vs-cart-btn"
            onClick={() => navigate('/carrito')}
            aria-label={`Carrito, ${count} ${count === 1 ? 'pieza' : 'piezas'}`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
              {count}
            </span>
          </button>
        </div>

        <nav className="vs-header__nav" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="vs-nav-link"
              data-accent={item.accent ? 'true' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
