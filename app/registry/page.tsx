import type { Metadata } from 'next'
import { Suspense } from 'react'
import RegistryClient from '@/components/registry/RegistryClient'
import ActivityFeed from '@/components/activity/ActivityFeed'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Contract Registry',
  description:
    'Browse Intelligent Contracts deployed on GenLayer networks. Explore on-chain contracts across Bradbury, Asimov, and Studionet testnets.',
  path: '/registry',
})

export default function RegistryPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RegistryClient />
      </Suspense>
      {/* Matches RegistryClient's own container so the feed lines up beneath it. */}
      <div className="mx-auto max-w-5xl px-4 pb-8">
        <ActivityFeed />
      </div>
    </>
  )
}
