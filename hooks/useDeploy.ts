'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { useDeployStore } from './useDeployStore'
import { deployContract } from '@/lib/genlayer/deploy'
import { track } from '@/lib/analytics'
import { NETWORKS } from '@/lib/genlayer/networks'
import type { DeployLog } from '@/types'

// ─── Arg Coercion ─────────────────────────────────────────────────────────────

export function coerceArgs(
  constructorArgs: Record<string, string>,
  parsedParams: Array<{ name: string; type: string }>
): Record<string, unknown> {
  const coerced: Record<string, unknown> = {}

  for (const param of parsedParams) {
    const raw = constructorArgs[param.name] ?? ''

    switch (param.type) {
      case 'int':
        coerced[param.name] = raw === '' ? 0 : parseInt(raw, 10)
        break
      case 'float':
        coerced[param.name] = raw === '' ? 0.0 : parseFloat(raw)
        break
      case 'bool':
        coerced[param.name] = raw === 'true' || raw === 'True' || raw === '1'
        break
      case 'list':
      case 'dict':
        try {
          coerced[param.name] = JSON.parse(raw || (param.type === 'list' ? '[]' : '{}'))
        } catch {
          coerced[param.name] = param.type === 'list' ? [] : {}
        }
        break
      default:
        coerced[param.name] = raw
    }
  }

  return coerced
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDeploy() {
  const { address, chainId, isConnected, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const {
    contractSource,
    parsedContract,
    constructorArgs,
    selectedNetwork,
    deploy,
    addLog,
    setDeployStatus,
    setDeployResult,
    setDeployError,
    resetDeploy,
  } = useDeployStore()

  const canDeploy =
    !!contractSource.trim() &&
    !!parsedContract?.className &&
    isConnected &&
    !!address &&
    deploy.status !== 'deploying' &&
    deploy.status !== 'validating'

  async function run() {
    if (!canDeploy || !address || !connector) return

    // Switch to the selected network if needed
    const targetChainId = NETWORKS[selectedNetwork].chainId
    if (chainId !== targetChainId) {
      try {
        await switchChainAsync({ chainId: targetChainId })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Network switch rejected.'
        setDeployError(`Please switch your wallet to ${NETWORKS[selectedNetwork].name}: ${msg}`)
        return
      }
    }

    const provider = await connector.getProvider()

    const startTime = Date.now()
    const contractName = parsedContract?.className ?? 'Unknown'

    resetDeploy()
    setDeployStatus('validating')

    track('deployment_started', {
      network: selectedNetwork,
      contract_name: contractName,
      has_constructor_args: Object.keys(constructorArgs).length > 0,
    })

    const onLog = (log: Omit<DeployLog, 'id' | 'timestamp'>) => addLog(log)

    const argsForDeploy = parsedContract
      ? coerceArgs(constructorArgs, parsedContract.constructorParams)
      : constructorArgs

    setDeployStatus('deploying')

    try {
      const result = await deployContract({
        contractSource,
        constructorArgs: argsForDeploy,
        networkId: selectedNetwork,
        address,
        provider,
        onLog,
      })

      const enriched = { ...result, contractName }
      setDeployResult(enriched)

      track('deployment_succeeded', {
        network: selectedNetwork,
        contract_name: enriched.contractName,
        contract_address: enriched.contractAddress,
        duration_ms: Date.now() - startTime,
      })

      try {
        const historyKey = 'gendeploy:deployments'
        const existing = JSON.parse(localStorage.getItem(historyKey) ?? '[]')
        existing.unshift({
          address: enriched.contractAddress,
          contractName: enriched.contractName,
          network: enriched.network,
          deployedAt: enriched.deployedAt,
          txHash: enriched.transactionHash,
        })
        localStorage.setItem(historyKey, JSON.stringify(existing.slice(0, 50)))

        if (enriched.contractAddress) {
          localStorage.setItem(`gendeploy:source:${enriched.contractAddress}`, contractSource)
        }
      } catch {
        // localStorage may not be available — non-fatal
      }

      // Add the deploy to the public registry (fire-and-forget; never blocks deploy).
      if (enriched.contractAddress) {
        fetch('/api/registry/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: enriched.contractAddress,
            network: enriched.network,
            deployTx: enriched.transactionHash,
          }),
        }).catch(() => {})
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setDeployError(message)

      track('deployment_failed', {
        network: selectedNetwork,
        contract_name: contractName,
        error: message,
      })
    }
  }

  return {
    deploy,
    canDeploy,
    run,
    reset: resetDeploy,
  }
}
