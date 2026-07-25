import type { Metadata } from 'next'
import BuilderProfile from '@/components/builders/BuilderProfile'
import { createPageMetadata } from '@/lib/metadata/site'

export function generateMetadata({
  params,
}: {
  params: { wallet: string }
}): Metadata {
  const wallet = params.wallet
  const shortWallet =
    wallet.length > 12 ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : wallet

  return createPageMetadata({
    title: `Builder ${shortWallet}`,
    description: `GenLayer builder reputation and verified contract deployments for ${shortWallet} on Shipyard.`,
    path: `/builders/${encodeURIComponent(wallet)}`,
  })
}

export default function BuilderProfilePage() {
  return <BuilderProfile />
}
