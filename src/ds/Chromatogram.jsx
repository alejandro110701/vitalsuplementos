const DEFAULT_PEAKS = [
  { x: 8, h: 12 },
  { x: 17, h: 22 },
  { x: 28, h: 8 },
  { x: 42, h: 92 },
  { x: 56, h: 6 },
  { x: 68, h: 14 },
  { x: 84, h: 4 }
];

/**
 * Stylized HPLC chromatogram — baseline noise + gaussian peaks, main-peak
 * callout. The signature scientific motif; inherits currentColor so it
 * tints teal on ink or ink on paper. Ported from the source codebase.
 */
export default function Chromatogram({
  peaks = DEFAULT_PEAKS,
  showAxes = true,
  showLabels = true,
  className = '',
  style = {},
  ...props
}) {
  const W = 600;
  const H = 200;
  const PADX = 28;
  const PADY = 18;
  const innerW = W - PADX * 2;
  const innerH = H - PADY * 2;
  const samples = 220;
  const points = [];

  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * 100;
    let y = 1.5 + 1.2 * Math.sin(x * 0.6) * Math.sin(x * 0.18 + 1);
    for (const p of peaks) {
      const sigma = p.h > 50 ? 1.6 : 2.4;
      y += p.h * Math.exp(-((x - p.x) ** 2) / (2 * sigma * sigma));
    }
    const px = PADX + (x / 100) * innerW;
    const py = PADY + innerH - (Math.min(y, 100) / 100) * innerH;
    points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }

  const mainPeak = peaks.reduce((a, b) => (a.h > b.h ? a : b));
  const mainPeakX = PADX + (mainPeak.x / 100) * innerW;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`vp-chromatogram ${className}`}
      role="img"
      aria-label="Cromatograma HPLC representativo"
      style={{ color: 'currentColor', ...style }}
      {...props}
    >
      <defs>
        <linearGradient id="vpChromaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {showAxes && (
        <>
          <line x1={PADX} y1={PADY} x2={PADX} y2={H - PADY} stroke="currentColor" strokeOpacity="0.25" />
          <line x1={PADX} y1={H - PADY} x2={W - PADX} y2={H - PADY} stroke="currentColor" strokeOpacity="0.25" />
          {Array.from({ length: 5 }).map((_, i) => {
            const x = PADX + (i / 4) * innerW;
            return (
              <line key={i} x1={x} y1={H - PADY} x2={x} y2={H - PADY + 4} stroke="currentColor" strokeOpacity="0.4" />
            );
          })}
        </>
      )}
      <polygon points={`${PADX},${H - PADY} ${points.join(' ')} ${W - PADX},${H - PADY}`} fill="url(#vpChromaFill)" />
      <polyline points={points.join(' ')} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      {showLabels && (
        <g>
          <line
            x1={mainPeakX}
            y1={PADY + innerH - (mainPeak.h / 100) * innerH - 4}
            x2={mainPeakX}
            y2={PADY}
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeDasharray="2 3"
          />
          <text
            x={mainPeakX + 6}
            y={PADY + 12}
            fill="currentColor"
            fillOpacity="0.85"
            fontSize="11"
            fontFamily="var(--font-mono)"
          >
            tR = 4.42 min · 99.4%
          </text>
        </g>
      )}
      {showAxes && showLabels && (
        <>
          <text x={PADX} y={H - 4} fontSize="9" fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-mono)">
            0
          </text>
          <text
            x={W - PADX - 12}
            y={H - 4}
            fontSize="9"
            fill="currentColor"
            fillOpacity="0.5"
            fontFamily="var(--font-mono)"
          >
            10 min
          </text>
          <text x={4} y={PADY + 4} fontSize="9" fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-mono)">
            mAU
          </text>
        </>
      )}
    </svg>
  );
}
