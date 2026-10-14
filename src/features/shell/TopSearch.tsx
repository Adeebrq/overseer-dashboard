import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { avatarFor, type Agent } from '../../data/mock'
import { useAgents } from '../../data/agentsStore'
import { useTheme } from '../../lib/theme'
import { STATUS_LABEL } from '../../data/status'
import { focusAgent } from '../../lib/agentFocus'
import { navGroups, type NavItem } from '../../lib/router'
import { Search } from '../../components/icons'

type Result = { kind: 'agent'; key: string; agent: Agent } | { kind: 'page'; key: string; page: NavItem }

const pages = navGroups.flatMap((g) => g.items)

function highlight(text: string, q: string): ReactNode {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

/** Top-bar quick search: agents and pages, combobox pattern with full keyboard support. */
export default function TopSearch() {
  const theme = useTheme()
  const agents = useAgents()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const id = useId()
  const q = query.trim()

  const groups = useMemo(() => {
    const ql = q.toLowerCase()
    const agentHits = agents
      .filter((a) => !ql || `${a.name} ${a.role} ${a.status}`.toLowerCase().includes(ql))
      .map((agent): Result => ({ kind: 'agent', key: `a-${agent.name}`, agent }))
    const pageHits = pages
      .filter((p) => !ql || p.label.toLowerCase().includes(ql))
      .slice(0, ql ? undefined : 4)
      .map((page): Result => ({ kind: 'page', key: `p-${page.slug}`, page }))
    return [
      { title: 'Agents', items: agentHits },
      { title: ql ? 'Pages' : 'Jump to', items: pageHits },
    ].filter((g) => g.items.length)
  }, [agents, q])
  const flat = groups.flatMap((g) => g.items)

  useEffect(() => setActive(0), [q])

  // ⌘K / Ctrl+K or "/" focuses the search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        input.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    if (open) document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, id])

  const choose = (r: Result | undefined) => {
    if (!r) return
    setOpen(false)
    setQuery('')
    input.current?.blur()
    if (r.kind === 'page') {
      location.hash = `#/${r.page.slug}`
    } else {
      location.hash = '#/overview'
      focusAgent(r.agent.name)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      if (!flat.length) return
      setActive((i) => (e.key === 'ArrowDown' ? (i + 1) % flat.length : (i - 1 + flat.length) % flat.length))
    } else if (e.key === 'Enter' && open) {
      e.preventDefault()
      choose(flat[active])
    } else if (e.key === 'Escape') {
      if (open) setOpen(false)
      else {
        setQuery('')
        input.current?.blur()
      }
    }
  }

  let index = -1
  return (
    <div className={`top-search${open ? ' is-open' : ''}`} ref={root}>
      <label className="search-field topbar__search">
        <Search className="search-field__icon" />
        <input
          ref={input}
          type="search"
          placeholder="Search agents..."
          role="combobox"
          aria-label="Search agents and pages"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && flat.length ? `${id}-opt-${active}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </label>

      {open && (
        <div className="popover top-search__panel">
          <ul id={`${id}-list`} role="listbox" aria-label="Search results" className="top-search__list">
            {groups.map((g) => (
              <li key={g.title} role="presentation">
                <div className="top-search__heading" aria-hidden="true">
                  {g.title}
                </div>
                <ul role="group" aria-label={g.title}>
                  {g.items.map((r) => {
                    index += 1
                    const i = index
                    return (
                      <li
                        key={r.key}
                        id={`${id}-opt-${i}`}
                        role="option"
                        aria-selected={i === active}
                        className={`top-search__item${i === active ? ' is-active' : ''}`}
                        onPointerEnter={() => setActive(i)}
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => choose(r)}
                      >
                        {r.kind === 'agent' ? (
                          <>
                            <span className="agent__avatar top-search__avatar">
                              <img src={avatarFor(r.agent, theme)} alt="" />
                            </span>
                            <span className="top-search__text">
                              <span className="top-search__name">{highlight(r.agent.name, q)}</span>
                              <span className="top-search__meta">{highlight(r.agent.role, q)}</span>
                            </span>
                            <span className={`top-search__status top-search__status--${r.agent.status}`}>
                              {STATUS_LABEL[r.agent.status]}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="top-search__icon">
                              <r.page.icon />
                            </span>
                            <span className="top-search__text">
                              <span className="top-search__name">{highlight(r.page.label, q)}</span>
                            </span>
                            <span className="top-search__hint">Page</span>
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ul>
          {flat.length === 0 && <p className="top-search__empty">No results for “{q}”</p>}
          <footer className="top-search__foot" aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> navigate
            </span>
            <span>
              <kbd>↵</kbd> open
            </span>
            <span>
              <kbd>esc</kbd> close
            </span>
          </footer>
        </div>
      )}
    </div>
  )
}
