import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { COD_ONLY } from '../config.js';
import { Button, Eyebrow } from '../ds/index.js';
import { productImage, productSrcSet } from '../data/products.js';
import { useCart } from '../lib/cart.jsx';
import { money } from '../lib/format.js';

const ESTADOS = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'CDMX',
  'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos',
  'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
  'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
  'Veracruz', 'Yucatán', 'Zacatecas'
];

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: 'var(--muted-foreground)',
  marginBottom: 8
};

const controlStyle = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  fontSize: 14,
  color: 'var(--foreground)',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 8
};

const errStyle = {
  margin: '8px 0 0',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: 'var(--destructive)'
};

/** Validation rules transcribed from the design's `submit()`. */
function validate(f) {
  const e = {};
  if (!f.nombre || f.nombre.trim().length < 4) e.nombre = 'Escribe tu nombre completo';
  if (!/^[0-9]{10}$/.test((f.tel || '').replace(/\D/g, ''))) e.tel = '10 dígitos, sin espacios';
  if (!f.calle || f.calle.trim().length < 5) e.calle = 'Calle y número';
  if (!f.colonia || f.colonia.trim().length < 3) e.colonia = 'Colonia o fraccionamiento';
  if (!/^[0-9]{5}$/.test(f.cp || '')) e.cp = 'Código postal de 5 dígitos';
  if (!f.ciudad || f.ciudad.trim().length < 3) e.ciudad = 'Ciudad';
  if (!f.estado) e.estado = 'Selecciona tu estado';
  return e;
}

function Field({ id, label, hint, value, onChange, error, placeholder, wide, children }) {
  return (
    <div className={wide ? 'vs-field-wide' : undefined}>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {hint && <span style={{ textTransform: 'none', letterSpacing: 0 }}> {hint}</span>}
      </label>
      {children || (
        <input
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          style={{ ...controlStyle, borderColor: error ? 'var(--destructive)' : 'var(--border)' }}
        />
      )}
      {error && (
        <p id={`${id}-err`} style={errStyle}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { lines, count, subtotal, shipping, total, clear, setOrder } = useCart();
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  // Nothing to check out — send them back to the cart.
  if (lines.length === 0) return <Navigate to="/carrito" replace />;

  const field = (k) => (e) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setOrder({
      id: 'VS-' + Math.floor(100000 + Math.random() * 899999),
      lines: lines.map((l) => ({ n: l.p.n, units: l.units, total: l.total })),
      total,
      name: form.nombre.trim().split(' ')[0],
      ciudad: form.ciudad,
      tel: form.tel
    });
    clear();
    navigate('/gracias', { replace: true });
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
        Datos de entrega
      </h1>

      <form className="vs-checkout-layout" onSubmit={submit} noValidate>
        <div>
          <div className="vs-field-grid">
            <Field id="nombre" label="Nombre completo" wide placeholder="Como aparece en tu identificación" value={form.nombre || ''} onChange={field('nombre')} error={errors.nombre} />
            <Field id="tel" label="WhatsApp" placeholder="10 dígitos" value={form.tel || ''} onChange={field('tel')} error={errors.tel} />
            <Field id="cp" label="Código postal" placeholder="00000" value={form.cp || ''} onChange={field('cp')} error={errors.cp} />
            <Field id="calle" label="Calle y número" wide placeholder="Av. Insurgentes Sur 1234, int. 5" value={form.calle || ''} onChange={field('calle')} error={errors.calle} />
            <Field id="colonia" label="Colonia" placeholder="Colonia o fraccionamiento" value={form.colonia || ''} onChange={field('colonia')} error={errors.colonia} />
            <Field id="ciudad" label="Ciudad" placeholder="Ciudad o municipio" value={form.ciudad || ''} onChange={field('ciudad')} error={errors.ciudad} />
            <Field id="estado" label="Estado" error={errors.estado}>
              <select
                id="estado"
                value={form.estado || ''}
                onChange={field('estado')}
                aria-invalid={errors.estado ? 'true' : undefined}
                style={{ ...controlStyle, padding: '0 12px', borderColor: errors.estado ? 'var(--destructive)' : 'var(--border)' }}
              >
                <option value="">Selecciona</option>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="ref" label="Referencias" hint="(opcional)" placeholder="Entre calles, color de fachada" value={form.ref || ''} onChange={field('ref')} />
          </div>

          <div style={{ marginTop: 48 }}>
            <Eyebrow>Forma de pago</Eyebrow>
            <div style={{ marginTop: 16, border: '1px solid var(--secondary)', borderRadius: 12, background: 'var(--muted)', padding: '22px 24px', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <span style={{ width: 18, height: 18, borderRadius: 999, border: '5px solid var(--secondary)', background: 'var(--card)', marginTop: 2, flex: 'none' }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Pago contra entrega
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.65, color: 'var(--muted-foreground)' }}>
                  Efectivo al repartidor. No pedimos tarjeta ni anticipo. Te escribimos por WhatsApp para confirmar antes
                  de que salga el paquete.
                </p>
              </div>
            </div>

            {!COD_ONLY && (
              <div style={{ marginTop: 12, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)', padding: '22px 24px', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <span style={{ width: 18, height: 18, borderRadius: 999, border: '1px solid var(--border)', background: 'var(--card)', marginTop: 2, flex: 'none' }} />
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Transferencia SPEI
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.65, color: 'var(--muted-foreground)' }}>
                    Te enviamos los datos por WhatsApp. El pedido sale en cuanto se acredita.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="vs-summary">
          <p style={{ margin: '0 0 20px', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--muted-foreground)' }}>
            Tu pedido · {count} {count === 1 ? 'pieza' : 'piezas'}
          </p>
          {lines.map((l) => (
            <div key={l.key} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, overflow: 'hidden', background: 'var(--halo-teal)', boxShadow: 'inset 0 0 0 1px var(--border)', flex: 'none' }}>
                <img src={productImage(l.p)} srcSet={productSrcSet(l.p)} sizes="72px" alt="" width={1000} height={1000} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.35 }}>
                  {l.p.n}
                </p>
                <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted-foreground)' }}>
                  {l.pack === 1 ? '1 pieza' : `${l.pack} piezas`} × {l.n}
                </p>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>{money(l.total)}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '16px 0 12px' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{money(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Envío</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{shipping ? money(shipping) : 'Gratis'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 0 24px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', fontSize: 18, letterSpacing: '-0.02em' }}>
              A pagar
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700 }}>{money(total)}</span>
          </div>
          <Button variant="default" size="xl" type="submit" style={{ width: '100%' }}>
            Confirmar pedido
          </Button>
          <p style={{ margin: '16px 0 0', fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
            Envío 2–5 días · Pago al recibir
          </p>
        </div>
      </form>
    </div>
  );
}
