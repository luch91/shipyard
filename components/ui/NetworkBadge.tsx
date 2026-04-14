import clsx from 'clsx'
import { NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'
import { NETWORKS } from '@/lib/genlayer/networks'
import type { NetworkId } from '@/types'

interface NetworkBadgeProps {
  networkId: NetworkId
  size?: 'sm' | 'md'
  pulse?: boolean
}

export default function NetworkBadge({ networkId, size = 'sm', pulse = false }: NetworkBadgeProps) {
  const colors = NETWORK_COLOR_CLASSES[networkId]
  const network = NETWORKS[networkId]

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded border font-mono font-medium',
        colors.border,
        colors.bg,
        colors.text,
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs'
      )}
    >
      <span
        className={clsx(
          'inline-block rounded-full',
          colors.dot,
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          pulse && 'animate-pulse'
        )}
      />
      {network.name}
    </span>
  )
}
