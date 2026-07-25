import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Admin Console',
  description: 'Protected Shipyard administration console.',
  path: '/admin',
  noIndex: true,
})

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children
}
