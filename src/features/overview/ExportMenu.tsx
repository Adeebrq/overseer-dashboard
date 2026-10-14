import { useEffect, useId } from 'react'
import { toast } from '../../lib/toast'
import type { Agent } from '../../data/mock'
import { downloadFile, exportFileName, toCsv, toJson, toTsv } from './exportFormats'
import { openOnArrow, useListNavigation } from '../../lib/hooks/useListNavigation'
import { usePopover } from '../../lib/hooks/usePopover'
import { Export } from '../../components/icons'

/** Export button + menu. Exports exactly the rows currently shown (search, filters and sort applied). */
export default function ExportMenu({ rows }: { rows: Agent[] }) {
  const { open, setOpen, up, close, root, button, panel } = usePopover<HTMLUListElement>()
  const id = useId()
  const n = rows.length
  const label = `${n} ${n === 1 ? 'agent' : 'agents'}`

  const actions = [
    {
      key: 'csv',
      title: 'Download CSV',
      hint: 'Excel, Sheets, Numbers',
      run: async () => {
        const file = downloadFile(toCsv(rows), 'text/csv;charset=utf-8', exportFileName('csv'))
        toast({ title: `Exported ${label}`, description: file })
      },
    },
    {
      key: 'json',
      title: 'Download JSON',
      hint: 'For scripts & APIs',
      run: async () => {
        const file = downloadFile(toJson(rows), 'application/json', exportFileName('json'))
        toast({ title: `Exported ${label}`, description: file })
      },
    },
    {
      key: 'copy',
      title: 'Copy to clipboard',
      hint: 'Pastes as columns',
      run: async () => {
        try {
          await navigator.clipboard.writeText(toTsv(rows))
          toast({ title: `Copied ${label}`, description: 'Paste into any spreadsheet' })
        } catch {
          toast({ tone: 'error', title: 'Couldn’t copy', description: 'Your browser blocked clipboard access' })
        }
      },
    },
  ]

  const pick = (i: number) => {
    close()
    actions[i].run()
  }
  const { active, setActive, onKeyDown } = useListNavigation(actions.length, {
    onPick: pick,
    onClose: close,
    onTab: () => setOpen(false),
  })

  useEffect(() => {
    if (!open) return
    setActive(0)
    panel.current?.focus()
  }, [open, panel, setActive])

  return (
    <div className={`filter export${open ? ' is-open' : ''}`} ref={root}>
      <button
        ref={button}
        type="button"
        className="btn btn--tool export__button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        disabled={n === 0}
        title={n === 0 ? 'Nothing to export' : `Export ${label}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={openOnArrow(() => setOpen(true))}
      >
        <Export className="btn__icon" />
        Export
      </button>

      {open && (
        <ul
          ref={panel}
          id={`${id}-menu`}
          role="menu"
          tabIndex={-1}
          aria-label={`Export ${label}`}
          className={`popover export__menu${up ? ' is-up' : ''}`}
          onKeyDown={onKeyDown}
          aria-activedescendant={`${id}-item-${active}`}
        >
          <li className="export__caption" role="presentation">
            {label} · current view
          </li>
          {actions.map((a, i) => (
            <li
              key={a.key}
              id={`${id}-item-${i}`}
              role="menuitem"
              className={`export__item${i === active ? ' is-active' : ''}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              <span className="export__title">{a.title}</span>
              <span className="export__hint">{a.hint}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
