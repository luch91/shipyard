import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

// Returns the currently authenticated wallet (or null).
export async function GET() {
  const session = await getSession()
  return NextResponse.json({ address: session?.address ?? null })
}
