import { describe, expect, it } from 'vitest'
import { dotBarCells } from './dotBarCells'

describe('dot bar pattern', () => {
  it('fills every cell exactly once (lit or track) at rest', () => {
    const { on, off } = dotBarCells(98.9, 6, 44, false)
    expect(on.length + off.length).toBe(6 * 44)
  })

  it('matches the design edge for 98.9%: row 0 lit to column 42, rows 1–2 dithered', () => {
    const { on } = dotBarCells(98.9, 6, 44, false)
    const row = (r: number) => on.filter((d) => Math.round(d.y / 3.93) === r).map((d) => Math.round(d.x / 3.93))
    expect(row(0).at(-1)).toBe(42)
    expect(row(1).slice(-2)).toEqual([41, 43]) // "…#.#.#" checker
    expect(row(2).slice(-2)).toEqual([40, 42])
  })

  it('keeps the whole track under the lit dots while the intro plays', () => {
    const { off } = dotBarCells(50, 3, 44, true)
    expect(off).toHaveLength(3 * 44)
  })
})
