import { describe, expect, it } from 'vitest'
import { formatCount, formatMs, formatUsd, localDateStamp } from './format'

describe('formatting', () => {
  it('formats money, durations and counts for display', () => {
    expect(formatUsd(0.4213)).toBe('$0.4213')
    expect(formatUsd(1.8)).toBe('$1.8000')
    expect(formatMs(1204)).toBe('1,204 ms')
    expect(formatMs(912)).toBe('912 ms')
    expect(formatCount(118629)).toBe('118,629')
  })

  it('stamps the local calendar date, not UTC', () => {
    expect(localDateStamp(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
