import type { Page } from '../../lib/router'
import DotBar from '../../components/DotBar'

/** Placeholder for sections that aren't built yet. Remounted per page, so its intro replays. */
export default function ComingSoon({ page }: { page: Page }) {
  const Icon = page.icon
  return (
    <section className="card coming-soon" aria-labelledby="coming-soon-title">
      <div className="coming-soon__body">
        <span className="glyph-tile glyph-tile--lg">
          <Icon />
        </span>
        <p className="label-mono coming-soon__eyebrow">[{page.label}]</p>
        <h2 id="coming-soon-title" className="pixel-num coming-soon__title">
          Coming soon
        </h2>
        <p className="coming-soon__text">
          {page.description ??
            `The ${page.label} section is still being built. It’ll appear here as soon as it’s ready.`}
        </p>
        <DotBar value={42} rows={3} label="In progress" />
        <a className="btn coming-soon__back" href="#/overview">
          Back to Overview
        </a>
      </div>
    </section>
  )
}
