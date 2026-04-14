'use client'

import { useState } from 'react'
import type { ContractMethod } from '@/types'
import { useReadMethod } from '@/hooks/useContract'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CopyButton from '@/components/ui/CopyButton'

function ReadMethodCard({
  method,
  contractAddress,
}: {
  method: ContractMethod
  contractAddress: string
}) {
  const { call, loading, result, error } = useReadMethod(contractAddress, method.name)
  const [args, setArgs] = useState<Record<string, string>>({})

  const handleCall = () => {
    const argsArray = method.params.map((p) => args[p.name] ?? '')
    call(argsArray)
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-white">{method.name}</span>
          {method.returnType && method.returnType !== 'None' && (
            <span className="font-mono text-xs text-emerald-400">→ {method.returnType}</span>
          )}
          {method.docstring && (
            <span className="text-xs text-neutral-600" title={method.docstring}>ⓘ</span>
          )}
        </div>
        <Button variant="ghost" size="sm" loading={loading} onClick={handleCall}>
          Call
        </Button>
      </div>

      {method.params.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
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
                className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 font-mono text-xs text-white placeholder-neutral-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                aria-label={param.name}
              />
            </div>
          ))}
        </div>
      )}

      {result !== null && (
        <div className="mt-3 rounded-md bg-neutral-950 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-[11px] text-neutral-600">result</span>
            <CopyButton value={result} label="Result" />
          </div>
          <pre className="overflow-x-auto font-mono text-xs text-emerald-300">{result}</pre>
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

export default function ReadMethods({
  methods,
  contractAddress,
}: {
  methods: ContractMethod[]
  contractAddress: string
}) {
  if (methods.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-neutral-600">
        No read methods found in this contract.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {methods.map((m) => (
        <ReadMethodCard key={m.name} method={m} contractAddress={contractAddress} />
      ))}
    </div>
  )
}
