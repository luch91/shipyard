'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ShieldAlert, RefreshCw, Rocket, Sparkles, Users, Eye, GitFork,
  Activity, AlertTriangle, Search, X, ChevronRight, Lock, LogOut,
} from 'lucide-react'
import CopyButton from '@/components/ui/CopyButton'

// ── The Bridge · admin control room ───────────────────────────────────────────
// A cream Bauhaus console. Color IS meaning: blue = Reach (adoption/traffic),
// green = Build (creation/success), red = Friction (failures). Every family also
// carries an icon + label, so identity never rests on color alone. Palette
// validated (dataviz): #0000FF / #FF0000 / #00A000 on cream all pass lightness,
// chroma, contrast (>=3:1) and CVD separation; vivid #00FF00 is used only for
// glow/fills behind a darker edge, never as text/thin marks.

// ── Palette ───────────────────────────────────────────────────────────────────
const CREAM   = '#f6f4ec'
const CARD    = '#fffdf8'
const INK      = '#141414'
const INK2     = '#5f5d54'
const INK3     = '#8f8c80'
const LINE      = '#e5e0d1'
const BLUE      = '#0000FF' // Reach
const GREEN     = '#00A000' // Build (legible mark)
const GREENGLOW = '#00FF00' // Build (fills/glow only)
const RED       = '#FF0000' // Friction

type Family = 'reach' | 'build' | 'friction'
const FAMILY: Record<Family, { mark: string; label: string }> = {
  reach:    { mark: BLUE,  label: 'Reach' },
  build:    { mark: GREEN, label: 'Build' },
  friction: { mark: RED,   label: 'Friction' },
}

// Every real track() event mapped to a family (grounded in the codebase's events).
const EVENT_FAMILY: Record<string, Family> = {
  deployment_succeeded: 'build', deployment_started: 'build', contract_loaded: 'build',
  contract_forked: 'build', contract_verified: 'build', template_selected: 'build',
  studionet_test_started: 'build', studionet_test_succeeded: 'build', write_method_executed: 'build',
  deployment_failed: 'friction', studionet_test_failed: 'friction',
  page_viewed: 'reach', network_selected: 'reach', registry_viewed: 'reach',
  read_method_called: 'reach', faucet_claimed: 'reach', source_link_shared: 'reach',
  sdk_call: 'reach', contract_cleared: 'reach',
}
const famOf = (ev: string): Family => EVENT_FAMILY[ev] ?? 'reach'

// ── Types (match /api/admin/analytics) ────────────────────────────────────────
interface Rollup {
  date: string
  active_wallets: number | null
  deploys_total: number | null
  deploys_by_network: Record<string, number> | null
  top_contracts?: { name: string; count: number }[] | null
  ai_generations: number | null
  ai_success_rate: number | null
  forks_total: number | null
  registry_views: number | null
  sdk_calls: number | null
  // Funnel stages (present on the event-derived series; absent on cron rollups).
  loaded?: number | null
  started?: number | null
  succeeded?: number | null
  failed?: number | null
  failed_by_network?: Record<string, number> | null
  verified?: number | null
  data_source?: 'events' | 'rollup'
}
interface EventRow {
  event_name: string
  wallet_hash: string | null
  network: string | null
  template_id: string | null
  contract_address: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
type Gate = 'loading' | 'login' | 'admin' | 'error'

// ── Metric catalogue (drives KPI tiles + hero chart) ──────────────────────────
type MetricKey = 'deploys_total' | 'ai_generations' | 'active_wallets' | 'registry_views' | 'forks_total'
const METRICS: {
  key: MetricKey; label: string; family: Family; mode: 'sum' | 'latest'; icon: typeof Rocket
}[] = [
  { key: 'deploys_total',  label: 'Deploys',        family: 'build', mode: 'sum',    icon: Rocket },
  { key: 'ai_generations', label: 'AI generations', family: 'build', mode: 'sum',    icon: Sparkles },
  { key: 'active_wallets', label: 'Daily active wallets', family: 'reach', mode: 'latest', icon: Users },
  { key: 'registry_views', label: 'Registry views',  family: 'reach', mode: 'sum',    icon: Eye },
  { key: 'forks_total',    label: 'Forks',           family: 'build', mode: 'sum',    icon: GitFork },
]

const RANGES: { label: string; days: number }[] = [
  { label: '7D', days: 7 }, { label: '30D', days: 30 }, { label: 'All', days: 9999 },
]

// Network filter chips (dashboard) — a fixed list so you can always filter by a
// network even at zero deploys. Testnet Clarke is upcoming: shown as a disabled
// "soon" chip (localnet is intentionally not surfaced here).
const NETWORK_CHIPS: { id: string; label: string; soon?: boolean }[] = [
  { id: 'testnet-bradbury', label: 'bradbury' },
  { id: 'testnet-asimov',   label: 'asimov' },
  { id: 'studionet',        label: 'studionet' },
  { id: 'testnet-clarke',   label: 'clarke', soon: true },
]

// Per-network identity colors (matching the main app: green/yellow/purple/blue),
// picked cream-legible. Used across the network chips, the deploys-by-network
// bars, and the usage chart so a network reads the same everywhere.
const NET_COLOR: Record<string, string> = {
  'testnet-bradbury': '#00A000', // green
  'testnet-asimov':   '#D97706', // amber / yellow
  'studionet':        '#7C3AED', // purple
  'testnet-clarke':   '#0000FF', // blue
}
const netColor = (id: string) => NET_COLOR[id] ?? INK3

// ── Helpers ───────────────────────────────────────────────────────────────────
const n0 = (n: number | null | undefined) => (n ?? 0)
const fmt = (n: number) => n.toLocaleString()
const time = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const shortDate = (d: string) => {
  const [, m, day] = d.split('-')
  return `${m}/${day}`
}

// Measure a container's pixel width so SVG charts render crisp (no viewBox distortion).
function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}

