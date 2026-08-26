import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../ds/index.js';
import { useCart } from '../lib/cart.jsx';
import { money } from '../lib/format.js';

const factLabel = {
  margin: 0,
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: 'var(--muted-foreground)'
};

const factValue = { margin: '8px 0 0', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700 };

export default function Gracias() {
  const navigate = useNavigate();
  const { order } = useCart();

  // Reached without placing an order (deep link, refresh) — nothing to confirm.
  if (!order) return <Navigate to="/" replace />;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '96px 24px' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: 'var(--muted)',
          border: '1px solid var(--secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--secondary)'
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h1
        style={{
          margin: '32px 0 0',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          textTransform: 'uppercase',
          fontSize: 'clamp(2.25rem, 6vw, 3.25rem)',
          lineHeight: 0.95,
          letterSpacing: '-0.025em'
        }}
      >
        Pedido confirmado
      </h1>
      <p style={{ margin: '20px 0 0', fontSize: 16, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
        Gracias, {order.name}. Te escribimos por WhatsApp en los próximos minutos para confirmar la dirección en{' '}
        {order.ciudad} y la hora de entrega.
      </p>

      <div style={{ display: 'flex', gap: 48, marginTop: 40, padding: '24px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div>
          <p style={factLabel}>Folio</p>
          <p style={factValue}>{order.id}</p>
        </div>
        <div>
          <p style={factLabel}>A pagar al recibir</p>
          <p style={factValue}>{money(order.total)}</p>
        </div>
        <div>
          <p style={factLabel}>Entrega</p>
          <p style={factValue}>2–5 días</p>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        {order.lines.map((l) => (
          <div key={l.n} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, padding: '14px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>{l.n}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>× {l.units}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
        <Button variant="default" size="xl" onClick={() => navigate('/tienda')}>
          Seguir comprando
        </Button>
        <Button variant="outline" size="xl" onClick={() => navigate('/')}>
          Al inicio
        </Button>
      </div>
    </div>
  );
}
