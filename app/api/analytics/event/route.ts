import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/ratelimit'
import { hashWallet } from '@/lib/analytics/hashWallet'

// First-party analytics ingest (replaces PostHog). Writes one row to
// analytics_events. Fire-and-forget contract: ALWAYS returns 200 so client
// analytics can never surface an error or affect the user flow. Failures are
// logged server-side only.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Abuse controls: a per-IP flood ceiling (generous — real sessions fire several
// events per page) plus size caps so a caller can't bloat the table with an
// oversized metadata blob or field. Over-limit events are dropped silently.
const ANALYTICS_LIMIT = 100 // events per IP per window
const ANALYTICS_WINDOW_SECONDS = 60 // 1 minute
const MAX_METADATA_CHARS = 4000
const MAX_FIELD_CHARS = 100

interface EventBody {
  event?: string
  wallet?: string
  session_id?: string
  network?: string
  template_id?: string
  contract_address?: string
  metadata?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: true })

    const body = (await req.json().catch(() => ({}))) as EventBody
    const event = typeof body.event === 'string' ? body.event.trim().slice(0, 100) : ''
    if (!event) return NextResponse.json({ ok: true })

    // Flood ceiling per IP. Over-limit is dropped silently (still 200) to honor
    // the fire-and-forget contract.
    const ip = getClientIp(req)
    const { allowed } = await rateLimit(`analytics:${ip}`, ANALYTICS_LIMIT, ANALYTICS_WINDOW_SECONDS)
    if (!allowed) return NextResponse.json({ ok: true })

    const wallet_hash =
      typeof body.wallet === 'string' && body.wallet ? hashWallet(body.wallet) : null
    const session_id =
      typeof body.session_id === 'string' && UUID_RE.test(body.session_id)
        ? body.session_id
        : null
    const user_agent = req.headers.get('user-agent')?.slice(0, 500) ?? null

    // Size caps: keep string fields bounded and drop an oversized metadata blob
    // rather than storing it.
    const trunc = (v: unknown) => (typeof v === 'string' ? v.slice(0, MAX_FIELD_CHARS) : null)
    let metadata = body.metadata ?? null
    if (metadata && JSON.stringify(metadata).length > MAX_METADATA_CHARS) metadata = null

    await getSupabaseAdmin()
      .from('analytics_events')
      .insert({
        event_name: event,
        wallet_hash,
        session_id,
        network: trunc(body.network),
        template_id: trunc(body.template_id),
        contract_address: trunc(body.contract_address),
        metadata,
        user_agent,
      })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[analytics] event ingest failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: true })
  }
}
