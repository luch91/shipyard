'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useDeployStore } from '@/hooks/useDeployStore'
import ContractPanel from '@/components/interact/ContractPanel'

export default function InteractPage() {
  const params = useParams()
  const address = typeof params.address === 'string' ? params.address : ''
  const { selectedNetwork } = useDeployStore()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/deploy"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 focus:outline-none"
      >
        <ArrowLeft size={12} />
        Back to deploy
      </Link>

      <h1 className="mb-6 font-mono text-xl font-bold text-white">Interact</h1>

      <ContractPanel address={address} networkId={selectedNetwork} />
    </div>
  )
}