export default function BridgePage() {
  const [gate, setGate]         = useState<Gate>('loading')
  const [pw, setPw]             = useState('')
  const [authErr, setAuthErr]   = useState<string | null>(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [rollups, setRollups]   = useState<Rollup[]>([])
  const [events, setEvents]     = useState<EventRow[]>([])
  const [configured, setConfig] = useState(true)
  const [loadingData, setLoad]  = useState(false)
  const [dataWarnings, setDataWarnings] = useState<string[]>([])

  // Controls (cross-filter state)
  const [rangeDays, setRangeDays]     = useState(30)
  const [network, setNetwork]         = useState<string | null>(null)
  const [focus, setFocus]             = useState<MetricKey>('deploys_total')
  const [feedFam, setFeedFam]         = useState<Family | null>(null)
  const [query, setQuery]             = useState('')
  const [live, setLive]               = useState(true)
  const [drawer, setDrawer]           = useState<EventRow | null>(null)
  const [walletHash, setWalletHash]   = useState<string | null>(null)
  const [eventType, setEventType]     = useState<string | null>(null)
  const [lastLoaded, setLastLoaded]   = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoad(true)
    try {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
      if (res.status === 401 || res.status === 403) { setGate('login'); return }
      if (!res.ok)            { setGate('error'); return }
      const data = await res.json()
      // Prefer the event-derived series (always reflects real activity); fall back
      // to the cron's daily rollups only if the series is empty.
      setRollups(data.series?.length ? data.series : (data.rollups ?? []))
      setEvents(data.events ?? [])
      setConfig(data.configured !== false)
      setDataWarnings(Array.isArray(data.dataWarnings) ? data.dataWarnings : [])
      setLastLoaded(Date.now())
      setGate('admin')
    } catch {
      setGate('error')
    } finally {
      setLoad(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthBusy(true)
    setAuthErr(null)
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        setAuthErr(d.error ?? 'Login failed.')
        return
      }
      setPw('')
      await load()
    } catch {
      setAuthErr('Login failed. Check your connection.')
    } finally {
      setAuthBusy(false)
    }
  }

  async function logout() {
    try { await fetch('/api/admin/logout', { method: 'POST' }) } catch { /* ignore */ }
    setGate('login')
  }

  // Live polling for the event feed (respects the Live/Pause toggle).
  useEffect(() => {
    if (gate !== 'admin' || !live) return
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [gate, live, load])

  // Resolve a searched wallet ADDRESS to its stored hash (server-side — the salt
  // isn't available to the client, so raw-address search can't match locally).
  useEffect(() => {
    const q = query.trim()
    if (!/^0x[0-9a-fA-F]{40}$/.test(q)) { setWalletHash(null); return }
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/analytics?wallet=${q}`)
        const d = await r.json()
        if (!cancelled) setWalletHash(typeof d.walletHash === 'string' ? d.walletHash : null)
      } catch {
        if (!cancelled) setWalletHash(null)
      }
    }, 300)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query])

  // ── Derived data ─────────────────────────────────────────────────────────────
  // Rollups arrive newest-first; chronological (oldest→newest) for charts.
  const chrono = useMemo(() => [...rollups].reverse(), [rollups])
  const windowed = useMemo(
    () => (rangeDays >= 9999 ? chrono : chrono.slice(Math.max(0, chrono.length - rangeDays))),
    [chrono, rangeDays],
  )
  const prevWindow = useMemo(() => {
    if (rangeDays >= 9999) return []
    const end = Math.max(0, chrono.length - rangeDays)
    return chrono.slice(Math.max(0, end - rangeDays), end)
  }, [chrono, rangeDays])

  // Value of a metric for one rollup (deploys respect the network cross-filter).
  const valueOf = useCallback((r: Rollup, key: MetricKey): number => {
    if (key === 'deploys_total' && network) return n0(r.deploys_by_network?.[network])
    return n0(r[key])
  }, [network])

  const windowStat = useCallback((key: MetricKey, mode: 'sum' | 'latest', win: Rollup[]): number => {
    if (win.length === 0) return 0
    if (mode === 'latest') return valueOf(win[win.length - 1], key)
    return win.reduce((s, r) => s + valueOf(r, key), 0)
  }, [valueOf])

  // Network totals over the window (for the breakdown bars + network chips).
  const networkTotals = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const r of windowed) {
      for (const [net, c] of Object.entries(r.deploys_by_network ?? {})) acc[net] = (acc[net] ?? 0) + c
    }
    return Object.entries(acc).sort((a, b) => b[1] - a[1])
  }, [windowed])

  const networkDeployMap = useMemo(() => Object.fromEntries(networkTotals), [networkTotals])

  // Contract rankings, failures, and activity stages require raw events. Stored
  // daily rollups remain valid for KPI history but do not carry these details.
  const eventBackedWindow = useMemo(
    () => windowed.filter((r) => r.data_source === 'events'),
    [windowed],
  )

  // Top contracts (most deployed) over the window — templates, custom, and CLI.
  const contractTotals = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const r of eventBackedWindow) {
      for (const c of r.top_contracts ?? []) acc[c.name] = (acc[c.name] ?? 0) + c.count
    }
    return Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [eventBackedWindow])

  // Events after cross-filters (network + family + template + search). "Recent"
  // reflects the last N events the API returns — labelled as such, never as all-time.
  const feedEvents = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((e) => {
      if (network && e.network !== network) return false
      if (feedFam && famOf(e.event_name) !== feedFam) return false
      if (eventType && e.event_name !== eventType) return false
      if (q) {
        // An address query matches by resolved wallet hash OR by any raw text field
        // (contract address, event, network, template, hash prefix).
        const hashMatch = walletHash !== null && e.wallet_hash === walletHash
        const hay = `${e.event_name} ${e.wallet_hash ?? ''} ${e.contract_address ?? ''} ${e.template_id ?? ''} ${JSON.stringify(e.metadata ?? {})}`.toLowerCase()
        if (!hashMatch && !hay.includes(q)) return false
      }
      return true
    })
  }, [events, network, feedFam, eventType, query, walletHash])

  const eventTypes = useMemo(() => [...new Set(events.map((e) => e.event_name))].sort(), [events])

  // Independent activity-stage totals from recent raw events. These are not a
  // cohort funnel: a load, deployment, and verification may belong to different
  // contracts or sessions, so no conversion percentage is implied.
  const funnel = useMemo(() => {
    const sum = (k: 'loaded' | 'started' | 'succeeded' | 'failed' | 'verified') =>
      eventBackedWindow.reduce((s, r) => s + n0(r[k]), 0)
    return [
      { label: 'Loaded',         value: sum('loaded'),    fam: 'build' as Family },
      { label: 'Deploy started', value: sum('started'),   fam: 'build' as Family },
      { label: 'Deployed',       value: sum('succeeded'), fam: 'build' as Family, failed: sum('failed') },
      { label: 'Verified',       value: sum('verified'),  fam: 'build' as Family },
    ]
  }, [eventBackedWindow])

  const rangeFails = useMemo(
    () => eventBackedWindow.reduce(
      (s, r) => s + (network ? n0(r.failed_by_network?.[network]) : n0(r.failed)),
      0,
    ),
    [eventBackedWindow, network],
  )

  const latest = windowed[windowed.length - 1]
  const focusMeta = METRICS.find((m) => m.key === focus)!

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: CREAM, color: INK }}>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        {/* Masthead */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 pb-4" style={{ borderColor: INK }}>
          <div>
            <h1 className="font-[Syne] text-3xl font-extrabold tracking-tight" style={{ color: INK }}>
              THE BRIDGE
            </h1>
            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: INK3 }}>
              Shipyard · admin control room
            </p>
          </div>
          {gate === 'admin' && (
            <div className="flex items-center gap-2">
              <FamilyLegend />
              <button
                type="button" onClick={load} disabled={loadingData}
                className="flex items-center gap-1.5 border-2 px-3 py-1.5 font-mono text-xs font-semibold disabled:opacity-50"
                style={{ borderColor: INK, color: INK }}
              >
                <RefreshCw size={12} className={loadingData ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                type="button" onClick={logout}
                className="flex items-center gap-1.5 border-2 px-3 py-1.5 font-mono text-xs font-semibold"
                style={{ borderColor: LINE, color: INK2 }}
              >
                <LogOut size={12} /> Log out
              </button>
            </div>
          )}
        </div>

        {/* Gates */}
        {gate === 'loading' && <p className="font-mono text-sm" style={{ color: INK2 }}>Checking access…</p>}

        {gate === 'login' && (
          <Gate title="Admin access" body="Enter the admin password to open the console.">
            <form onSubmit={submitLogin} className="flex w-full max-w-xs flex-col items-stretch gap-2">
              <div className="flex items-center gap-2 border-2 px-3 py-2" style={{ borderColor: LINE, background: CARD }}>
                <Lock size={13} style={{ color: INK3 }} />
                <input
                  type="password" value={pw} onChange={(e) => setPw(e.target.value)}
                  placeholder="Password" autoFocus autoComplete="current-password"
                  className="w-full bg-transparent font-mono text-sm outline-none" style={{ color: INK }}
                />
              </div>
              <button
                type="submit" disabled={authBusy || !pw}
                className="px-4 py-2 font-mono text-xs font-bold text-white disabled:opacity-50"
                style={{ background: BLUE }}
              >
                {authBusy ? 'Checking…' : 'Enter'}
              </button>
              {authErr && <span className="font-mono text-[10px]" style={{ color: RED }}>{authErr}</span>}
            </form>
          </Gate>
        )}
        {gate === 'error' && (
          <Gate title="Something went wrong" body="Could not load analytics. Try again.">
            <button type="button" onClick={load} className="border-2 px-4 py-2 font-mono text-xs font-semibold" style={{ borderColor: INK, color: INK }}>
              Retry
            </button>
          </Gate>
        )}

        {/* Console */}
        {gate === 'admin' && (
          <div className="space-y-6">
            {!configured && (
              <p className="border-2 px-3 py-2 font-mono text-xs" style={{ borderColor: RED, color: RED, background: CARD }}>
                Supabase is not configured — no data to show.
              </p>
            )}
            {dataWarnings.map((warning) => (
              <p key={warning} className="border-2 px-3 py-2 font-mono text-xs" style={{ borderColor: RED, color: RED, background: CARD }}>
                {warning}
              </p>
            ))}

            {/* Command bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <ControlGroup label="Range">
                {RANGES.map((r) => (
                  <Chip key={r.label} active={rangeDays === r.days} onClick={() => setRangeDays(r.days)}>{r.label}</Chip>
                ))}
              </ControlGroup>
              <ControlGroup label="Network · deploy/feed">
                <Chip active={network === null} onClick={() => setNetwork(null)}>All</Chip>
                {NETWORK_CHIPS.map((n) => n.soon ? (
                  <span
                    key={n.id} title="Coming soon"
                    className="flex items-center gap-1.5 border-2 border-dashed px-2.5 py-1 font-mono text-[11px] font-semibold"
                    style={{ borderColor: LINE, color: INK3 }}
                  >
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: netColor(n.id) }} />
                    {n.label}
                    <span className="px-1 text-[9px] font-bold uppercase tracking-wide" style={{ background: LINE, color: INK2 }}>soon</span>
                  </span>
                ) : (
                  <Chip key={n.id} active={network === n.id} onClick={() => setNetwork(network === n.id ? null : n.id)}>
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: netColor(n.id) }} />
                    {n.label}
                  </Chip>
                ))}
              </ControlGroup>
              <ControlGroup label="Feed">
                <Chip active={live} onClick={() => { const nv = !live; setLive(nv); if (nv) load() }}>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${live ? 'animate-pulse' : ''}`}
                    style={{ background: live ? GREENGLOW : INK3 }}
                  />
                  {live ? 'Live' : 'Paused'}
                </Chip>
                {lastLoaded && (
                  <span className="font-mono text-[10px]" style={{ color: INK3 }}>
                    updated {new Date(lastLoaded).toLocaleTimeString()}
                  </span>
                )}
              </ControlGroup>
              {network && (
                <button type="button" onClick={() => setNetwork(null)}
                  className="font-mono text-[11px] underline-offset-2 hover:underline" style={{ color: INK3 }}>
                  clear filter
                </button>
              )}
            </div>

            {/* KPI vitals */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {METRICS.map((m) => (
                <KpiTile
                  key={m.key} meta={m}
                  value={windowStat(m.key, m.mode, windowed)}
                  prev={windowStat(m.key, m.mode, prevWindow)}
                  series={windowed.map((r) => valueOf(r, m.key))}
                  active={focus === m.key}
                  onClick={() => setFocus(m.key)}
                />
              ))}
              <FrictionTile
                value={rangeFails}
                hint={rangeDays >= 9999 ? 'recent event window' : network ? network.replace('testnet-', '') : 'in range'}
              />
            </div>

            {/* Hero timeseries (focused metric) */}
            <Panel title={`${focusMeta.label} · over time${focus === 'deploys_total' && network ? ` · ${network.replace('testnet-', '')}` : ''}`} fam={focusMeta.family}>
              <HeroChart data={windowed.map((r) => ({ date: r.date, value: valueOf(r, focus) }))} color={FAMILY[focusMeta.family].mark} />
            </Panel>

            {/* Usage — deploys by network over time */}
            <Panel title="Usage · deploys by network over time" fam="build" hint="all networks">
              <UsageChart days={windowed} nets={NETWORK_CHIPS.map((n) => n.id)} />
            </Panel>

            {/* Breakdowns */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Deploys by network" fam="build" hint="click to filter">
                <BarList
                  rows={NETWORK_CHIPS.map((n) => ({
                    id: n.id,
                    label: n.soon ? `${n.label} · soon` : n.label,
                    value: networkDeployMap[n.id] ?? 0,
                    color: netColor(n.id),
                  }))}
                  color={GREEN} glow={GREENGLOW}
                  selected={network} onSelect={(id) => setNetwork(network === id ? null : id)}
                  empty="No deploys in range."
                />
              </Panel>
              <Panel title="Top contracts" fam="build" hint="successful deploys · recent events · all networks">
                <BarList
                  rows={contractTotals.map(([name, c]) => ({ id: name, label: name, value: c }))}
                  color={GREEN} glow={GREENGLOW}
                  selected={null} onSelect={() => {}}
                  empty="No deploys in range."
                />
              </Panel>
            </div>

            {/* Independent activity stages — intentionally not presented as a conversion funnel. */}
            <Panel title="Build activity stages" fam="build" hint="recent events · all networks">
              <Funnel stages={funnel} />
            </Panel>

            {/* Live feed */}
            <Panel
              title={`Recent events · ${feedEvents.length} of latest 50${live ? '' : ' (paused)'}`}
              fam="reach"
              right={
                <div className="flex flex-wrap items-center gap-2">
                  {(['build', 'reach', 'friction'] as Family[]).map((f) => (
                    <Chip key={f} active={feedFam === f} onClick={() => setFeedFam(feedFam === f ? null : f)}>
                      <span className="inline-block h-2 w-2" style={{ background: FAMILY[f].mark }} /> {FAMILY[f].label}
                    </Chip>
                  ))}
                  <select
                    value={eventType ?? ''}
                    onChange={(e) => setEventType(e.target.value || null)}
                    aria-label="Filter by event type"
                    className="border-2 bg-transparent px-2 py-1 font-mono text-[11px] outline-none"
                    style={{ borderColor: eventType ? INK : LINE, color: eventType ? INK : INK2 }}
                  >
                    <option value="">All events</option>
                    {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="flex items-center gap-1 border-2 px-2 py-1" style={{ borderColor: LINE }}>
                    <Search size={11} style={{ color: INK3 }} />
                    <input
                      value={query} onChange={(e) => setQuery(e.target.value)} placeholder="0x wallet / contract"
                      className="w-28 bg-transparent font-mono text-[11px] outline-none" style={{ color: INK }}
                    />
                  </div>
                </div>
              }
            >
              {feedEvents.length === 0 ? (
                <p className="px-1 py-4 font-mono text-xs" style={{ color: INK3 }}>No events match.</p>
              ) : (
                <div className="divide-y" style={{ borderColor: LINE }}>
                  {feedEvents.map((e, i) => {
                    const fam = famOf(e.event_name)
                    return (
                      <button
                        key={`${e.created_at}-${i}`} type="button" onClick={() => setDrawer(e)}
                        className="flex w-full items-center gap-3 px-1 py-2 text-left transition-colors hover:bg-black/[0.03]"
                        style={{ borderColor: LINE }}
                      >
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: FAMILY[fam].mark }} />
                        <span className="w-24 shrink-0 font-mono text-[11px] sm:w-32" style={{ color: INK2 }}>{time(e.created_at)}</span>
                        <span className="min-w-0 flex-1 truncate font-mono text-xs font-semibold" style={{ color: INK }}>{e.event_name}</span>
                        <span className="hidden w-28 shrink-0 truncate font-mono text-[11px] sm:block" style={{ color: INK3 }}>{e.network ?? '—'}</span>
                        <span className="hidden w-24 shrink-0 truncate font-mono text-[11px] md:block" style={{ color: INK3 }}>
                          {e.wallet_hash ? `${e.wallet_hash.slice(0, 8)}…` : '—'}
                        </span>
                        <ChevronRight size={13} style={{ color: INK3 }} />
                      </button>
                    )
                  })}
                </div>
              )}
            </Panel>

            {latest && (
              <p className="font-mono text-[10px]" style={{ color: INK3 }}>
                KPI history combines stored daily rollups with recent raw events (latest {latest.date}). Contract rankings, failures, activity stages, and the feed use recent raw events only.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Drill-down drawer */}
      {drawer && <Drawer event={drawer} onClose={() => setDrawer(null)} />}
    </div>
  )
}

// ── Presentational pieces ─────────────────────────────────────────────────────

function FamilyLegend() {
  return (
    <div className="hidden items-center gap-3 sm:flex">
      {(['reach', 'build', 'friction'] as Family[]).map((f) => (
        <span key={f} className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider" style={{ color: INK2 }}>
          <span className="inline-block h-2.5 w-2.5" style={{ background: FAMILY[f].mark }} />{FAMILY[f].label}
        </span>
      ))}
    </div>
  )
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: INK3 }}>{label}</span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick}
      className="flex items-center gap-1 border-2 px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors"
      style={active
        ? { borderColor: INK, background: INK, color: CREAM }
        : { borderColor: LINE, background: CARD, color: INK2 }}
    >
      {children}
    </button>
  )
}

