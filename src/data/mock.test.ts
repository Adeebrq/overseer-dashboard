import { describe, expect, it } from 'vitest'
import { agents, avatarFor, inferenceViews, regions } from './mock'
import { STATUS_LABEL } from './status'
import { worldDots } from './worldDots'

describe('mock data consistency', () => {
  it('regions add up to the Regional Traffic headline', () => {
    expect(regions.reduce((sum, r) => sum + r.requests, 0)).toBe(67_546)
  })

  it('monthly and weekly headlines are the sum of their daily points', () => {
    for (const range of ['Monthly', 'Weekly'] as const) {
      const v = inferenceViews[range]
      const days = v.series.slice(1, -1) // first/last points only carry the line to the edges
      expect(days.reduce((s, p) => s + p.v, 0)).toBe(v.total)
    }
  })

  it('every series fits under its axis', () => {
    for (const v of Object.values(inferenceViews)) {
      expect(Math.max(...v.series.map((p) => p.v))).toBeLessThanOrEqual(v.max)
    }
  })

  it('every agent has a label and both avatar renders', () => {
    for (const a of agents) {
      expect(STATUS_LABEL[a.status]).toBeTruthy()
      expect(avatarFor(a, 'dark')).toBe(`/avatars/${a.avatar}.png`)
      expect(avatarFor(a, 'light')).toBe(`/avatars/light/${a.avatar}.png`)
    }
  })

  it('decodes all 2,614 map dots from the design', () => {
    expect(worldDots).toHaveLength(2614)
  })
})
