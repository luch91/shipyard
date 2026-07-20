import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { hashWallet } from '@/lib/analytics/hashWallet'
import type { DeploymentRecord, NetworkId } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/history — server-synced deployment history for the signed-in wallet.
//
// Source of truth is analytics_events (event_name = 'deployment_succeeded'),
// which every successful deploy already writes with the deployer's HASHED wallet
// (track() attaches the connected address; the ingest hashes it with ANALYTICS_SALT).
// We resolve the caller's session address through the same hash and read their own
// rows back — no raw wallet is ever stored or compared. This needs no schema change
// and no change to the deploy path; it simply surfaces data already captured, so a
// signed-in user sees their deploys across devices/browsers. Anonymous callers get
// an empty set and the client keeps using its localStorage history unchanged.
export async function GET() {
  const session = await getSession()
  if (!session?.address) {
    return NextResponse.json({ signedIn: false, configured: isSupabaseConfigured(), deployments: [] })
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ signedIn: true, configured: false, deployments: [] })
  }

  // Without ANALYTICS_SALT the ingest stores no wallet_hash, so there is nothing to
  // match — degrade to an empty server set (client localStorage still works).
  const walletHash = hashWallet(session.address)
  if (!walletHash) {
    return NextResponse.json({ signedIn: true, configured: true, deployments: [] })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('analytics_events')
    .select('network, contract_address, metadata, created_at')
    .eq('event_name', 'deployment_succeeded')
    .eq('wallet_hash', walletHash)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ signedIn: true, configured: true, deployments: [] })
  }

  // Map events → DeploymentRecord, keeping only rows with an address and deduping by
  // address (rows are newest-first, so the first occurrence is the latest deploy).
  const seen = new Set<string>()
  const deployments: DeploymentRecord[] = []
  for (const row of data ?? []) {
    const address = typeof row.contract_address === 'string' ? row.contract_address : ''
    if (!address) continue
    const key = address.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    const meta = (row.metadata ?? {}) as Record<string, unknown>
    const contractName =
      typeof meta.contract_name === 'string' && meta.contract_name ? meta.contract_name : 'Contract'
    const txHash = typeof meta.transaction_hash === 'string' ? meta.transaction_hash : undefined

    deployments.push({
      address,
      contractName,
      network: (row.network as NetworkId) ?? 'testnet-bradbury',
      deployedAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      txHash,
    })
  }

  return NextResponse.json({ signedIn: true, configured: true, deployments })
}
