import { describe, expect, it } from 'vitest'
import {
  buildEventSeries,
  mergeDailyMetrics,
  recentUtcRange,
  type AdminAnalyticsEvent,
  type StoredDailyRollup,
} from '@/lib/analytics/adminMetrics'
import { collectPaginatedRows } from '@/lib/analytics/paginate'

describe('admin analytics calendar aggregation', () => {
  it('builds an inclusive UTC calendar with zero-activity days', () => {
    const series = buildEventSeries([], '2026-06-29', '2026-07-02')

    expect(series.map((d) => d.date)).toEqual([
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
    ])
    expect(series.every((d) => d.deploys_total === 0)).toBe(true)
  })

  it('returns exactly 60 UTC days for recent and previous 30-day windows', () => {
    const range = recentUtcRange(new Date('2026-07-12T23:59:59.000Z'), 60)
    const series = buildEventSeries([], range.start, range.end)

    expect(range).toEqual({ start: '2026-05-14', end: '2026-07-12' })
    expect(series).toHaveLength(60)
    expect(series.slice(-30)[0].date).toBe('2026-06-13')
    expect(series.slice(-30).at(-1)?.date).toBe('2026-07-12')
    expect(series.slice(-60, -30)[0].date).toBe('2026-05-14')
    expect(series.slice(-60, -30).at(-1)?.date).toBe('2026-06-12')
  })

  it('aggregates canonical metrics and unique daily wallets', () => {
    const events: AdminAnalyticsEvent[] = [
      {
        event_name: 'deployment_succeeded', wallet_hash: 'wallet-a',
        network: 'testnet-bradbury', template_id: null,
        metadata: { contract_name: 'Oracle' }, created_at: '2026-07-12T01:00:00.000Z',
      },
      {
        event_name: 'deployment_succeeded', wallet_hash: 'wallet-a',
        network: 'testnet-bradbury', template_id: null,
        metadata: { contract_name: 'Oracle' }, created_at: '2026-07-12T02:00:00.000Z',
      },
      {
        event_name: 'deployment_failed', wallet_hash: 'wallet-b',
        network: 'studionet', template_id: null, metadata: null,
        created_at: '2026-07-12T03:00:00.000Z',
      },
      {
        event_name: 'contract_loaded', wallet_hash: null, network: null,
        template_id: null, metadata: { method: 'generate' },
        created_at: '2026-07-12T04:00:00.000Z',
      },
      {
        event_name: 'registry_viewed', wallet_hash: null, network: null,
        template_id: null, metadata: null, created_at: '2026-07-12T05:00:00.000Z',
      },
    ]

    const [day] = buildEventSeries(events, '2026-07-12', '2026-07-12')

    expect(day.active_wallets).toBe(2)
    expect(day.deploys_total).toBe(2)
    expect(day.deploys_by_network).toEqual({ 'testnet-bradbury': 2 })
    expect(day.failed).toBe(1)
    expect(day.failed_by_network).toEqual({ studionet: 1 })
    expect(day.ai_generations).toBe(1)
    expect(day.registry_views).toBe(1)
    expect(day.top_contracts).toEqual([{ name: 'Oracle', count: 2 }])
  })

  it('uses recent event days over rollups while retaining older all-time rollups', () => {
    const rollups: StoredDailyRollup[] = [
      {
        date: '2026-07-10', active_wallets: 4, deploys_total: 7,
        deploys_by_network: { studionet: 7 }, ai_generations: 2,
        ai_success_rate: null, forks_total: 1, registry_views: 3, sdk_calls: 0,
      },
      {
        date: '2026-05-01', active_wallets: 2, deploys_total: 5,
        deploys_by_network: { 'testnet-asimov': 5 }, ai_generations: 1,
        ai_success_rate: null, forks_total: 0, registry_views: 1, sdk_calls: 0,
      },
    ]
    const recent = buildEventSeries([], '2026-07-10', '2026-07-12')
    const merged = mergeDailyMetrics(rollups, recent)

    expect(merged.map((d) => d.date)).toEqual([
      '2026-07-12', '2026-07-11', '2026-07-10', '2026-05-01',
    ])
    expect(merged.find((d) => d.date === '2026-07-10')).toMatchObject({
      deploys_total: 0,
      data_source: 'events',
    })
    expect(merged.find((d) => d.date === '2026-05-01')).toMatchObject({
      deploys_total: 5,
      data_source: 'rollup',
    })
  })
})

describe('admin analytics pagination safety', () => {
  it('collects every page when the backend caps individual responses', async () => {
    const source = Array.from({ length: 2_505 }, (_, i) => i)
    const result = await collectPaginatedRows(
      async (from, to) => source.slice(from, to + 1),
      { pageSize: 1_000, maxRows: 5_000 },
    )

    expect(result.rows).toHaveLength(2_505)
    expect(result.rows[0]).toBe(0)
    expect(result.rows.at(-1)).toBe(2_504)
    expect(result.truncated).toBe(false)
  })

  it('stops at the explicit safety ceiling and reports truncation', async () => {
    const source = Array.from({ length: 2_505 }, (_, i) => i)
    const result = await collectPaginatedRows(
      async (from, to) => source.slice(from, to + 1),
      { pageSize: 1_000, maxRows: 2_000 },
    )

    expect(result.rows).toHaveLength(2_000)
    expect(result.truncated).toBe(true)
  })
})
