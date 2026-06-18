'use client'

import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { useDeployStore } from './useDeployStore'
import { coerceArgs } from './useDeploy'
import { deployContract } from '@/lib/genlayer/deploy'
import { NETWORKS } from '@/lib/genlayer/networks'
import { track } from '@/lib/analytics'
import type { DeployLog, DeployResult, NetworkId } from '@/types'

const STUDIONET: NetworkId = 'studionet'

type TestStatus = 'idle' | 'deploying' | 'success' | 'error'

/**
 * Free, instant "test deploy" to Studionet — a dry run a builder can use to
 * confirm a contract actually deploys before targeting a real network.
 *
 * Deliberately isolated from useDeploy: it has its own state and does NOT write
 * to the deploy store, deploy history, or the main deploy result. A test can
 * never be confused with (or overwrite) a real deployment.
 */
export function useStudionetTest() {
  const { address, chainId, isConnected, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { contractSource, parsedContract, constructorArgs } = useDeployStore()

  const [status, setStatus] = useState<TestStatus>('idle')
  const [result, setResult] = useState<DeployResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<DeployLog[]>([])

  const canTest =
    !!contractSource.trim() &&
    !!parsedContract?.className &&
    isConnected &&
    !!address &&
    status !== 'deploying'

  async function runTest() {
    if (!canTest || !address || !connector) return

    // Switch the wallet to Studionet if needed
    const targetChainId = NETWORKS[STUDIONET].chainId
    if (chainId !== targetChainId) {
      try {
        await switchChainAsync({ chainId: targetChainId })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Network switch rejected.'
        setStatus('error')
        setError(`Please switch your wallet to ${NETWORKS[STUDIONET].name}: ${msg}`)
        return
      }
    }

    const provider = await connector.getProvider()

    setStatus('deploying')
    setResult(null)
    setError(null)
    setLogs([])

    const onLog = (log: Omit<DeployLog, 'id' | 'timestamp'>) =>
      setLogs((prev) => [...prev, { ...log, id: crypto.randomUUID(), timestamp: Date.now() }])

    const args = parsedContract
      ? coerceArgs(constructorArgs, parsedContract.constructorParams)
      : constructorArgs

    track('studionet_test_started', { contract_name: parsedContract?.className ?? 'Unknown' })

    try {
      const res = await deployContract({
        contractSource,
        constructorArgs: args,
        networkId: STUDIONET,
        address,
        provider,
        onLog,
      })
      setStatus('success')
      setResult(res)
      track('studionet_test_succeeded', { contract_address: res.contractAddress })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Test deploy failed.'
      setStatus('error')
      setError(msg)
      track('studionet_test_failed', { error: msg })
    }
  }

  function reset() {
    setStatus('idle')
    setResult(null)
    setError(null)
    setLogs([])
  }

  return { status, result, error, logs, canTest, runTest, reset }
}
