import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { hashWallet } from '@/lib/analytics/hashWallet'
import { computeBuilderActivity } from '@/lib/builders/activity'

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
  // degrade to what the contracts table alone can show. The aggregation itself
  // lives in lib/builders/activity.ts so it can be tested without a database.
  const walletHash = hashWallet(wallet)

  const [deployEvents, forksMadeEvents, forkEvents] = walletHash
    ? await Promise.all([
        // Deploys by this wallet (fuller than the verified-only contracts list above).
        sb
          .from('analytics_events')
          .select('contract_address')
          .eq('event_name', 'deployment_succeeded')
          .eq('wallet_hash', walletHash)
          .limit(EVENT_SCAN_LIMIT)
          .then((r) => r.data ?? []),
        // Forks this wallet made. wallet_hash is an exact (case-safe) match.
        sb
          .from('analytics_events')
          .select('contract_address')
          .eq('event_name', 'contract_forked')
          .eq('wallet_hash', walletHash)
          .limit(EVENT_SCAN_LIMIT)
          .then((r) => r.data ?? []),
        // Recent forks by anyone; narrowed to this wallet's contracts in JS, since
        // addresses are mixed-case across capture paths and `.in` is case-sensitive.
        sb
          .from('analytics_events')
          .select('contract_address, wallet_hash')
          .eq('event_name', 'contract_forked')
          .order('created_at', { ascending: false })
          .limit(EVENT_SCAN_LIMIT)
          .then((r) => r.data ?? []),
      ])
    : [[], [], []]

  const activity = computeBuilderActivity({
    attributedAddresses: contracts.map((c) => c.address),
    deployEvents,
    forksMadeEvents,
    forkEvents,
    walletHash,
  })

  const response: BuilderProfileResponse = {
    wallet,
    displayName: prof.display_name ?? null,
    reputation: prof.reputation_score ?? 0,
    contractsVerified: prof.contracts_verified ?? 0,
    contractsDeployed: activity.contractsDeployed,
    forksReceived: activity.forksReceived,
    forksMade: activity.forksMade,
    createdAt: prof.created_at ?? null,
    contracts,
  }

  return NextResponse.json(response)
}
