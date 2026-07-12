import { createHash } from 'crypto'

// Hash a wallet so raw addresses are never stored (PRD §8/§17). FAILS CLOSED:
// returns null when ANALYTICS_SALT is not set, rather than using a known default
// salt (which — over public wallet addresses — would make the hash trivially
// reversible). Shared by the analytics ingest and the admin console's wallet
// search, so both derive the exact same hash for a given address.
export function hashWallet(wallet: string): string | null {
  const salt = process.env.ANALYTICS_SALT
  if (!salt) return null
  return createHash('sha256').update(salt + wallet.toLowerCase()).digest('hex')
}
