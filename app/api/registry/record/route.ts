import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { getRedis } from '@/lib/redis'
import { rateLimit, getClientIp } from '@/lib/ratelimit'
import { getDeployTx } from '@/lib/genlayer/client'
import { NETWORKS } from '@/lib/genlayer/networks'
import type { NetworkId } from '@/types'

export const dynamic = 'force-dynamic'

// Anti-spam ceiling per IP. Generous — a real session deploys few contracts —
// but bounds junk writes and the on-chain lookups they trigger.
const RECORD_LIMIT = 30 // records per IP per window
const RECORD_WINDOW_SECONDS = 60 * 60 // 1 hour

// Records a deployed contract into the registry (contracts table) so it becomes
// discoverable. Confirms the contract actually exists on-chain first (anti-spam).
// Uses ignoreDuplicates so it never downgrades an already-verified row.
// Fire-and-forget from the deploy flow — always returns quickly, never throws.
export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: true })

    const ip = getClientIp(req)
    const { allowed, retryAfter } = await rateLimit(
      `registry-record:${ip}`,
      RECORD_LIMIT,
      RECORD_WINDOW_SECONDS,
    )
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many registry submissions. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      )
    }

    const body = (await req.json().catch(() => ({}))) as {
      address?: unknown
      network?: unknown
      deployTx?: unknown
    }
    const address = typeof body.address === 'string' ? body.address : ''
    const network = typeof body.network === 'string' ? body.network : ''
    const deployTx = typeof body.deployTx === 'string' && body.deployTx ? body.deployTx : null

    if (!address || !(network in NETWORKS)) {
      return NextResponse.json({ error: 'address and a valid network are required.' }, { status: 400 })
    }

    // Anti-spam: a record must carry a deploy transaction. We validate it where we
    // can, but a transient RPC failure (common on Bradbury, which has slow LLM
    // finality and a rate-limited public RPC) must NEVER drop a genuine deploy. So
    // we only reject on a *conclusive* contradiction — i.e. the tx lookup succeeds
    // and shows it did not deploy this address. Inconclusive/timed-out reads record.
    if (!deployTx) {
      return NextResponse.json({ error: 'A deploy transaction hash is required.' }, { status: 400 })
    }
    // The deploy tx also carries the contract source, so we store it here to make
    // unverified registry entries show their methods (verification later upgrades
    // the row). Source read from the tx is authentic (it's what was deployed).
    let source: string | null = null
    try {
      const tx = await getDeployTx(network as NetworkId, deployTx)
      // Only reject on a *positive* contradiction: the tx resolves to a created
      // contract that is a different address. Anything inconclusive (no address
      // resolved yet, decoded fields still settling) records — never drop a real
      // deploy on timing.
      if (tx.contractAddress && tx.contractAddress.toLowerCase() !== address.toLowerCase()) {
        return NextResponse.json(
          { error: 'That transaction did not deploy this address.' },
          { status: 400 },
        )
      }
      if (typeof tx.code === 'string' && tx.code) source = tx.code
    } catch {
      // Transient lookup failure — trust the supplied tx and record anyway.
    }

    await getSupabaseAdmin()
      .from('contracts')
      .upsert(
        { address, network, source, deploy_tx: deployTx, deployed_at: new Date().toISOString() },
        { onConflict: 'address,network', ignoreDuplicates: true },
      )

    // Invalidate the registry cache so the new contract appears promptly.
    try {
      await getRedis()?.del(`registry:${network}`)
    } catch {
      // non-fatal
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
