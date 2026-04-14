'use client'

import { useState } from 'react'
import { Eye, EyeOff, Zap } from 'lucide-react'
import clsx from 'clsx'
import { useDeployStore } from '@/hooks/useDeployStore'
import { deployContract } from '@/lib/genlayer/deploy'
import { parseContract, validateContract } from '@/lib/genlayer/parser'
import NetworkBadge from '@/components/ui/NetworkBadge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { NetworkId, DeployLog, DeployResult } from '@/types'

const COMPARABLE_NETWORKS: NetworkId[] = ['testnet-bradbury', 'testnet-asimov', 'studionet', 'localnet']

// ─── Single network deploy column ────────────────────────────────────────────

interface ColState {
  status: 'idle' | 'deploying' | 'success' | 'error'
  logs: DeployLog[]
  result: DeployResult | null
  error: string | null
}

function NetworkColumn({
  networkId,
  contractSource,
  constructorArgs,
  privateKey,
}: {
  networkId: NetworkId
  contractSource: string
  constructorArgs: Record<string, string>
  privateKey: string
}) {
  const [state, setState] = useState<ColState>({
    status: 'idle',
    logs: [],
    result: null,
    error: null,
  })

  const deploy = async () => {
    setState({ status: 'deploying', logs: [], result: null, error: null })

    const addLog = (log: Omit<DeployLog, 'id' | 'timestamp'>) =>
      setState((s) => ({
        ...s,
        logs: [...s.logs, { ...log, id: crypto.randomUUID(), timestamp: Date.now() }],
      }))

    try {
      const result = await deployContract({
        contractSource,
        constructorArgs,
        networkId,
        privateKey,
        onLog: addLog,
      })
      setState((s) => ({ ...s, status: 'success', result }))
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : 'Deploy failed.',
      }))
    }
  }

  const levelColors: Record<DeployLog['level'], string> = {
    info: 'text-neutral-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
    warn: 'text-amber-400',
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <NetworkBadge networkId={networkId} pulse={state.status === 'deploying'} />
        <Button
          variant="primary"
          size="sm"
          loading={state.status === 'deploying'}
          disabled={!contractSource || !privateKey}
          onClick={deploy}
        >
          Deploy
        </Button>
      </div>

      {/* Log terminal */}
      <div className="h-48 overflow-y-auto rounded-md bg-neutral-950 p-3">
        {state.logs.length === 0 ? (
          <p className="font-mono text-xs text-neutral-700">Waiting…</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {state.logs.map((log) => (
              <div key={log.id} className={clsx('font-mono text-xs', levelColors[log.level])}>
                {log.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result */}
      {state.status === 'success' && state.result && (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="mb-1 font-mono text-[11px] text-emerald-400">Deployed</p>
          {state.result.contractAddress && (
            <p className="break-all font-mono text-xs text-white">{state.result.contractAddress}</p>
          )}
        </div>
      )}

      {state.status === 'error' && state.error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 p-3">
          <p className="font-mono text-xs text-red-400">{state.error}</p>
        </div>
      )}
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const { contractSource: storeSource, parsedContract } = useDeployStore()

  const [source, setSource] = useState(storeSource)
  const [networkA, setNetworkA] = useState<NetworkId>('testnet-bradbury')
  const [networkB, setNetworkB] = useState<NetworkId>('studionet')
  const [privateKey, setPrivateKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [constructorArgs, setConstructorArgs] = useState<Record<string, string>>({})

  const parsed = source ? (validateContract(source).valid ? parseContract(source) : null) : parsedContract

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-mono text-xl font-bold text-white">Network Comparison</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Deploy the same contract to two networks simultaneously and compare results.
        </p>
      </div>

      {/* Config */}
      <Card className="mb-6 flex flex-col gap-4">
        {/* Contract source */}
        {!storeSource && (
          <div>
            <label className="mb-1 block font-mono text-xs text-neutral-400">Contract source</label>
            <textarea
              rows={5}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Paste contract source…"
              className="w-full resize-none rounded-md border border-neutral-700 bg-neutral-800 p-3 font-mono text-xs text-white placeholder-neutral-600 focus:border-emerald-500/60 focus:outline-none"
            />
          </div>
        )}

        {storeSource && parsed && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-400">Contract:</span>
            <span className="font-mono text-xs text-white">{parsed.className}</span>
            <span className="text-xs text-neutral-600">(loaded from deploy page)</span>
          </div>
        )}

        {/* Constructor args */}
        {parsed && parsed.constructorParams.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-neutral-400">Constructor parameters</label>
            {parsed.constructorParams.map((param) => (
              <div key={param.name} className="flex items-center gap-2">
                <label className="w-32 shrink-0 font-mono text-xs text-neutral-500">
                  {param.name}:{param.type}
                </label>
                <input
                  type="text"
                  value={constructorArgs[param.name] ?? ''}
                  onChange={(e) =>
                    setConstructorArgs((a) => ({ ...a, [param.name]: e.target.value }))
                  }
                  placeholder={param.defaultValue ?? param.type}
                  className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 font-mono text-xs text-white placeholder-neutral-600 focus:border-emerald-500/60 focus:outline-none"
                  aria-label={param.name}
                />
              </div>
            ))}
          </div>
        )}

        {/* Network pickers */}
        <div className="grid grid-cols-2 gap-4">
          {([['Network A', networkA, setNetworkA], ['Network B', networkB, setNetworkB]] as const).map(
            ([label, value, setter]) => (
              <div key={label}>
                <label className="mb-1 block font-mono text-xs text-neutral-400">{label}</label>
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value as NetworkId)}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 font-mono text-xs text-white focus:border-emerald-500/60 focus:outline-none"
                >
                  {COMPARABLE_NETWORKS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )
          )}
        </div>

        {/* Private key */}
        <div>
          <label className="mb-1 block font-mono text-xs text-neutral-400">
            Private key <span className="text-neutral-600">(used for both networks)</span>
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="0x…"
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 pr-10 font-mono text-xs text-white placeholder-neutral-600 focus:border-emerald-500/60 focus:outline-none"
              aria-label="Private key"
            />
            <button
              type="button"
              onClick={() => setShowKey((p) => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 focus:outline-none"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
      </Card>

      {/* Side-by-side columns */}
      {networkA === networkB && (
        <p className="mb-4 text-xs text-amber-400">⚠ Both networks are the same. Select different networks for a meaningful comparison.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-xs text-neutral-500">Network A</p>
          <NetworkColumn
            networkId={networkA}
            contractSource={storeSource || source}
            constructorArgs={constructorArgs}
            privateKey={privateKey}
          />
        </div>
        <div>
          <p className="mb-2 font-mono text-xs text-neutral-500">Network B</p>
          <NetworkColumn
            networkId={networkB}
            contractSource={storeSource || source}
            constructorArgs={constructorArgs}
            privateKey={privateKey}
          />
        </div>
      </div>
    </div>
  )
}
