import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Compare GenLayer Networks',
  description:
    'Deploy the same Intelligent Contract across supported GenLayer testnets and compare results from one browser workflow.',
  path: '/compare',
})

export default function CompareLayout({ children }: { children: ReactNode }) {
  return children
}