function Panel({
  title, fam, hint, right, children,
}: {
  title: string; fam: Family; hint?: string; right?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <section className="border-2" style={{ borderColor: LINE, background: CARD }}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b-2 px-3 py-2" style={{ borderColor: LINE }}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-block h-3 w-3 shrink-0" style={{ background: FAMILY[fam].mark }} />
          <h2 className="truncate font-mono text-xs font-bold uppercase tracking-[0.15em]" style={{ color: INK }}>{title}</h2>
          {hint && <span className="shrink-0 font-mono text-[10px]" style={{ color: INK3 }}>· {hint}</span>}
        </div>
        {right}
      </div>
      <div className="p-3">{children}</div>
    </section>
  )
}

function Gate({ title, body, children, icon }: { title: string; body: string; children: React.ReactNode; icon?: boolean }) {
  return (
    <div className="mx-auto max-w-md border-2 p-6 text-center" style={{ borderColor: LINE, background: CARD }}>
      {icon && <ShieldAlert size={22} className="mx-auto mb-3" style={{ color: RED }} />}
      <h2 className="font-[Syne] text-lg font-bold" style={{ color: INK }}>{title}</h2>
      <p className="mx-auto mb-4 mt-1.5 max-w-sm font-mono text-xs leading-relaxed" style={{ color: INK2 }}>{body}</p>
      <div className="flex flex-col items-center gap-2">{children}</div>
    </div>
  )
}

