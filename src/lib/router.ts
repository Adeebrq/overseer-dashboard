import { useEffect, useState, type ComponentType, type SVGProps } from 'react'
import { agents, type Agent } from '../data/mock'
import {
  NavAgents,
  NavDeployments,
  NavEvals,
  NavOverview,
  NavPipelines,
  NavSettings,
  NavTeam,
  NavTraces,
} from '../components/icons'

export type NavItem = { slug: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }

/** A resolved route. `section` is the sidebar item to highlight when it differs from `slug`. */
export type Page = NavItem & { section?: string; description?: string }

export const navGroups: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { slug: 'overview', label: 'Overview', icon: NavOverview },
      { slug: 'agents', label: 'Agents', icon: NavAgents },
      { slug: 'pipelines', label: 'Pipelines', icon: NavPipelines },
    ],
  },
  {
    title: 'Build & Ship',
    items: [
      { slug: 'deployments', label: 'Deployments', icon: NavDeployments },
      { slug: 'evals', label: 'Evals', icon: NavEvals },
      { slug: 'traces', label: 'Traces', icon: NavTraces },
    ],
  },
  {
    title: 'Manage',
    items: [
      { slug: 'team', label: 'Team', icon: NavTeam },
      { slug: 'settings', label: 'Settings', icon: NavSettings },
    ],
  },
]

/** Pages reachable from elsewhere (e.g. the account menu) but not listed in the sidebar. */
export const extraPages: NavItem[] = [{ slug: 'profile', label: 'Profile', icon: NavTeam }]

const allItems = [...navGroups.flatMap((g) => g.items), ...extraPages]

/** URL slug for an agent's detail page, e.g. #/agents/vector-qa. */
export const agentHref = (a: Agent) => `#/agents/${a.avatar}`

function fromHash(): Page {
  const detail = location.hash.match(/^#\/agents\/([\w-]+)$/)
  const agent = detail && agents.find((a) => a.avatar === detail[1])
  if (agent) {
    return {
      slug: `agents/${agent.avatar}`,
      label: agent.name,
      icon: NavAgents,
      section: 'agents',
      description: `Details for ${agent.name} are still being built. They’ll appear here as soon as they’re ready.`,
    }
  }
  return allItems.find((i) => `#/${i.slug}` === location.hash) ?? allItems[0]
}

/** Current page, kept in the URL hash (#/agents) so refresh and back/forward work. */
export function usePage() {
  const [page, setPage] = useState<Page>(fromHash)
  useEffect(() => {
    const onHash = () => setPage(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return page
}
