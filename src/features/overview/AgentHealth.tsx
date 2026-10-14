import { useEffect, useMemo, useState } from 'react'
import { avatarFor, type Agent } from '../../data/mock'
import { useAgents } from '../../data/agentsStore'
import { useTheme } from '../../lib/theme'
import AgentFilter from './AgentFilter'
import { activeFilterCount, matchesFilters, NO_FILTERS, type Filters } from './filters'
import { STATUS_LABEL } from '../../data/status'
import { formatMs, formatUsd } from '../../lib/format'
import DotBar from '../../components/DotBar'
import ExportMenu from './ExportMenu'
import { Search, SortChevron } from '../../components/icons'
import RowActions from './RowActions'
import { FOCUS_AGENT_EVENT, takePendingAgent } from '../../lib/agentFocus'

type SortKey = 'name' | 'status' | 'success' | 'cost' | 'p95'

const sortValue: Record<SortKey, (a: Agent) => string | number> = {
  name: (a) => a.name,
  status: (a) => a.status,
  success: (a) => a.success,
  cost: (a) => a.costPer1k,
  p95: (a) => a.p95Ms,
}

const columns: { label: string; sort?: SortKey }[] = [
  { label: 'Agent', sort: 'name' },
  { label: 'Role' },
  { label: 'Status', sort: 'status' },
  { label: 'Success', sort: 'success' },
  { label: 'Cost/1K', sort: 'cost' },
  { label: 'p95', sort: 'p95' },
  { label: 'Actions' },
]

export default function AgentHealth() {
  const theme = useTheme()
  const agents = useAgents()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null)
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [flash, setFlash] = useState<string | null>(null)

  // Picking an agent in the top-bar search: make sure its row is visible, scroll to it, flash it.
  useEffect(() => {
    const focusRow = (name: string) => {
      setQuery('')
      setFilters(NO_FILTERS)
      setFlash(name)
      requestAnimationFrame(() =>
        document
          .querySelector(`[data-agent="${CSS.escape(name)}"]`)
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
      )
    }
    const onFocusAgent = () => {
      const name = takePendingAgent()
      if (name) focusRow(name)
    }
    onFocusAgent() // a request made before this table mounted
    window.addEventListener(FOCUS_AGENT_EVENT, onFocusAgent)
    return () => window.removeEventListener(FOCUS_AGENT_EVENT, onFocusAgent)
  }, [])

  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(null), 1400)
    return () => window.clearTimeout(t)
  }, [flash])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = agents.filter(
      (a) => matchesFilters(a, filters) && (!q || `${a.name} ${a.role} ${a.status}`.toLowerCase().includes(q)),
    )
    if (!sort) return list
    const get = sortValue[sort.key]
    return [...list].sort((a, b) => (get(a) > get(b) ? 1 : get(a) < get(b) ? -1 : 0) * sort.dir)
  }, [agents, query, sort, filters])

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }))

  return (
    <section className="card health" aria-labelledby="health-title">
      <header className="health__head">
        <h2 id="health-title" className="label-mono health__title">
          Agent Health
        </h2>
        <div className="health__tools">
          <label className="search-field health__search">
            <Search className="search-field__icon" />
            <input
              type="search"
              placeholder="Search agents"
              aria-label="Search agents"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <AgentFilter agents={agents} value={filters} onChange={setFilters} />
          <ExportMenu rows={rows} />
        </div>
      </header>

      <div className="health__scroll">
        <table className="health__table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.label}
                  scope="col"
                  aria-sort={c.sort && sort?.key === c.sort ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}
                >
                  {c.sort ? (
                    <button className="th-sort" onClick={() => toggleSort(c.sort!)}>
                      {c.label}
                      <SortChevron
                        className="th-sort__chevron"
                        style={sort?.key === c.sort && sort.dir === -1 ? { transform: 'rotate(180deg)' } : undefined}
                      />
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr
                key={a.name}
                data-agent={a.name}
                className={
                  [a.status === 'paused' && 'is-paused', flash === a.name && 'is-flash'].filter(Boolean).join(' ') ||
                  undefined
                }
              >
                <td>
                  <span className="agent">
                    <span className="agent__avatar">
                      <img src={avatarFor(a, theme)} alt="" />
                    </span>
                    {a.name}
                  </span>
                </td>
                <td>{a.role}</td>
                <td>
                  <span className={`pill pill--${a.status}`}>{STATUS_LABEL[a.status]}</span>
                </td>
                <td>
                  <span className="success">
                    <DotBar
                      value={a.success}
                      rows={6}
                      tone={a.status === 'deploying' || a.status === 'degraded' ? 'amber' : 'green'}
                      label={`${a.success}% success`}
                    />
                    <span className="success__pct" aria-hidden="true">
                      {a.success.toFixed(1)}%
                    </span>
                  </span>
                </td>
                <td>{formatUsd(a.costPer1k)}</td>
                <td>{formatMs(a.p95Ms)}</td>
                <td className="health__actions">
                  <RowActions agent={a} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="health__empty">
                  No agents match {query.trim() ? `“${query.trim()}”` : 'these filters'}
                  {activeFilterCount(filters) > 0 && (
                    <>
                      {' · '}
                      <button className="link-btn" onClick={() => setFilters(NO_FILTERS)}>
                        Clear filters
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
