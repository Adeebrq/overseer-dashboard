import { describe, expect, it } from 'vitest'
import type { Agent } from '../../data/mock'
import { exportFileName, toCsv, toJson, toTsv } from './exportFormats'

const agent: Agent = {
  name: 'Sentinel',
  role: 'Guardrails',
  status: 'healthy',
  success: 98.9,
  costPer1k: 0.4213,
  p95Ms: 1204,
  avatar: 'sentinel',
}

describe('export formats', () => {
  it('writes CSV with headers, clean numbers and CRLF line endings', () => {
    expect(toCsv([agent])).toBe(
      'Agent,Role,Status,Success (%),Cost per 1K (USD),p95 (ms)\r\nSentinel,Guardrails,Healthy,98.9,0.4213,1204\r\n',
    )
  })

  it('quotes CSV cells that contain commas, quotes or newlines', () => {
    const csv = toCsv([{ ...agent, name: 'A, "B"', role: 'x\ny' }])
    expect(csv.split('\r\n')[1]).toBe('"A, ""B""","x\ny",Healthy,98.9,0.4213,1204')
  })

  it('writes TSV that pastes as columns, flattening tabs and newlines', () => {
    const tsv = toTsv([{ ...agent, role: 'a\tb\nc' }])
    expect(tsv.split('\n')).toEqual([
      'Agent\tRole\tStatus\tSuccess (%)\tCost per 1K (USD)\tp95 (ms)',
      'Sentinel\ta b c\tHealthy\t98.9\t0.4213\t1204',
    ])
  })

  it('writes typed JSON', () => {
    expect(JSON.parse(toJson([agent]))).toEqual([
      { agent: 'Sentinel', role: 'Guardrails', status: 'Healthy', successPct: 98.9, costPer1kUsd: 0.4213, p95Ms: 1204 },
    ])
  })

  it('names files with the local date', () => {
    expect(exportFileName('csv', new Date(2026, 9, 14, 23, 30))).toBe('agent-health-2026-10-14.csv')
  })
})
