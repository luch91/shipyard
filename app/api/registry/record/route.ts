import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { getRedis } from '@/lib/redis'
import { getOnChainCode } from '@/lib/genlayer/client'
import { NETWORKS } from '@/lib/genlayer/networks'
import type { NetworkId } from '@/types'

export const dynamic = 'force-dynamic'

// Records a deployed contract into the registry (contracts table) so it becomes
// discoverable. Confirms the contract actually exists on-chain first (anti-spam).
// Uses ignoreDuplicates so it never downgrades an already-verified row.
// Fire-and-forget from the deploy flow — always returns quickly, never throws.
export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: true })

    const body = (await req.json().catch(() => ({}))) as {
      address?: unknown
      network?: unknown
      deployTx?: unknown
    }
    const address = typeof body.address === 'string' ? body.address : ''
    const network = typeof body.network === 'string' ? body.network : ''
    const deployTx = typeof body.deployTx === 'string' ? body.deployTx : null

    if (!address || !(network in NETWORKS)) {
      return NextResponse.json({ error: 'address and a valid network are required.' }, { status: 400 })
    }

    // Anti-spam: only list contracts that genuinely exist on-chain.
    try {
      const code = await getOnChainCode(network as NetworkId, address)
      if (!code) return NextResponse.json({ error: 'No contract at that address.' }, { status: 400 })
    } catch {
      return NextResponse.json({ error: 'Could not confirm the contract on-chain.' }, { status: 502 })
    }

    await getSupabaseAdmin()
      .from('contracts')
      .upsert(
        { address, network, deploy_tx: deployTx, deployed_at: new Date().toISOString() },
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
