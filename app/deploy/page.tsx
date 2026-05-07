'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import LZString from 'lz-string'
import { useDeployStore } from '@/hooks/useDeployStore'
import { parseContract, validateContract } from '@/lib/genlayer/parser'
import { hasDiff } from '@/lib/diff'
import ContractUploader from '@/components/deploy/ContractUploader'
import NetworkSelector from '@/components/deploy/NetworkSelector'
import DeployForm from '@/components/deploy/DeployForm'
import DeployLogs from '@/components/deploy/DeployLogs'
import FaucetWidget from '@/components/deploy/FaucetWidget'
import ContractDiff from '@/components/deploy/ContractDiff'

export default function DeployPage() {
  const searchParams = useSearchParams()
  const { contractSource, parsedContract, setContractSource, setParsedContract } = useDeployStore()
  const [prevSource, setPrevSource] = useState<string | null>(null)

  // Pre-load source from ?source= URL param (URL-encoded source sharing)
  useEffect(() => {
    const encoded = searchParams.get('source')
    if (!encoded) return
    const decoded = LZString.decompressFromEncodedURIComponent(encoded)
    if (!decoded) return
    const validation = validateContract(decoded)
    if (validation.valid) {
      setContractSource(decoded)
      setParsedContract(parseContract(decoded))
    }
  }, [searchParams, setContractSource, setParsedContract])

  // Check if this contract was previously deployed and source differs
  useEffect(() => {
    if (!parsedContract?.className || !contractSource) {
      setPrevSource(null)
      return
    }
    // Look for any deployment with this contract name
    try {
      const history = JSON.parse(localStorage.getItem('gendeploy:deployments') ?? '[]')
      const match = history.find(
        (d: { contractName: string; address: string }) =>
          d.contractName === parsedContract.className
      )
      if (match) {
        const stored = localStorage.getItem(`gendeploy:source:${match.address}`)
        if (stored && hasDiff(stored, contractSource)) {
          setPrevSource(stored)
        } else {
          setPrevSource(null)
        }
      } else {
        setPrevSource(null)
      }
    } catch {
      setPrevSource(null)
    }
  }, [contractSource, parsedContract?.className])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-mono text-xl font-bold text-white">Deploy a Contract</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Upload your Intelligent Contract, choose a network, and deploy in seconds.
        </p>
      </div>

      {/* Faucet widget — shows when wallet is connected with 0 balance on testnet */}
      <div className="mb-4">
        <FaucetWidget />
      </div>

      {/* Diff view — shows when re-deploying a changed contract */}
      {prevSource && parsedContract && (
        <div className="mb-4">
          <ContractDiff
            oldSource={prevSource}
            newSource={contractSource}
            contractName={parsedContract.className}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ContractUploader />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-1">
          <NetworkSelector />
          <DeployForm />
        </div>
        <div className="lg:col-span-1">
          <DeployLogs />
        </div>
      </div>
    </div>
  )
}
