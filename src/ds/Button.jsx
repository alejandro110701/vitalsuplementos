/**
 * VitalPeptides Button — ink-solid by default, with a clinical teal
 * secondary, hairline outline, ghost, gradient hero, and destructive.
 * Styling is driven entirely by design-system CSS custom properties.
 */
const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--font-sans)',
  fontWeight: 500,
  borderRadius: 'var(--radius-md)',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'var(--transition-smooth)',
  textDecoration: 'none',
  lineHeight: 1
};

const sizes = {
  sm: { height: 32, padding: '0 12px', fontSize: 12 },
  default: { height: 36, padding: '0 16px', fontSize: 14 },
  lg: { height: 40, padding: '0 32px', fontSize: 14 },
  xl: { height: 48, padding: '0 40px', fontSize: 16 },
  icon: { height: 36, width: 36, padding: 0 }
};

const variants = {
  default: { background: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: 'var(--shadow-sm)' },
  secondary: { background: 'var(--secondary)', color: 'var(--secondary-foreground)', boxShadow: 'var(--shadow-card)' },
  outline: {
    background: 'var(--background)',
    color: 'var(--foreground)',
    borderColor: 'var(--input)',
    boxShadow: 'var(--shadow-sm)'
  },
  ghost: { background: 'transparent', color: 'var(--foreground)' },
  destructive: {
    background: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    boxShadow: 'var(--shadow-sm)'
  },
  hero: {
    backgroundImage: 'var(--gradient-primary)',
    color: 'var(--primary-foreground)',
    boxShadow: 'var(--shadow-elegant)'
  },
  link: { background: 'transparent', color: 'var(--primary)', textUnderlineOffset: '4px' }
};

export default function Button({
  variant = 'default',
  size = 'default',
  as: Comp = 'button',
  className = '',
  style = {},
  children,
  ...props
}) {
  return (
    <Comp
      className={`vp-btn vp-btn--${variant} ${className}`}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </Comp>
  );
}
