import { useEffect, useState } from 'react'

// Shared load-intro timing for the dot charts: a line/marker phase, then dots
// switch on one by one, sweeping left → right with a little scatter.
export const LINE_MS = 770
export const DOTS_START_MS = 595
export const DOTS_SWEEP_MS = 1050
export const DOTS_JITTER_MS = 245
export const INTRO_MS = DOTS_START_MS + DOTS_SWEEP_MS + DOTS_JITTER_MS + 100
/** Each pixel flashes bright for PIXEL_FLASH_MS, settling by PIXEL_MS. */
export const PIXEL_MS = 200
export const PIXEL_FLASH_MS = 90

export const DOT_COLORS = {
  green: { color: '#00a449', flash: '#4ade80' },
  amber: { color: '#e0b36a', flash: '#f6d59b' },
  track: '--dot-track', // CSS variable, so it follows the theme
}

/** When a dot at horizontal position `t` (0–1) switches on. */
export const dotDelay = (t: number, seedA: number, seedB: number) =>
  DOTS_START_MS + t * DOTS_SWEEP_MS + jitter(seedA, seedB) * DOTS_JITTER_MS

/** Stable pseudo-random 0–1, so the pixel order looks scattered but never reshuffles. */
export function jitter(a: number, b: number) {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return n - Math.floor(n)
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * True while the intro should play. It starts once `ready` (e.g. the element has been
 * measured) and turns off after the intro, so later re-renders and resizes never replay it.
 */
export function useIntro(ready: boolean, extraMs = 0) {
  const [intro, setIntro] = useState(() => !prefersReducedMotion())
  useEffect(() => {
    if (!intro || !ready) return
    const t = window.setTimeout(() => setIntro(false), INTRO_MS + extraMs)
    return () => window.clearTimeout(t)
  }, [intro, ready, extraMs])
  return intro
}
