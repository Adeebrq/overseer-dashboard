import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Open/close state for a button-anchored popover: closes on outside click, restores focus to
 * the button, and flips the panel upward when there isn't room below it in the window.
 */
export function usePopover<P extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = useState(false)
  const [up, setUp] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<P>(null)

  useLayoutEffect(() => {
    if (!open || !panel.current || !button.current) return
    const below = window.innerHeight - button.current.getBoundingClientRect().bottom
    setUp(below < panel.current.offsetHeight + 12)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const close = () => {
    setOpen(false)
    button.current?.focus()
  }

  return { open, setOpen, up, close, root, button, panel }
}
