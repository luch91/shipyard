import { Suspense } from 'react'
import RegistryClient from '@/components/registry/RegistryClient'

export default function RegistryPage() {
  return (
    <Suspense fallback={null}>
      <RegistryClient />
    </Suspense>
  )
}
