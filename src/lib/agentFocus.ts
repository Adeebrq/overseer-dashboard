/**
 * Lets the top-bar search ask the Agent Health table to reveal and flash a row. If the table
 * isn't mounted yet (searching from another page), it picks the request up when it mounts.
 */
export const FOCUS_AGENT_EVENT = 'focus-agent'

let pendingAgent: string | null = null

export const takePendingAgent = () => {
  const name = pendingAgent
  pendingAgent = null
  return name
}

export function focusAgent(name: string) {
  pendingAgent = name
  window.dispatchEvent(new CustomEvent(FOCUS_AGENT_EVENT, { detail: name }))
}
