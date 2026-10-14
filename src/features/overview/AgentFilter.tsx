import { useEffect, useId } from 'react'
import { usePopover } from '../../lib/hooks/usePopover'
import type { Agent, Status } from '../../data/mock'
import { STATUSES } from '../../data/status'
import { activeFilterCount, NO_FILTERS, SUCCESS_THRESHOLDS, type Filters } from './filters'
import { Filter } from '../../components/icons'

type Props = { agents: Agent[]; value: Filters; onChange: (f: Filters) => void }

/** Filter button + popover for the Agent Health table. Changes apply immediately. */
export default function AgentFilter({ agents, value, onChange }: Props) {
  const { open, setOpen, up, close, root, button, panel } = usePopover()
  const id = useId()
  const count = activeFilterCount(value)

  useEffect(() => {
    if (open) panel.current?.querySelector<HTMLElement>('input')?.focus()
  }, [open, panel])

  const toggleStatus = (s: Status) =>
    onChange({
      ...value,
      statuses: value.statuses.includes(s) ? value.statuses.filter((x) => x !== s) : [...value.statuses, s],
    })

  return (
    <div className={`filter${open ? ' is-open' : ''}`} ref={root}>
      <button
        ref={button}
        type="button"
        className={`btn btn--tool filter__button${count ? ' has-filters' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((o) => !o)}
      >
        <Filter className="btn__icon" />
        Filter
        {count > 0 && (
          <span className="filter__count" aria-label={`${count} active`}>
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panel}
          id={`${id}-panel`}
          className={`popover filter__panel${up ? ' is-up' : ''}`}
          role="dialog"
          aria-label="Filter agents"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation()
              close()
            }
          }}
        >
          <fieldset className="filter__group">
            <legend className="filter__legend">Status</legend>
            {STATUSES.map((s) => {
              const n = agents.filter((a) => a.status === s.value).length
              return (
                <label key={s.value} className="filter__option">
                  <input
                    type="checkbox"
                    className="pixel-check"
                    checked={value.statuses.includes(s.value)}
                    onChange={() => toggleStatus(s.value)}
                  />
                  <span className={`filter__swatch filter__swatch--${s.value}`} aria-hidden="true" />
                  <span className="filter__label">{s.label}</span>
                  <span className="filter__n">{n}</span>
                </label>
              )
            })}
          </fieldset>

          <fieldset className="filter__group">
            <legend className="filter__legend">Min. success</legend>
            <div className="segmented" role="radiogroup" aria-label="Minimum success rate">
              {SUCCESS_THRESHOLDS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={value.minSuccess === t}
                  className="segmented__item"
                  onClick={() => onChange({ ...value, minSuccess: t })}
                >
                  {t ? `${t}%+` : 'Any'}
                </button>
              ))}
            </div>
          </fieldset>

          <footer className="filter__foot">
            <button type="button" className="filter__clear" disabled={count === 0} onClick={() => onChange(NO_FILTERS)}>
              Clear
            </button>
            <button type="button" className="btn btn--compact filter__done" onClick={close}>
              Done
            </button>
          </footer>
        </div>
      )}
    </div>
  )
}
