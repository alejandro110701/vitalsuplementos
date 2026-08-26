/**
 * Eyebrow / kicker — the mono uppercase micro-label above section headlines.
 * Wide tracking is a brand signature. Teal when `accent`.
 */
export default function Eyebrow({ accent = false, className = '', style = {}, children, ...props }) {
  return (
    <p
      className={`vp-eyebrow ${className}`}
      style={{
        margin: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.24em',
        color: accent ? 'var(--secondary-text)' : 'var(--muted-foreground)',
        ...style
      }}
      {...props}
    >
      {children}
    </p>
  );
}
