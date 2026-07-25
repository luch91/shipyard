'use client'

import { Suspense, useEffect, useState } from 'react'
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
import { getNetwork, NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'
import type { NetworkId } from '@/types'

// Isolated so useSearchParams is inside a Suspense boundary (Next.js 14 requirement)
function SourceLoader() {
  const searchParams = useSearchParams()
  const { setContractSource, setParsedContract, setConstructorArg } = useDeployStore()

  useEffect(() => {
    const encoded = searchParams.get('source')
    if (!encoded) return
    const decoded = LZString.decompressFromEncodedURIComponent(encoded)
    if (!decoded) return
    const validation = validateContract(decoded)
    if (validation.valid) {
      const parsed = parseContract(decoded)
      setContractSource(decoded)
      setParsedContract(parsed)
      for (const param of parsed.constructorParams) {
        if (param.defaultValue !== undefined) {
          setConstructorArg(param.name, param.type === 'bool' ? param.defaultValue.toLowerCase() : param.defaultValue)
        }
      }
    }
  }, [searchParams, setContractSource, setParsedContract, setConstructorArg])

  return null
}

export default function DeployPage() {
  const { contractSource, parsedContract, selectedNetwork } = useDeployStore()
  const [prevSource, setPrevSource] = useState<string | null>(null)
  const network = getNetwork(selectedNetwork)
  const networkColors = NETWORK_COLOR_CLASSES[selectedNetwork as NetworkId]

  // Check if this contract was previously deployed and source differs
  useEffect(() => {
    if (!parsedContract?.className || !contractSource) {
      setPrevSource(null)
      return
    }
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
    <div className="min-h-screen bg-[#080b09]">
      <Suspense fallback={null}>
        <SourceLoader />
      </Suspense>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-7 flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              Deploy a Contract
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              Upload your Intelligent Contract, choose a network, and deploy in seconds.
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-md border border-white/[0.08] bg-[#101411] px-3 py-2">
            <span className={`h-2 w-2 rounded-full ${networkColors.dot}`} />
            <span className="text-xs text-neutral-500">Current target</span>
            <span className="text-sm font-medium text-neutral-200">{network.name}</span>
          </div>
        </div>

        {/* Faucet widget — shows when wallet is connected with 0 balance on testnet */}
        <div className="mb-5">
          <FaucetWidget />
        </div>

        {/* Diff view — shows when re-deploying a changed contract */}
        {prevSource && parsedContract && (
          <div className="mb-5">
            <ContractDiff
              oldSource={prevSource}
              newSource={contractSource}
              contractName={parsedContract.className}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <section className="app-panel p-4 sm:p-5 xl:col-span-5">
            <ContractUploader />
          </section>
          <section className="app-panel flex flex-col gap-6 p-4 sm:p-5 xl:col-span-4">
            <NetworkSelector />
            <div className="border-t border-white/[0.07] pt-6">
              <DeployForm />
            </div>
          </section>
          <section className="app-panel p-4 sm:p-5 xl:col-span-3">
            <DeployLogs />
          </section>
        </div>
      </div>
    </div>
  )
}
