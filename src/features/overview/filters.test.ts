import { describe, expect, it } from 'vitest'
import { agents } from '../../data/mock'
import { activeFilterCount, matchesFilters, NO_FILTERS, type Filters } from './filters'

const names = (f: Filters) => agents.filter((a) => matchesFilters(a, f)).map((a) => a.name)

describe('agent filters', () => {
  it('lets everything through with no filters', () => {
    expect(names(NO_FILTERS)).toHaveLength(agents.length)
    expect(activeFilterCount(NO_FILTERS)).toBe(0)
  })

  it('combines statuses (OR) with the success threshold (AND)', () => {
    const f: Filters = { statuses: ['healthy', 'degraded'], minSuccess: 90 }
    expect(names(f)).toEqual(['Sentinel', 'Vector QA'])
    expect(activeFilterCount(f)).toBe(3)
  })
})
