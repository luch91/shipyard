import { NextRequest, NextResponse } from 'next/server'
import { parseSiweMessage } from 'viem/siwe'
import { recoverMessageAddress } from 'viem'
import {
  NONCE_COOKIE,
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from '@/lib/auth/session'

// Verifies a SIWE message + signature and, on success, issues a session cookie.
// Checks: nonce matches the issued (cookie) nonce, domain matches the request
// host, message not expired, and the signature recovers to the claimed address.
export async function POST(req: NextRequest) {
  let body: { message?: unknown; signature?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const message = body.message
  const signature = body.signature
  if (typeof message !== 'string' || typeof signature !== 'string') {
    return NextResponse.json({ error: 'message and signature are required.' }, { status: 400 })
  }

  const expectedNonce = req.cookies.get(NONCE_COOKIE)?.value
  if (!expectedNonce) {
    return NextResponse.json({ error: 'Missing or expired nonce. Try again.' }, { status: 401 })
  }

  let fields
  try {
    fields = parseSiweMessage(message)
  } catch {
    return NextResponse.json({ error: 'Malformed SIWE message.' }, { status: 400 })
  }

  if (!fields.address) {
    return NextResponse.json({ error: 'Message has no address.' }, { status: 400 })
  }
  if (fields.nonce !== expectedNonce) {
    return NextResponse.json({ error: 'Nonce mismatch.' }, { status: 401 })
  }

  // Bind to the request host to prevent cross-site message reuse.
  const host = req.headers.get('host')
  if (fields.domain && host && fields.domain !== host) {
    return NextResponse.json({ error: 'Domain mismatch.' }, { status: 401 })
  }
  if (fields.expirationTime && new Date(fields.expirationTime) < new Date()) {
    return NextResponse.json({ error: 'Message has expired.' }, { status: 401 })
  }

  // Verify the EOA signature recovers to the claimed address.
  let recovered: string
  try {
    recovered = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }
  if (recovered.toLowerCase() !== fields.address.toLowerCase()) {
    return NextResponse.json({ error: 'Signature does not match address.' }, { status: 401 })
  }

  const token = await createSessionToken(fields.address, fields.chainId)
  const res = NextResponse.json({ address: fields.address.toLowerCase() })
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions)
  res.cookies.delete(NONCE_COOKIE) // single-use
  return res
}
