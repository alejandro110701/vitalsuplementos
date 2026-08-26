/**
 * VitalPeptides brand mark — a stylized peptide chain: 4 residues along a
 * bond axis (terminal residues filled, inner residues open) with two
 * peptide-bond kinks. Renders mono-color via currentColor; the wordmark's
 * middot inherits the teal accent.
 */
export function LogoMark({ style = {}, ...props }) {
  return (
    <svg
      viewBox="0 0 64 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ height: 28, width: 'auto', color: 'currentColor', ...style }}
      {...props}
    >
      <path d="M8 16 L20 16 M28 16 L36 16 M44 16 L56 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 16 L24 12 L28 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 16 L40 20 L44 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="16" r="4" fill="currentColor" />
      <circle cx="58" cy="16" r="4" fill="currentColor" />
      <circle cx="22" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="42" cy="21" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default LogoMark;
