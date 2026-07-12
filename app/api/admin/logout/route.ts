import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/session'

// Clears only password-admin authentication. Wallet SIWE remains signed in.
export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(ADMIN_SESSION_COOKIE)
  return res
}
