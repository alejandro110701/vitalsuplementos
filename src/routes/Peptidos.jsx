import { useNavigate } from 'react-router-dom';
import { PEPTIDES_URL } from '../config.js';
import { Button, Chromatogram, Eyebrow } from '../ds/index.js';
import { useTitle } from '../lib/useTitle.js';

const FACTS = [
  {
    title: 'Qué es',
    copy: 'Un catálogo separado de péptidos liofilizados con pureza medida por HPLC y certificado de análisis por lote.'
  },
  {
    title: 'Para quién',
    copy: 'Clínicas, médicos y compradores profesionales. Para investigación, no para consumo humano.'
  },
  {
    title: 'Cómo se compra',
    copy: 'Directo en vitalpeptides.app, con su propio carrito, su facturación y su asesoría. Tu cuenta de la tienda no se mezcla.'
  }
];

export default function Peptidos() {
  useTitle('Péptidos');
  const navigate = useNavigate();

  return (
    <div>
      <section className="vp-bg-dots" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="vs-wrap vs-pep-hero" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div>
            <Eyebrow accent>Vital · Peptides</Eyebrow>
            <h1
              style={{
                margin: '22px 0 0',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                lineHeight: 0.93,
                letterSpacing: '-0.025em'
              }}
            >
              Los péptidos tienen su propio sitio
            </h1>
            <p style={{ margin: '26px 0 0', maxWidth: 560, fontSize: 17, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
              En esta tienda no vendemos péptidos y no los vamos a vender: son producto para investigación, con otro marco
              y otro comprador. Viven en <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>vitalpeptides.app</span>,
              la otra mitad de la casa.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
              <Button variant="default" size="xl" as="a" href={PEPTIDES_URL} target="_blank" rel="noopener noreferrer">
                Ir a Vital Peptides →
              </Button>
              <Button variant="ghost" size="xl" onClick={() => navigate('/tienda')}>
                Quedarme en la tienda
              </Button>
            </div>
          </div>
          <div style={{ color: 'var(--secondary)' }}>
            <Chromatogram style={{ width: '100%', height: 'auto' }} />
            <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted-foreground)' }}>
              Cromatograma representativo · CoA por lote
            </p>
          </div>
        </div>
      </section>

      <section className="vs-wrap" style={{ paddingTop: 96 }}>
        <div className="vs-pillars" style={{ borderTop: '1px solid var(--border)' }}>
          {FACTS.map((f, i) => (
            <div
              key={f.title}
              style={{
                padding: i === 0 ? '40px 40px 40px 0' : i === 1 ? '40px' : '40px 0 40px 40px',
                borderRight: i < 2 ? '1px solid var(--border)' : undefined
              }}
            >
              <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--secondary-text)' }}>
                {f.title}
              </p>
              <p style={{ margin: '16px 0 0', fontSize: 15, lineHeight: 1.7 }}>{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="vs-wrap" style={{ paddingTop: 72, paddingBottom: 96 }}>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 16,
            background: 'var(--vp-ink)',
            color: '#fff',
            padding: '56px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 40,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', fontSize: 34, lineHeight: 1, letterSpacing: '-0.025em' }}>
              Continuar en Vital Peptides
            </h2>
            <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.62)' }}>
              Abre en una pestaña nueva · tu carrito de aquí se queda
            </p>
          </div>
          <Button variant="secondary" size="xl" as="a" href={PEPTIDES_URL} target="_blank" rel="noopener noreferrer">
            vitalpeptides.app →
          </Button>
        </div>
      </section>
    </div>
  );
}
