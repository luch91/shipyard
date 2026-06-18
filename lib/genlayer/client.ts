import type { NetworkId } from '@/types'

// ─── Type shims ───────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenLayerClient = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenLayerChain = any

// ─── Network → SDK chain mapping ─────────────────────────────────────────────

async function getChain(networkId: NetworkId): Promise<GenLayerChain> {
  const { chains } = await import('genlayer-js')
  const map: Record<NetworkId, GenLayerChain> = {
    'testnet-bradbury': chains.testnetBradbury,
    'testnet-asimov': chains.testnetAsimov,
    studionet: chains.studionet,
    localnet: chains.localnet,
  }
  return map[networkId]
}

// ─── Client Factory ───────────────────────────────────────────────────────────

/**
 * Read-only client — no signer. Use for balance checks and contract reads.
 */
export async function createReadClient(networkId: NetworkId): Promise<GenLayerClient> {
  const { createClient } = await import('genlayer-js')
  const chain = await getChain(networkId)
  return createClient({ chain })
}

/**
 * Signer client backed by an EIP-1193 provider (e.g. MetaMask via wagmi connector).
 * Uses eth_sendTransaction so MetaMask shows a confirmation popup.
 * The wallet must already be on the correct chain before calling.
 */
export async function createSignerClientWithProvider(
  networkId: NetworkId,
  address: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any
): Promise<GenLayerClient> {
  const { createClient } = await import('genlayer-js')
  const chain = await getChain(networkId)
  return createClient({ chain, account: address as `0x${string}`, provider })
}

// ─── Convenience Wrappers ─────────────────────────────────────────────────────

export async function readContractMethod(
  networkId: NetworkId,
  contractAddress: string,
  methodName: string,
  args: unknown[] = []
): Promise<unknown> {
  const client = await createReadClient(networkId)
  return client.readContract({
    address: contractAddress as `0x${string}`,
    functionName: methodName,
    args: args as unknown[],
  })
}

export async function writeContractMethodWithProvider(
  networkId: NetworkId,
  address: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any,
  contractAddress: string,
  methodName: string,
  args: unknown[] = []
): Promise<string> {
  const client = await createSignerClientWithProvider(networkId, address, provider)
  const hash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: methodName,
    args,
    value: BigInt(0),
  })
  return hash as string
}