function KpiTile({
  meta, value, prev, series, active, onClick,
}: {
  meta: { label: string; family: Family; icon: typeof Rocket }
  value: number; prev: number; series: number[]; active: boolean; onClick: () => void
}) {
  const color = FAMILY[meta.family].mark
  const delta = value - prev
  const pct = prev > 0 ? Math.round((delta / prev) * 100) : null
  const Icon = meta.icon
  return (
    <button
      type="button" onClick={onClick}
      className="flex flex-col gap-1 border-2 px-3 py-2.5 text-left transition-all"
      style={{ borderColor: active ? INK : LINE, background: CARD, boxShadow: active ? `inset 0 -3px 0 ${color}` : 'none' }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color }} />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: INK3 }}>{meta.label}</span>
      </div>
      <div className="truncate font-[Syne] text-2xl font-extrabold leading-none" style={{ color: INK }}>{fmt(value)}</div>
      <div className="flex items-center justify-between">
        {pct === null
          ? <span className="font-mono text-[10px]" style={{ color: INK3 }}>—</span>
          : <span className="font-mono text-[10px] font-semibold" style={{ color: delta >= 0 ? GREEN : RED }}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(pct)}%
            </span>}
        <Sparkline values={series} color={color} />
      </div>
    </button>
  )
}

