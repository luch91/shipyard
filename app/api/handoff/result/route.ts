import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { decodeEnvelope, isValidState } from '@/lib/handoff/protocol'

export const dynamic = 'force-dynamic'

// Relay transport for the wallet handoff (SPEC.md §12.1, §12.4 #5). Used when the CLI
// can't be reached on 127.0.0.1 (remote/SSH, port blocked): the /handoff page POSTs the
// result here and the CLI polls for it. Results are PUBLIC outcomes only (tx hash,
// contract address, booleans) — never a key/seed/signature.
//
// Requires Redis. When Redis is not configured the relay is unavailable (503) and the
// CLI must fall back to the loopback callback. The rest of the app already degrades
// gracefully without Redis; relay is the one path that genuinely needs it.

const KEY = (state: string) => `handoff:result:${state}`
const TTL_SECONDS = 600 // 10 minutes — short-lived, single-use

// POST { state, payload } — store a handoff result (single-use, first write wins).
export async function POST(req: NextRequest) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json(
      { error: 'Relay unavailable — Redis is not configured. Use the loopback callback.' },
      { status: 503 },
    )
  }

  let body: { state?: unknown; payload?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { state, payload } = body
  if (!isValidState(state) || typeof payload !== 'string' || !payload) {
    return NextResponse.json({ error: 'state and payload are required.' }, { status: 400 })
  }

  // The payload must be a decodable envelope whose state matches the key — binds the
  // stored result to this run and rejects malformed/mismatched writes.
  const env = decodeEnvelope(payload)
  if (!env || env.state !== state) {
    return NextResponse.json({ error: 'Payload does not match state.' }, { status: 400 })
  }

  // Single-use: NX so the first write wins; a later write for the same state is rejected.
  const stored = await redis.set(KEY(state), payload, { nx: true, ex: TTL_SECONDS })
  if (stored !== 'OK') {
    return NextResponse.json({ error: 'A result was already submitted for this state.' }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}

// GET ?state= — poll for a stored result. Returns it once then deletes it (single-use);
// 204 while still pending.
export async function GET(req: NextRequest) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json(
      { error: 'Relay unavailable — Redis is not configured.' },
      { status: 503 },
    )
  }

  const state = req.nextUrl.searchParams.get('state')
  if (!isValidState(state)) {
    return NextResponse.json({ error: 'A valid state is required.' }, { status: 400 })
  }

  const payload = await redis.get<string>(KEY(state))
  if (!payload) return new NextResponse(null, { status: 204 })

  await redis.del(KEY(state)) // single-use: consume on read
  return NextResponse.json({ payload })
}
