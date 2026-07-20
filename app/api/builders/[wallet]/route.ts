import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { hashWallet } from '@/lib/analytics/hashWallet'

export const dynamic = 'force-dynamic'

// A single builder's public profile: their reputation stats plus the contracts they
// have deployed (attributed via contracts.deployer_wallet). Wallet addresses are
// stored lowercased at attribution time, so the lookup lowercases too.
export type BuilderProfileContract = {
  address: string
  network: string
  verified: boolean
  deployedAt: string | null
}

export type BuilderProfileResponse = {
  wallet: string
  displayName: string | null
  reputation: number
  contractsVerified: number
  contractsDeployed: number
  forksReceived: number
  forksMade: number
  createdAt: string | null
  contracts: BuilderProfileContract[]
}

// How many analytics rows to scan when computing activity stats. Generous for an
// early-stage app; bounds the query so a profile read stays cheap.
const EVENT_SCAN_LIMIT = 2000

export async function GET(_req: NextRequest, { params }: { params: { wallet: string } }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  }

  const wallet = (params.wallet ?? '').toLowerCase()
  if (!wallet) {
    return NextResponse.json({ error: 'wallet is required.' }, { status: 400 })
  }

  const sb = getSupabaseAdmin()

  // reputation_score + contracts_verified are maintained synchronously by /api/verify,
  // so they are authoritative and read straight from the profile row.
  const { data: prof } = await sb
    .from('builder_profiles')
    .select('display_name, reputation_score, contracts_verified, created_at')
    .eq('wallet_address', wallet)
    .maybeSingle()

  if (!prof) {
    return NextResponse.json({ error: 'Builder not found.' }, { status: 404 })
  }

  // Attributed (verified) contracts — shown in the list, and seeded into the deploy set.
  const { data: rows } = await sb
    .from('contracts')
    .select('address, network, is_verified, deployed_at, created_at')
    .eq('deployer_wallet', wallet)
    .order('created_at', { ascending: false })
    .limit(100)

  const contracts: BuilderProfileContract[] = (rows ?? []).map((r) => ({
    address: String(r.address),
    network: String(r.network),
    verified: !!r.is_verified,
    deployedAt: (r.deployed_at ?? r.created_at) ?? null,
  }))

  // ── Activity stats (deployed / forks) ───────────────────────────────────────
  // These three columns are not maintained as running counters anywhere, so we
  // derive them at read time from analytics_events — the same hashed-wallet join
  // used for deploy history. Always accurate, no backfill or migration needed.
  // Requires ANALYTICS_SALT (else wallet_hash is never stored); without it these
  // degrade to what the contracts table alone can show.
  const deployedLower = new Set<string>()
  for (const c of contracts) deployedLower.add(c.address.toLowerCase())

  let forksMade = 0
  let forksReceived = 0

  const walletHash = hashWallet(wallet)
  if (walletHash) {
    // Deploys by this wallet (fuller than the verified-only contracts list above).
    const { data: deployEvents } = await sb
      .from('analytics_events')
      .select('contract_address')
      .eq('event_name', 'deployment_succeeded')
      .eq('wallet_hash', walletHash)
      .limit(EVENT_SCAN_LIMIT)
    for (const e of deployEvents ?? []) {
      if (typeof e.contract_address === 'string' && e.contract_address) {
        deployedLower.add(e.contract_address.toLowerCase())
      }
    }

    // Forks this wallet made — distinct source contracts it forked. wallet_hash is an
    // exact (case-safe) match, so this is a direct filter.
    const { data: madeEvents } = await sb
      .from('analytics_events')
      .select('contract_address')
      .eq('event_name', 'contract_forked')
      .eq('wallet_hash', walletHash)
      .limit(EVENT_SCAN_LIMIT)
    const madeSet = new Set<string>()
    for (const e of madeEvents ?? []) {
      if (typeof e.contract_address === 'string' && e.contract_address) {
        madeSet.add(e.contract_address.toLowerCase())
      }
    }
    forksMade = madeSet.size

    // Forks received — others forking contracts this wallet deployed. Addresses can be
    // mixed-case across capture paths, so match in JS on lowercased addresses rather
    // than a case-sensitive DB `.in`. Deduped by (forker, contract); self-forks excluded.
    if (deployedLower.size) {
      const { data: recvEvents } = await sb
        .from('analytics_events')
        .select('contract_address, wallet_hash')
        .eq('event_name', 'contract_forked')
        .order('created_at', { ascending: false })
        .limit(EVENT_SCAN_LIMIT)
      const recvSet = new Set<string>()
      for (const e of recvEvents ?? []) {
        const addr = typeof e.contract_address === 'string' ? e.contract_address.toLowerCase() : ''
        if (!addr || !deployedLower.has(addr)) continue
        if (e.wallet_hash && e.wallet_hash === walletHash) continue // exclude self-forks
        recvSet.add(`${e.wallet_hash ?? 'anon'}:${addr}`)
      }
      forksReceived = recvSet.size
    }
  }

  const response: BuilderProfileResponse = {
    wallet,
    displayName: prof.display_name ?? null,
    reputation: prof.reputation_score ?? 0,
    contractsVerified: prof.contracts_verified ?? 0,
    contractsDeployed: deployedLower.size,
    forksReceived,
    forksMade,
    createdAt: prof.created_at ?? null,
    contracts,
  }

  return NextResponse.json(response)
}
