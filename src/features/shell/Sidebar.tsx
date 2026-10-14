import { Collapse, Logo } from '../../components/icons'
import AccountMenu from './AccountMenu'
import DotBar from '../../components/DotBar'
import NavGlow from './NavGlow'
import { navGroups } from '../../lib/router'

type Props = { activeSlug: string; onCollapse: () => void; onNavigate: () => void; onSignOut: () => void }

export default function Sidebar({ activeSlug, onCollapse, onNavigate, onSignOut }: Props) {
  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="sidebar__brand">
        <a href="#/overview" className="sidebar__home" aria-label="Overseer — go to Overview" onClick={onNavigate}>
          <Logo className="sidebar__logo" />
        </a>
        <button className="icon-btn sidebar__collapse" onClick={onCollapse} aria-label="Collapse sidebar">
          <Collapse />
        </button>
      </div>

      <nav className="sidebar__nav">
        {navGroups.map((g, gi) => (
          <div className="nav-group" key={gi}>
            {g.title && <div className="nav-group__title">{g.title}</div>}
            <ul>
              {g.items.map(({ slug, label, icon: Icon }) => {
                const active = slug === activeSlug
                return (
                  <li key={slug}>
                    <a
                      href={`#/${slug}`}
                      className={`nav-item${active ? ' is-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      title={label}
                      onClick={onNavigate}
                    >
                      {/* Mounted per active item, so the sparkle drift replays on every switch. */}
                      {active && <NavGlow />}
                      <Icon className="nav-item__icon" />
                      <span className="nav-item__label">{label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <section className="token-card hatch-card" aria-label="Token budget">
          <div className="token-card__title">Token Budget</div>
          <div className="token-card__rule" />
          <DotBar value={61.2} rows={3} label="612K of 1M tokens used" />
          <div className="token-card__meta">
            <span>612K / 1M</span>
            <span>Resets in 9 days</span>
          </div>
        </section>

        <div className="sidebar__divider" />

        <AccountMenu onSignOut={onSignOut} onNavigate={onNavigate} />
      </div>
    </aside>
  )
}
