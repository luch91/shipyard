import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Intelligent Contract Templates',
  description:
    'Explore ready-to-deploy Python templates for GenLayer Intelligent Contracts, from beginner examples to AI-native applications.',
  path: '/templates',
})

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return children
}
