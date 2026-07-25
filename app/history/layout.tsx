import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Deployment History',
  description: 'Your local and wallet-linked Shipyard deployment history.',
  path: '/history',
  noIndex: true,
})

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return children
}
