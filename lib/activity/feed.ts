// Public activity feed, derived from analytics_events.
//
// Privacy contract, and the reason this module exists separately from the query:
// analytics_events stores a SALTED HASH of the wallet, never the address, so it can
// never identify anyone on its own. Attribution here comes only from
// contracts.deployer_wallet — which /api/verify sets after proving ownership and
// which /builders already displays publicly. An event is shown ONLY when its
// contract is already in the registry, so the feed can never surface a contract
// that was not already discoverable.

export type ActivityKind = 'deployed' | 'verified' | 'forked'

export type ActivityEventRow = {
  event_name?: string | null
  contract_address?: string | null
  network?: string | null
  metadata?: unknown
  created_at?: string | null
}

export type RegistryContract = {
  address: string
  network: string
  deployer_wallet?: string | null
}

export type ActivityItem = {
  kind: ActivityKind
  address: string
  contractName: string | null
  network: string
  at: string
  /** Proven deployer, or null. Never derived from analytics data. */
  builder: string | null
}

const EVENT_KIND: Record<string, ActivityKind> = {
  deployment_succeeded: 'deployed',
  contract_verified: 'verified',
  contract_forked: 'forked',
}

const key = (address: string, network: string) => `${address.toLowerCase()}|${network.toLowerCase()}`

/**
 * Splits values into batches. PostgREST encodes `.in()` into the query string, and
 * a few hundred addresses produce a URL long enough that the request fails outright
 * — so every bulk lookup has to be chunked rather than sent as one filter.
 */
export function chunk<T>(values: T[], size: number): T[][] {
  if (size < 1) throw new Error('chunk size must be >= 1')
  const out: T[][] = []
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size))
  return out
}

/**
 * Indexes registry rows for lookup. Addresses arrive in mixed case across capture
 * paths, so every key is lowercased. The address-only index is a fallback for
 * events that never recorded a network.
 */
export function indexRegistry(contracts: RegistryContract[]) {
  const byAddressAndNetwork = new Map<string, RegistryContract>()
  const byAddress = new Map<string, RegistryContract>()
  for (const c of contracts) {
    if (!c.address) continue
    byAddressAndNetwork.set(key(c.address, c.network ?? ''), c)
    if (!byAddress.has(c.address.toLowerCase())) byAddress.set(c.address.toLowerCase(), c)
  }
  return { byAddressAndNetwork, byAddress }
}

/**
 * Builds the feed from events ordered NEWEST-FIRST. One entry per (kind, project):
 * a contract can appear once as deployed and again as verified, but a repeat of
 * the same kind collapses to its most recent occurrence.
 *
 * "Project" means address OR contract name — see the dedupe block below for why
 * address alone produced a feed of one project repeated 25 times.
 */
export function buildActivityFeed(
  events: ActivityEventRow[],
  contracts: RegistryContract[],
  limit = 25,
): ActivityItem[] {
  const registry = indexRegistry(contracts)
  const seen = new Set<string>()
  const items: ActivityItem[] = []

  for (const event of events) {
    if (items.length >= limit) break

    const kind = EVENT_KIND[event.event_name ?? '']
    if (!kind) continue

    const address = typeof event.contract_address === 'string' ? event.contract_address : ''
    if (!address) continue

    const at = typeof event.created_at === 'string' ? event.created_at : ''
    if (!at) continue // ordering is the whole point of a feed

    const network = typeof event.network === 'string' ? event.network : ''

    // Registry membership is the privacy gate: no row, no entry.
    const match =
      (network ? registry.byAddressAndNetwork.get(key(address, network)) : undefined) ??
      registry.byAddress.get(address.toLowerCase())
    if (!match) continue

    const meta = (event.metadata ?? {}) as Record<string, unknown>
    const contractName =
      typeof meta.contract_name === 'string' && meta.contract_name ? meta.contract_name : null

    // Collapse on address OR name, not either alone.
    //
    // Address alone is too weak: builders iterate, and every redeploy mints a NEW
    // address, so one afternoon of iteration filled the whole feed (measured
    // against production data: 25 rows, 2 distinct projects).
    //
    // Name alone is too strong in one direction and too weak in the other: events
    // that record no name — contract_verified is one — would all collapse into a
    // single entry, while a redeploy that renamed the contract would slip through
    // as a duplicate.
    //
    // Keys are namespaced (a:/n:) so a contract whose name happens to look like an
    // address cannot collide with a real one.
    const addressKey = `${kind}:a:${address.toLowerCase()}`
    const nameKey = contractName ? `${kind}:n:${contractName.toLowerCase()}` : null
    if (seen.has(addressKey) || (nameKey && seen.has(nameKey))) continue
    seen.add(addressKey)
    if (nameKey) seen.add(nameKey)

    items.push({
      kind,
      address: match.address, // registry casing is what the rest of the app links with
      contractName,
      network: network || match.network,
      at,
      builder: match.deployer_wallet ?? null,
    })
  }

  return items
}
