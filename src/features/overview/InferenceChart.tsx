import { useMemo, useState } from 'react'
import { inferenceViews, type InferenceRange, type InferenceView } from '../../data/mock'
import { DOT_COLORS, dotDelay, LINE_MS, useIntro } from '../../lib/intro'
import { useDesignBox } from '../../lib/hooks/useDesignBox'
import { formatCount } from '../../lib/format'
import DotCanvas, { type Dot } from '../../components/DotCanvas'
import Dropdown from '../../components/Dropdown'

const RANGES = ['Yearly', 'Monthly', 'Weekly'] as const satisfies readonly InferenceRange[]

// Geometry in design pixels (1280px frame), relative to the chart box.
const H = 215
const PLOT_LEFT = 21 // dots + line start
const GRID_LEFT = 25 // dashed gridlines start
const TOP = 11 // top tick
const BOTTOM = 195 // 0
const DOT_TOP = 14.7
const DOT_BOTTOM = 192
const PITCH_X = 3.99
const PITCH_Y = 3.97
const DOT = 2.59
const LABEL_BASELINE = 209.2
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

const formatTick = (v: number) => (v === 0 ? '0' : v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : `${v}`)

function makeScale(view: InferenceView) {
  const yOf = (v: number) => TOP + ((view.max - v) / view.max) * (BOTTOM - TOP)
  const lineYAt = (t: number) => {
    const s = view.series
    if (t <= s[0].t) return yOf(s[0].v)
    for (let i = 1; i < s.length; i++) {
      if (t <= s[i].t) {
        const k = (t - s[i - 1].t) / (s[i].t - s[i - 1].t)
        return yOf(s[i - 1].v + k * (s[i].v - s[i - 1].v))
      }
    }
    return yOf(s[s.length - 1].v)
  }
  return { yOf, lineYAt }
}

export default function InferenceChart() {
  const [range, setRange] = useState<InferenceRange>('Yearly')
  const [ref, width] = useDesignBox<HTMLDivElement>()
  const view = inferenceViews[range]

  return (
    <section className="card chart-card" aria-labelledby="inference-title">
      <header className="chart-card__head">
        <h2 id="inference-title" className="label-mono">
          Inference Calls
        </h2>
        <Dropdown label="Range" value={range} options={RANGES} onChange={setRange} />
      </header>
      <p key={range} className="chart-card__value pixel-num value-swap" aria-live="polite">
        {formatCount(view.total)}
      </p>

      <div className="inference-plot" ref={ref}>
        {/* Keyed by range, so switching replays the line + pixel intro with the new data. */}
        {width > 0 && <InferencePlot key={range} view={view} width={width} />}
      </div>
    </section>
  )
}

function InferencePlot({ view, width }: { view: InferenceView; width: number }) {
  const intro = useIntro(true)
  const plotW = Math.max(0, width - PLOT_LEFT)
  const { yOf, lineYAt } = useMemo(() => makeScale(view), [view])
  const ticks = Array.from({ length: 7 }, (_, i) => (view.max * (6 - i)) / 6)

  const { cells, line } = useMemo(() => {
    if (plotW <= 0) return { cells: [] as Dot[], line: '' }
    const cols = Math.floor((plotW - DOT) / PITCH_X) + 1
    const rows = Math.floor((DOT_BOTTOM - DOT_TOP - DOT) / PITCH_Y) + 1
    const cells: Dot[] = []
    for (let c = 0; c < cols; c++) {
      const x = PLOT_LEFT + 0.7 + c * PITCH_X
      const ly = lineYAt((x + DOT / 2 - PLOT_LEFT) / plotW)
      for (let r = 0; r < rows; r++) {
        const y = DOT_TOP + r * PITCH_Y
        if (y + DOT / 2 < ly) continue
        // Density fades from solid at the line to ~1/8 at the floor, ordered-dithered.
        const f = (y - ly) / (DOT_BOTTOM - ly)
        const density = 1 - 0.97 * Math.pow(f, 0.7)
        if (BAYER[r % 4][c % 4] < density * 16) cells.push({ x, y, delay: dotDelay(c / cols, c, r) })
      }
    }
    const l = view.series
      .map((p, i) => `${i ? 'L' : 'M'}${(PLOT_LEFT + p.t * plotW).toFixed(2)} ${yOf(p.v).toFixed(2)}`)
      .join('')
    return { cells, line: l }
  }, [plotW, view, yOf, lineYAt])

  return (
    <>
      <DotCanvas
        className="inference-plot__dots"
        viewBox={[0, 0, width, H]}
        size={DOT}
        dots={cells}
        animate={intro}
        {...DOT_COLORS.green}
      />
      <svg viewBox={`0 0 ${width} ${H}`} role="img" aria-label={view.description}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" strokeDasharray="4 4" x1={GRID_LEFT} x2={width} y1={yOf(t)} y2={yOf(t)} />
            <text className="axis-label" fontSize={8.1} x={18} y={yOf(t) + 2.9} textAnchor="end">
              {formatTick(t)}
            </text>
          </g>
        ))}
        <path
          className={`inference-plot__line${intro ? ' draw-in' : ''}`}
          d={line}
          pathLength={1}
          style={intro ? { animationDuration: `${LINE_MS}ms` } : undefined}
        />
        {view.labels.map((l) => (
          <text
            key={l.text}
            className="axis-label"
            fontSize={8.1}
            x={PLOT_LEFT + l.t * plotW}
            y={LABEL_BASELINE}
            textAnchor="middle"
          >
            {l.text}
          </text>
        ))}
      </svg>
    </>
  )
}
