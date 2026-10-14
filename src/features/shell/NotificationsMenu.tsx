import { useEffect, useId, useMemo, useState } from 'react'
import { Bell } from '../../components/icons'
import { initialNotifications, type Notification } from '../../data/notifications'
import { focusAgent } from '../../lib/agentFocus'
import { openOnArrow, useListNavigation } from '../../lib/hooks/useListNavigation'
import { usePopover } from '../../lib/hooks/usePopover'

type Tab = 'all' | 'unread'

/** Bell button + notifications panel. Clicking an item marks it read and, for agents, reveals its row. */
export default function NotificationsMenu() {
  const { open, setOpen, close, root, button, panel } = usePopover<HTMLDivElement>()
  const [items, setItems] = useState<Notification[]>(initialNotifications)
  const [tab, setTab] = useState<Tab>('all')
  const id = useId()

  const unread = items.filter((n) => !n.read).length
  const shown = useMemo(() => (tab === 'unread' ? items.filter((n) => !n.read) : items), [items, tab])

  const markRead = (ids: string[]) => setItems((all) => all.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)))

  const pick = (i: number) => {
    const n = shown[i]
    if (!n) return
    markRead([n.id])
    if (n.agent) {
      setOpen(false)
      location.hash = '#/overview'
      focusAgent(n.agent)
    }
  }

  const { active, setActive, onKeyDown } = useListNavigation(shown.length, {
    onPick: pick,
    onClose: close,
    onTab: () => setOpen(false),
  })

  useEffect(() => {
    if (!open) return
    setActive(0)
    panel.current?.querySelector<HTMLElement>('[role=listbox]')?.focus()
  }, [open, tab, panel, setActive])

  return (
    <div className={`notifications${open ? ' is-open' : ''}`} ref={root}>
      <button
        ref={button}
        type="button"
        className="icon-btn topbar__bell"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={openOnArrow(() => setOpen(true))}
      >
        <Bell />
        {unread > 0 && <span className="topbar__bell-dot" aria-hidden="true" />}
      </button>

      {open && (
        <div
          ref={panel}
          id={`${id}-panel`}
          className="popover notifications__panel"
          role="dialog"
          aria-label="Notifications"
          onKeyDown={(e) => {
            // Esc closes from anywhere in the panel (tabs, "Mark all", empty state), not just the list.
            if (e.key === 'Escape') {
              e.preventDefault()
              close()
            }
          }}
        >
          <header className="notifications__head">
            <h2 className="label-mono notifications__title">Notifications</h2>
            <button
              type="button"
              className="filter__clear notifications__mark"
              disabled={unread === 0}
              onClick={() => markRead(items.map((n) => n.id))}
            >
              Mark all as read
            </button>
          </header>

          <div className="segmented notifications__tabs" role="radiogroup" aria-label="Show">
            {(['all', 'unread'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tab === t}
                className="segmented__item"
                onClick={() => setTab(t)}
              >
                {t === 'all' ? 'All' : `Unread${unread ? ` · ${unread}` : ''}`}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="notifications__empty">You’re all caught up.</p>
          ) : (
            <ul
              role="listbox"
              tabIndex={-1}
              aria-label={tab === 'all' ? 'All notifications' : 'Unread notifications'}
              aria-activedescendant={`${id}-n-${active}`}
              className="notifications__list"
              onKeyDown={onKeyDown}
            >
              {shown.map((n, i) => (
                <li
                  key={n.id}
                  id={`${id}-n-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`notifications__item${i === active ? ' is-active' : ''}${n.read ? '' : ' is-unread'}`}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(i)}
                >
                  <span className={`notif-marker notif-marker--${n.tone}`} aria-hidden="true" />
                  <span className="notifications__text">
                    <span className="notifications__item-title">{n.title}</span>
                    <span className="notifications__detail">{n.detail}</span>
                  </span>
                  <span className="notifications__meta">
                    <time className="notifications__time">{n.time}</time>
                    {!n.read && <span className="notifications__unread" aria-label="Unread" />}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
