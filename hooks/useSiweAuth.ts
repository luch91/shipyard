'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { createSiweMessage } from 'viem/siwe'

type Status = 'loading' | 'authenticated' | 'unauthenticated'

// Client-side SIWE flow: fetch nonce -> build + sign message -> verify -> session.
export function useSiweAuth() {
  const { address, chainId, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const [status, setStatus] = useState<Status>('loading')
  const [sessionAddress, setSessionAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      setSessionAddress(data.address ?? null)
      setStatus(data.address ? 'authenticated' : 'unauthenticated')
    } catch {
      setSessionAddress(null)
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Authenticated only if the session wallet matches the currently connected wallet.
  const authenticated =
    status === 'authenticated' &&
    !!sessionAddress &&
    (!address || address.toLowerCase() === sessionAddress)

  const signIn = useCallback(async () => {
    if (!isConnected || !address) return
    setError(null)
    try {
      const nonceRes = await fetch('/api/auth/nonce')
      const { nonce } = await nonceRes.json()

      const message = createSiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Shipyard.',
        uri: window.location.origin,
        version: '1',
        chainId: chainId ?? 1,
        nonce,
      })

      const signature = await signMessageAsync({ message })

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      })
      if (!verifyRes.ok) {
        const d = await verifyRes.json().catch(() => ({}))
        throw new Error(d.error ?? 'Sign-in failed.')
      }
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.')
      setStatus('unauthenticated')
    }
  }, [address, chainId, isConnected, signMessageAsync, refresh])

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore — clear local state regardless
    }
    setSessionAddress(null)
    setStatus('unauthenticated')
  }, [])

  return { status, authenticated, sessionAddress, error, signIn, signOut, refresh }
}
