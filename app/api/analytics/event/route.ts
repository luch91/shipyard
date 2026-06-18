import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

// First-party analytics ingest (replaces PostHog). Writes one row to
// analytics_events. Fire-and-forget contract: ALWAYS returns 200 so client
// analytics can never surface an error or affect the user flow. Failures are
// logged server-side only.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface EventBody {
  event?: string
  wallet?: string
  session_id?: string
  network?: string
  template_id?: string
  contract_address?: string
  metadata?: Record<string, unknown>
}

// Hash the wallet so raw addresses are never stored (PRD §8/§17).
function hashWallet(wallet: string): string {
  const salt = process.env.ANALYTICS_SALT ?? 'shipyard-default-analytics-salt'
  return createHash('sha256').update(salt + wallet.toLowerCase()).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: true })

    const body = (await req.json().catch(() => ({}))) as EventBody
    const event = typeof body.event === 'string' ? body.event.trim().slice(0, 100) : ''
    if (!event) return NextResponse.json({ ok: true })

    const wallet_hash =
      typeof body.wallet === 'string' && body.wallet ? hashWallet(body.wallet) : null
    const session_id =
      typeof body.session_id === 'string' && UUID_RE.test(body.session_id)
        ? body.session_id
        : null
    const user_agent = req.headers.get('user-agent')?.slice(0, 500) ?? null

    await getSupabaseAdmin()
      .from('analytics_events')
      .insert({
        event_name: event,
        wallet_hash,
        session_id,
        network: typeof body.network === 'string' ? body.network : null,
        template_id: typeof body.template_id === 'string' ? body.template_id : null,
        contract_address:
          typeof body.contract_address === 'string' ? body.contract_address : null,
        metadata: body.metadata ?? null,
        user_agent,
      })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[analytics] event ingest failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: true })
  }
}
