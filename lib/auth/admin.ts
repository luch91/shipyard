import { getPasswordAdminSession, getSession, type SessionPayload } from '@/lib/auth/session'

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

// A session is admin if it's the shared-password admin session OR a wallet on the
// allowlist. The wallet path stays valid as a fallback so a bad ADMIN_PASSWORD (or
// none set) can never lock an allowlisted wallet out.
export function isAdminSession(session: SessionPayload | null): boolean {
  if (!session) return false
  return session.admin === true || isAdminWallet(session.address)
}

// Convenience for Route Handlers: returns the current session plus whether it
// belongs to an admin, so callers can tell "not signed in" (401) apart from
// "signed in but not an admin" (403).
export async function getAdminSession(): Promise<{
  session: SessionPayload | null
  isAdmin: boolean
}> {
  const passwordSession = await getPasswordAdminSession()
  if (passwordSession) return { session: passwordSession, isAdmin: true }

  const session = await getSession()
  // The regular SIWE cookie grants admin access only through the wallet
  // allowlist. A legacy password-admin token in that cookie must not bypass the
  // new cookie separation.
  return { session, isAdmin: isAdminWallet(session?.address) }
}
