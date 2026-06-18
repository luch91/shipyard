import { NextResponse } from 'next/server'
import { generateSiweNonce } from 'viem/siwe'
import { NONCE_COOKIE, nonceCookieOptions } from '@/lib/auth/session'

// Must run per-request: a static/cached nonce would be identical for everyone and
// break replay protection.
export const dynamic = 'force-dynamic'

// Issues a single-use SIWE nonce. Stored in an httpOnly cookie so the verify
// step can confirm the signed message used the nonce we issued (replay protection).
export async function GET() {
  const nonce = generateSiweNonce()
  const res = NextResponse.json({ nonce })
  res.cookies.set(NONCE_COOKIE, nonce, nonceCookieOptions)
  return res
}
