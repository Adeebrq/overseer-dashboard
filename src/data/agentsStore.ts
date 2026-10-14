import { useSyncExternalStore } from 'react'
import { agents as initialAgents, type Agent, type Status } from './mock'

/**
 * Live agent list shared by the table, filter counts, search and exports, so actions like
 * Pause/Resume show up everywhere at once. Starts from the mock data.
 */
let agents: Agent[] = initialAgents
const listeners = new Set<() => void>()
/** Status each paused agent had before pausing, so Resume restores it. */
const beforePause = new Map<string, Status>()

const set = (next: Agent[]) => {
  agents = next
  listeners.forEach((l) => l())
}

export const getAgents = () => agents

export function setAgentStatus(name: string, status: Status) {
  set(agents.map((a) => (a.name === name ? { ...a, status } : a)))
}

/** Pauses a running agent or resumes a paused one; returns the new status. */
export function togglePaused(name: string): Status {
  const agent = agents.find((a) => a.name === name)
  if (!agent) throw new Error(`Unknown agent: ${name}`)
  if (agent.status === 'paused') {
    const restored = beforePause.get(name) ?? 'healthy'
    beforePause.delete(name)
    setAgentStatus(name, restored)
    return restored
  }
  beforePause.set(name, agent.status)
  setAgentStatus(name, 'paused')
  return 'paused'
}

export function useAgents() {
  return useSyncExternalStore((l) => {
    listeners.add(l)
    return () => listeners.delete(l)
  }, getAgents)
}
