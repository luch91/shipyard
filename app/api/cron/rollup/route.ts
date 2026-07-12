import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { collectPaginatedRows } from '@/lib/analytics/paginate'

// Daily analytics rollup. Triggered by Vercel Cron (once a day) — see vercel.json.
// Aggregates a single day's analytics_events into one analytics_daily_rollups row.
// Protected by CRON_SECRET: Vercel automatically sends `Authorization: Bearer
// <CRON_SECRET>` for cron requests, so the public can't trigger it.

export const dynamic = 'force-dynamic'

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

interface EventRow {
  id: string
  event_name: string
  wallet_hash: string | null
  network: string | null
  template_id: string | null
  metadata: Record<string, unknown> | null
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  // Target day: ?date=YYYY-MM-DD (for backfill/testing), else yesterday (UTC).
  const param = new URL(req.url).searchParams.get('date')
  const date = param && /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : ymd(new Date(Date.now() - 86_400_000))
  const dayStart = `${date}T00:00:00.000Z`
  const dayEnd = `${ymd(new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000))}T00:00:00.000Z`

  const sb = getSupabaseAdmin()
  let eventFetch: Awaited<ReturnType<typeof collectPaginatedRows<EventRow>>>
  try {
    eventFetch = await collectPaginatedRows<EventRow>(async (from, to) => {
      const { data, error } = await sb
        .from('analytics_events')
        .select('id, event_name, wallet_hash, network, template_id, metadata')
        .gte('created_at', dayStart)
        .lt('created_at', dayEnd)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .range(from, to)
      if (error) throw error
      return (data ?? []) as EventRow[]
    }, { pageSize: 1_000, maxRows: 50_000 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read analytics events.' },
      { status: 500 },
    )
  }

  // Never persist a knowingly partial daily rollup.
  if (eventFetch.truncated) {
    return NextResponse.json(
      { error: 'Daily event volume reached the 50,000-row safety limit; rollup was not written.' },
      { status: 503 },
    )
  }

  const rows = eventFetch.rows
  const wallets = new Set<string>()
  const byNetwork: Record<string, number> = {}
  const templateCounts: Record<string, number> = {}
  let deploys_total = 0
  let ai_generations = 0
  let forks_total = 0
  let registry_views = 0
  let sdk_calls = 0

  for (const r of rows) {
    if (r.wallet_hash) wallets.add(r.wallet_hash)
    switch (r.event_name) {
      case 'deployment_succeeded':
        deploys_total++
        if (r.network) byNetwork[r.network] = (byNetwork[r.network] ?? 0) + 1
        break
      case 'template_selected': {
        const t =
          r.template_id ??
          (typeof r.metadata?.template_name === 'string' ? (r.metadata.template_name as string) : 'unknown')
        templateCounts[t] = (templateCounts[t] ?? 0) + 1
        break
      }
      case 'contract_loaded':
        if (r.metadata?.method === 'generate') ai_generations++
        break
      case 'contract_forked':
        forks_total++
        break
      case 'registry_viewed':
        registry_views++
        break
      case 'sdk_call':
        sdk_calls++
        break
    }
  }

  const top_templates = Object.entries(templateCounts)
    .map(([template_id, count]) => ({ template_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const rollup = {
    date,
    active_wallets: wallets.size,
    deploys_total,
    deploys_by_network: byNetwork,
    top_templates,
    ai_generations,
    ai_success_rate: null,
    forks_total,
    registry_views,
    sdk_calls,
  }

  const { error: upsertError } = await sb
    .from('analytics_daily_rollups')
    .upsert(rollup, { onConflict: 'date' })

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, rollup, events_processed: rows.length })
}
