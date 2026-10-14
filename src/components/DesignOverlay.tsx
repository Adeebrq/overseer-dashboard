import { useEffect, useState } from 'react'
import { useTheme } from '../lib/theme'

/**
 * Dev-only: press "o" (or add ?overlay) to lay the Figma export for the current theme over the
 * page at 1280px. ?overlay=diff blends with "difference", so anything misaligned lights up.
 * The references live in /design and are served by the dev server (see vite.config.ts).
 */
export default function DesignOverlay() {
  const theme = useTheme()
  const params = new URLSearchParams(location.search)
  const [on, setOn] = useState(() => params.has('overlay'))
  const diff = params.get('overlay') === 'diff'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'o' && !(e.target instanceof HTMLInputElement)) setOn((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!on) return null
  return (
    <img className={`design-overlay${diff ? ' design-overlay--diff' : ''}`} src={`/__design/${theme}.svg`} alt="" />
  )
}
