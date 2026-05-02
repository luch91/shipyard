import type { DeployOptions, DeployResult } from '@/types'
import { createSignerClient } from './client'
import { validateContract } from './parser'

// ─── Deploy ───────────────────────────────────────────────────────────────────

export async function deployContract(options: DeployOptions): Promise<DeployResult> {
  const { contractSource, constructorArgs, networkId, privateKey, onLog } = options

  // 1. Validate
  onLog({ level: 'info', message: 'Validating contract source...' })
  const validation = validateContract(contractSource)
  if (!validation.valid) {
    const msg = `Validation failed: ${validation.errors.join('; ')}`
    onLog({ level: 'error', message: msg })
    throw new Error(msg)
  }
  onLog({ level: 'success', message: 'Contract source is valid.' })
  for (const warning of validation.warnings) {
    onLog({ level: 'warn', message: warning })
  }

  // 2. Create signer client
  onLog({ level: 'info', message: `Connecting to ${networkId}...` })
  let client: Awaited<ReturnType<typeof createSignerClient>>
  try {
    client = await createSignerClient(networkId, privateKey)
  } catch (err) {
    const msg = `Could not connect to ${networkId}. Check your connection or try a different network.`
    onLog({ level: 'error', message: msg })
    console.error(err)
    throw new Error(msg)
  }
  onLog({ level: 'success', message: 'Connected.' })

  // 3. Build constructor args array (positional)
  const argsArray = Object.values(constructorArgs)
  onLog({
    level: 'info',
    message: `Deploying with args: ${argsArray.length ? JSON.stringify(argsArray) : '(none)'}`,
  })

  // 4. Deploy — returns tx hash directly
  let txHash: string
  try {
    onLog({ level: 'info', message: 'Sending deploy transaction...' })
    txHash = await client.deployContract({
      code: contractSource,
      args: argsArray,
    })
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err)
    let msg: string
    if (raw.includes('enough funds') || raw.includes('insufficient funds')) {
      msg =
        'Insufficient funds. Your wallet has no GEN tokens on this network. ' +
        'Visit https://testnet-faucet.genlayer.foundation to get testnet tokens.'
    } else {
      msg = `Deployment failed: ${raw}`
    }
    onLog({ level: 'error', message: msg })
    console.error(err)
    throw new Error(msg)
  }
  onLog({ level: 'info', message: `Transaction submitted: ${txHash}` })

  // 5. Wait for finalization
  onLog({ level: 'info', message: 'Waiting for transaction to finalize (this can take ~30s)...' })
  let contractAddress = ''
  try {
    // status is optional — omitting it uses the SDK default (waits for FINALIZED)
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      retries: 60,
      interval: 3000,
    })

    // Contract address lives in txDataDecoded for deploy transactions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = (receipt as any)?.txDataDecoded
    contractAddress = decoded?.contractAddress ?? (receipt as any)?.recipient ?? ''

    onLog({ level: 'success', message: `Contract deployed at: ${contractAddress}` })
  } catch (err) {
    onLog({
      level: 'warn',
      message: 'Transaction submitted but could not confirm finalization. Check the explorer.',
    })
    console.error(err)
  }

  return {
    contractAddress,
    transactionHash: txHash,
    network: networkId,
    deployedAt: Date.now(),
    contractName: '',
  }
}

// ─── Gas Estimate ─────────────────────────────────────────────────────────────

export function estimateDeployGas(contractSource: string): number {
  const byteSize = new TextEncoder().encode(contractSource).length
  return 21000 + byteSize * 68
}
