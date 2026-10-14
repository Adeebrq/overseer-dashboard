import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const KEY = 'theme'
const listeners = new Set<() => void>()
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: light)') : null

function saved(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

/** Saved choice wins; otherwise follow the system setting. */
const resolve = (): Theme => saved() ?? (media?.matches ? 'light' : 'dark')

function apply(theme: Theme, animate: boolean) {
  const root = document.documentElement
  if (animate) {
    // Briefly cross-fade colours so the switch doesn't flash.
    root.classList.add('theme-switching')
    window.setTimeout(() => root.classList.remove('theme-switching'), 300)
  }
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#EEF2EF' : '#1F2421')
  listeners.forEach((l) => l())
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode etc. — the switch still works for this visit */
  }
  apply(theme, true)
}

// Follow system changes until the user picks a theme themselves.
media?.addEventListener('change', () => {
  if (!saved()) apply(resolve(), true)
})

export function useTheme(): Theme {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'),
  )
}
