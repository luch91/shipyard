export interface AdminAnalyticsEvent {
  id?: string
  event_name: string
  wallet_hash: string | null
  network: string | null
  template_id: string | null
  contract_address?: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface StoredDailyRollup {
  date: string
  active_wallets: number | null
  deploys_total: number | null
  deploys_by_network: Record<string, number> | null
  ai_generations: number | null
  ai_success_rate: number | null
  forks_total: number | null
  registry_views: number | null
  sdk_calls: number | null
}

export interface DailyMetrics {
  date: string
  active_wallets: number
  deploys_total: number
  deploys_by_network: Record<string, number>
  top_contracts: { name: string; count: number }[] | null
  ai_generations: number
  ai_success_rate: number | null
  forks_total: number
  registry_views: number
  sdk_calls: number
  loaded: number | null
  started: number | null
  succeeded: number | null
  failed: number | null
  failed_by_network: Record<string, number>
  verified: number | null
  data_source: 'events' | 'rollup'
}

interface EventBucket extends DailyMetrics {
  wallets: Set<string>
  contracts: Record<string, number>
}

const DAY_MS = 86_400_000

const n0 = (value: number | null | undefined) => value ?? 0

function parseYmd(date: string): Date {
  const parsed = new Date(`${date}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid UTC date: ${date}`)
  }
  return parsed
}

function emptyEventBucket(date: string): EventBucket {
  return {
    date,
    active_wallets: 0,
    deploys_total: 0,
    deploys_by_network: {},
    top_contracts: [],
    ai_generations: 0,
    ai_success_rate: null,
    forks_total: 0,
    registry_views: 0,
    sdk_calls: 0,
    loaded: 0,
    started: 0,
    succeeded: 0,
    failed: 0,
    failed_by_network: {},
    verified: 0,
    data_source: 'events',
    wallets: new Set<string>(),
    contracts: {},
  }
}

export function recentUtcRange(now: Date, days: number): { start: string; end: string } {
  if (!Number.isInteger(days) || days < 1) throw new Error('days must be a positive integer')
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const start = new Date(end.getTime() - (days - 1) * DAY_MS)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

// Builds an inclusive, chronological UTC series. Empty dates are real zero days,
// so slicing the latest 7/30 entries means calendar days rather than activity days.
export function buildEventSeries(
  events: AdminAnalyticsEvent[],
  startDate: string,
  endDate: string,
): DailyMetrics[] {
  const start = parseYmd(startDate)
  const end = parseYmd(endDate)
  if (start > end) throw new Error('startDate must be on or before endDate')

  const buckets = new Map<string, EventBucket>()
  for (let time = start.getTime(); time <= end.getTime(); time += DAY_MS) {
    const date = new Date(time).toISOString().slice(0, 10)
    buckets.set(date, emptyEventBucket(date))
  }

  for (const event of events) {
    const day = event.created_at.slice(0, 10)
    const bucket = buckets.get(day)
    if (!bucket) continue
    if (event.wallet_hash) bucket.wallets.add(event.wallet_hash)

    switch (event.event_name) {
      case 'deployment_succeeded': {
        bucket.deploys_total++
        bucket.succeeded = n0(bucket.succeeded) + 1
        if (event.network) {
          bucket.deploys_by_network[event.network] =
            (bucket.deploys_by_network[event.network] ?? 0) + 1
        }
        const name = typeof event.metadata?.contract_name === 'string' && event.metadata.contract_name
          ? event.metadata.contract_name
          : 'Unknown'
        bucket.contracts[name] = (bucket.contracts[name] ?? 0) + 1
        break
      }
      case 'contract_loaded':
        bucket.loaded = n0(bucket.loaded) + 1
        if (event.metadata?.method === 'generate') bucket.ai_generations++
        break
      case 'deployment_started':
        bucket.started = n0(bucket.started) + 1
        break
      case 'deployment_failed':
        bucket.failed = n0(bucket.failed) + 1
        if (event.network) {
          bucket.failed_by_network[event.network] =
            (bucket.failed_by_network[event.network] ?? 0) + 1
        }
        break
      case 'contract_verified':
        bucket.verified = n0(bucket.verified) + 1
        break
      case 'contract_forked':
        bucket.forks_total++
        break
      case 'registry_viewed':
        bucket.registry_views++
        break
      case 'sdk_call':
        bucket.sdk_calls++
        break
    }
  }

  return [...buckets.values()].map(({ wallets, contracts, ...day }) => ({
    ...day,
    active_wallets: wallets.size,
    top_contracts: Object.entries(contracts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 10),
  }))
}

function normalizeRollup(rollup: StoredDailyRollup): DailyMetrics {
  return {
    date: rollup.date,
    active_wallets: n0(rollup.active_wallets),
    deploys_total: n0(rollup.deploys_total),
    deploys_by_network: rollup.deploys_by_network ?? {},
    // Stored rollups rank template selections, not successful deployments, so
    // they must not be presented as historical "top contracts".
    top_contracts: null,
    ai_generations: n0(rollup.ai_generations),
    ai_success_rate: rollup.ai_success_rate ?? null,
    forks_total: n0(rollup.forks_total),
    registry_views: n0(rollup.registry_views),
    sdk_calls: n0(rollup.sdk_calls),
    loaded: null,
    started: null,
    succeeded: null,
    failed: null,
    failed_by_network: {},
    verified: null,
    data_source: 'rollup',
  }
}

// Recent raw-event days replace same-date cron rows; older rollups provide safe
// all-time KPI history without querying the unbounded raw event table.
export function mergeDailyMetrics(
  rollups: StoredDailyRollup[],
  recentEventSeries: DailyMetrics[],
): DailyMetrics[] {
  const byDate = new Map<string, DailyMetrics>()
  for (const rollup of rollups) byDate.set(rollup.date, normalizeRollup(rollup))
  for (const day of recentEventSeries) byDate.set(day.date, day)
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date))
}
