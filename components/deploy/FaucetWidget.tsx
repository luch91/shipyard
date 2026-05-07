'use client'

import { useState } from 'react'
import { Droplets, ExternalLink, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useDeployStore } from '@/hooks/useDeployStore'
import { track } from '@/lib/analytics'
import type { NetworkId } from '@/types'

const FAUCET_NETWORKS: NetworkId[] = ['testnet-bradbury', 'testnet-asimov']
const NETWORK_PARAM: Record<string, string> = {
  'testnet-bradbury': 'bradbury',
  'testnet-asimov': 'asimov',
}

export default function FaucetWidget() {
  const { wallet, selectedNetwork } = useDeployStore()
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState('')

  // Only show on testnets when wallet is connected with 0 or null balance
  const shouldShow =
    wallet.isConnected &&
    wallet.address &&
    FAUCET_NETWORKS.includes(selectedNetwork) &&
    (wallet.balance === null || wallet.balance === '0.0000')

  if (!shouldShow) return null

  const networkParam = NETWORK_PARAM[selectedNetwork]
  const faucetUrl = `https://testnet-faucet.genlayer.foundation/claim?address=${wallet.address}&network=${networkParam}`

  const handleClaim = async () => {
    setClaiming(true)
    setError('')
    track('faucet_claimed', { network: selectedNetwork })
    try {
      const res = await fetch(faucetUrl)
      if (res.ok) {
        setClaimed(true)
      } else {
        // Faucet may have CORS restrictions — open in new tab as fallback
        window.open(faucetUrl, '_blank', 'noopener,noreferrer')
        setClaimed(true)
      }
    } catch {
      // CORS blocked — open in new tab
      window.open(faucetUrl, '_blank', 'noopener,noreferrer')
      setClaimed(true)
    } finally {
      setClaiming(false)
    }
  }

  if (claimed) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
        <CheckCircle size={13} className="shrink-0 text-emerald-400" />
        <p className="text-xs text-emerald-400">
          Faucet request sent. Tokens usually arrive within 30 seconds.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <Droplets size={13} className="shrink-0 text-amber-400" />
        <p className="text-xs text-amber-400">
          Your wallet has no GEN tokens on this network.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="sm" loading={claiming} onClick={handleClaim}>
          <Droplets size={11} />
          Get tokens
        </Button>
        <a
          href="https://testnet-faucet.genlayer.foundation"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-600 hover:text-neutral-400"
          aria-label="Open faucet in new tab"
        >
          <ExternalLink size={12} />
        </a>
      </div>
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </div>
  )
}
