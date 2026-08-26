import { Link } from 'react-router-dom';
import { PEPTIDES_URL } from '../config.js';
import { LogoMark } from '../ds/index.js';

const colTitle = {
  margin: '0 0 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: 'var(--muted-foreground)'
};

const colList = { display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 };

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
      <div className="vs-wrap vs-footer-grid" style={{ padding: '64px 24px 40px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <LogoMark style={{ height: 26 }} />
            <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 14 }}>
              Vital<span style={{ color: 'var(--secondary)' }}>·</span>
              <span style={{ fontWeight: 500 }}>Suplementos</span>
            </span>
          </div>
          <p style={{ margin: '18px 0 0', maxWidth: 320, fontSize: 13, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
            Importación directa de suplementos y skincare. Envíos a todo México con pago contra entrega.
          </p>
        </div>

        <div>
          <p style={colTitle}>Tienda</p>
          <div style={colList}>
            <Link to="/tienda">Todo el catálogo</Link>
            <Link to="/tienda?mundo=sup">Suplementos</Link>
            <Link to="/tienda?mundo=skin">Skincare</Link>
            <Link to="/carrito">Mi carrito</Link>
          </div>
        </div>

        <div>
          <p style={colTitle}>Marca</p>
          <div style={colList}>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/peptidos">Péptidos</Link>
            <a href={PEPTIDES_URL} target="_blank" rel="noopener noreferrer">
              vitalpeptides.app
            </a>
          </div>
        </div>

        <div>
          <p style={colTitle}>Compra</p>
          <div style={{ ...colList, color: 'var(--muted-foreground)' }}>
            <span>Pago contra entrega</span>
            <span>Envío 2–5 días</span>
            <span>Reposición por daño</span>
          </div>
        </div>
      </div>

      <div
        className="vs-wrap"
        style={{
          padding: '20px 24px 40px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap'
        }}
      >
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--muted-foreground)' }}>
          © 2026 Vital Suplementos · México
        </p>
        <p style={{ margin: 0, maxWidth: 620, fontSize: 11, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
          Suplementos alimenticios y productos cosméticos: no son medicamentos. Este sitio no ofrece diagnóstico ni
          tratamiento. Los péptidos se comercializan únicamente en vitalpeptides.app, para investigación.
        </p>
      </div>
    </footer>
  );
}
