'use client'

import { getLiveNetworks } from '@/lib/genlayer/networks'
import { NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'
import { useDeployStore } from '@/hooks/useDeployStore'
import { useNetworkHealth } from '@/hooks/useNetworkHealth'
import type { HealthStatus } from '@/hooks/useNetworkHealth'
import { Signal, SignalMedium, SignalZero } from 'lucide-react'
import toast from 'react-hot-toast'
import { track } from '@/lib/analytics'
import type { NetworkId } from '@/types'
import clsx from 'clsx'

function HealthIcon({ status, networkId }: { status: HealthStatus; networkId: NetworkId }) {
  const props = { size: 11, strokeWidth: 2 }
  const titles: Record<HealthStatus, string> = {
    up: 'Online', slow: 'Responding slowly', down: networkId === 'localnet' ? 'Not running' : 'Offline', loading: 'Checking…',
  }
  const icon = status === 'down'
    ? <SignalZero   {...props} className="text-red-500" />
    : status === 'slow'
    ? <SignalMedium {...props} className="text-yellow-400" />
    : status === 'up'
    ? <Signal       {...props} className="text-green-400" />
    : <Signal       {...props} className="text-neutral-600" />
  return <span className="ml-auto" title={titles[status]}>{icon}</span>
}

export default function NetworkSelector() {
  const { selectedNetwork, setSelectedNetwork } = useDeployStore()
  // Live testnets only (excludes localnet, isLive:false). Testnet Clarke is shown
  // as a "Soon" teaser below, replacing localnet as the fourth network card.
  const networks = getLiveNetworks()
  const health = useNetworkHealth()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="step-badge">02</span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
          Network
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {networks.map((network) => {
          const colors = NETWORK_COLOR_CLASSES[network.id as NetworkId]
          const isSelected = selectedNetwork === network.id

          return (
            <button
              key={network.id}
              type="button"
              onClick={() => {
                if (network.id !== selectedNetwork) {
                  toast.success(`Now targeting ${network.name}`)
                }
                setSelectedNetwork(network.id as NetworkId)
                track('network_selected', {
                  network: network.id,
                  network_id: network.id,
                  network_name: network.name,
                })
              }}
              className={clsx(
                'relative flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
                isSelected
                  ? [colors.border, colors.bg, 'ring-1', colors.border]
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
              )}
              aria-pressed={isSelected}
              aria-label={`Select ${network.name}`}
            >
              {/* Status dot + name + health indicator */}
              <span className="flex items-center gap-1.5">
                <span
                  className={clsx(
                    'inline-block h-2 w-2 rounded-full',
                    colors.dot,
                    network.isLive && isSelected ? 'animate-pulse' : ''
                  )}
                />
                <span
                  className={clsx(
                    'font-mono text-xs font-medium',
                    isSelected ? colors.text : 'text-neutral-400'
                  )}
                >
                  {network.name}
                </span>
                <HealthIcon status={health[network.id as NetworkId]} networkId={network.id as NetworkId} />
              </span>

              <p className="text-[11px] leading-tight text-neutral-600 line-clamp-2">
                {network.description}
              </p>

              {!network.isLive && (
                <span className="absolute right-2 top-2 rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
                  local
                </span>
              )}
            </button>
          )
        })}

        {/* Testnet Clarke — coming soon. Teaser only: not a deployable network
            until GenLayer publishes its RPC/chainId and genlayer-js exports the
            chain. Standalone card, intentionally not part of the NETWORKS map. */}
        <div
          className="relative flex cursor-default flex-col items-start gap-1 rounded-lg border border-sky-500/20 bg-sky-500/[0.04] px-4 py-3 text-left opacity-70"
          aria-disabled="true"
        >
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400 opacity-40" />
            <span className="font-mono text-xs font-medium text-sky-400">Testnet Clarke</span>
          </span>
          <p className="text-[11px] leading-tight text-neutral-600 line-clamp-2">
            Next-generation GenLayer testnet
          </p>
          <span className="absolute right-2 top-2 rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-400">
            Soon
          </span>
        </div>
      </div>
    </div>
  )
}
