'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Trash2, ExternalLink, History, Download, Upload } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import NetworkBadge from '@/components/ui/NetworkBadge'
import type { DeploymentRecord, NetworkId } from '@/types'

const HISTORY_KEY = 'gendeploy:deployments'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load from localStorage
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(HISTORY_KEY)
        setDeployments(raw ? JSON.parse(raw) : [])
      } catch { /* non-fatal */ }
    }
    load()
    // Re-read when storage changes (e.g. new deploy in same tab)
    window.addEventListener('storage', load)
    // Poll for same-tab updates
    const interval = setInterval(load, 3000)
    return () => {
      window.removeEventListener('storage', load)
      clearInterval(interval)
    }
  }, [])

  if (pathname === '/') return null

  const clearHistory = () => {
    try {
      localStorage.removeItem(HISTORY_KEY)
      setDeployments([])
    } catch { /* non-fatal */ }
  }

  const exportHistory = () => {
    try {
      const sources: Record<string, string> = {}
      for (const d of deployments) {
        const src = localStorage.getItem(`gendeploy:source:${d.address}`)
        if (src) sources[d.address] = src
      }
      const data = { version: 1, exportedAt: Date.now(), deployments, sources }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shipyard-history-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* non-fatal */ }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(data.deployments)) {
          toast.error('Invalid history file.')
          return
        }
        // Write sources only if not already cached
        if (data.sources && typeof data.sources === 'object') {
          for (const [address, src] of Object.entries(data.sources)) {
            if (typeof src === 'string' && !localStorage.getItem(`gendeploy:source:${address}`)) {
              localStorage.setItem(`gendeploy:source:${address}`, src)
            }
          }
        }
        // Merge — deduplicate by address, sort newest first, cap at 50
        const existingAddresses = new Set(deployments.map((d) => d.address))
        const incoming = (data.deployments as DeploymentRecord[]).filter(
          (d) => d.address && d.contractName && d.network && d.deployedAt && !existingAddresses.has(d.address)
        )
        const merged = [...deployments, ...incoming]
          .sort((a, b) => b.deployedAt - a.deployedAt)
          .slice(0, 50)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(merged))
        setDeployments(merged)
        toast.success(`Imported ${incoming.length} deployment${incoming.length !== 1 ? 's' : ''}.`)
      } catch {
        toast.error('Could not read history file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <aside
      className={clsx(
        'relative flex shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 transition-all duration-200',
        open ? 'w-56' : 'w-10'
      )}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white focus:outline-none"
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {open && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-3">
            <div className="flex items-center gap-1.5">
              <History size={13} className="text-neutral-500" />
              <span className="font-mono text-xs font-semibold text-neutral-400">Deployments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-neutral-400 hover:text-emerald-400 focus:outline-none"
                aria-label="Import deployment history"
              >
                <Upload size={14} strokeWidth={2.5} />
              </button>
              {deployments.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={exportHistory}
                    className="text-neutral-400 hover:text-emerald-400 focus:outline-none"
                    aria-label="Export deployment history"
                  >
                    <Download size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-neutral-400 hover:text-red-400 focus:outline-none"
                    aria-label="Clear deployment history"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-2">
            {deployments.length === 0 ? (
              <p className="px-3 py-4 text-center text-[11px] text-neutral-700">
                No deployments yet
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5 px-2">
                {deployments.map((d, i) => (
                  <li key={`${d.address}-${i}`}>
                    <Link
                      href={`/interact/${d.address}?network=${d.network}`}
                      className="group flex flex-col gap-1 rounded-md px-2 py-2 transition-colors hover:bg-neutral-800/60"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-mono text-xs font-medium text-white group-hover:text-emerald-400">
                          {d.contractName || 'Contract'}
                        </span>
                        <ExternalLink size={10} className="shrink-0 text-neutral-700 group-hover:text-neutral-500" />
                      </div>
                      <NetworkBadge networkId={d.network as NetworkId} size="sm" />
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-mono text-[10px] text-neutral-600">
                          {d.address.slice(0, 10)}…
                        </span>
                        <span className="shrink-0 text-[10px] text-neutral-700">
                          {timeAgo(d.deployedAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Collapsed state — icon only */}
      {!open && (
        <div className="flex flex-1 flex-col items-center pt-5">
          <History size={14} className="text-neutral-600" />
          {deployments.length > 0 && (
            <span className="mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 font-mono text-[9px] text-emerald-400">
              {deployments.length > 9 ? '9+' : deployments.length}
            </span>
          )}
        </div>
      )}
    </aside>
  )
}