function FrictionTile({ value, hint }: { value: number; hint: string }) {
  return (
    <div className="flex flex-col gap-1 border-2 px-3 py-2.5" style={{ borderColor: value > 0 ? RED : LINE, background: CARD }}>
      <div className="flex items-center gap-1.5">
        <AlertTriangle size={12} style={{ color: RED }} />
        <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: INK3 }}>Deploy fails</span>
      </div>
      <div className="truncate font-[Syne] text-2xl font-extrabold leading-none" style={{ color: value > 0 ? RED : INK }}>{fmt(value)}</div>
      <span className="truncate font-mono text-[10px]" style={{ color: INK3 }}>{hint}</span>
    </div>
  )
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 60, h = 18
  if (values.length < 2) return <svg width={w} height={h} />
  const max = Math.max(...values, 1), min = Math.min(...values, 0)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 2) + 1
    const y = h - 1 - ((v - min) / span) * (h - 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={w} height={h} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function HeroChart({ data, color }: { data: { date: string; value: number }[]; color: string }) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const h = 240, padL = 8, padR = 8, padT = 14, padB = 22

  if (data.length < 2) {
    return <div ref={ref} className="flex h-40 items-center justify-center font-mono text-xs" style={{ color: INK3 }}>
      Need at least two days of rollups to plot a trend.
    </div>
  }

  const iw = Math.max(0, w - padL - padR)
  const ih = h - padT - padB
  const max = Math.max(...data.map((d) => d.value), 1)
  const min = 0
  const span = max - min || 1
  const x = (i: number) => padL + (i / (data.length - 1)) * iw
  const y = (v: number) => padT + ih - ((v - min) / span) * ih

  const line = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')
  const area = `${padL},${padT + ih} ${line} ${padL + iw},${padT + ih}`

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (w === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const idx = Math.round(((mx - padL) / (iw || 1)) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, idx)))
  }

  return (
    <div ref={ref} className="relative w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      {w > 0 && (
        <svg width={w} height={h} className="block">
          {[0.5, 1].map((f) => (
            <line key={f} x1={padL} x2={padL + iw} y1={y(max * f)} y2={y(max * f)} stroke={LINE} strokeWidth={1} />
          ))}
          <polygon points={area} fill={color} opacity={0.08} />
          <polyline points={line} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          {hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke={INK} strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(data[hover].value)} r={4} fill={color} stroke={CARD} strokeWidth={2} />
            </>
          )}
        </svg>
      )}
      {/* axis end labels */}
      <div className="mt-0.5 flex justify-between font-mono text-[10px]" style={{ color: INK3 }}>
        <span>{shortDate(data[0].date)}</span>
        <span>peak {fmt(max)}</span>
        <span>{shortDate(data[data.length - 1].date)}</span>
      </div>
      {hover !== null && w > 0 && (
        <div
          className="pointer-events-none absolute -top-1 z-10 border-2 px-2 py-1 font-mono text-[10px] shadow-sm"
          style={{
            borderColor: INK, background: CARD, color: INK,
            left: `${Math.min(Math.max(x(hover) - 40, 0), Math.max(w - 84, 0))}px`,
          }}
        >
          <div className="font-bold">{fmt(data[hover].value)}</div>
          <div style={{ color: INK3 }}>{data[hover].date}</div>
        </div>
      )}
    </div>
  )
}

