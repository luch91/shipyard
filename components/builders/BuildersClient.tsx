'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, Trophy, ShieldCheck, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { track } from '@/lib/analytics'
import type { BuilderEntry } from '@/app/api/builders/route'

function shortAddr(addr: string): string {
  return addr.length > 16 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr
}

// Medal accent for the top three ranks; the rest read as plain neutral numerals.
const RANK_ACCENT: Record<number, string> = {
  1: 'text-amber-300 border-amber-400/40 bg-amber-400/[0.08]',
  2: 'text-neutral-200 border-neutral-400/40 bg-neutral-400/[0.08]',
  3: 'text-orange-300 border-orange-400/40 bg-orange-400/[0.08]',
}

export default function BuildersClient() {
  const [builders, setBuilders] = useState<BuilderEntry[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    track('builders_viewed')
  }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/builders')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch')
      setBuilders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
            Leaderboard
          </p>
          <h1 className="flex items-center gap-2 font-mono text-xl font-bold text-white">
            <Trophy size={18} className="text-amber-300" />
            Builders
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ranked by reputation earned from verified contract deployments.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white disabled:opacity-40 focus:outline-none"
          aria-label="Refresh"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[64px] animate-pulse rounded-lg border border-neutral-800 bg-neutral-900"
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
      {!loading && !error && builders.length === 0 && (
        <div className="glass-card flex flex-col items-center gap-3 py-16 text-center">
          <Trophy size={28} className="text-neutral-800" />
          <p className="font-sans font-medium text-neutral-500">No builders ranked yet</p>
          <p className="max-w-sm text-sm text-neutral-700">
            Reputation is earned by verifying a contract you deployed. Verify one to claim
            the top spot.
          </p>
          <Link
            href="/deploy"
            className="mt-2 rounded-full bg-emerald-500 px-5 py-2 font-mono text-xs font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            Deploy a Contract →
          </Link>
        </div>
      )}

      {/* Leaderboard */}
      {!loading && !error && builders.length > 0 && (
        <div className="flex flex-col gap-2">
          {builders.map((b, i) => {
            const rank = i + 1
            return (
              <Link
                key={b.wallet}
                href={`/builders/${b.wallet}`}
                className="group flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900/60 focus:outline-none"
              >
                {/* Rank */}
                <span
                  className={clsx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-bold',
                    RANK_ACCENT[rank] ?? 'border-neutral-800 bg-neutral-800/40 text-neutral-500',
                  )}
                >
                  {rank}
                </span>

                {/* Identity */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-white group-hover:text-emerald-400">
                    {b.displayName || shortAddr(b.wallet)}
                  </p>
                  {b.displayName && (
                    <p className="truncate font-mono text-[11px] text-neutral-600">
                      {shortAddr(b.wallet)}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex shrink-0 items-center gap-4">
                  <div className="flex items-center gap-1 text-neutral-400" title="Verified contracts">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span className="font-mono text-sm tabular-nums">{b.contractsVerified}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold tabular-nums text-white">
                      {b.reputation}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-600">
                      rep
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-neutral-700 transition-colors group-hover:text-neutral-400"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
