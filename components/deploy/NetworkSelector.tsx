'use client'

import { getAllNetworks } from '@/lib/genlayer/networks'
import { NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'
import { useDeployStore } from '@/hooks/useDeployStore'
import { useNetworkHealth } from '@/hooks/useNetworkHealth'
import type { HealthStatus } from '@/hooks/useNetworkHealth'
import { Signal, SignalMedium, SignalZero } from 'lucide-react'
import { track } from '@/lib/analytics'
import type { NetworkId } from '@/types'
import clsx from 'clsx'

function HealthIcon({ status }: { status: HealthStatus }) {
  const props = { size: 11, strokeWidth: 2 }
  const titles: Record<HealthStatus, string> = {
    up: 'Online', slow: 'Responding slowly', down: 'Offline', loading: 'Checking…',
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
  const networks = getAllNetworks()
  const health = useNetworkHealth()

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-sm font-semibold text-neutral-300">2. Network</h2>
      <div className="grid grid-cols-2 gap-2">
        {networks.map((network) => {
          const colors = NETWORK_COLOR_CLASSES[network.id as NetworkId]
          const isSelected = selectedNetwork === network.id

          return (
            <button
              key={network.id}
              type="button"
              onClick={() => {
                setSelectedNetwork(network.id as NetworkId)
                track('network_selected', { network_id: network.id, network_name: network.name })
              }}
              className={clsx(
                'relative flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
                isSelected
                  ? [colors.border, colors.bg, 'ring-1', colors.border]
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/60'
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
                <HealthIcon status={health[network.id as NetworkId]} />
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
      </div>
    </div>
  )
}
