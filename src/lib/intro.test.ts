import { describe, expect, it } from 'vitest'
import { DOTS_JITTER_MS, DOTS_START_MS, DOTS_SWEEP_MS, dotDelay, jitter } from './intro'

describe('pixel intro timing', () => {
  it('is deterministic, so dots never reshuffle between renders', () => {
    expect(jitter(3, 7)).toBe(jitter(3, 7))
    expect(dotDelay(0.5, 3, 7)).toBe(dotDelay(0.5, 3, 7))
  })

  it('keeps every delay inside the sweep window', () => {
    for (let t = 0; t <= 1; t += 0.1) {
      for (let s = 0; s < 20; s++) {
        const d = dotDelay(t, s, s * 3)
        expect(d).toBeGreaterThanOrEqual(DOTS_START_MS)
        expect(d).toBeLessThanOrEqual(DOTS_START_MS + DOTS_SWEEP_MS + DOTS_JITTER_MS)
      }
    }
  })
})