function UsageChart({ days, nets }: { days: Rollup[]; nets: string[] }) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const h = 220, padL = 8, padR = 8, padT = 12, padB = 8

  const daily = days.map((r) => nets.map((net) => n0(r.deploys_by_network?.[net])))
  const totals = daily.map((row) => row.reduce((s, v) => s + v, 0))
  const max = Math.max(...totals, 1)
  const hasData = totals.some((t) => t > 0)

  if (days.length === 0 || nets.length === 0 || !hasData) {
    return <div ref={ref} className="flex h-32 items-center justify-center font-mono text-xs" style={{ color: INK3 }}>
      No deploys in range.
    </div>
  }

  const iw = Math.max(0, w - padL - padR)
  const ih = h - padT - padB
  const colW = iw / days.length
  const barW = Math.max(2, colW * 0.66)
  const baseline = padT + ih

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (w === 0 || colW === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const i = Math.floor((e.clientX - rect.left - padL) / colW)
    setHover(Math.max(0, Math.min(days.length - 1, i)))
  }

  return (
    <div>
      <div ref={ref} className="relative w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {w > 0 && (
          <svg width={w} height={h} className="block">
            {days.map((r, i) => {
              const x = padL + colW * i + (colW - barW) / 2
              let c = 0
              return nets.map((net, j) => {
                const v = daily[i][j]
                if (v <= 0) return null
                const yTop = baseline - ((c + v) / max) * ih
                const segH = (v / max) * ih
                c += v
                return (
                  <rect
                    key={`${r.date}-${net}`} x={x} y={yTop} width={barW} height={Math.max(1, segH - 1)}
                    fill={netColor(net)} opacity={hover === null || hover === i ? 1 : 0.3}
                  />
                )
              })
            })}
            {hover !== null && (
              <line
                x1={padL + colW * hover + colW / 2} x2={padL + colW * hover + colW / 2}
                y1={padT} y2={baseline} stroke={INK} strokeWidth={1} strokeDasharray="3 3"
              />
            )}
          </svg>
        )}
        {hover !== null && w > 0 && totals[hover] > 0 && (
          <div
            className="pointer-events-none absolute top-0 z-10 border-2 px-2 py-1 font-mono text-[10px]"
            style={{
              borderColor: INK, background: CARD, color: INK,
              left: `${Math.min(Math.max(padL + colW * hover - 44, 0), Math.max(w - 116, 0))}px`,
            }}
          >
            <div className="mb-0.5 font-bold">{days[hover].date} · {fmt(totals[hover])}</div>
            {nets.map((net, j) => daily[hover][j] > 0 ? (
              <div key={net} className="flex items-center gap-1.5" style={{ color: INK2 }}>
                <span className="inline-block h-2 w-2" style={{ background: netColor(net) }} />
                {net.replace('testnet-', '')} · {fmt(daily[hover][j])}
              </div>
            ) : null)}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {nets.map((net, j) => (
          <span key={net} className="flex items-center gap-1 font-mono text-[10px]" style={{ color: INK2 }}>
            <span className="inline-block h-2.5 w-2.5" style={{ background: netColor(net) }} />
            {net.replace('testnet-', '')}
          </span>
        ))}
      </div>
    </div>
  )
}

