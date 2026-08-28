import React from 'react';

/**
 * Keeps one broken render from blanking the whole storefront.
 *
 * React 18 unmounts the entire tree when a render throws, so without this the
 * shopper gets an empty white document — no header, no error, no way back. On
 * organic traffic that is a bad session; on a paid click it is a burnt click
 * that also fails Google's destination requirements, because the landing page
 * genuinely renders nothing.
 *
 * The fallback deliberately offers the catalogue and WhatsApp rather than a
 * reload: whatever threw will throw again on the same URL, so "intenta de
 * nuevo" would be advice that cannot work.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // Nothing collects this yet. It still belongs in the console, because the
    // alternative is a silent blank page with no trace of what threw.
    console.error('Storefront render failed:', error, info?.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main
        style={{
          minHeight: '70vh',
          display: 'grid',
          placeItems: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
          color: 'var(--foreground)'
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <p
            style={{
              margin: '0 0 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--muted-foreground)'
            }}
          >
            Algo se rompió de nuestro lado
          </p>
          <h1 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.25 }}>
            No pudimos mostrar esta página
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
            El catálogo sigue disponible y tu carrito no se perdió.
          </p>
          <a
            href="#/tienda"
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              borderRadius: 6,
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Ver el catálogo
          </a>
        </div>
      </main>
    );
  }
}
