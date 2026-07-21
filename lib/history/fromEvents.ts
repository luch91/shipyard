import type { DeploymentRecord, NetworkId } from '@/types'

// Maps deployment_succeeded analytics rows onto the DeploymentRecord shape the
// history UI already renders for localStorage entries, so server-synced and local
// history merge without the client caring where a row came from.

export type DeploymentEventRow = {
  network?: string | null
  contract_address?: string | null
  metadata?: unknown
  created_at?: string | null
}

const DEFAULT_NETWORK: NetworkId = 'testnet-bradbury'
const DEFAULT_CONTRACT_NAME = 'Contract'

/**
 * Rows must arrive newest-first: the first occurrence of an address wins, so a
 * re-deploy to the same address keeps its latest record. Rows without an address
 * are dropped — there is nothing to link or interact with.
 */
export function deploymentsFromEvents(
  rows: DeploymentEventRow[],
  now: () => number = Date.now,
): DeploymentRecord[] {
  const seen = new Set<string>()
  const deployments: DeploymentRecord[] = []

  for (const row of rows) {
    const address = typeof row.contract_address === 'string' ? row.contract_address : ''
    if (!address) continue
    const key = address.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    const meta = (row.metadata ?? {}) as Record<string, unknown>
    const contractName =
      typeof meta.contract_name === 'string' && meta.contract_name
        ? meta.contract_name
        : DEFAULT_CONTRACT_NAME
    const txHash = typeof meta.transaction_hash === 'string' ? meta.transaction_hash : undefined

    deployments.push({
      address,
      contractName,
      network: (row.network as NetworkId) ?? DEFAULT_NETWORK,
      deployedAt: row.created_at ? new Date(row.created_at).getTime() : now(),
      txHash,
    })
  }

  return deployments
}
