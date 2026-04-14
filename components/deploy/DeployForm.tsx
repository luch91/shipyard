'use client'

import { useState } from 'react'
import { Eye, EyeOff, Rocket } from 'lucide-react'
import clsx from 'clsx'
import { useDeployStore } from '@/hooks/useDeployStore'
import { useDeploy } from '@/hooks/useDeploy'
import type { ContractParam } from '@/types'

// ─── Param Input ──────────────────────────────────────────────────────────────

function ParamInput({ param, value, onChange }: {
  param: ContractParam
  value: string
  onChange: (v: string) => void
}) {
  const inputClass =
    'w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 font-mono text-sm text-white placeholder-neutral-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40'

  if (param.type === 'bool') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        aria-label={param.name}
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    )
  }

  if (param.type === 'int' || param.type === 'float') {
    return (
      <input
        type="number"
        step={param.type === 'float' ? 'any' : '1'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={param.defaultValue ?? `Enter ${param.type}…`}
        className={inputClass}
        aria-label={param.name}
      />
    )
  }

  if (param.type === 'list' || param.type === 'dict') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={param.type === 'list' ? '["item1", "item2"]' : '{"key": "value"}'}
        rows={2}
        className={clsx(inputClass, 'resize-none')}
        aria-label={param.name}
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={param.defaultValue ?? `Enter ${param.name}…`}
      className={inputClass}
      aria-label={param.name}
    />
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function DeployForm() {
  const { parsedContract, constructorArgs, setConstructorArg } = useDeployStore()
  const { canDeploy, run, deploy } = useDeploy()

  // Private key is local state only — never goes to Zustand
  const [privateKey, setPrivateKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const isDeploying = deploy.status === 'deploying' || deploy.status === 'validating'

  const handleDeploy = async () => {
    if (!privateKey.trim()) return
    await run(privateKey)
  }

  if (!parsedContract) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="font-mono text-sm font-semibold text-neutral-300">3. Configure & Deploy</h2>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-8 text-center">
          <p className="text-sm text-neutral-600">
            Upload a valid contract to see constructor parameters.
          </p>
        </div>
      </div>
    )
  }

  const { constructorParams } = parsedContract

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-mono text-sm font-semibold text-neutral-300">3. Configure & Deploy</h2>

      {/* Constructor params */}
      {constructorParams.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-neutral-500">Constructor parameters</p>
          {constructorParams.map((param) => (
            <div key={param.name} className="flex flex-col gap-1">
              <label className="font-mono text-xs text-neutral-400">
                {param.name}
                <span className="ml-1.5 text-neutral-600">: {param.type}</span>
                {param.required && (
                  <span className="ml-1 text-red-500" aria-label="required">*</span>
                )}
              </label>
              <ParamInput
                param={param}
                value={constructorArgs[param.name] ?? ''}
                onChange={(v) => setConstructorArg(param.name, v)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Private key */}
      <div className="flex flex-col gap-1">
        <label className="font-mono text-xs text-neutral-400">
          Private key <span className="text-neutral-600">(never stored)</span>
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="0x…"
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 pr-10 font-mono text-sm text-white placeholder-neutral-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            aria-label="Private key for signing the deploy transaction"
          />
          <button
            type="button"
            onClick={() => setShowKey((p) => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 focus:outline-none"
            aria-label={showKey ? 'Hide private key' : 'Show private key'}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-[11px] text-neutral-600">
          Use a throwaway testnet key. Never use a mainnet private key.
        </p>
      </div>

      {/* Deploy button */}
      <button
        type="button"
        onClick={handleDeploy}
        disabled={!canDeploy || !privateKey.trim() || isDeploying}
        className={clsx(
          'flex items-center justify-center gap-2 rounded-md px-4 py-3 font-mono text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
          canDeploy && privateKey.trim() && !isDeploying
            ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
            : 'cursor-not-allowed bg-neutral-800 text-neutral-600'
        )}
      >
        {isDeploying ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-600 border-t-emerald-400" />
            Deploying…
          </>
        ) : (
          <>
            <Rocket size={15} />
            Deploy Contract
          </>
        )}
      </button>
    </div>
  )
}
