/**
 * Chip — mono uppercase micro-label for clinical data: purity, CoA, sale,
 * sold-out, fiscal tags. Distinct from Badge (which uses the body font).
 */
const variants = {
  outline: {
    background: 'color-mix(in oklab, var(--vp-white) 90%, transparent)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(4px)'
  },
  solid: {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    border: '1px solid transparent'
  },
  teal: {
    background: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    border: '1px solid transparent'
  },
  danger: {
    background: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    border: '1px solid transparent'
  },
  soft: {
    background: 'color-mix(in oklab, var(--secondary) 15%, transparent)',
    color: 'var(--secondary-text)',
    border: '1px solid transparent'
  }
};

export default function Chip({ variant = 'outline', className = '', style = {}, children, ...props }) {
  return (
    <span
      className={`vp-chip ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        borderRadius: 'var(--radius-sm)',
        padding: '5px 9px',
        lineHeight: 1,
        ...variants[variant],
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
}