function BarList({
  rows, color, glow, selected, onSelect, empty,
}: {
  rows: { id: string; label: string; value: number; color?: string }[]
  color: string; glow: string; selected: string | null; onSelect: (id: string) => void; empty: string
}) {
  if (rows.length === 0) return <p className="py-3 font-mono text-xs" style={{ color: INK3 }}>{empty}</p>
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => {
        const on = selected === r.id
        const dim = selected !== null && !on
        const bar = r.color ?? (on ? glow : color)
        return (
          <button key={r.id} type="button" onClick={() => onSelect(r.id)}
            className="group flex items-center gap-3 text-left" style={{ opacity: dim ? 0.4 : 1 }}>
            <span className="w-24 shrink-0 truncate font-mono text-[11px] font-semibold sm:w-32" style={{ color: INK }}>{r.label}</span>
            <span className="relative h-4 flex-1" style={{ background: '#00000008' }}>
              <span className="absolute inset-y-0 left-0" style={{ width: `${(r.value / max) * 100}%`, background: bar, borderRight: `2px solid ${bar}` }} />
            </span>
            <span className="w-10 shrink-0 text-right font-mono text-[11px] font-bold tabular-nums" style={{ color: INK }}>{fmt(r.value)}</span>
          </button>
        )
      })}
    </div>
  )
}

