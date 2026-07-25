import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Deploy an Intelligent Contract',
  description:
    'Upload or generate a Python Intelligent Contract, configure its parameters, and deploy it to a supported GenLayer environment.',
  path: '/deploy',
})

export default function DeployLayout({ children }: { children: ReactNode }) {
  return children
}
