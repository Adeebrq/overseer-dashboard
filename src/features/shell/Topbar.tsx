import { Bell } from '../../components/icons'
import TopSearch from './TopSearch'

type Props = { title: string; onMenu: () => void }

export default function Topbar({ title, onMenu }: Props) {
  return (
    <header className="topbar">
      <button className="icon-btn topbar__menu" onClick={onMenu} aria-label="Open navigation">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
          <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" strokeLinecap="round" />
        </svg>
      </button>

      <h1 className="topbar__title">{`[${title}]`}</h1>

      <div className="topbar__actions">
        <TopSearch />
        <button className="icon-btn topbar__bell" aria-label="Notifications">
          <Bell />
        </button>
        <span className="topbar__divider" aria-hidden="true" />
        <img className="topbar__avatar" src="/avatars/user.jpg" alt="Your profile" />
      </div>
    </header>
  )
}
