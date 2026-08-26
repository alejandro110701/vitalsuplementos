import { Link } from 'react-router-dom';
import { Chip, Eyebrow, ProductCard } from '../ds/index.js';
import { GOALS, productImage, productSrcSet, relatedProducts, sku, worldLabel } from '../data/products.js';

/**
 * El Anaquel — the shelf.
 *
 * The current product sits first as the reference card, and the four the
 * catalogue ranks closest are measured against it on identical rows. The fixed
 * row height is what makes the values line up horizontally across the shelf;
 * without it this is just another related rail.
 *
 * The circle mask stays here, unqualified: these are the curated isolated
 * packshots the mask was designed for. El Pliego earns the right to break it
 * because it shows raw material; the shelf keeps it because it shows catalogue.
 */
function Rows({ p }) {
  return (
    <dl className="vp-anaquel__dl">
      <div>
        <dt>Presentación</dt>
        <dd>{p.spec}</dd>
      </div>
      <div>
        <dt>Categoría</dt>
        <dd>{worldLabel(p.w)}</dd>
      </div>
      <div>
        <dt>SKU</dt>
        <dd>{sku(p)}</dd>
      </div>
    </dl>
  );
}

export default function Anaquel({ current }) {
  const related = relatedProducts(current, 4);
  const goal = GOALS.find((g) => current.goals.includes(g.id));
  const criterion = `${worldLabel(current.w)}${goal ? ` · objetivo: ${goal.label.toLowerCase()}` : ''}`;

  return (
    <section className="vp-anaquel" aria-labelledby="anaquel-h">
      <div className="vp-anaquel__in">
        <div className="vp-anaquel__head">
          <div>
            <Eyebrow>Del mismo mundo</Eyebrow>
            <h2
              id="anaquel-h"
              style={{
                margin: '14px 0 0',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
                letterSpacing: '-0.025em'
              }}
            >
              Va bien con
            </h2>
            <p className="vp-anaquel__crit">{criterion}</p>
          </div>
          <Link className="vs-link-teal" to={`/tienda?mundo=${current.w}`}>
            Ver toda la tienda →
          </Link>
        </div>

        <div className="vp-anaquel__grid">
          <div className="vp-anaquel__tile" data-ref="true" aria-current="page">
            <ProductCard
              as="div"
              title={current.n}
              image={productImage(current)}
              imageSrcSet={productSrcSet(current)}
              imageAlt={current.n}
              price={current.price}
              compareAt={current.was || null}
              kicker={current.kicker}
              purityLabel={current.spec}
              soldOut={current.inStock === false}
              cta="Estás aquí"
            />
            <div style={{ marginTop: 12 }}>
              <Chip variant="soft">Esta placa</Chip>
            </div>
            <Rows p={current} />
          </div>

          {related.map((p) => (
            <Link key={p.slug} className="vp-anaquel__tile" to={`/producto/${p.slug}`}>
              <ProductCard
                as="div"
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
              <Rows p={p} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
