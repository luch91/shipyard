'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import { useDeployStore } from '@/hooks/useDeployStore'
import { useDeploy } from '@/hooks/useDeploy'
import { NETWORKS } from '@/lib/genlayer/networks'
import type { DeployLog } from '@/types'
import toast from 'react-hot-toast'

// ─── Log Line ─────────────────────────────────────────────────────────────────

function LogLine({ log }: { log: DeployLog }) {
  const levelColors: Record<DeployLog['level'], string> = {
    info: 'text-neutral-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
    warn: 'text-amber-400',
  }
  const prefixes: Record<DeployLog['level'], string> = {
    info: '›',
    success: '✓',
    error: '✗',
    warn: '⚠',
  }

  return (
    <div className="flex gap-2 font-mono text-xs leading-relaxed">
      <span className={clsx('shrink-0', levelColors[log.level])}>
        {prefixes[log.level]}
      </span>
      <span className={levelColors[log.level]}>{log.message}</span>
    </div>
  )
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyLine({ label, value }: { label: string; value: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied!`)
    } catch {
      toast.error('Copy failed.')
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[11px] text-neutral-500">{label}</p>
        <p className="truncate font-mono text-xs text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md p-1.5 text-neutral-600 hover:bg-neutral-700 hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        aria-label={`Copy ${label}`}
      >
        <Copy size={13} />
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DeployLogs() {
  const { deploy } = useDeployStore()
  const { reset } = useDeploy()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom as logs stream in
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [deploy.logs])

  const isEmpty = deploy.status === 'idle' && deploy.logs.length === 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold text-neutral-300">Deploy Log</h2>
        {!isEmpty && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-neutral-600 hover:text-neutral-400 focus:outline-none"
          >
            clear
          </button>
        )}
      </div>

      {/* Terminal window */}
      <div className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-1.5 border-b border-neutral-800 bg-neutral-900 px-3 py-2">
          <span className="h-3 w-3 rounded-full bg-red-500/60" />
          <span className="h-3 w-3 rounded-full bg-amber-500/60" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
          <span className="ml-2 font-mono text-[11px] text-neutral-600">deploy output</span>
        </div>

        {/* Log stream */}
        <div className="h-64 overflow-y-auto p-3">
          {isEmpty ? (
            <p className="font-mono text-xs text-neutral-700">
              Waiting for deploy command…
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {deploy.logs.map((log) => (
                <LogLine key={log.id} log={log} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Success card */}
      {deploy.status === 'success' && deploy.result && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Deployed successfully</span>
          </div>
          <div className="flex flex-col gap-2">
            {deploy.result.contractAddress && (
              <CopyLine label="Contract Address" value={deploy.result.contractAddress} />
            )}
            <CopyLine label="Transaction Hash" value={deploy.result.transactionHash} />
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {deploy.result.contractAddress && (
              <a
                href={`/interact/${deploy.result.contractAddress}`}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:underline"
              >
                <ExternalLink size={12} />
                Interact with this contract
              </a>
            )}
            {(() => {
              const explorerUrl = NETWORKS[deploy.result.network]?.explorerUrl
              if (!explorerUrl) return null
              return (
                <>
                  {deploy.result.contractAddress && (
                    <a
                      href={`${explorerUrl}/address/${deploy.result.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:underline"
                    >
                      <ExternalLink size={12} />
                      View contract on explorer
                    </a>
                  )}
                  <a
                    href={`${explorerUrl}/tx/${deploy.result.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:underline"
                  >
                    <ExternalLink size={12} />
                    View transaction on explorer
                  </a>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Error card */}
      {deploy.status === 'error' && deploy.error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-start gap-2">
            <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{deploy.error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
