import { NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { buildActivityFeed, chunk, type ActivityItem, type RegistryContract } from '@/lib/activity/feed'

export const dynamic = 'force-dynamic'

// GET /api/activity — public "what's happening on Shipyard lately" feed.
//
// Reads events the app already captures (no schema change) and shows only
// contracts that are already in the registry, so nothing becomes visible here
// that was not already discoverable. Wallet attribution comes from
// contracts.deployer_wallet, which /api/verify sets after proving ownership;
// analytics_events holds only a salted wallet hash and is never exposed.
// The aggregation lives in lib/activity/feed.ts so it is testable without a DB.

const FEED_EVENTS = ['deployment_succeeded', 'contract_verified', 'contract_forked']

/** Events scanned before filtering. Comfortably more than a full feed needs. */
const EVENT_SCAN_LIMIT = 300
const FEED_LIMIT = 25

// Addresses per contracts lookup. `.in()` goes into the query string, and a few
// hundred addresses make the URL long enough that the request fails outright
// (measured: 408 values fail, 200 succeed). 100 keeps a wide margin.
const CONTRACT_LOOKUP_CHUNK = 100

export type ActivityResponse = { items: ActivityItem[] }

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json<ActivityResponse>({ items: [] })
  }

  const sb = getSupabaseAdmin()

  const { data: events, error } = await sb
    .from('analytics_events')
    .select('event_name, contract_address, network, metadata, created_at')
    .in('event_name', FEED_EVENTS)
    .order('created_at', { ascending: false })
    .limit(EVENT_SCAN_LIMIT)

  if (error || !events?.length) {
    return NextResponse.json<ActivityResponse>({ items: [] })
  }

  // Look the contracts up by both the casing the event recorded and its lowercase
  // form: `.in` is case-sensitive, and the two tables are written by different
  // paths. The final match is still done case-insensitively in buildActivityFeed.
  const addresses = new Set<string>()
  for (const e of events) {
    if (typeof e.contract_address === 'string' && e.contract_address) {
      addresses.add(e.contract_address)
      addresses.add(e.contract_address.toLowerCase())
    }
  }
  if (!addresses.size) {
    return NextResponse.json<ActivityResponse>({ items: [] })
  }

  const batches = await Promise.all(
    chunk([...addresses], CONTRACT_LOOKUP_CHUNK).map((batch) =>
      sb.from('contracts').select('address, network, deployer_wallet').in('address', batch),
    ),
  )

  // Keep whatever resolved. A failed batch costs some entries; failing the whole
  // feed on one bad batch would be worse, and an empty feed simply hides itself.
  const contracts: RegistryContract[] = []
  for (const batch of batches) {
    if (batch.error) continue
    contracts.push(...((batch.data ?? []) as RegistryContract[]))
  }

  const items = buildActivityFeed(events, contracts, FEED_LIMIT)

  return NextResponse.json<ActivityResponse>({ items })
}
