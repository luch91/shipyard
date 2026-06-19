import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { isAdminWallet } from '@/lib/auth/admin'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const ROLLUP_DAYS = 30
const EVENT_LIMIT = 50

// GET /api/admin/analytics
//   401 — not signed in
//   403 — signed in but not an admin (returns the viewer's own address so the
//         page can show "add this to ADMIN_WALLETS")
//   200 — { configured, rollups, events }
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }
  if (!isAdminWallet(session.address)) {
    return NextResponse.json(
      { error: 'Not authorized.', address: session.address },
      { status: 403 }
    )
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, rollups: [], events: [] })
  }

  const db = getSupabaseAdmin()
  const [rollupsRes, eventsRes] = await Promise.all([
    db
      .from('analytics_daily_rollups')
      .select('*')
      .order('date', { ascending: false })
      .limit(ROLLUP_DAYS),
    db
      .from('analytics_events')
      .select('event_name, wallet_hash, network, template_id, contract_address, created_at')
      .order('created_at', { ascending: false })
      .limit(EVENT_LIMIT),
  ])

  return NextResponse.json({
    configured: true,
    rollups: rollupsRes.data ?? [],
    events: eventsRes.data ?? [],
  })
}
