/** Display formatting. Data stays numeric; only the UI turns it into strings. */

export const formatUsd = (value: number, decimals = 4) => `$${value.toFixed(decimals)}`

export const formatMs = (value: number) => `${value.toLocaleString('en-US')} ms`

export const formatCount = (value: number) => value.toLocaleString('en-US')

/** YYYY-MM-DD in the user's local time zone (toISOString would give UTC). */
export function localDateStamp(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
