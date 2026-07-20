import type { Metadata } from 'next'
import { Suspense } from 'react'
import BuildersClient from '@/components/builders/BuildersClient'

export const metadata: Metadata = {
  title: 'Builders',
  description:
    'Top GenLayer builders on Shipyard, ranked by reputation earned from verified contract deployments.',
}

export default function BuildersPage() {
  return (
    <Suspense fallback={null}>
      <BuildersClient />
    </Suspense>
  )
}
