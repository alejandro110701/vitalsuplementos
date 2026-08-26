import { useNavigate } from 'react-router-dom';
import { Button, Eyebrow } from '../ds/index.js';

const PILLARS = [
  { n: '01', title: 'Etiqueta legible', copy: 'Si no podemos decir cuánto activo trae una porción, no lo vendemos.' },
  { n: '02', title: 'Sin promesas médicas', copy: 'Describimos qué es y qué contiene. Lo demás lo decide tu médico, no nuestro copy.' },
  { n: '03', title: 'Riesgo nuestro', copy: 'Pagas al recibir. Si el paquete llega dañado o incompleto, se repone.' }
];

export default function Nosotros() {
  const navigate = useNavigate();

  return (
    <div>
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <div className="vs-wrap" style={{ padding: '96px 24px' }}>
          <Eyebrow>Quiénes somos</Eyebrow>
          <h1
            style={{
              margin: '20px 0 0',
              maxWidth: '22ch',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.025em'
            }}
          >
            Traemos lo que ya funciona
          </h1>
          <p style={{ margin: '28px 0 0', maxWidth: 620, fontSize: 17, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
            Vital Suplementos es una operación mexicana de importación directa. Elegimos productos que ya tienen historia
            afuera —Corea, Estados Unidos, Europa— y los traemos con etiqueta completa: dosis por porción, lote y
            caducidad visibles. Sin fórmulas “propietarias” que esconden cuánto trae cada cápsula.
          </p>
        </div>
      </section>

      <section className="vs-wrap vs-pillars" style={{ paddingTop: 96 }}>
        {PILLARS.map((p, i) => (
          <div
            key={p.n}
            style={{
              padding: i === 0 ? '0 40px 0 0' : i === 1 ? '0 40px' : '0 0 0 40px',
              borderRight: i < 2 ? '1px solid var(--border)' : undefined
            }}
          >
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--secondary)' }}>
              {p.n}
            </p>
            <h3 style={{ margin: '16px 0 0', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', fontSize: 26, letterSpacing: '-0.02em' }}>
              {p.title}
            </h3>
            <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>{p.copy}</p>
          </div>
        ))}
      </section>

      <section className="vs-wrap" style={{ padding: '96px 24px' }}>
        <div className="vs-about-cta" style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 48, background: 'var(--card)' }}>
          <div>
            <Eyebrow accent>La otra mitad</Eyebrow>
            <h2 style={{ margin: '16px 0 0', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', fontSize: 34, letterSpacing: '-0.025em' }}>
              Vital Peptides
            </h2>
            <p style={{ margin: '14px 0 0', maxWidth: 520, fontSize: 15, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
              Misma casa, otro terreno: péptidos para investigación, con CoA por lote. Se atiende aparte porque el
              comprador y las reglas son distintas.
            </p>
          </div>
          <Button variant="outline" size="xl" onClick={() => navigate('/peptidos')}>
            Ver la pasarela
          </Button>
        </div>
      </section>
    </div>
  );
}
