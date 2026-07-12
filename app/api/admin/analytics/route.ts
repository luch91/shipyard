import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/admin'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { hashWallet } from '@/lib/analytics/hashWallet'
import {
  buildEventSeries,
  mergeDailyMetrics,
  recentUtcRange,
  type AdminAnalyticsEvent,
  type StoredDailyRollup,
} from '@/lib/analytics/adminMetrics'
import { collectPaginatedRows } from '@/lib/analytics/paginate'

export const dynamic = 'force-dynamic'

const ROLLUP_LIMIT = 5_000
const EVENT_LIMIT = 50
const EVENT_SERIES_DAYS = 60
const PAGE_SIZE = 1_000
const EVENT_SERIES_LIMIT = 50_000

// GET /api/admin/analytics
//   401 — not signed in
//   403 — signed in but not an admin (returns the viewer's own address so the
//         page can show "add this to ADMIN_WALLETS")
//   200 — { configured, rollups, events }
export async function GET(req: NextRequest) {
  const { session, isAdmin } = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Not authorized.', address: session.address },
      { status: 403 }
    )
  }

  // Wallet search: resolve a raw address to its stored hash (admin-only). Wallets
  // are hashed at ingest with a server salt the client can't reproduce, so the
  // console asks the server to hash the query, then matches events by that hash.
  const walletParam = new URL(req.url).searchParams.get('wallet')
  if (walletParam) {
    return NextResponse.json({ walletHash: /^0x[0-9a-fA-F]{40}$/.test(walletParam) ? hashWallet(walletParam) : null })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, rollups: [], events: [] })
  }

  const db = getSupabaseAdmin()
  const eventRange = recentUtcRange(new Date(), EVENT_SERIES_DAYS)
  const since = `${eventRange.start}T00:00:00.000Z`

  const [rollupFetch, eventsRes, seriesFetch] = await Promise.all([
    collectPaginatedRows<StoredDailyRollup>(async (from, to) => {
      const { data, error } = await db
        .from('analytics_daily_rollups')
        .select('*')
        .order('date', { ascending: false })
        .range(from, to)
      if (error) throw error
      return (data ?? []) as StoredDailyRollup[]
    }, { pageSize: PAGE_SIZE, maxRows: ROLLUP_LIMIT })
      .then((result) => ({ ...result, unavailable: false }))
      .catch(() => ({ rows: [] as StoredDailyRollup[], truncated: false, unavailable: true })),
    db
      .from('analytics_events')
      .select('event_name, wallet_hash, network, template_id, contract_address, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(EVENT_LIMIT),
    collectPaginatedRows<AdminAnalyticsEvent>(async (from, to) => {
      const { data, error } = await db
        .from('analytics_events')
        .select('id, event_name, wallet_hash, network, template_id, metadata, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .range(from, to)
      if (error) throw error
      return (data ?? []) as AdminAnalyticsEvent[]
    }, { pageSize: PAGE_SIZE, maxRows: EVENT_SERIES_LIMIT })
      .then((result) => ({ ...result, unavailable: false }))
      .catch(() => ({ rows: [] as AdminAnalyticsEvent[], truncated: false, unavailable: true })),
  ])

  const recentSeries = seriesFetch.unavailable
    ? []
    : buildEventSeries(
        seriesFetch.rows,
        eventRange.start,
        eventRange.end,
      )
  const series = mergeDailyMetrics(
    rollupFetch.rows,
    recentSeries,
  )

  const dataWarnings = [
    rollupFetch.unavailable ? 'Stored all-time rollups are temporarily unavailable.' : null,
    rollupFetch.truncated ? `Stored history reached the ${ROLLUP_LIMIT.toLocaleString()}-day safety limit.` : null,
    seriesFetch.unavailable ? 'Recent event metrics are temporarily unavailable.' : null,
    seriesFetch.truncated ? `Recent event metrics reached the ${EVENT_SERIES_LIMIT.toLocaleString()}-row safety limit and may be incomplete.` : null,
    eventsRes.error ? 'The recent event feed is temporarily unavailable.' : null,
  ].filter((warning): warning is string => warning !== null)

  return NextResponse.json({
    configured: true,
    rollups: rollupFetch.rows,
    series,
    events: eventsRes.data ?? [],
    eventSeriesStart: recentSeries.length ? eventRange.start : null,
    eventSeriesTruncated: seriesFetch.truncated,
    dataWarnings,
  })
}
