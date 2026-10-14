import { useMemo } from 'react'
import { DOT_COLORS, useIntro } from '../lib/intro'
import { DOT, dotBarCells, PITCH } from './dotBarCells'
import DotCanvas from './DotCanvas'

type Props = {
  /** 0–100 */
  value: number
  rows: number
  cols?: number
  tone?: 'green' | 'amber'
  label: string
}

/** Pixel progress bar drawn on a canvas, with the shared load intro. */
export default function DotBar({ value, rows, cols = 44, tone = 'green', label }: Props) {
  const intro = useIntro(true)
  const { on, off } = useMemo(() => dotBarCells(value, rows, cols, intro), [value, rows, cols, intro])

  const w = (cols - 1) * PITCH + DOT
  const h = (rows - 1) * PITCH + DOT

  return (
    <span className={`dotbar dotbar--${tone}`} role="img" aria-label={label}>
      <DotCanvas
        viewBox={[0, 0, w, h]}
        size={DOT}
        dots={on}
        track={off}
        trackColor={DOT_COLORS.track}
        animate={intro}
        {...DOT_COLORS[tone]}
      />
    </span>
  )
}
