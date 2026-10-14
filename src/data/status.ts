import type { Status } from './mock'

/** Display order and labels for agent statuses — the single source for table, filter, search and export. */
export const STATUSES: readonly { value: Status; label: string }[] = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'paused', label: 'Paused' },
  { value: 'deploying', label: 'Deploying' },
  { value: 'degraded', label: 'Degraded' },
]

export const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.value, s.label])) as Record<Status, string>
