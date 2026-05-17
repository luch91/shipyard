import type { Metadata } from 'next'
import { Suspense } from 'react'
import RegistryClient from '@/components/registry/RegistryClient'

export const metadata: Metadata = {
  title: 'Contract Registry',
  description:
    'Browse Intelligent Contracts deployed on GenLayer networks. Explore on-chain contracts across Bradbury, Asimov, and Studionet testnets.',
}

export default function RegistryPage() {
  return (
    <Suspense fallback={null}>
      <RegistryClient />
    </Suspense>
  )
}
