import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  sessionCookieOptions,
} from '@/lib/auth/session'
import { rateLimit, getClientIp } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

// Shared-password admin login. On the correct ADMIN_PASSWORD, issues a dedicated
// httpOnly admin JWT without replacing the wallet SIWE session. Brute-force is
// bounded by a per-IP rate limit; the compare is timing-safe. The password is a
// server-only env var (no NEXT_PUBLIC_) and is never returned or logged.
export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { error: 'Password login is not configured. Set ADMIN_PASSWORD, or use an admin wallet.' },
      { status: 503 },
    )
  }

  const ip = getClientIp(req)
  const { allowed, retryAfter } = await rateLimit(`admin-login:${ip}`, 5, 300) // 5 tries / 5 min
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  let body: { password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  const password = typeof body.password === 'string' ? body.password : ''

  // Timing-safe compare. timingSafeEqual requires equal-length buffers, so the
  // length check gates it (a length mismatch is already a non-match).
  const a = Buffer.from(password, 'utf-8')
  const b = Buffer.from(expected, 'utf-8')
  const ok = a.length === b.length && timingSafeEqual(a, b)
  if (!ok) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  const token = await createAdminSessionToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions)
  return res
}
