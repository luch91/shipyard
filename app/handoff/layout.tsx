import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Wallet Handoff',
  description: 'Review and authorize a Shipyard wallet action.',
  path: '/handoff',
  noIndex: true,
})

export default function HandoffLayout({ children }: { children: ReactNode }) {
  return children
}
