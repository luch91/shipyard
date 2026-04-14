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
 * Signer client — for deploys and write transactions.
 * Private key must be a valid 0x-prefixed 64-char hex string.
 */
export async function createSignerClient(
  networkId: NetworkId,
  privateKey: string
): Promise<GenLayerClient> {
  const { createClient, createAccount } = await import('genlayer-js')
  const chain = await getChain(networkId)
  const account = createAccount(privateKey as `0x${string}`)
  return createClient({ chain, account })
}

/**
 * Ephemeral client — random keypair, useful for testnet exploration.
 */
export async function createEphemeralClient(networkId: NetworkId): Promise<{
  client: GenLayerClient
  privateKey: string
  address: string
}> {
  const { createClient, createAccount, generatePrivateKey } = await import('genlayer-js')
  const chain = await getChain(networkId)
  const pk = generatePrivateKey()
  const account = createAccount(pk)
  const client = createClient({ chain, account })
  return {
    client,
    privateKey: pk as string,
    address: account.address as string,
  }
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

export async function writeContractMethod(
  networkId: NetworkId,
  privateKey: string,
  contractAddress: string,
  methodName: string,
  args: unknown[] = []
): Promise<string> {
  const client = await createSignerClient(networkId, privateKey)
  const hash = await client.writeContract({
    address: contractAddress as `0x${string}`,
    functionName: methodName,
    args,
    value: BigInt(0),
  })
  return hash as string
}
