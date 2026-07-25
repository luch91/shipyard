import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata/site'

export function generateMetadata({
  params,
}: {
  params: { address: string }
}): Metadata {
  const address = params.address
  const shortAddress =
    address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address

  return createPageMetadata({
    title: `Interact with ${shortAddress}`,
    description: `Read from and interact with GenLayer Intelligent Contract ${shortAddress} through Shipyard.`,
    path: `/interact/${encodeURIComponent(address)}`,
  })
}

export default function InteractLayout({ children }: { children: ReactNode }) {
  return children
}
