import { useEffect, useId, useRef } from 'react'
import { setTheme, useTheme } from '../../lib/theme'
import { openOnArrow, useListNavigation } from '../../lib/hooks/useListNavigation'
import { usePopover } from '../../lib/hooks/usePopover'
import { Kebab } from '../../components/icons'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const SHORTCUTS: [string, string[]][] = [
  ['Search agents & pages', [isMac ? '⌘' : 'Ctrl', 'K']],
  ['Search (when not typing)', ['/']],
  ['Move through results & menus', ['↑', '↓']],
  ['Open the highlighted item', ['↵']],
  ['Close a menu or dialog', ['esc']],
]

type Props = { onSignOut: () => void; onNavigate: () => void }

/** The account card at the bottom of the sidebar, its menu, and the dialogs it opens. */
export default function AccountMenu({ onSignOut, onNavigate }: Props) {
  const { open, setOpen, close, root, button, panel } = usePopover<HTMLUListElement>()
  const shortcuts = useRef<HTMLDialogElement>(null)
  const confirm = useRef<HTMLDialogElement>(null)
  const id = useId()
  const theme = useTheme()

  type Item = {
    key: string
    label: string
    hint?: string
    danger?: boolean
    checked?: boolean
    keepOpen?: boolean
    run: () => void
  }
  const items: Item[] = [
    { key: 'profile', label: 'Profile', run: () => go('#/profile') },
    { key: 'settings', label: 'Settings', run: () => go('#/settings') },
    {
      key: 'theme',
      label: 'Light mode',
      checked: theme === 'light',
      keepOpen: true,
      run: () => setTheme(theme === 'light' ? 'dark' : 'light'),
    },
    {
      key: 'shortcuts',
      label: 'Keyboard shortcuts',
      hint: isMac ? '⌘K' : 'Ctrl K',
      run: () => shortcuts.current?.showModal(),
    },
    { key: 'logout', label: 'Log out', danger: true, run: () => confirm.current?.showModal() },
  ]

  function go(hash: string) {
    location.hash = hash
    onNavigate()
  }

  const pick = (i: number) => {
    if (!items[i].keepOpen) setOpen(false)
    items[i].run()
  }
  const { active, setActive, onKeyDown } = useListNavigation(items.length, {
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
    <div className={`account${open ? ' is-open' : ''}`} ref={root}>
      <button
        ref={button}
        type="button"
        className="user-card hatch-card hatch-card--left"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-label="Account menu for @adeebrq"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={openOnArrow(() => setOpen(true))}
      >
        <span className="user-card__initials">AQ</span>
        <span className="user-card__who">
          <span className="user-card__name">@adeebrq</span>
          <span className="user-card__role">Owner</span>
        </span>
        <span className="user-card__more" aria-hidden="true">
          <Kebab />
        </span>
      </button>

      {open && (
        <ul
          ref={panel}
          id={`${id}-menu`}
          role="menu"
          tabIndex={-1}
          aria-label="Account"
          aria-activedescendant={`${id}-item-${active}`}
          className="popover account__menu"
          onKeyDown={onKeyDown}
        >
          <li className="account__head" role="presentation">
            <span className="user-card__initials">AQ</span>
            <span className="account__who">
              <span className="account__name">@adeebrq</span>
              <span className="account__role">Owner · Overseer</span>
            </span>
          </li>
          {items.map((it, i) => (
            <li
              key={it.key}
              id={`${id}-item-${i}`}
              role={it.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
              aria-checked={it.checked}
              className={`menu-item${i === active ? ' is-active' : ''}${it.danger ? ' is-danger' : ''}${
                it.danger ? ' has-rule' : ''
              }`}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              <span>{it.label}</span>
              {it.hint && <kbd className="account__kbd">{it.hint}</kbd>}
              {it.checked !== undefined && (
                <span className={`switch${it.checked ? ' is-on' : ''}`} aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      )}

      <dialog ref={shortcuts} className="modal" aria-labelledby={`${id}-sc-title`}>
        <h2 id={`${id}-sc-title`} className="label-mono modal__title">
          Keyboard shortcuts
        </h2>
        <dl className="shortcuts">
          {SHORTCUTS.map(([what, keys]) => (
            <div key={what} className="shortcuts__row">
              <dt>{what}</dt>
              <dd>
                {keys.map((k) => (
                  <kbd key={k}>{k}</kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
        <form method="dialog" className="modal__actions">
          <button className="btn btn--compact" autoFocus>
            Done
          </button>
        </form>
      </dialog>

      <dialog ref={confirm} className="modal modal--narrow" aria-labelledby={`${id}-lo-title`}>
        <h2 id={`${id}-lo-title`} className="label-mono modal__title">
          Log out?
        </h2>
        <p className="modal__text">You’ll need to sign in again to get back to the console.</p>
        <form method="dialog" className="modal__actions">
          <button className="btn btn--compact btn--ghost" autoFocus>
            Cancel
          </button>
          <button
            className="btn btn--compact btn--danger"
            onClick={(e) => {
              e.preventDefault()
              confirm.current?.close()
              onSignOut()
            }}
          >
            Log out
          </button>
        </form>
      </dialog>
    </div>
  )
}
