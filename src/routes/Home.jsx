import { Link, useNavigate } from 'react-router-dom';
import { Button, Chromatogram, Eyebrow, ManifestoBand, ProductCard, StatBlock } from '../ds/index.js';
import { GOALS, LISTED, findProduct, productImage, productSrcSet } from '../data/products.js';
import { useTitle } from '../lib/useTitle.js';

const HERO_TILES = ['serum-anua', 'creatina', 'glutation-gomas', 'tocobo-barra', 'mentas-cafeina'];

const sectionH2 = {
  margin: '14px 0 0',
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  textTransform: 'uppercase',
  fontSize: 40,
  lineHeight: 1,
  letterSpacing: '-0.025em'
};

function WorldCard({ to, kicker, title, copy, image, imageSrcSet, imageAlt, dark }) {
  return (
    <Link
      to={to}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 16,
        background: dark ? 'var(--vp-ink)' : 'var(--muted)',
        color: dark ? '#fff' : 'inherit',
        border: dark ? 'none' : '1px solid var(--border)',
        padding: 'clamp(28px, 7vw, 44px) clamp(24px, 7vw, 40px)',
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
            color: dark ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)'
          }}
        >
          {kicker}
        </p>
        <h2
          style={{
            margin: '16px 0 0',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            textTransform: 'uppercase',
            // "SUPLEMENTOS" is 11 uppercase characters; at a fixed 46px it ran
            // 43px past the card on a 375px phone. Scale it with the viewport.
            fontSize: 'clamp(30px, 8.4vw, 46px)',
            lineHeight: 0.95,
            letterSpacing: '-0.025em'
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: '16px 0 0',
            maxWidth: 320,
            fontSize: 15,
            lineHeight: 1.65,
            color: dark ? 'rgba(255,255,255,0.66)' : 'var(--muted-foreground)'
          }}
        >
          {copy}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
            borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.5)' : 'var(--foreground)'}`,
            paddingBottom: 4,
            whiteSpace: 'nowrap'
          }}
        >
          Ver los 8 →
        </span>
        <div
          style={{
            width: 'clamp(112px, 32vw, 172px)',
            height: 'clamp(112px, 32vw, 172px)',
            borderRadius: 999,
            overflow: 'hidden',
            background: '#fff',
            margin: '0 -8px -8px 0',
            flex: 'none'
          }}
        >
          <img
            src={image}
            srcSet={imageSrcSet}
            sizes="(max-width: 720px) 32vw, 172px"
            alt={imageAlt}
            width={1000}
            height={1000}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  useTitle(null);
  const navigate = useNavigate();
  const best = LISTED.filter((p) => p.best).sort((a, b) => a.best - b.best);

  return (
    <div>
      {/* ---- hero ---- */}
      <section className="vp-bg-grid" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div
          className="vs-wrap"
          style={{ paddingTop: 104, paddingBottom: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.32em',
              color: 'var(--muted-foreground)',
              animation: 'vsFade .9s both'
            }}
          >
            Suplementos y skincare · México
          </p>
          <h1
            style={{
              margin: '28px 0 0',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: 'clamp(3rem, 9vw, 7rem)',
              lineHeight: 0.9,
              letterSpacing: '-0.025em',
              maxWidth: '15ch',
              animation: 'vsRise 1s .06s both'
            }}
          >
            Criterio, no promesas
          </h1>
          <p
            style={{
              margin: '32px 0 0',
              maxWidth: 620,
              fontSize: 17,
              lineHeight: 1.65,
              color: 'var(--muted-foreground)',
              textWrap: 'pretty',
              animation: 'vsRise 1s .16s both'
            }}
          >
            Importamos suplementos y skincare que ya se usan afuera. No pagas nada por adelantado: el dinero cambia
            de manos cuando el paquete está en las tuyas.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center', animation: 'vsRise 1s .26s both' }}>
            <Button variant="default" size="xl" onClick={() => navigate('/tienda')}>
              Ver la tienda
            </Button>
            {/* Was "Línea de péptidos". Moved out of the hero on 28 Aug 2026:
                the hero and the header nav are what an ad reviewer, a Merchant
                Center reviewer and a COFEPRIS inspector read as "what this shop
                sells", and research peptides are not advertisable here. The
                peptide business keeps its brand section further down the page,
                the footer links and the legal line — presence is fine, top-of-
                page prominence is what creates the review problem.

                Skincare replaces it because "skincare coreano méxico" is the
                one head query in this catalogue with no Amazon and no Mercado
                Libre in the results. */}
            <Button variant="outline" size="xl" onClick={() => navigate('/tienda?mundo=skin')}>
              Skincare coreano
            </Button>
          </div>

          <div className="vs-hero-tiles">
            {HERO_TILES.map((slug) => {
              const p = findProduct(slug);
              if (!p) return null;
              return (
                <Link key={slug} to={`/producto/${p.slug}`} style={{ animation: 'vsRise 1.1s .3s both' }}>
                  <div
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: 999,
                      overflow: 'hidden',
                      background: 'var(--halo-teal)',
                      boxShadow: 'inset 0 0 0 1px var(--border)'
                    }}
                  >
                    <img
                      src={productImage(p)}
                      srcSet={productSrcSet(p)}
                      sizes="48px"
                      alt={p.n}
                      width={1000}
                      height={1000}
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <p
                    style={{
                      margin: '12px 0 0',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: 'var(--muted-foreground)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {p.kicker.split(' · ')[1]}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- trust strip ---- */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="vs-wrap vs-stats">
          <StatBlock label="Envío" value="$200" sub="2–5 días a todo México" />
          <StatBlock label="Pago" value="Contra entrega" sub="Efectivo al recibir" />
          <StatBlock label="Catálogo" value="16 productos" sub="Suplementos y skincare" />
          <StatBlock label="Origen" value="Importado" sub="Corea, EE. UU. y Europa" />
        </div>
      </section>

      {/* COD WhatsApp path - Ship-Lead approved */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
        <div className="vs-wrap" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.24em',
                color: 'var(--muted-foreground)'
              }}
            >
              Pedidos por WhatsApp
            </p>
            <p
              style={{
                margin: '16px 0 0',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 28,
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}
            >
              <a
                href="https://wa.me/525520791699"
                style={{ color: 'inherit', textDecoration: 'none', borderBottom: '2px solid var(--secondary)' }}
              >
                +52 55 2079 1699
              </a>
            </p>
            <ol
              style={{
                margin: '24px auto 0',
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px 16px',
                justifyContent: 'center',
                fontSize: 14,
                color: 'var(--muted-foreground)'
              }}
            >
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--secondary)' }}>01</span>
                pedido
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--border)' }}>→</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--secondary)' }}>02</span>
                confirmas por WhatsApp
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--border)' }}>→</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--secondary)' }}>03</span>
                pagas al courier
              </li>
            </ol>
            <p
              style={{
                margin: '24px 0 0',
                fontSize: 14,
                lineHeight: 1.65,
                color: 'var(--muted-foreground)'
              }}
            >
              Contra entrega. No generamos la guía hasta que confirmes por WhatsApp, y no pagas nada hasta que el
              paquete esté en tus manos.
            </p>
          </div>
        </div>
      </section>

      {/* ---- the two worlds ---- */}
      <section className="vs-wrap vs-worlds" style={{ paddingTop: 96 }}>
        <WorldCard
          to="/tienda?mundo=sup"
          kicker="Mundo uno"
          title="Suplementos"
          copy="Magnesio, creatina, colágeno, NAD+. Dosis por porción impresa, sin mezclas propietarias."
          image={productImage(findProduct('creatina'))}
          imageSrcSet={productSrcSet(findProduct('creatina'))}
          imageAlt="Creatina monohidratada"
          dark
        />
        <WorldCard
          to="/tienda?mundo=skin"
          kicker="Mundo dos"
          title="Skincare"
          copy="Activos con porcentaje declarado: niacinamida 10, salicílico, SPF en barra, hidrogel."
          image={productImage(findProduct('serum-anua'))}
          imageSrcSet={productSrcSet(findProduct('serum-anua'))}
          imageAlt="Serum de niacinamida"
        />
      </section>

      {/* ---- best sellers ---- */}
      <section className="vs-wrap" style={{ paddingTop: 96 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            paddingBottom: 28,
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <Eyebrow>Los que más salen</Eyebrow>
            <h2 style={sectionH2}>Más pedidos este mes</h2>
          </div>
          <Link to="/tienda" className="vs-link-teal">
            Ver los 16 →
          </Link>
        </div>
        <div className="vs-grid-4" style={{ paddingTop: 40 }}>
          {best.map((p) => (
            <ProductCard
              key={p.slug}
              as={Link}
              to={`/producto/${p.slug}`}
              title={p.n}
              image={productImage(p)}
              imageSrcSet={productSrcSet(p)}
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
      </section>

      {/* ---- goals ---- */}
      <section className="vs-wrap" style={{ paddingTop: 96 }}>
        <Eyebrow>Empieza por el objetivo</Eyebrow>
        <div className="vs-goal-grid" style={{ marginTop: 28 }}>
          {GOALS.map((g) => (
            <Link
              key={g.id}
              to={`/tienda?objetivo=${g.id}`}
              className="vs-hover-card"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 16,
                background: 'var(--card)',
                padding: 28,
                display: 'block'
              }}
            >
              <span style={{ color: 'var(--secondary)', display: 'block' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={g.icon} />
                </svg>
              </span>
              <h3 style={{ margin: '22px 0 0', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', fontSize: 22, letterSpacing: '-0.02em' }}>
                {g.label}
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>{g.sub}</p>
              <p style={{ margin: '16px 0 0', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted-foreground)' }}>
                {LISTED.filter((p) => p.goals.includes(g.id)).length} productos
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- manifesto ---- */}
      <div style={{ marginTop: 96 }}>
        <ManifestoBand
          kicker="Pago contra entrega"
          headline="Pagas cuando lo tienes en la mano"
          sub="Sin anticipo · efectivo al recibir · envío $200 a todo México"
        />
      </div>

      {/* ---- peptides teaser ---- */}
      <section className="vs-wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <Link
          to="/peptidos"
          className="vs-hover-card vs-pep-teaser"
          style={{ border: '1px solid var(--border)', borderRadius: 16, background: 'var(--card)', padding: '56px 48px' }}
        >
          <div>
            <Eyebrow accent>Otra parte de la marca</Eyebrow>
            <h2 style={{ ...sectionH2, margin: '16px 0 0' }}>Vital Peptides</h2>
            <p style={{ margin: '18px 0 0', maxWidth: 460, fontSize: 15, lineHeight: 1.65, color: 'var(--muted-foreground)' }}>
              Los péptidos no se venden en esta tienda. Viven en su propio sitio, con CoA por lote y asesoría para
              profesionales. Te llevamos hasta allá.
            </p>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 28,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.24em',
                borderBottom: '1px solid var(--foreground)',
                paddingBottom: 4
              }}
            >
              Cómo funciona la pasarela →
            </span>
          </div>
          <div style={{ color: 'var(--secondary)' }}>
            <Chromatogram style={{ width: '100%', height: 'auto' }} />
          </div>
        </Link>
      </section>
    </div>
  );
}
