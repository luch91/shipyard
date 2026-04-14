'use client'

import { useState, useCallback } from 'react'
import { readContractMethod, writeContractMethod } from '@/lib/genlayer/client'
import { useDeployStore } from './useDeployStore'
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
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (privateKey: string, args: string[] = [], networkOverride?: NetworkId) => {
      setLoading(true)
      setTxHash(null)
      setError(null)
      try {
        const network = networkOverride ?? selectedNetwork
        const hash = await writeContractMethod(network, privateKey, contractAddress, methodName, args)
        setTxHash(hash)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transaction failed.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [contractAddress, methodName, selectedNetwork]
  )

  return { execute, loading, txHash, error, reset: () => { setTxHash(null); setError(null) } }
}
