'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ShieldAlert, RefreshCw } from 'lucide-react'
import { useSiweAuth } from '@/hooks/useSiweAuth'
import CopyButton from '@/components/ui/CopyButton'

interface Rollup {
  date:               string
  active_wallets:     number | null
  deploys_total:      number | null
  deploys_by_network: Record<string, number> | null
  top_templates:      { template_id: string; count: number }[] | null
  ai_generations:     number | null
  ai_success_rate:    number | null
  forks_total:        number | null
  registry_views:     number | null
  sdk_calls:          number | null
}

interface EventRow {
  event_name:       string
  wallet_hash:      string | null
  network:          string | null
  template_id:      string | null
  contract_address: string | null
  created_at:       string
}

type Gate = 'loading' | 'disconnected' | 'signin' | 'forbidden' | 'admin' | 'error'

const num = (n: number | null | undefined) => (n ?? 0).toLocaleString()
const time = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function AdminAnalyticsPage() {
  const { isConnected } = useAccount()
  const { status, authenticated, sessionAddress, signIn, signOut, error } = useSiweAuth()

  const [gate, setGate]         = useState<Gate>('loading')
  const [rollups, setRollups]   = useState<Rollup[]>([])
  const [events, setEvents]     = useState<EventRow[]>([])
  const [configured, setConfig] = useState(true)
  const [loadingData, setLoad]  = useState(false)

  const load = useCallback(async () => {
    setLoad(true)
    try {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
      if (res.status === 401) { setGate('signin'); return }
      if (res.status === 403) { setGate('forbidden'); return }
      if (!res.ok)            { setGate('error'); return }
      const data = await res.json()
      setRollups(data.rollups ?? [])
      setEvents(data.events ?? [])
      setConfig(data.configured !== false)
      setGate('admin')
    } catch {
      setGate('error')
    } finally {
      setLoad(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'loading') { setGate('loading'); return }
    if (!isConnected)         { setGate('disconnected'); return }
    if (!authenticated)       { setGate('signin'); return }
    load()
  }, [status, isConnected, authenticated, load])

  const latest = rollups[0]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[Syne] text-xl font-bold text-white">Analytics</h1>
          <p className="font-mono text-xs text-neutral-500">Admin only · first-party metrics</p>
        </div>
        {gate === 'admin' && (
          <button
            type="button"
            onClick={load}
            disabled={loadingData}
            className="flex items-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-1.5 font-mono text-xs text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-neutral-200 disabled:opacity-50"
          >
            <RefreshCw size={12} className={loadingData ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>

      {/* ── Gate states ─────────────────────────────────────────────────────── */}
      {gate === 'loading' && (
        <p className="font-mono text-sm text-neutral-500">Checking access…</p>
      )}

      {gate === 'disconnected' && (
        <GateCard title="Connect your wallet" body="Connect the wallet that has admin access to view analytics.">
          <ConnectButton chainStatus="none" />
        </GateCard>
      )}

      {gate === 'signin' && (
        <GateCard title="Sign in to continue" body="Prove ownership of your wallet to access the admin dashboard.">
          <button
            type="button"
            onClick={signIn}
            className="rounded-md bg-emerald-500 px-4 py-2 font-mono text-xs font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            Sign in with wallet
          </button>
          {error && <span className="font-mono text-[10px] text-red-400">{error}</span>}
        </GateCard>
      )}

      {gate === 'forbidden' && (
        <GateCard
          title="Not authorized"
          body="Your wallet is signed in but is not on the admin allowlist. To grant access, add the address below to the ADMIN_WALLETS environment variable (comma-separated), then restart/redeploy."
          icon
        >
          <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-black/30 px-3 py-2">
            <code className="font-mono text-xs text-emerald-400 break-all">{sessionAddress}</code>
            {sessionAddress && <CopyButton value={sessionAddress} label="Address" />}
          </div>
          <button
            type="button"
            onClick={signOut}
            className="font-mono text-[11px] text-neutral-500 underline-offset-2 hover:text-neutral-300 hover:underline"
          >
            Sign out
          </button>
        </GateCard>
      )}

      {gate === 'error' && (
        <GateCard title="Something went wrong" body="Could not load analytics. Try refreshing.">
          <button
            type="button"
            onClick={load}
            className="rounded-md border border-white/[0.08] px-4 py-2 font-mono text-xs text-neutral-300 hover:bg-white/[0.04]"
          >
            Retry
          </button>
        </GateCard>
      )}

      {/* ── Admin dashboard ─────────────────────────────────────────────────── */}
      {gate === 'admin' && (
        <div className="space-y-8">
          {!configured && (
            <p className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 font-mono text-xs text-amber-400">
              Supabase is not configured — no data to show.
            </p>
          )}

          {/* Latest-day summary */}
          <section>
            <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              {latest ? `Latest rollup · ${latest.date}` : 'No rollups yet'}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Active wallets" value={num(latest?.active_wallets)} />
              <Stat label="Deploys" value={num(latest?.deploys_total)} />
              <Stat label="AI gens" value={num(latest?.ai_generations)} />
              <Stat label="AI success" value={latest?.ai_success_rate != null ? `${latest.ai_success_rate}%` : '—'} />
              <Stat label="Forks" value={num(latest?.forks_total)} />
              <Stat label="Registry views" value={num(latest?.registry_views)} />
            </div>
            {!latest && (
              <p className="mt-2 font-mono text-xs text-neutral-600">
                Daily rollups are written once a day by the cron job. Live activity is in the events feed below.
              </p>
            )}
          </section>

          {/* Daily history */}
          {rollups.length > 0 && (
            <section>
              <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                Daily history (last {rollups.length})
              </h2>
              <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
                <table className="w-full font-mono text-xs">
                  <thead className="text-neutral-500">
                    <tr className="border-b border-white/[0.06] text-left">
                      <Th>Date</Th><Th>Wallets</Th><Th>Deploys</Th><Th>AI gens</Th><Th>AI %</Th><Th>Forks</Th><Th>Views</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rollups.map((r) => (
                      <tr key={r.date} className="border-b border-white/[0.04] last:border-0">
                        <Td className="text-neutral-300">{r.date}</Td>
                        <Td>{num(r.active_wallets)}</Td>
                        <Td>{num(r.deploys_total)}</Td>
                        <Td>{num(r.ai_generations)}</Td>
                        <Td>{r.ai_success_rate != null ? `${r.ai_success_rate}%` : '—'}</Td>
                        <Td>{num(r.forks_total)}</Td>
                        <Td>{num(r.registry_views)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Live events */}
          <section>
            <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              Recent events (live · last {events.length})
            </h2>
            {events.length === 0 ? (
              <p className="font-mono text-xs text-neutral-600">No events recorded yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
                <table className="w-full font-mono text-xs">
                  <thead className="text-neutral-500">
                    <tr className="border-b border-white/[0.06] text-left">
                      <Th>Time</Th><Th>Event</Th><Th>Network</Th><Th>Template</Th><Th>Wallet</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e, i) => (
                      <tr key={`${e.created_at}-${i}`} className="border-b border-white/[0.04] last:border-0">
                        <Td className="whitespace-nowrap text-neutral-500">{time(e.created_at)}</Td>
                        <Td className="text-emerald-400">{e.event_name}</Td>
                        <Td>{e.network ?? '—'}</Td>
                        <Td>{e.template_id ?? '—'}</Td>
                        <Td className="text-neutral-600">{e.wallet_hash ? `${e.wallet_hash.slice(0, 10)}…` : '—'}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

// ── Small presentational helpers ──────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-600">{label}</div>
      <div className="mt-1 font-[Syne] text-xl font-bold text-white">{value}</div>
    </div>
  )
}

function GateCard({
  title, body, children, icon,
}: {
  title: string
  body: string
  children: React.ReactNode
  icon?: boolean
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
      {icon && <ShieldAlert size={22} className="mx-auto mb-3 text-amber-400" />}
      <h2 className="font-[Syne] text-lg font-bold text-white">{title}</h2>
      <p className="mx-auto mb-4 mt-1.5 max-w-sm font-mono text-xs leading-relaxed text-neutral-500">{body}</p>
      <div className="flex flex-col items-center gap-2">{children}</div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-medium">{children}</th>
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 text-neutral-400 ${className}`}>{children}</td>
}