function Funnel({ stages }: { stages: { label: string; value: number; fam: Family; failed?: number }[] }) {
  const top = Math.max(stages[0]?.value ?? 0, 1)
  const totalFailed = stages.reduce((s, x) => s + (x.failed ?? 0), 0)
  return (
    <div className="flex flex-col gap-2">
      {stages.map((s) => {
        return (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-20 shrink-0 truncate font-mono text-[11px] font-semibold sm:w-28" style={{ color: INK }}>{s.label}</span>
            <div className="relative h-5 min-w-0 flex-1 overflow-hidden" style={{ background: '#00000008' }}>
              <div className="absolute inset-y-0 left-0" style={{ width: `${(s.value / top) * 100}%`, background: GREEN }} />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-[11px] font-bold tabular-nums" style={{ color: INK }}>{fmt(s.value)}</span>
          </div>
        )
      })}
      {totalFailed > 0 && (
        <p className="mt-1 font-mono text-[10px]" style={{ color: RED }}>
          ✕ {fmt(totalFailed)} deploy{totalFailed === 1 ? '' : 's'} failed in range
        </p>
      )}
    </div>
  )
}

function Drawer({ event, onClose }: { event: EventRow; onClose: () => void }) {
  const fam = famOf(event.event_name)
  const details = event.metadata && Object.keys(event.metadata).length > 0
    ? JSON.stringify(event.metadata)
    : null
  const rows: [string, string | null][] = [
    ['Event', event.event_name], ['Family', FAMILY[fam].label], ['Time', time(event.created_at)],
    ['Network', event.network], ['Template', event.template_id],
    ['Contract', event.contract_address], ['Wallet (hashed)', event.wallet_hash],
    ['Details', details],
  ]
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: '#00000030' }} />
      <div className="relative h-full w-full max-w-sm overflow-y-auto border-l-2 p-5"
        style={{ background: CARD, borderColor: INK }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3" style={{ background: FAMILY[fam].mark }} />
            <h3 className="font-[Syne] text-base font-bold" style={{ color: INK }}>Event detail</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"><X size={16} style={{ color: INK2 }} /></button>
        </div>
        <dl className="space-y-3">
          {rows.map(([k, v]) => (
            <div key={k} className="border-b pb-2" style={{ borderColor: LINE }}>
              <dt className="font-mono text-[10px] uppercase tracking-wider" style={{ color: INK3 }}>{k}</dt>
              <dd className="mt-0.5 flex items-center gap-2 font-mono text-xs break-all" style={{ color: INK }}>
                {v ?? '—'}
                {v && (k === 'Contract' || k === 'Wallet (hashed)') && <CopyButton value={v} label={k} />}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center gap-1 font-mono text-[10px]" style={{ color: INK3 }}>
          <Activity size={11} /> live · first-party analytics
        </div>
      </div>
    </div>
  )
}
