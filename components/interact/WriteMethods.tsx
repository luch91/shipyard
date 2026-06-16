'use client'

import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { ContractMethod } from '@/types'
import { useWriteMethod } from '@/hooks/useContract'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

function WriteMethodCard({
  method,
  contractAddress,
}: {
  method: ContractMethod
  contractAddress: string
}) {
  const { execute, loading, txHash, error } = useWriteMethod(contractAddress, method.name)
  const { isConnected } = useAccount()
  const [args, setArgs] = useState<Record<string, string>>({})

  const handleExecute = () => {
    const argsArray = method.params.map((p) => {
      const raw = args[p.name] ?? ''
      switch (p.type) {
        case 'int': return raw === '' ? 0 : parseInt(raw, 10)
        case 'float': return raw === '' ? 0.0 : parseFloat(raw)
        case 'bool': return raw === 'true' || raw === 'True' || raw === '1'
        case 'list':
        case 'dict':
          try { return JSON.parse(raw || (p.type === 'list' ? '[]' : '{}')) }
          catch { return p.type === 'list' ? [] : {} }
        default: return raw
      }
    })
    execute(argsArray)
  }

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-white">{method.name}</span>
        <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] text-amber-400">
          write
        </span>
        {method.docstring && (
          <span className="text-xs text-neutral-600" title={method.docstring}>ⓘ</span>
        )}
      </div>

      {method.params.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {method.params.map((param) => (
            <div key={param.name} className="flex items-center gap-2">
              <label className="w-24 shrink-0 font-mono text-xs text-neutral-500">
                {param.name}
                <span className="ml-1 text-neutral-700">:{param.type}</span>
              </label>
              <input
                type="text"
                value={args[param.name] ?? ''}
                onChange={(e) => setArgs((a) => ({ ...a, [param.name]: e.target.value }))}
                placeholder={param.type}
                className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 font-mono text-xs text-white placeholder-neutral-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                aria-label={param.name}
              />
            </div>
          ))}
        </div>
      )}

      {!isConnected ? (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2">
          <Wallet size={13} className="shrink-0 text-neutral-500" />
          <span className="font-mono text-xs text-neutral-500">Connect wallet to execute</span>
          <div className="ml-auto scale-90 origin-right">
            <ConnectButton chainStatus="none" />
          </div>
        </div>
      ) : (
        <div className="mb-3 flex justify-end">
          <Button
            variant="danger"
            size="sm"
            loading={loading}
            onClick={handleExecute}
          >
            Execute
          </Button>
        </div>
      )}

      {txHash && (
        <div className="rounded-md bg-neutral-950 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-[11px] text-neutral-600">transaction hash</span>
            <CopyButton value={txHash} label="Tx hash" />
          </div>
          <p className="break-all font-mono text-xs text-amber-400">{txHash}</p>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-md bg-red-500/5 px-3 py-2 font-mono text-xs text-red-400">
          {error}
        </p>
      )}
    </Card>
  )
}

export default function WriteMethods({
  methods,
  contractAddress,
}: {
  methods: ContractMethod[]
  contractAddress: string
}) {
  if (methods.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-neutral-600">
        No write methods found in this contract.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {methods.map((m) => (
        <WriteMethodCard key={m.name} method={m} contractAddress={contractAddress} />
      ))}
    </div>
  )
}
