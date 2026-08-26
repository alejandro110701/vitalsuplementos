/**
 * Full-bleed editorial "manifesto" band — a cinematic grayscale photo behind
 * one oversized uppercase headline, mono sub-caption and optional inline CTA.
 * The brand's biggest typographic moment.
 */
export default function ManifestoBand({
  image,
  imageAlt = '',
  imageSrcSet,
  imageSizes = '100vw',
  kicker,
  headline,
  sub,
  cta,
  align = 'center',
  className = '',
  style = {},
  ...props
}) {
  return (
    <section
      className={`vp-manifesto ${className}`}
      style={{
        position: 'relative',
        isolation: 'isolate',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--vp-ink)',
        color: '#fff',
        ...style
      }}
      {...props}
    >
      <div style={{ position: 'relative', minHeight: '70vh', width: '100%' }}>
        {image && (
          <img
            src={image}
            srcSet={imageSrcSet}
            sizes={imageSrcSet ? imageSizes : undefined}
            alt={imageAlt}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              opacity: 0.7,
              filter: 'grayscale(1) contrast(1.08)'
            }}
          />
        )}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, oklch(0.1 0.01 240 / 0.45) 0%, oklch(0.1 0.01 240 / 0.55) 100%)'
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            margin: '0 auto',
            display: 'flex',
            minHeight: '70vh',
            maxWidth: 1152,
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '96px 24px',
            alignItems: align === 'left' ? 'flex-start' : 'center',
            textAlign: align === 'left' ? 'left' : 'center'
          }}
        >
          {kicker && (
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.32em',
                color: 'rgba(255,255,255,0.7)'
              }}
            >
              {kicker}
            </p>
          )}
          <h2
            style={{
              margin: '24px 0 0',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              textTransform: 'uppercase',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: '#fff',
              fontSize: 'clamp(2.5rem, 7vw, 6rem)'
            }}
          >
            {headline}
          </h2>
          {sub && (
            <p
              style={{
                margin: '24px 0 0',
                maxWidth: 640,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.7)'
              }}
            >
              {sub}
            </p>
          )}
          {cta && (
            <a
              href={cta.href || '#'}
              style={{
                marginTop: 40,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: '1px solid rgba(255,255,255,0.5)',
                paddingBottom: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.24em',
                color: '#fff',
                textDecoration: 'none'
              }}
            >
              {cta.label} <span aria-hidden>→</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
