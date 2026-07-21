'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Rocket, ShieldCheck, GitFork, Activity } from 'lucide-react'
import NetworkBadge from '@/components/ui/NetworkBadge'
import { NETWORKS } from '@/lib/genlayer/networks'
import { timeAgo } from '@/lib/activity/timeAgo'
import type { ActivityItem, ActivityKind } from '@/lib/activity/feed'
import type { NetworkId } from '@/types'

function shortAddr(addr: string): string {
  return addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

const KIND: Record<ActivityKind, { label: string; Icon: typeof Rocket; className: string }> = {
  deployed: { label: 'deployed',  Icon: Rocket,      className: 'text-emerald-400' },
  verified: { label: 'verified',  Icon: ShieldCheck, className: 'text-sky-400' },
  forked:   { label: 'forked',    Icon: GitFork,     className: 'text-violet-400' },
}

const isKnownNetwork = (n: string): n is NetworkId => n in NETWORKS

export default function ActivityFeed() {
  const [items, setItems]     = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed]   = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res  = await fetch('/api/activity')
        const data = await res.json()
        if (!active) return
        setItems(Array.isArray(data.items) ? data.items : [])
      } catch {
        if (active) setFailed(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  // The feed is a supporting panel, not the point of the page — if it has nothing
  // to show or the fetch failed, it stays out of the way rather than showing an error.
  if (failed || (!loading && items.length === 0)) return null

  return (
    <section className="mt-10">
      <h2 className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        <Activity size={12} className="text-emerald-400" />
        Recent activity
      </h2>

      {loading ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[42px] animate-pulse rounded-lg border border-neutral-800 bg-neutral-900" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => {
            const { label, Icon, className } = KIND[item.kind]
            return (
              <li key={`${item.kind}:${item.address}`}>
                <Link
                  href={`/interact/${item.address}`}
                  className="group flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 transition-colors hover:border-neutral-700 focus:outline-none"
                >
                  <Icon size={13} className={`shrink-0 ${className}`} />

                  <p className="min-w-0 flex-1 truncate font-mono text-[13px] text-neutral-300">
                    <span className="text-white group-hover:text-emerald-400">
                      {item.contractName || shortAddr(item.address)}
                    </span>
                    <span className="text-neutral-500"> {label}</span>
                    {item.builder && (
                      <span className="text-neutral-600"> by {shortAddr(item.builder)}</span>
                    )}
                  </p>

                  {isKnownNetwork(item.network) && (
                    <span className="hidden shrink-0 sm:inline">
                      <NetworkBadge networkId={item.network} size="sm" />
                    </span>
                  )}

                  <time
                    dateTime={item.at}
                    className="shrink-0 font-mono text-[11px] tabular-nums text-neutral-600"
                  >
                    {timeAgo(item.at)}
                  </time>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
