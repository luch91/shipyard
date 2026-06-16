'use client'

import { useCallback, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useDeployStore } from './useDeployStore'
import { createReadClient } from '@/lib/genlayer/client'
import type { NetworkId } from '@/types'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { wallet, setWallet, clearWallet, selectedNetwork } = useDeployStore()

  // Sync wagmi connection state into Zustand store
  useEffect(() => {
    if (isConnected && address) {
      setWallet({ address, isConnected: true })
    } else {
      clearWallet()
    }
  }, [address, isConnected, setWallet, clearWallet])

  // Fetch GEN balance from genlayer node
  const refreshBalance = useCallback(
    async (addr: string, networkId: NetworkId) => {
      try {
        const client = await createReadClient(networkId)
        const raw: unknown = await client.getBalance({ address: addr as `0x${string}`, blockTag: 'latest' })
        const wei = typeof raw === 'bigint' ? raw : BigInt(String(raw))
        const gen = Number(wei) / 1e18
        setWallet({ balance: gen.toFixed(4) })
      } catch {
        setWallet({ balance: null })
      }
    },
    [setWallet]
  )

  useEffect(() => {
    if (isConnected && address) {
      refreshBalance(address, selectedNetwork)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, selectedNetwork])

  return {
    address: address ?? null,
    balance: wallet.balance,
    isConnected,
    refreshBalance: () => {
      if (address) refreshBalance(address, selectedNetwork)
    },
  }
}
