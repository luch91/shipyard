import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { getOnChainCode, getDeployTx } from '@/lib/genlayer/client'
import { NETWORKS } from '@/lib/genlayer/networks'
import type { NetworkId } from '@/types'

export const dynamic = 'force-dynamic'

function normalize(s: string): string {
  return s.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim()
}

// GET /api/verify?address=&network= -> { verified, deployer }
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ verified: false, deployer: null, source: null })

  const url = new URL(req.url)
  const address = url.searchParams.get('address')
  const network = url.searchParams.get('network')
  if (!address || !network) {
    return NextResponse.json({ error: 'address and network are required.' }, { status: 400 })
  }

  const { data } = await getSupabaseAdmin()
    .from('contracts')
    .select('is_verified, deployer_wallet, source')
    .eq('address', address)
    .eq('network', network)
    .maybeSingle()

  return NextResponse.json({
    verified: !!data?.is_verified,
    deployer: data?.deployer_wallet ?? null,
    source: data?.source ?? null,
  })
}

// POST /api/verify  { address, network, source, deployTx? }
// Authenticity: the submitted source must match the on-chain code (trustless).
// Attribution: credited to the signed-in wallet ONLY when the deploy tx proves it
// deployed this contract; otherwise the contract is verified as authentic but
// left unattributed (graceful fallback).
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in to verify a contract.' }, { status: 401 })
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  }

  let body: { address?: unknown; network?: unknown; source?: unknown; deployTx?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const address = typeof body.address === 'string' ? body.address : ''
  const network = typeof body.network === 'string' ? body.network : ''
  const source = typeof body.source === 'string' ? body.source : ''
  const deployTx = typeof body.deployTx === 'string' ? body.deployTx : undefined

  if (!address || !source || !(network in NETWORKS)) {
    return NextResponse.json({ error: 'address, network, and source are required.' }, { status: 400 })
  }

  // ── Authenticity: source must match the authentic on-chain source ──
  // Studio networks (studionet/localnet) expose getContractCode. Bradbury/Asimov
  // do not, so there we read the source embedded in the deploy transaction.
  let onChainSource: string | null = null
  let tx: Awaited<ReturnType<typeof getDeployTx>> | null = null

  try {
    const code = await getOnChainCode(network as NetworkId, address)
    if (code) onChainSource = code
  } catch {
    // getContractCode is unavailable on this network — fall back to the deploy tx.
  }

  if (!onChainSource && deployTx) {
    try {
      tx = await getDeployTx(network as NetworkId, deployTx)
      const deployedThis = tx.contractAddress?.toLowerCase() === address.toLowerCase()
      if (tx.isDeploy && deployedThis && tx.code) onChainSource = tx.code
    } catch {
      // deploy tx lookup failed — handled by the null check below.
    }
  }

  if (!onChainSource) {
    return NextResponse.json(
      {
        error:
          'Could not read the contract source from the network. On Bradbury/Asimov, include the deploy transaction hash.',
      },
      { status: 502 }
    )
  }
  if (normalize(onChainSource) !== normalize(source)) {
    return NextResponse.json(
      { error: 'Source does not match the on-chain contract.' },
      { status: 400 }
    )
  }

  // ── Attribution: confirm the signer deployed this contract (strict, optional) ──
  let attributedTo: string | null = null
  if (deployTx) {
    try {
      if (!tx) tx = await getDeployTx(network as NetworkId, deployTx)
      const deployedThis = tx.contractAddress?.toLowerCase() === address.toLowerCase()
      const sentBySigner = tx.from?.toLowerCase() === session.address
      if (tx.isDeploy && deployedThis && sentBySigner) attributedTo = session.address
    } catch {
      // tx lookup failed — fall back to authenticity-only (no attribution)
    }
  }

  const sb = getSupabaseAdmin()

  // Was it already verified+attributed to this wallet? (avoid double-counting reputation)
  const { data: existing } = await sb
    .from('contracts')
    .select('is_verified, deployer_wallet, deploy_tx')
    .eq('address', address)
    .eq('network', network)
    .maybeSingle()
  const alreadyAttributed = !!existing?.is_verified && existing?.deployer_wallet === attributedTo

  // Never downgrade attribution: a verify may add or upgrade the deployer, but an
  // authenticity-only re-verify (attributedTo === null) must preserve whatever's
  // already attributed instead of nulling it.
  const { error: upsertErr } = await sb.from('contracts').upsert(
    {
      address,
      network,
      source,
      is_verified: true,
      deployer_wallet: attributedTo ?? existing?.deployer_wallet ?? null,
      deploy_tx: attributedTo ? deployTx : (existing?.deploy_tx ?? null),
    },
    { onConflict: 'address,network' }
  )
  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 })
  }

  // Bump reputation only on first attribution (PRD: verified * 3).
  if (attributedTo && !alreadyAttributed) {
    const { data: prof } = await sb
      .from('builder_profiles')
      .select('contracts_verified, reputation_score')
      .eq('wallet_address', attributedTo)
      .maybeSingle()
    await sb.from('builder_profiles').upsert(
      {
        wallet_address: attributedTo,
        contracts_verified: (prof?.contracts_verified ?? 0) + 1,
        reputation_score: (prof?.reputation_score ?? 0) + 3,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'wallet_address' }
    )
  }

  return NextResponse.json({ success: true, verified: true, attributed: !!attributedTo })
}
