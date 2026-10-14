import { useEffect, useId, useLayoutEffect, useState, type CSSProperties } from 'react'
import { More } from '../../components/icons'
import { togglePaused } from '../../data/agentsStore'
import type { Agent } from '../../data/mock'
import { STATUS_LABEL } from '../../data/status'
import { openOnArrow, useListNavigation } from '../../lib/hooks/useListNavigation'
import { usePopover } from '../../lib/hooks/usePopover'
import { agentHref } from '../../lib/router'
import { toast } from '../../lib/toast'

const GAP = 6

/**
 * "⋯" menu for one agent row. The table scrolls sideways on small screens, which would clip an
 * absolutely positioned menu, so this one is fixed to the viewport next to its button.
 */
export default function RowActions({ agent }: { agent: Agent }) {
  const { open, setOpen, close, root, button, panel } = usePopover<HTMLUListElement>()
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' })
  const id = useId()
  const paused = agent.status === 'paused'

  const pauseOrResume = () => {
    const next = togglePaused(agent.name)
    const undo = { label: 'Undo', run: () => togglePaused(agent.name) }
    toast(
      next === 'paused'
        ? { title: `${agent.name} paused`, description: 'Stopped until you resume it', action: undo }
        : { title: `${agent.name} resumed`, description: `Back to ${STATUS_LABEL[next].toLowerCase()}`, action: undo },
    )
  }

  const copyName = async () => {
    try {
      await navigator.clipboard.writeText(agent.name)
      toast({ title: 'Copied agent name', description: agent.name })
    } catch {
      toast({ tone: 'error', title: 'Couldn’t copy', description: 'Your browser blocked clipboard access' })
    }
  }

  const items = [
    { key: 'details', label: 'View details', run: () => (location.hash = agentHref(agent)) },
    { key: 'pause', label: paused ? 'Resume agent' : 'Pause agent', run: pauseOrResume },
    { key: 'copy', label: 'Copy agent name', run: copyName },
  ]

  const pick = (i: number) => {
    close()
    items[i].run()
  }
  const { active, setActive, onKeyDown } = useListNavigation(items.length, {
    onPick: pick,
    onClose: close,
    onTab: () => setOpen(false),
  })

  // Place the menu under the button (right-aligned), or above it when there isn't room below.
  useLayoutEffect(() => {
    if (!open || !button.current || !panel.current) return
    const b = button.current.getBoundingClientRect()
    const h = panel.current.offsetHeight
    const right = Math.max(GAP, window.innerWidth - b.right)
    setStyle(
      window.innerHeight - b.bottom < h + GAP * 2
        ? { right, bottom: window.innerHeight - b.top + GAP }
        : { right, top: b.bottom + GAP },
    )
  }, [open, button, panel])

  useEffect(() => {
    if (!open) {
      setStyle({ visibility: 'hidden' })
      return
    }
    setActive(0)
    panel.current?.focus()
    // A fixed menu would drift away from its row, so close on scroll or resize instead.
    const dismiss = () => setOpen(false)
    window.addEventListener('scroll', dismiss, true)
    window.addEventListener('resize', dismiss)
    return () => {
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('resize', dismiss)
    }
  }, [open, panel, setActive, setOpen])

  return (
    <div className={`row-actions${open ? ' is-open' : ''}`} ref={root}>
      <button
        ref={button}
        type="button"
        className="icon-btn"
        aria-label={`Actions for ${agent.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={openOnArrow(() => setOpen(true))}
      >
        <More />
      </button>
      {open && (
        <ul
          ref={panel}
          id={`${id}-menu`}
          role="menu"
          tabIndex={-1}
          aria-label={`Actions for ${agent.name}`}
          aria-activedescendant={`${id}-item-${active}`}
          className="popover row-actions__menu"
          style={style}
          onKeyDown={onKeyDown}
        >
          {items.map((it, i) => (
            <li
              key={it.key}
              id={`${id}-item-${i}`}
              role="menuitem"
              className={`menu-item${i === active ? ' is-active' : ''}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              {it.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
