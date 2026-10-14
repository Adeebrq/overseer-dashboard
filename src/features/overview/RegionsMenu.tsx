import { useEffect, useId } from 'react'
import DotBar from '../../components/DotBar'
import type { Region } from '../../data/mock'
import { formatCount, formatMs } from '../../lib/format'
import { openOnArrow, useListNavigation } from '../../lib/hooks/useListNavigation'
import { usePopover } from '../../lib/hooks/usePopover'

type Props = { regions: Region[]; pinnedId: string; onPick: (id: string) => void }

/** "View all" on Regional Traffic: every region with requests, share and latency. Picking one pins it on the map. */
export default function RegionsMenu({ regions, pinnedId, onPick }: Props) {
  const { open, setOpen, close, root, button, panel } = usePopover<HTMLDivElement>()
  const id = useId()
  const total = regions.reduce((sum, r) => sum + r.requests, 0)
  const sorted = [...regions].sort((a, b) => b.requests - a.requests)

  const pick = (i: number) => {
    onPick(sorted[i].id)
    close()
  }
  const { active, setActive, onKeyDown } = useListNavigation(sorted.length, {
    onPick: pick,
    onClose: close,
    onTab: () => setOpen(false),
  })

  useEffect(() => {
    if (!open) return
    setActive(
      Math.max(
        0,
        sorted.findIndex((r) => r.id === pinnedId),
      ),
    )
    panel.current?.querySelector<HTMLElement>('[role=listbox]')?.focus()
    // Only on open: the highlighted row shouldn't jump while the menu is in use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div className={`regions${open ? ' is-open' : ''}`} ref={root}>
      <button
        ref={button}
        type="button"
        className="btn btn--compact"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={openOnArrow(() => setOpen(true))}
      >
        View all
      </button>

      {open && (
        <div
          ref={panel}
          id={`${id}-panel`}
          role="dialog"
          aria-label="All regions"
          className="popover regions__panel"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              close()
            }
          }}
        >
          <header className="regions__head">
            <h2 className="label-mono regions__title">All regions</h2>
            <span className="regions__total">{formatCount(total)} reqs</span>
          </header>
          <ul
            role="listbox"
            tabIndex={-1}
            aria-label="Regions by traffic"
            aria-activedescendant={`${id}-r-${active}`}
            className="regions__list"
            onKeyDown={onKeyDown}
          >
            {sorted.map((r, i) => {
              const share = (r.requests / total) * 100
              return (
                <li
                  key={r.id}
                  id={`${id}-r-${i}`}
                  role="option"
                  aria-selected={r.id === pinnedId}
                  className={`regions__item${i === active ? ' is-active' : ''}${r.id === pinnedId ? ' is-pinned' : ''}`}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(i)}
                >
                  <span className="notif-marker" aria-hidden="true" />
                  <span className="regions__name">{r.label}</span>
                  <span className="regions__share">
                    <DotBar value={share} rows={2} cols={24} intro={false} label={`${share.toFixed(1)}% of traffic`} />
                    <span className="regions__pct">{share.toFixed(1)}%</span>
                  </span>
                  <span className="regions__nums">
                    <span>{formatCount(r.requests)}</span>
                    <span className="regions__latency">{formatMs(r.latencyMs)}</span>
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="regions__hint">Pick a region to pin it on the map</p>
        </div>
      )}
    </div>
  )
}
