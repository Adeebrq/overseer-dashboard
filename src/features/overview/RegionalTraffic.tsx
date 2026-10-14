import { useMemo, useState, type CSSProperties } from 'react'
import { regions } from '../../data/mock'
import { formatCount, formatMs } from '../../lib/format'
import { DOT_COLORS, dotDelay, INTRO_MS, useIntro } from '../../lib/intro'
import { WORLD_DOT, worldDots } from '../../data/worldDots'
import DotCanvas from '../../components/DotCanvas'
import Trend from '../../components/Trend'

// The world map's coordinate space, straight from the design export.
const VB = { x: 771, y: 311, w: 461, h: 202 }
const TIP_W = 105
const TIP_GAP = 30.1 // marker centre → tooltip edge
const LINK_W = 29.6 // horizontal leg of the connector
const LINK_TOP = 6.5 // connector leaves the marker's bottom edge…
const LINK_H = 15.5 // …and turns towards the tooltip this far down
const LIT_RADIUS = 26 // dots this close to the active marker light up
const OUTRO_MS = 450 // connector + tooltip settle in after the dots

const pctX = (x: number) => `${((x - VB.x) / VB.w) * 100}%`
const pctY = (y: number) => `${((y - VB.y) / VB.h) * 100}%`
const square = (x: number, y: number) => `M${x} ${y}h${WORLD_DOT}v${WORLD_DOT}h-${WORLD_DOT}z`
const introDots = worldDots.map((d) => ({ ...d, delay: dotDelay((d.x - VB.x) / VB.w, d.x, d.y) }))

export default function RegionalTraffic() {
  const [pinnedId, setPinnedId] = useState(regions[0].id)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const intro = useIntro(true, OUTRO_MS)

  const activeId = hoverId ?? pinnedId
  const active = regions.find((r) => r.id === activeId)!
  const previewing = activeId !== pinnedId

  // The tooltip sits to the right of its marker unless that would run off the map.
  const flip = active.x + TIP_GAP + TIP_W > VB.x + VB.w
  const tipLeft = flip ? active.x - TIP_GAP - TIP_W : active.x + TIP_GAP

  const litPath = useMemo(
    () =>
      worldDots
        .filter((d) => Math.hypot(d.x + WORLD_DOT / 2 - active.x, d.y + WORLD_DOT / 2 - active.y) < LIT_RADIUS)
        .map((d) => square(d.x, d.y))
        .join(''),
    [active],
  )

  const markerDelay = (x: number) => dotDelay((x - VB.x) / VB.w, 0, 0) + 120
  // After the dots: the connector draws down then across, then the tooltip settles in.
  const settle = (offsetMs: number): CSSProperties | undefined =>
    intro ? { animationDelay: `${INTRO_MS - 250 + offsetMs}ms` } : undefined

  return (
    <section className="card chart-card" aria-labelledby="traffic-title">
      <header className="chart-card__head">
        <h2 id="traffic-title" className="label-mono">
          Regional Traffic
        </h2>
        <button className="btn btn--compact">View all</button>
      </header>
      <div className="traffic__summary">
        <p className="chart-card__value pixel-num">67,546</p>
        <p className="traffic__delta">
          <Trend dir="up" className="trend--mono">
            67.3%
          </Trend>
          <span>Last Month</span>
        </p>
      </div>

      <div className="world">
        <div className={`world__canvas${intro ? ' is-intro' : ''}`} onPointerLeave={() => setHoverId(null)}>
          <DotCanvas
            className="world__dots"
            viewBox={[VB.x, VB.y, VB.w, VB.h]}
            size={WORLD_DOT}
            dots={introDots}
            animate={intro}
            {...DOT_COLORS.green}
          />
          {!intro && (
            <svg
              className="world__dots"
              viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <path key={activeId} className="world__lit" d={litPath} />
            </svg>
          )}

          <div
            className={`world__link${flip ? ' is-flipped' : ''}`}
            style={{
              left: pctX(flip ? active.x - LINK_W : active.x),
              top: pctY(active.y + LINK_TOP),
              width: `${(LINK_W / VB.w) * 100}%`,
              height: `${(LINK_H / VB.h) * 100}%`,
            }}
            aria-hidden="true"
          >
            <span className="world__link-v" style={settle(0)} />
            <span className="world__link-h" style={settle(170)} />
          </div>

          {regions.map((r) => (
            <button
              key={r.id}
              className={`world__marker${r.id === activeId ? ' is-active' : ''}${r.id === pinnedId ? ' is-pinned' : ''}`}
              style={{
                left: pctX(r.x),
                top: pctY(r.y),
                ...(intro ? { animationDelay: `${markerDelay(r.x).toFixed(0)}ms` } : null),
              }}
              onPointerEnter={() => setHoverId(r.id)}
              onFocus={() => setHoverId(r.id)}
              onBlur={() => setHoverId(null)}
              onClick={() => setPinnedId(r.id)}
              aria-label={`${r.label}: ${formatCount(r.requests)} requests, ${formatMs(r.latencyMs)}`}
              aria-pressed={r.id === pinnedId}
            >
              <span className="world__marker-ring" />
            </button>
          ))}

          <div
            className={`region-tip hatch-card${previewing ? ' is-preview' : ''}`}
            style={{ left: pctX(tipLeft), top: pctY(active.y - 5.5), ...settle(300) }}
            role="status"
            aria-live="polite"
          >
            <div className="region-tip__head">
              <span>{active.label}</span>
              <span className="region-tip__dot" title={previewing ? 'Click the marker to pin' : 'Pinned'} />
            </div>
            <div className="region-tip__rule" />
            <div className="region-tip__meta">
              <span>{formatCount(active.requests)} reqs</span>
              <span>{formatMs(active.latencyMs)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
