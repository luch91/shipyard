'use client'

import { useState, useCallback } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { readContractMethod, writeContractMethodWithProvider } from '@/lib/genlayer/client'
import { useDeployStore } from './useDeployStore'
import { track } from '@/lib/analytics'
import { NETWORKS } from '@/lib/genlayer/networks'
import type { NetworkId } from '@/types'

// ─── Read ─────────────────────────────────────────────────────────────────────

export function useReadMethod(contractAddress: string, methodName: string) {
  const { selectedNetwork } = useDeployStore()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const call = useCallback(
    async (args: string[] = [], networkOverride?: NetworkId) => {
      setLoading(true)
      setResult(null)
      setError(null)
      track('read_method_called', { method_name: methodName, network: networkOverride ?? selectedNetwork })
      try {
        const network = networkOverride ?? selectedNetwork
        const res = await readContractMethod(network, contractAddress, methodName, args)
        setResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Call failed.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [contractAddress, methodName, selectedNetwork]
  )

  return { call, loading, result, error, reset: () => { setResult(null); setError(null) } }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function useWriteMethod(contractAddress: string, methodName: string) {
  const { selectedNetwork } = useDeployStore()
  const { address, chainId, isConnected, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (args: string[] = [], networkOverride?: NetworkId) => {
      if (!isConnected || !address || !connector) {
        setError('Please connect your wallet first.')
        return
      }

      const network = networkOverride ?? selectedNetwork
      const targetChainId = NETWORKS[network].chainId

      if (chainId !== targetChainId) {
        try {
          await switchChainAsync({ chainId: targetChainId })
        } catch {
          setError('Please switch your wallet to the correct network.')
          return
        }
      }

      const provider = await connector.getProvider()

      setLoading(true)
      setTxHash(null)
      setError(null)
      track('write_method_executed', { method_name: methodName, network })

      try {
        const hash = await writeContractMethodWithProvider(network, address, provider, contractAddress, methodName, args)
        setTxHash(hash)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transaction failed.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [contractAddress, methodName, selectedNetwork, address, connector, switchChainAsync, chainId, isConnected]
  )

  return { execute, loading, txHash, error, reset: () => { setTxHash(null); setError(null) } }
}
