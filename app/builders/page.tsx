import type { Metadata } from 'next'
import { Suspense } from 'react'
import BuildersClient from '@/components/builders/BuildersClient'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Builders',
  description:
    'Top GenLayer builders on Shipyard, ranked by reputation earned from verified contract deployments.',
  path: '/builders',
})

export default function BuildersPage() {
  return (
    <Suspense fallback={null}>
      <BuildersClient />
    </Suspense>
  )
}
