import { useState, type KeyboardEvent } from 'react'

type Options = {
  onPick: (index: number) => void
  onClose: () => void
  /** Tab leaves the menu; focus moves on naturally. */
  onTab?: () => void
}

/**
 * Keyboard model shared by the dashboard's menus (aria-activedescendant pattern):
 * ↑/↓ wrap, Home/End jump, Enter/Space pick, Esc closes, Tab leaves.
 */
export function useListNavigation(count: number, { onPick, onClose, onTab }: Options) {
  const [active, setActive] = useState(0)

  const onKeyDown = (e: KeyboardEvent) => {
    const last = count - 1
    switch (e.key) {
      case 'ArrowDown':
        setActive((i) => (i >= last ? 0 : i + 1))
        break
      case 'ArrowUp':
        setActive((i) => (i <= 0 ? last : i - 1))
        break
      case 'Home':
        setActive(0)
        break
      case 'End':
        setActive(last)
        break
      case 'Enter':
      case ' ':
        onPick(active)
        break
      case 'Escape':
        onClose()
        break
      case 'Tab':
        onTab?.()
        return
      default:
        return
    }
    e.preventDefault()
  }

  return { active, setActive, onKeyDown }
}

/** ↑/↓ on a menu's trigger button opens the menu. */
export const openOnArrow = (open: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    open()
  }
}
