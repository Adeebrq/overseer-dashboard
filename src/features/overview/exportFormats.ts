import type { Agent } from '../../data/mock'
import { STATUS_LABEL } from '../../data/status'
import { localDateStamp } from '../../lib/format'

// Exports carry clean, typed values (no "$" or "ms") so spreadsheets can sort and sum them.
const COLUMNS: { header: string; value: (a: Agent) => string | number }[] = [
  { header: 'Agent', value: (a) => a.name },
  { header: 'Role', value: (a) => a.role },
  { header: 'Status', value: (a) => STATUS_LABEL[a.status] },
  { header: 'Success (%)', value: (a) => a.success },
  { header: 'Cost per 1K (USD)', value: (a) => a.costPer1k },
  { header: 'p95 (ms)', value: (a) => a.p95Ms },
]

const csvCell = (v: string | number) => {
  const s = String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows: Agent[]) {
  const lines = [COLUMNS.map((c) => c.header), ...rows.map((r) => COLUMNS.map((c) => c.value(r)))]
  return lines.map((cells) => cells.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

/** Tab-separated, which pastes into spreadsheets as columns. */
export function toTsv(rows: Agent[]) {
  const lines = [COLUMNS.map((c) => c.header), ...rows.map((r) => COLUMNS.map((c) => c.value(r)))]
  return lines.map((cells) => cells.map((v) => String(v).replace(/[\t\r\n]/g, ' ')).join('\t')).join('\n')
}

export function toJson(rows: Agent[]) {
  const data = rows.map((r) => ({
    agent: r.name,
    role: r.role,
    status: STATUS_LABEL[r.status],
    successPct: r.success,
    costPer1kUsd: r.costPer1k,
    p95Ms: r.p95Ms,
  }))
  return JSON.stringify(data, null, 2) + '\n'
}

export const exportFileName = (ext: string, date = new Date()) => `agent-health-${localDateStamp(date)}.${ext}`

/** Triggers a browser download of `text`; returns the file name used. */
export function downloadFile(text: string, mime: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return fileName
}
