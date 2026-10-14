import { useSyncExternalStore } from 'react'

export type Toast = {
  id: number
  title: string
  description?: string
  tone: 'success' | 'error'
  /** Set while the exit animation plays. */
  leaving?: boolean
}

const DURATION_MS = 3200
const EXIT_MS = 220
const MAX = 3

let toasts: Toast[] = []
let nextId = 1
const listeners = new Set<() => void>()
const timers = new Map<number, number>()

const emit = () => listeners.forEach((l) => l())
const set = (next: Toast[]) => {
  toasts = next
  emit()
}

function schedule(id: number, ms = DURATION_MS) {
  window.clearTimeout(timers.get(id))
  timers.set(
    id,
    window.setTimeout(() => dismiss(id), ms),
  )
}

/** Show a toast from anywhere: `toast({ title: 'Copied' })`. */
export function toast(t: Omit<Toast, 'id' | 'tone'> & { tone?: Toast['tone'] }) {
  const id = nextId++
  set([...toasts, { tone: 'success', ...t, id }])
  schedule(id)
  // Keep the stack short: retire the oldest beyond the limit.
  const live = toasts.filter((x) => !x.leaving)
  live.slice(0, Math.max(0, live.length - MAX)).forEach((old) => dismiss(old.id))
  return id
}

export function dismiss(id: number) {
  window.clearTimeout(timers.get(id))
  timers.delete(id)
  if (!toasts.some((t) => t.id === id && !t.leaving)) return
  set(toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
  window.setTimeout(() => set(toasts.filter((t) => t.id !== id)), EXIT_MS)
}

/** Hovering or focusing a toast holds it on screen; leaving restarts a shorter timer. */
export const pause = (id: number) => window.clearTimeout(timers.get(id))
export const resume = (id: number) => schedule(id, 1600)

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => toasts,
  )
}
