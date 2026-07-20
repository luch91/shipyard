'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ShieldCheck, Copy, Check, ExternalLink, Trophy } from 'lucide-react'
import NetworkBadge from '@/components/ui/NetworkBadge'
import type { NetworkId } from '@/types'
import type { BuilderProfileResponse } from '@/app/api/builders/[wallet]/route'

function shortAddr(addr: string): string {
  return addr.length > 16 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3">
      <span className="font-mono text-lg font-bold tabular-nums text-white">{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-600">
        {label}
      </span>
    </div>
  )
}

export default function BuilderProfile() {
  const params = useParams<{ wallet: string }>()
  const wallet = typeof params.wallet === 'string' ? params.wallet : ''

  const [profile, setProfile] = useState<BuilderProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    if (!wallet) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res  = await fetch(`/api/builders/${wallet}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to fetch')
        if (!cancelled) setProfile(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [wallet])

  const copy = () => {
    if (!profile) return
    navigator.clipboard.writeText(profile.wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/builders"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-neutral-500 transition-colors hover:text-neutral-300"
      >
        <ArrowLeft size={13} />
        Builders
      </Link>

      {loading && (
        <div className="flex flex-col gap-4">
          <div className="h-24 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900" />
          <div className="h-40 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="font-mono text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && profile && (
        <>
          {/* Identity + reputation */}
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {profile.displayName && (
                <h1 className="mb-0.5 font-sans text-xl font-bold text-white">
                  {profile.displayName}
                </h1>
              )}
              <button
                type="button"
                onClick={copy}
                className="group flex items-center gap-1.5 focus:outline-none"
                aria-label="Copy wallet address"
              >
                <span className="font-mono text-sm text-neutral-400 group-hover:text-white">
                  {shortAddr(profile.wallet)}
                </span>
                {copied ? (
                  <Check size={12} className="text-emerald-400" />
                ) : (
                  <Copy size={12} className="text-neutral-600 group-hover:text-neutral-400" />
                )}
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/[0.08] px-4 py-2">
              <Trophy size={16} className="text-amber-300" />
              <span className="font-mono text-2xl font-bold tabular-nums text-white">
                {profile.reputation}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-amber-300/80">
                reputation
              </span>
            </div>
          </div>

          {/* Stat grid */}
          <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Verified" value={profile.contractsVerified} />
            <Stat label="Deployed" value={profile.contractsDeployed} />
            <Stat label="Forks received" value={profile.forksReceived} />
            <Stat label="Forks made" value={profile.forksMade} />
          </div>

          {/* Contracts */}
          <h2 className="mb-3 font-mono text-sm font-semibold text-neutral-300">
            Verified contracts
          </h2>
          {profile.contracts.length === 0 ? (
            <p className="text-sm text-neutral-600">No attributed contracts yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {profile.contracts.map((c) => (
                <div
                  key={`${c.address}-${c.network}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-mono text-sm text-white">{c.address}</span>
                    {c.verified && (
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/[0.08] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400"
                        title="Source matches on-chain"
                      >
                        <ShieldCheck size={10} />
                        Verified
                      </span>
                    )}
                  </div>
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
        </>
      )}
    </div>
  )
}
