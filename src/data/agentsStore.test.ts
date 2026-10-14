import { describe, expect, it } from 'vitest'
import { getAgents, togglePaused } from './agentsStore'

const statusOf = (name: string) => getAgents().find((a) => a.name === name)?.status

describe('agents store', () => {
  it('pauses an agent and resumes it to its previous status', () => {
    expect(statusOf('Orbit')).toBe('deploying')
    expect(togglePaused('Orbit')).toBe('paused')
    expect(statusOf('Orbit')).toBe('paused')
    expect(togglePaused('Orbit')).toBe('deploying')
    expect(statusOf('Orbit')).toBe('deploying')
  })

  it('resumes an agent that started paused as healthy', () => {
    expect(statusOf('Atlas RAG')).toBe('paused')
    expect(togglePaused('Atlas RAG')).toBe('healthy')
    togglePaused('Atlas RAG') // put it back for other tests
  })
})
