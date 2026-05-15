'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Copy, Check, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import NetworkBadge from '@/components/ui/NetworkBadge'
import type { NetworkId } from '@/types'
import type { ContractEntry } from '@/app/api/registry/route'

const TABS: { id: NetworkId; label: string }[] = [
  { id: 'testnet-bradbury', label: 'Bradbury' },
  { id: 'testnet-asimov',   label: 'Asimov' },
  { id: 'studionet',        label: 'Studionet' },
]

export default function RegistryClient() {
  const [network, setNetwork]     = useState<NetworkId>('testnet-bradbury')
  const [contracts, setContracts] = useState<ContractEntry[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [copied, setCopied]       = useState<string | null>(null)

  const load = async (net: NetworkId) => {
    setLoading(true)
    setError(null)
    setContracts([])
    try {
      const res  = await fetch(`/api/registry?network=${net}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch')
      setContracts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(network) }, [network])

  const copy = (addr: string) => {
    navigator.clipboard.writeText(addr)
    setCopied(addr)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-bold text-white">Contract Registry</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Intelligent Contracts deployed on GenLayer networks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(network)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white disabled:opacity-40 focus:outline-none"
          aria-label="Refresh"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Network tabs */}
      <div className="mb-6 flex gap-1 border-b border-neutral-800 pb-0">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setNetwork(id)}
            className={clsx(
              '-mb-px rounded-t-md px-3 py-1.5 font-mono text-sm font-medium transition-colors focus:outline-none',
              network === id
                ? 'border border-b-neutral-950 border-neutral-800 bg-neutral-900 text-white'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-lg border border-neutral-800 bg-neutral-900"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="font-mono text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && contracts.length === 0 && (
        <p className="text-sm text-neutral-600">No Intelligent Contracts found on this network.</p>
      )}

      {/* List */}
      {!loading && !error && contracts.length > 0 && (
        <div className="flex flex-col gap-2">
          {contracts.map((c) => (
            <div
              key={c.address}
              className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                {/* Address + copy */}
                <button
                  type="button"
                  onClick={() => copy(c.address)}
                  className="group flex items-center gap-1.5 focus:outline-none"
                  aria-label="Copy address"
                >
                  <span className="truncate font-mono text-sm text-white group-hover:text-emerald-400">
                    {c.address}
                  </span>
                  {copied === c.address ? (
                    <Check size={12} className="shrink-0 text-emerald-400" />
                  ) : (
                    <Copy size={12} className="shrink-0 text-neutral-600 group-hover:text-neutral-400" />
                  )}
                </button>

                {/* Method chips */}
                {c.methods.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.methods.slice(0, 6).map((m) => (
                      <span
                        key={m}
                        className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-neutral-500"
                      >
                        {m}
                      </span>
                    ))}
                    {c.methods.length > 6 && (
                      <span className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-neutral-600">
                        +{c.methods.length - 6}
                      </span>
                    )}
                  </div>
                )}

                <p className="mt-1.5 font-mono text-[11px] text-neutral-700">
                  block {c.blockNumber.toLocaleString()}
                </p>
              </div>

              {/* Right: badge + interact */}
              <div className="flex shrink-0 items-center gap-2">
                <NetworkBadge networkId={c.network as NetworkId} size="sm" />
                <Link
                  href={`/interact/${c.address}?network=${c.network}`}
                  className="flex items-center gap-1 rounded-md border border-neutral-700 px-2.5 py-1.5 font-mono text-xs font-medium text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white focus:outline-none"
                >
                  Interact
                  <ExternalLink size={10} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
