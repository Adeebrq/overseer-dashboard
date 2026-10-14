export type Kpi = {
  label: string
  value: string
  caption: string
  delta: string
  trend: 'up' | 'down'
  icon: 'eval' | 'agents' | 'trace' | 'latency'
}

export const kpis: Kpi[] = [
  { label: 'Eval Pass Rate', value: '92.6%', caption: '73 failed', delta: '2.1%', trend: 'up', icon: 'eval' },
  { label: 'Active Agents', value: '27', caption: 'since Aug', delta: '4 new', trend: 'up', icon: 'agents' },
  { label: 'Trace Coverage', value: '86', caption: 'services traced', delta: '9', trend: 'up', icon: 'trace' },
  { label: 'Avg. Latency', value: '1.8 s', caption: 'p95 response', delta: '14%', trend: 'down', icon: 'latency' },
]

export type InferenceRange = 'Yearly' | 'Monthly' | 'Weekly'

export type InferenceView = {
  /** Headline figure for the range. */
  total: number
  /** Points across the plot: `t` runs 0→1, `v` is calls. */
  series: { t: number; v: number }[]
  /** X-axis labels at plot positions `t`. */
  labels: { t: number; text: string }[]
  /** Top of the y-axis; six equal steps down to 0. */
  max: number
  description: string
}

// Gridline positions in the design, top (120k) to bottom (0).
function designYToValue(y: number) {
  const ys = [316, 348, 375, 406, 439, 469, 500]
  for (let i = 0; i < ys.length - 1; i++) {
    if (y <= ys[i + 1]) return 120_000 - 20_000 * (i + (y - ys[i]) / (ys[i + 1] - ys[i]))
  }
  return 0
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Labels sit where the design puts them: first at 1.57% of the plot, last at 96.83%.
const FIRST = 0.0157
const LAST = 0.9683
const at = (i: number, n: number) => FIRST + (i * (LAST - FIRST)) / (n - 1)
const spread = <T>(items: T[]) => items.map((item, i) => ({ item, t: at(i, items.length) }))
/** Points spaced like the labels, with the line carried flat out to both edges of the plot. */
const spaced = (values: number[]) => [
  { t: 0, v: values[0] },
  ...values.map((v, i) => ({ t: at(i, values.length), v })),
  { t: 1, v: values[values.length - 1] },
]

const dailyDec = [
  3420, 3510, 3380, 3605, 3720, 3550, 3490, 3810, 3925, 3700, 3640, 3885, 4010, 3960, 3820, 4105, 4230, 4080, 3950,
  4190, 4310, 4180, 4050, 4290, 4420, 4350, 4210, 4480, 4560, 4395,
]
const lastWeek = [4120, 4285, 4190, 4410, 4520, 3890, 3760]

export const inferenceViews: Record<InferenceRange, InferenceView> = {
  Yearly: {
    total: 118_629,
    // Traced from the design.
    series: [
      [270.137, 431.418],
      [289.906, 425.794],
      [306.852, 425.794],
      [327.186, 411.733],
      [346.955, 411.733],
      [377.456, 386.987],
      [396.661, 386.987],
      [415.301, 373.489],
      [427.163, 380.8],
      [440.719, 397.11],
      [464.442, 403.859],
      [507.37, 380.8],
      [524.881, 386.987],
      [549.168, 373.489],
      [573.457, 357.179],
      [592.097, 380.8],
      [603.393, 386.987],
      [623.162, 380.8],
      [643.496, 347.055],
      [653.664, 342.556],
      [661.571, 342.556],
      [670.044, 347.055],
      [680.211, 338.057],
      [692.073, 324.559],
      [705.065, 319.497],
      [723.139, 319.497],
    ].map(([x, y]) => ({ t: (x - 270) / 454, v: designYToValue(y) })),
    labels: spread(months).map(({ item, t }) => ({ t, text: item })),
    max: 120_000,
    description: 'Inference calls per month this year, rising from about 43k in January to 118k in December',
  },
  Monthly: {
    total: 119_225,
    series: spaced(dailyDec),
    labels: [1, 5, 10, 15, 20, 25, 30].map((d) => ({ t: at(d - 1, 30), text: `Dec ${d}` })),
    max: 6_000,
    description: 'Inference calls per day in December, between about 3.4k and 4.6k',
  },
  Weekly: {
    total: 29_175,
    series: spaced(lastWeek),
    labels: spread(days).map(({ item, t }) => ({ t, text: item })),
    max: 6_000,
    description: 'Inference calls per day this week, peaking at 4.5k on Friday',
  },
}

export type Region = { id: string; label: string; requests: number; latencyMs: number; x: number; y: number }

// Marker positions are in the world map's own coordinate space (see world-dots.svg viewBox).
export const regions: Region[] = [
  { id: 'us-east', label: 'us-east', requests: 28_370, latencyMs: 42, x: 897.9, y: 390.51 },
  { id: 'eu-central', label: 'eu-central', requests: 21_904, latencyMs: 58, x: 1015.13, y: 374.88 },
  { id: 'ap-south', label: 'ap-south', requests: 17_272, latencyMs: 96, x: 1101.1, y: 425.68 },
]

export type Status = 'healthy' | 'paused' | 'deploying' | 'degraded'

export type Agent = {
  name: string
  role: string
  status: Status
  /** Percent, 0–100. */
  success: number
  /** USD per 1,000 calls. */
  costPer1k: number
  p95Ms: number
  /** Avatar file name in /public/avatars (and /public/avatars/light). */
  avatar: string
}

export const avatarFor = (a: Agent, theme: 'dark' | 'light') =>
  `/avatars/${theme === 'light' ? 'light/' : ''}${a.avatar}.png`

export const agents: Agent[] = [
  {
    name: 'Sentinel',
    role: 'Guardrails',
    status: 'healthy',
    success: 98.9,
    costPer1k: 0.4213,
    p95Ms: 1204,
    avatar: 'sentinel',
  },
  {
    name: 'Vector QA',
    role: 'Eval runs',
    status: 'healthy',
    success: 96.4,
    costPer1k: 0.7386,
    p95Ms: 1418,
    avatar: 'vector-qa',
  },
  {
    name: 'Atlas RAG',
    role: 'Retrieval',
    status: 'paused',
    success: 92.1,
    costPer1k: 1.8542,
    p95Ms: 2136,
    avatar: 'atlas-rag',
  },
  {
    name: 'Orbit',
    role: 'Latency',
    status: 'deploying',
    success: 88.5,
    costPer1k: 0.2764,
    p95Ms: 912,
    avatar: 'orbit',
  },
  {
    name: 'Courier',
    role: 'Tool calls',
    status: 'degraded',
    success: 85.2,
    costPer1k: 1.7431,
    p95Ms: 1627,
    avatar: 'courier',
  },
]
