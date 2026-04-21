'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDeployStore } from './useDeployStore'
import { createReadClient, createEphemeralClient } from '@/lib/genlayer/client'
import type { NetworkId } from '@/types'

const WALLET_ADDRESS_KEY = 'gendeploy:wallet:address'

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidPrivateKey(key: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(key)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallet() {
  const { wallet, setWallet, clearWallet, selectedNetwork } = useDeployStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Restore address from localStorage on mount ─────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WALLET_ADDRESS_KEY)
      if (saved && !wallet.isConnected) {
        setWallet({ address: saved, isConnected: true })
      }
    } catch {
      // localStorage unavailable — fine
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Balance Refresh ────────────────────────────────────────────────────────

  const refreshBalance = useCallback(
    async (address: string, networkId: NetworkId) => {
      try {
        const client = await createReadClient(networkId)
        const raw: unknown = await client.getBalance({ address: address as `0x${string}`, blockTag: 'latest' })
        // raw is typically a bigint in wei — format to GEN string
        const wei = typeof raw === 'bigint' ? raw : BigInt(String(raw))
        const gen = Number(wei) / 1e18
        setWallet({ balance: gen.toFixed(4) })
      } catch {
        setWallet({ balance: null })
      }
    },
    [setWallet]
  )

  // ── Connect with Private Key ───────────────────────────────────────────────

  const connect = useCallback(
    async (privateKey?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        let address: string

        if (!privateKey) {
          // Ephemeral wallet — random keypair
          const ephemeral = await createEphemeralClient(selectedNetwork)
          address = ephemeral.address
        } else {
          // Import from private key — normalize 0x prefix
          const normalized = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
          if (!isValidPrivateKey(normalized)) {
            throw new Error('Invalid private key. Must be a 64-character hex string.')
          }
          const genlayerJs = await import('genlayer-js')
          const account = genlayerJs.createAccount(normalized as `0x${string}`)
          address = account.address as string
        }

        // Persist address (NOT private key) to localStorage
        try {
          localStorage.setItem(WALLET_ADDRESS_KEY, address)
        } catch {
          // non-fatal
        }

        setWallet({ address, isConnected: true, balance: null })

        // Fetch balance asynchronously
        await refreshBalance(address, selectedNetwork)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to connect wallet.'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedNetwork, setWallet, refreshBalance]
  )

  // ── Disconnect ─────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    try {
      localStorage.removeItem(WALLET_ADDRESS_KEY)
    } catch {
      // non-fatal
    }
    clearWallet()
    setError(null)
  }, [clearWallet])

  // ── Refresh balance on network change ─────────────────────────────────────

  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      refreshBalance(wallet.address, selectedNetwork)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork])

  return {
    address: wallet.address,
    balance: wallet.balance,
    isConnected: wallet.isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    refreshBalance: () => {
      if (wallet.address) refreshBalance(wallet.address, selectedNetwork)
    },
  }
}
