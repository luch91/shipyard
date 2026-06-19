import { getSession, type SessionPayload } from '@/lib/auth/session'

// Admin gating: a comma-separated allowlist of wallet addresses in the
// ADMIN_WALLETS env var (server-side only, no NEXT_PUBLIC_ prefix). Compared
// case-insensitively. Empty/unset means there are no admins.

export function getAdminWallets(): string[] {
  return (process.env.ADMIN_WALLETS ?? '')
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminWallet(address: string | null | undefined): boolean {
  if (!address) return false
  return getAdminWallets().includes(address.toLowerCase())
}

// Convenience for Route Handlers: returns the current session plus whether it
// belongs to an admin, so callers can tell "not signed in" (401) apart from
// "signed in but not an admin" (403).
export async function getAdminSession(): Promise<{
  session: SessionPayload | null
  isAdmin: boolean
}> {
  const session = await getSession()
  return { session, isAdmin: isAdminWallet(session?.address) }
}
