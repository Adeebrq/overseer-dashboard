import { dotDelay } from '../lib/intro'
import type { Dot } from './DotCanvas'

export const PITCH = 3.93
export const DOT = 2.56

/**
 * Dot positions for a bar filled to `value`%. Filled columns are solid; the last few break up in a
 * staggered checker (rows repeat every three) so the edge reads as a dither, as in the design.
 * While `intro` plays the whole track starts dark and lit dots switch on over it.
 */
export function dotBarCells(value: number, rows: number, cols: number, intro: boolean) {
  const end = Math.min(cols - 1, Math.floor((cols * value) / 100))
  const on: Dot[] = []
  const off: Dot[] = []
  for (let r = 0; r < rows; r++) {
    const phase = r % 3
    const start = phase === 0 ? end : end - (phase === 1 ? 3 : 2)
    for (let c = 0; c < cols; c++) {
      const lit = c < start || (phase !== 0 && c <= end && (c - start) % 2 === 1)
      const x = c * PITCH
      const y = r * PITCH
      if (lit) on.push({ x, y, delay: dotDelay(c / cols, c + value, r) })
      if (!lit || intro) off.push({ x, y })
    }
  }
  return { on, off }
}
