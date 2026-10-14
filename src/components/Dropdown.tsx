import { useEffect, useId } from 'react'
import { openOnArrow, useListNavigation } from '../lib/hooks/useListNavigation'
import { usePopover } from '../lib/hooks/usePopover'
import { ChevronDown } from './icons'

type Props<T extends string> = {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}

/**
 * Compact select in the dashboard's button style. Listbox pattern: the button opens a menu,
 * arrows move, Enter/Space picks, Esc or a click outside closes and focus returns to the button.
 */
export default function Dropdown<T extends string>({ label, value, options, onChange }: Props<T>) {
  const { open, setOpen, close, root, button, panel } = usePopover<HTMLUListElement>()
  const id = useId()
  const pick = (i: number) => {
    onChange(options[i])
    close()
  }
  const { active, setActive, onKeyDown } = useListNavigation(options.length, {
    onPick: pick,
    onClose: close,
    onTab: () => setOpen(false),
  })

  useEffect(() => {
    if (!open) return
    setActive(options.indexOf(value))
    panel.current?.focus()
  }, [open, options, value, panel, setActive])

  return (
    <div className={`dropdown${open ? ' is-open' : ''}`} ref={root}>
      <button
        ref={button}
        type="button"
        className="btn dropdown__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${label}: ${value}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={openOnArrow(() => setOpen(true))}
      >
        {value}
        <ChevronDown className="btn__chevron dropdown__chevron" />
      </button>

      {open && (
        <ul
          ref={panel}
          id={`${id}-list`}
          className="dropdown__menu"
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onKeyDown}
        >
          {options.map((o, i) => (
            <li
              key={o}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o === value}
              className={`dropdown__option${i === active ? ' is-active' : ''}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              <span>{o}</span>
              <svg className="dropdown__check" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  d="M2 5.2 4.1 7.3 8 2.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
