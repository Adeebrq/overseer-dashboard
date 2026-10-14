import type { Agent, Status } from '../../data/mock'

export type Filters = { statuses: Status[]; minSuccess: number }

export const NO_FILTERS: Filters = { statuses: [], minSuccess: 0 }

/** Minimum success-rate options offered in the filter panel (0 = any). */
export const SUCCESS_THRESHOLDS = [0, 85, 90, 95] as const

export const matchesFilters = (a: Agent, f: Filters) =>
  (f.statuses.length === 0 || f.statuses.includes(a.status)) && a.success >= f.minSuccess

export const activeFilterCount = (f: Filters) => f.statuses.length + (f.minSuccess > 0 ? 1 : 0)
