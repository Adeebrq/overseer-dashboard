import { useEffect, useState } from 'react'
import Sidebar from './features/shell/Sidebar'
import Topbar from './features/shell/Topbar'
import KpiStrip from './features/overview/KpiStrip'
import InferenceChart from './features/overview/InferenceChart'
import RegionalTraffic from './features/overview/RegionalTraffic'
import AgentHealth from './features/overview/AgentHealth'
import ComingSoon from './features/shell/ComingSoon'
import SignedOut from './features/shell/SignedOut'
import Toaster from './components/Toaster'
import DesignOverlay from './components/DesignOverlay'
import { usePage } from './lib/router'

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  // The column-width animation is only enabled while toggling, so window resizes stay instant.
  const [railAnimating, setRailAnimating] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const page = usePage()
  const [signedOut, setSignedOut] = useState(false)

  useEffect(() => {
    document.title = `${page.label} · Overseer`
  }, [page])

  useEffect(() => {
    if (!railAnimating) return
    const t = window.setTimeout(() => setRailAnimating(false), 350)
    return () => window.clearTimeout(t)
  }, [railAnimating, collapsed])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div
      className={`shell${collapsed ? ' is-collapsed' : ''}${railAnimating ? ' is-rail-animating' : ''}${
        drawerOpen ? ' is-drawer-open' : ''
      }`}
    >
      <Sidebar
        activeSlug={page.slug}
        onSignOut={() => setSignedOut(true)}
        onCollapse={() => {
          setRailAnimating(true)
          setCollapsed((c) => !c)
        }}
        onNavigate={() => setDrawerOpen(false)}
      />
      <div className="scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <div className="workspace">
        <Topbar title={page.label} onMenu={() => setDrawerOpen(true)} />
        <main className="content">
          {page.slug === 'overview' ? (
            <>
              <KpiStrip />
              <div className="chart-row">
                <InferenceChart />
                <RegionalTraffic />
              </div>
              <AgentHealth />
            </>
          ) : (
            <ComingSoon key={page.slug} page={page} />
          )}
        </main>
      </div>
      <Toaster />
      {signedOut && <SignedOut onSignIn={() => setSignedOut(false)} />}
      {import.meta.env.DEV && <DesignOverlay />}
    </div>
  )
}
