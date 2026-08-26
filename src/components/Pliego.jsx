import { useEffect, useMemo, useRef, useState } from 'react';
import { Chromatogram, Eyebrow } from '../ds/index.js';
import { altFor, beatCopy, galleryFor } from '../lib/gallery.js';

const pad = (n) => String(n).padStart(2, '0');

/**
 * El Pliego — the circle that opens into a sheet.
 *
 * One sticky square stage on the left; the beats scroll past it on the right,
 * each swapping the photograph beneath. Beat 01 shows the packshot inside the
 * brand's circle mask on the teal halo; from beat 02 the aperture opens to a
 * rounded sheet, because from there on the frames are raw material rather than
 * catalogue tiles. Scrolling back re-closes it — it is a state, not a one-shot.
 *
 * Mechanically this is one IntersectionObserver and CSS `position: sticky`.
 * No scroll listener, no rAF, no scroll-snap: nothing here can jank or leak
 * global scroll state across routes.
 */
export default function Pliego({ product }) {
  const { beats, sheet, n } = useMemo(() => galleryFor(product), [product.slug]);

  const [active, setActive] = useState(0);
  // Mount the active layer plus one ahead, so the next frame decodes before it
  // is needed without paying for all five up front.
  const [reach, setReach] = useState(1);

  const refs = useRef([]);
  refs.current = [];

  useEffect(() => {
    setActive(0);
    setReach(1);
  }, [product.slug]);

  useEffect(() => setReach((r) => Math.max(r, active + 2)), [active]);

  useEffect(() => {
    const nodes = refs.current.filter(Boolean);
    if (nodes.length < 2) return undefined;

    const live = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = Number(entry.target.dataset.i);
          if (entry.isIntersecting) live.add(i);
          else live.delete(i);
        }
        // Taking the minimum keeps the swap monotonic with scroll direction: when
        // two beats straddle the band during a fast flick the upper one holds
        // until it fully exits, so the stage never oscillates. Never clear on an
        // empty set — past the last beat the stage keeps the final image.
        if (live.size) setActive(Math.min(...live));
      },
      // collapses the root to a 10%-tall band at the exact vertical centre
      { root: null, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
    // slug AND n: six of sixteen products have the same beat count, so keying on
    // count alone would leave the observer bound to detached nodes on navigation
  }, [product.slug, n]);

  if (beats.length < 2) return null;

  const mask = active === 0 && beats[0]?.kind === 'PACKSHOT' ? 'circle' : 'sheet';

  return (
    <section className="vp-pliego" style={{ '--n': n }} aria-labelledby="pliego-h">
      <div className="vp-pliego__head">
        <div>
          <Eyebrow>El producto, de cerca</Eyebrow>
          <h2
            id="pliego-h"
            style={{
              margin: '14px 0 0',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: 'clamp(1.75rem, 3.4vw, 2.5rem)',
              lineHeight: 1,
              letterSpacing: '-0.025em'
            }}
          >
            {n} vistas
          </h2>
          <a className="vp-skip" href="#ficha">
            Saltar al detalle
          </a>
        </div>
        <Chromatogram showLabels={false} showAxes aria-hidden="true" />
      </div>

      <div className="vp-pliego__grid">
        <div className="vp-pliego__stage">
          <div className="vp-pliego__frame" data-mask={mask}>
            {beats.map((im, j) =>
              j < reach ? (
                <img
                  key={im.src}
                  className="vp-pliego__layer"
                  data-on={j === active ? 'true' : 'false'}
                  data-prev={j === active - 1 ? 'true' : 'false'}
                  style={{ backgroundImage: `url(${im.lqip})` }}
                  src={im.src}
                  srcSet={`${im.srcSmall} 700w, ${im.src} 1400w`}
                  sizes="(max-width: 720px) 100vw, (max-width: 1024px) 92vw, 640px"
                  width={im.w}
                  height={im.h}
                  decoding="async"
                  loading={j === 0 ? 'eager' : 'lazy'}
                  fetchpriority={j === 0 ? 'high' : 'auto'}
                  alt={j === active ? altFor(product, im, j, n) : ''}
                  aria-hidden={j === active ? undefined : 'true'}
                />
              ) : null
            )}
          </div>

          {/* real anchors, so this is keyboard-operable and works without JS */}
          <nav className="vp-pliego__rail" aria-label="Vistas del producto">
            {beats.map((im, j) => (
              <a
                key={im.src}
                className="vp-pliego__tick"
                href={`#pliego-b${j}`}
                aria-current={j === active ? 'true' : undefined}
              >
                {pad(j + 1)}
              </a>
            ))}
          </nav>
        </div>

        <div>
          {beats.map((im, j) => {
            const copy = beatCopy(product, im, j);
            return (
              <section
                key={im.src}
                id={`pliego-b${j}`}
                className="vp-pliego__beat"
                data-i={j}
                data-on={j === active ? 'true' : 'false'}
                ref={(el) => refs.current.push(el)}
                aria-labelledby={`pliego-t${j}`}
              >
                <div className="vp-pliego__beatInner">
                  <p className="vp-pliego__idx">
                    {pad(j + 1)} / {pad(n)}
                    {copy.eyebrow ? ` · ${copy.eyebrow}` : ''}
                  </p>
                  <h3 id={`pliego-t${j}`} className="vp-pliego__title" tabIndex={-1}>
                    {copy.title}
                  </h3>
                  <p className="vp-pliego__body">{copy.body}</p>
                  <dl className="vp-pliego__data">
                    {copy.rows.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {copy.disclose && (
                    <p className="vp-pliego__disclose">Material del fabricante · sin editar</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {sheet.length > 0 && (
        <div className="vp-pliego__sheet">
          <Eyebrow>Más material</Eyebrow>
          <div className="vp-pliego__sheetGrid">
            {sheet.map((im, j) => (
              <figure key={im.src} className="vp-pliego__sheetItem">
                <img
                  src={im.src}
                  srcSet={`${im.srcSmall} 700w, ${im.src} 1400w`}
                  sizes="(max-width: 720px) 50vw, 380px"
                  width={im.w}
                  height={im.h}
                  loading="lazy"
                  decoding="async"
                  alt={altFor(product, im, j, sheet.length)}
                />
                <figcaption>{pad(j + 1)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
