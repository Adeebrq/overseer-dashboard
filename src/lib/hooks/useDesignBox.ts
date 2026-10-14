import { useLayoutEffect, useRef, useState } from 'react'

/** CSS px per design px. The root font-size is 16px at the 1280px design width. */
export function designScale() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) / 16
}

/** Tracks an element's width, expressed in design pixels. */
export function useDesignBox<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(el.getBoundingClientRect().width / designScale())
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    // Root font-size changes with the viewport; re-measure in case no box resize is reported.
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return [ref, width] as const
}
