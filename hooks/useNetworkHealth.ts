'use client'

import { useState, useEffect } from 'react'
import type { NetworkId } from '@/types'
import { NETWORKS } from '@/lib/genlayer/networks'

export type HealthStatus = 'loading' | 'up' | 'slow' | 'down'

const SLOW_MS = 1500
const TIMEOUT_MS = 5000

async function ping(rpcUrl: string): Promise<HealthStatus> {
  const t0 = Date.now()
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', id: 1 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const data = await res.json()
    if (!data.result) return 'down'
    return Date.now() - t0 >= SLOW_MS ? 'slow' : 'up'
  } catch {
    return 'down'
  }
}

export function useNetworkHealth(): Record<NetworkId, HealthStatus> {
  const [health, setHealth] = useState<Record<NetworkId, HealthStatus>>({
    'testnet-bradbury': 'loading',
    'testnet-asimov': 'loading',
    studionet: 'loading',
    localnet: 'loading',
  })

  useEffect(() => {
    for (const id of Object.keys(NETWORKS) as NetworkId[]) {
      ping(NETWORKS[id].rpcUrl).then((status) =>
        setHealth((prev) => ({ ...prev, [id]: status }))
      )
    }
  }, [])

  return health
}
