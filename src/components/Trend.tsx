import type { ReactNode } from 'react'

type Props = { dir: 'up' | 'down'; children: ReactNode; className?: string }

/** Green delta with the design's arrow glyph. Both directions are "good" here, so both stay green. */
export default function Trend({ dir, children, className = '' }: Props) {
  return (
    <span className={`trend ${className}`}>
      <svg
        className="trend__arrow"
        viewBox="425.845 170.722 7.756 8.778"
        fill="currentColor"
        aria-hidden="true"
        style={dir === 'down' ? { transform: 'rotate(180deg)' } : undefined}
      >
        <path d="M429.173 179.5V172.801L426.621 175.362L425.845 174.595L429.727 170.722L433.601 174.595L432.842 175.362L430.281 172.801V179.5H429.173Z" />
      </svg>
      <span className="sr-only">{dir === 'up' ? 'up' : 'down'}</span>
      {children}
    </span>
  )
}
