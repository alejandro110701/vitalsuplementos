/**
 * StatBlock — a single figure in a hairline-divided stat strip: mono label,
 * oversized Space Grotesk value, muted sub. Used across trust strips.
 */
export default function StatBlock({ label, value, sub, className = '', style = {}, ...props }) {
  return (
    <div className={`vp-stat ${className}`} style={{ padding: '28px 8px', ...style }} {...props}>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--muted-foreground)'
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: '8px 0 0',
          fontFamily: 'var(--font-display)',
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--foreground)'
        }}
      >
        {value}
      </p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted-foreground)' }}>{sub}</p>}
    </div>
  );
}
