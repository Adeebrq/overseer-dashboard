import { useEffect, useLayoutEffect, useRef } from 'react'
import { PIXEL_FLASH_MS, PIXEL_MS } from '../lib/intro'

export type Dot = { x: number; y: number; delay?: number }

type Props = {
  /** Coordinate space the dots are given in: [x, y, width, height]. Stretched to fill the box. */
  viewBox: [number, number, number, number]
  /** Square size, in viewBox units. */
  size: number
  /** Dots that switch on (pixel intro when `animate`). */
  dots: Dot[]
  /** Always-visible background dots, e.g. a progress track. */
  track?: Dot[]
  color: string
  flash: string
  trackColor?: string
  animate: boolean
  className?: string
}

/**
 * Pixel dots drawn on a canvas. Thousands of DOM nodes animating at once made the load intro
 * drop to a few frames per second; a canvas redraws them all in well under a millisecond,
 * then simply keeps its last frame. Squares are snapped to device pixels (like crispEdges).
 */
export default function DotCanvas({ viewBox, size, dots, track, color, flash, trackColor, animate, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const props = useRef({ viewBox, size, dots, track, color, flash, trackColor })
  props.current = { viewBox, size, dots, track, color, flash, trackColor }
  const start = useRef<number | null>(animate ? null : -Infinity)
  const raf = useRef(0)
  const drawRef = useRef<() => boolean>(() => false)

  drawRef.current = () => {
    const canvas = ref.current
    if (!canvas) return false
    const { width: cw, height: ch } = canvas.getBoundingClientRect()
    if (!cw || !ch) return false
    const dpr = window.devicePixelRatio || 1
    const W = Math.round(cw * dpr)
    const H = Math.round(ch * dpr)
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W
      canvas.height = H
    }
    const ctx = canvas.getContext('2d')!
    const p = props.current
    const css = getComputedStyle(canvas)
    const paint = (c: string) => (c.startsWith('--') ? css.getPropertyValue(c).trim() : c)
    const [vx, vy, vw, vh] = p.viewBox
    const sx = W / vw
    const sy = H / vh
    const rect = (d: Dot) => {
      const x0 = Math.round((d.x - vx) * sx)
      const y0 = Math.round((d.y - vy) * sy)
      ctx.rect(
        x0,
        y0,
        Math.max(1, Math.round((d.x - vx + p.size) * sx) - x0),
        Math.max(1, Math.round((d.y - vy + p.size) * sy) - y0),
      )
    }

    ctx.clearRect(0, 0, W, H)
    if (p.track && p.trackColor) {
      ctx.beginPath()
      p.track.forEach(rect)
      ctx.fillStyle = paint(p.trackColor)
      ctx.fill()
    }

    if (start.current === null) start.current = performance.now()
    const t = performance.now() - start.current
    let pending = false
    const lit = new Path2D()
    const flashing = new Path2D()
    for (const d of p.dots) {
      const delay = d.delay ?? 0
      if (t < delay) {
        pending = true
        continue
      }
      const target = t < delay + PIXEL_FLASH_MS ? flashing : lit
      if (t < delay + PIXEL_MS) pending = true
      const x0 = Math.round((d.x - vx) * sx)
      const y0 = Math.round((d.y - vy) * sy)
      target.rect(
        x0,
        y0,
        Math.max(1, Math.round((d.x - vx + p.size) * sx) - x0),
        Math.max(1, Math.round((d.y - vy + p.size) * sy) - y0),
      )
    }
    ctx.fillStyle = paint(p.color)
    ctx.fill(lit)
    ctx.fillStyle = paint(p.flash)
    ctx.fill(flashing)
    return pending
  }

  // Intro loop: redraw every frame until the last dot has settled, then stop.
  useEffect(() => {
    const tick = () => {
      if (drawRef.current()) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  // Static redraw whenever the dots or the box change (resizes, hover highlights, data).
  useLayoutEffect(() => {
    if (start.current !== null && !drawRef.current()) cancelAnimationFrame(raf.current)
  })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ro = new ResizeObserver(() => drawRef.current())
    ro.observe(canvas)
    // Theme switch: colours are read from CSS, so just redraw.
    const mo = new MutationObserver(() => drawRef.current())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
