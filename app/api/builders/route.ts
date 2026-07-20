import { NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Public builder leaderboard. Reads builder_profiles (populated by /api/verify when
// a wallet proves it deployed a verified contract) with the service role — RLS stays
// deny-by-default; server reads bypass it, matching the registry pattern. Rows only
// exist once a wallet has earned reputation, so there are no empty/zero entries.
export type BuilderEntry = {
  wallet: string
  displayName: string | null
  reputation: number
  contractsVerified: number
  contractsDeployed: number
  forksReceived: number
  updatedAt: string | null
}

export async function GET() {
  // No database → no leaderboard. Return empty (not an error), like the registry.
  if (!isSupabaseConfigured()) return NextResponse.json([])

  const { data, error } = await getSupabaseAdmin()
    .from('builder_profiles')
    .select(
      'wallet_address, display_name, reputation_score, contracts_verified, contracts_deployed, forks_received, updated_at',
    )
    .order('reputation_score', { ascending: false })
    .order('contracts_verified', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const builders: BuilderEntry[] = (data ?? []).map((r) => ({
    wallet: String(r.wallet_address),
    displayName: r.display_name ?? null,
    reputation: r.reputation_score ?? 0,
    contractsVerified: r.contracts_verified ?? 0,
    contractsDeployed: r.contracts_deployed ?? 0,
    forksReceived: r.forks_received ?? 0,
    updatedAt: r.updated_at ?? null,
  }))

  return NextResponse.json(builders)
}
