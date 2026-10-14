import type { Status } from './mock'

export type Notification = {
  id: string
  /** Colours the marker the same way as agent statuses; 'info' for neutral updates. */
  tone: Status | 'info'
  title: string
  detail: string
  /** Relative time, already formatted (mock data). */
  time: string
  /** Agent this is about — clicking reveals its row in Agent Health. */
  agent?: string
  read: boolean
}

// Placeholder feed, consistent with the agents and figures shown on the overview.
export const initialNotifications: Notification[] = [
  {
    id: 'n1',
    tone: 'degraded',
    title: 'Courier is degraded',
    detail: 'Success rate dropped to 85.2% · p95 1,627 ms',
    time: '2m',
    agent: 'Courier',
    read: false,
  },
  {
    id: 'n2',
    tone: 'deploying',
    title: 'Orbit is deploying',
    detail: 'Rollout at 60% across 3 regions',
    time: '14m',
    agent: 'Orbit',
    read: false,
  },
  {
    id: 'n3',
    tone: 'paused',
    title: 'Atlas RAG was paused',
    detail: 'Paused by @adeebrq',
    time: '1h',
    agent: 'Atlas RAG',
    read: false,
  },
  {
    id: 'n4',
    tone: 'healthy',
    title: 'Eval pass rate is up 2.1%',
    detail: 'Now 92.6% · 73 failed this week',
    time: '3h',
    read: true,
  },
  {
    id: 'n5',
    tone: 'info',
    title: 'Token budget 61% used',
    detail: '612K of 1M · resets in 9 days',
    time: '1d',
    read: true,
  },
]
