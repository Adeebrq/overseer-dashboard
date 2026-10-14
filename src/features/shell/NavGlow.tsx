import type { CSSProperties } from 'react'
import { jitter } from '../../lib/intro'

// Sparkle dust from the design: [x, y, opacity] in the nav item's coordinate space.
const SPARKS: [number, number, number][] = [
  [176, 81, 0.3],
  [195, 92, 0.8],
  [180, 80, 0.3],
  [191, 83, 0.7],
  [169, 82, 0.1],
  [195, 75, 0.8],
  [188, 82, 0.6],
  [187, 88, 0.6],
  [191, 80, 0.7],
  [191, 86, 0.7],
  [186, 81, 0.5],
  [183, 82, 0.4],
  [178, 86, 0.4],
  [189, 79, 0.6],
  [189, 85, 0.6],
  [183, 79, 0.4],
  [186, 83, 0.5],
  [190, 90, 0.7],
  [191, 76, 0.7],
  [164, 82, 0.05],
  [175, 84, 0.3],
  [196, 85, 0.8],
  [172, 83, 0.2],
  [167, 83, 0.05],
  [185, 85, 0.5],
  [193, 78, 0.7],
  [193, 88, 0.7],
  [196, 76, 0.8],
  [196, 83, 0.8],
  [181, 84, 0.4],
  [196, 79, 0.8],
  [174, 81, 0.2],
]

/**
 * On load each sparkle drifts in from a little way left (fainter ones from further out),
 * with a small random vertical offset, then settles exactly where the design puts it.
 */
function sparkStyle(x: number, y: number, i: number) {
  const r = jitter(x, y)
  return {
    '--dx': `${(-4 - (1 - (x - 164) / 32) * 9 - r * 4).toFixed(1)}px`,
    '--dy': `${((jitter(y, x) - 0.5) * 6).toFixed(1)}px`,
    animationDelay: `${(150 + r * 350 + i * 6).toFixed(0)}ms`,
  } as CSSProperties
}

/** Light streak on the active nav item, copied from the design: green bloom, white core, sparkle dust, edge bar. */
export default function NavGlow() {
  return (
    <svg className="nav-item__glow" viewBox="11 70 189 25" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <defs>
        <filter id="navglow-bloom" x="148" y="58" width="66" height="51.4" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="navglow-core" x="174" y="68" width="44" height="33" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <linearGradient id="navglow-bar" x1="199" y1="76" x2="199" y2="90" gradientUnits="userSpaceOnUse">
          <stop className="nav-glow__stop-a" stopColor="#1F5537" />
          <stop className="nav-glow__stop-b" offset="1" stopColor="#012110" />
        </linearGradient>
      </defs>
      <path
        className="nav-glow__bloom"
        filter="url(#navglow-bloom)"
        d="M156 82.4999C156 82.4999 195.5 78.5 201 67.4999C206.5 56.4998 209 112.5 201 99.4999C193 86.4998 156 82.4999 156 82.4999Z"
        fill="#007D2D"
        fillOpacity={0.4}
        style={{ mixBlendMode: 'plus-lighter' }}
      />
      <path
        className="nav-glow__core"
        filter="url(#navglow-core)"
        d="M178 83.6072C178 83.6072 206.38 80.7833 210.332 73.0174C214.284 65.2515 216.08 104.787 210.332 95.609C204.584 86.4311 178 83.6072 178 83.6072Z"
        fill="#fff"
        fillOpacity={0.5}
        style={{ mixBlendMode: 'plus-lighter' }}
      />
      {SPARKS.map(([x, y, o], i) => (
        <rect
          key={i}
          className="nav-spark"
          x={x}
          y={y}
          width="0.5"
          height="0.5"
          rx="0.25"
          fill="#fff"
          fillOpacity={o}
          style={sparkStyle(x, y, i)}
        />
      ))}
      <rect className="nav-item__bar" x="198" y="76" width="2" height="14" rx="1" fill="url(#navglow-bar)" />
    </svg>
  )
}
