import { kpis, type Kpi } from '../../data/mock'
import { AgentBot, EvalBadge, Gauge, TraceScan } from '../../components/icons'
import Trend from '../../components/Trend'

const icons: Record<Kpi['icon'], typeof EvalBadge> = {
  eval: EvalBadge,
  agents: AgentBot,
  trace: TraceScan,
  latency: Gauge,
}

export default function KpiStrip() {
  return (
    <section className="card kpi-strip" aria-label="Key metrics">
      {kpis.map((k) => {
        const Icon = icons[k.icon]
        return (
          <article className="kpi" key={k.label}>
            <header className="kpi__head">
              <span className="glyph-tile">
                <Icon />
              </span>
              <h2 className="label-mono">{k.label}</h2>
            </header>
            <p className="kpi__value pixel-num">{k.value}</p>
            <footer className="kpi__foot">
              <span>{k.caption}</span>
              <Trend dir={k.trend}>{k.delta}</Trend>
            </footer>
          </article>
        )
      })}
    </section>
  )
}
