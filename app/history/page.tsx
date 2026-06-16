'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Clock, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import NetworkBadge from '@/components/ui/NetworkBadge'
import type { DeploymentRecord, NetworkId } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`
}

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copied`)
  } catch {
    toast.error('Copy failed')
  }
}

// ── Deployment card ───────────────────────────────────────────────────────────

function DeploymentCard({ deployment }: { deployment: DeploymentRecord }) {
  const params    = deployment.constructorParams
  const hasParams = params && Object.keys(params).length > 0
  const networkId = deployment.network as NetworkId

  return (
    <div className="glass-card group flex flex-col overflow-hidden">
      {/* Top — clickable link to interact */}
      <Link
        href={`/interact/${deployment.address}?network=${deployment.network}&from=history`}
        className="flex items-start justify-between gap-4 p-4
                   hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-sans font-semibold text-white text-sm
                             group-hover:text-emerald-400 transition-colors">
              {deployment.contractName}
            </span>
            <NetworkBadge networkId={networkId} size="sm" />
          </div>
          <span className="font-mono text-[11px] text-neutral-600">
            {shortAddr(deployment.address)}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="font-mono text-[10px] text-neutral-700">
            {timeAgo(deployment.deployedAt)}
          </span>
          <ExternalLink
            size={11}
            className="text-neutral-700 group-hover:text-emerald-400 transition-colors"
          />
        </div>
      </Link>

      {/* Detail rows */}
      {(deployment.txHash || hasParams) && (
        <div className="border-t border-white/[0.04] px-4 py-3 flex flex-col gap-2">
          {deployment.txHash && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-neutral-700 w-14 shrink-0 uppercase tracking-[0.1em]">
                Tx Hash
              </span>
              <span className="font-mono text-[10px] text-neutral-500 flex-1 truncate">
                {shortAddr(deployment.txHash)}
              </span>
              <button
                type="button"
                onClick={() => copy(deployment.txHash!, 'Tx hash')}
                className="shrink-0 text-neutral-700 hover:text-neutral-400 transition-colors focus:outline-none"
              >
                <Copy size={11} />
              </button>
            </div>
          )}

          {hasParams && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(params!).slice(0, 4).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-md border border-white/[0.05] bg-white/[0.02]
                             px-2 py-0.5 font-mono text-[9px] text-neutral-600"
                  title={`${k}: ${String(v)}`}
                >
                  {k}: {String(v).slice(0, 16)}{String(v).length > 16 ? '…' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    try {
      const raw   = localStorage.getItem('gendeploy:deployments')
      const local = raw ? JSON.parse(raw) : []
      setDeployments(local)
    } catch {
      setDeployments([])
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-emerald-400 mb-2">
          History
        </p>
        <h1 className="font-sans text-2xl font-bold text-white mb-1">
          Deployment History
        </h1>
        <p className="text-sm text-neutral-500">
          {deployments.length > 0
            ? `${deployments.length} contract${deployments.length !== 1 ? 's' : ''} deployed this session`
            : 'Your deployed contracts will appear here'}
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="h-5 w-5 animate-spin rounded-full border-2
                           border-neutral-700 border-t-emerald-500" />
        </div>
      )}

      {!loading && deployments.length === 0 && (
        <div className="glass-card flex flex-col items-center gap-3 py-16 text-center">
          <Clock size={28} className="text-neutral-800" />
          <p className="font-sans font-medium text-neutral-500">No deployments yet</p>
          <p className="text-sm text-neutral-700">
            Deploy a contract and it will appear here.
          </p>
          <Link
            href="/deploy"
            className="mt-2 rounded-full bg-emerald-500 px-5 py-2 font-mono
                       text-xs font-semibold text-neutral-950 hover:bg-emerald-400
                       transition-colors"
          >
            Deploy a Contract →
          </Link>
        </div>
      )}

      {!loading && deployments.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {deployments.map((d, i) => (
            <DeploymentCard key={`${d.address}-${i}`} deployment={d} />
          ))}
        </div>
      )}
    </div>
  )
}
