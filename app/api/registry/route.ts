import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { parseContract } from '@/lib/genlayer/parser'

// DB-backed registry. Contracts enter the `contracts` table when they are
// deployed or verified through Shipyard (a live full-chain crawler would be a
// later, separate addition). Reads use the service role (bypasses RLS) and are
// cached in Redis with a 5-minute TTL (PRD).

const CACHE_TTL_SECONDS = 300

const KNOWN_NETWORKS = ['testnet-bradbury', 'testnet-asimov', 'studionet', 'localnet']

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export type ContractEntry = {
  address:    string
  network:    string
  verified:   boolean
  deployer:   string | null
  deployedAt: string | null
  methods:    string[]
}

export async function GET(req: NextRequest) {
  const network = req.nextUrl.searchParams.get('network') ?? 'testnet-bradbury'

  if (!KNOWN_NETWORKS.includes(network)) {
    return NextResponse.json({ error: `Unknown network: ${network}` }, { status: 400, headers: CORS })
  }

  // Without a database there is no registry to read — return empty, not an error.
  if (!isSupabaseConfigured()) {
    return NextResponse.json([], { headers: { ...CORS, 'X-Cache': 'DISABLED' } })
  }

  const redis = getRedis()
  const cacheKey = `registry:${network}`
  if (redis) {
    try {
      const cached = await redis.get<ContractEntry[]>(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: { ...CORS, 'X-Cache': 'HIT', 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' },
        })
      }
    } catch {
      // cache read failure — fall through to a DB read
    }
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('contracts')
      .select('address, network, is_verified, deployer_wallet, deployed_at, created_at, source')
      .eq('network', network)
      .order('is_verified', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw new Error(error.message)

    const contracts: ContractEntry[] = (data ?? []).map((r) => {
      let methods: string[] = []
      if (typeof r.source === 'string' && r.source) {
        try {
          methods = parseContract(r.source).methods.map((m) => m.name)
        } catch {
          // unparseable source — list the contract without method chips
        }
      }
      return {
        address:    String(r.address),
        network:    String(r.network),
        verified:   !!r.is_verified,
        deployer:   r.deployer_wallet ?? null,
        deployedAt: (r.deployed_at ?? r.created_at) ?? null,
        methods,
      }
    })

    if (redis) {
      try {
        await redis.set(cacheKey, contracts, { ex: CACHE_TTL_SECONDS })
      } catch {
        // cache write failure is non-fatal
      }
    }

    return NextResponse.json(contracts, {
      headers: { ...CORS, 'X-Cache': 'MISS', 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500, headers: CORS })
  }
}
