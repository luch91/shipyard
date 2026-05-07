'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { GitFork, Share2 } from 'lucide-react'
import LZString from 'lz-string'
import toast from 'react-hot-toast'
import { parseContract, validateContract } from '@/lib/genlayer/parser'
import { useDeployStore } from '@/hooks/useDeployStore'
import { track } from '@/lib/analytics'
import NetworkBadge from '@/components/ui/NetworkBadge'
import CopyButton from '@/components/ui/CopyButton'
import ReadMethods from './ReadMethods'
import WriteMethods from './WriteMethods'
import type { ParsedContract, NetworkId } from '@/types'

// ─── Source paste panel ───────────────────────────────────────────────────────

function SourceInput({ onLoad }: { onLoad: (src: string) => void }) {
  const [val, setVal] = useState('')
  const [err, setErr] = useState('')

  const handleChange = (src: string) => {
    setVal(src)
    if (!src.trim()) { setErr(''); return }
    const v = validateContract(src)
    if (v.valid) {
      setErr('')
      onLoad(src)
    } else {
      setErr(v.errors[0])
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900 p-6">
      <p className="mb-3 text-sm text-neutral-500">
        Paste your contract source to introspect its methods.
      </p>
      <textarea
        rows={7}
        value={val}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="# Paste contract source here…"
        className="w-full resize-none rounded-md border border-neutral-700 bg-neutral-800 p-3 font-mono text-xs text-white placeholder-neutral-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        aria-label="Paste contract source"
      />
      {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface ContractPanelProps {
  address: string
  networkId: NetworkId
}

export default function ContractPanel({ address, networkId }: ContractPanelProps) {
  const router = useRouter()
  const { setContractSource } = useDeployStore()
  const [parsed, setParsed] = useState<ParsedContract | null>(null)
  const [activeTab, setActiveTab] = useState<'read' | 'write'>('read')

  const handleFork = () => {
    if (!parsed) return
    setContractSource(parsed.raw)
    track('contract_forked', { contract_name: parsed.className, address })
    router.push('/deploy')
  }

  const handleShareSource = async () => {
    if (!parsed) return
    const encoded = LZString.compressToEncodedURIComponent(parsed.raw)
    const url = `${window.location.origin}/deploy?source=${encoded}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Deployable link copied!')
      track('source_link_shared', { contract_name: parsed.className, address })
    } catch {
      toast.error('Could not copy link.')
    }
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`gendeploy:source:${address}`)
      if (stored && validateContract(stored).valid) {
        setParsed(parseContract(stored))
      }
    } catch { /* non-fatal */ }
  }, [address])

  const handleSourceLoad = (src: string) => {
    setParsed(parseContract(src))
    try {
      localStorage.setItem(`gendeploy:source:${address}`, src)
    } catch { /* non-fatal */ }
  }

  const readMethods = parsed?.methods.filter((m) => m.type === 'read') ?? []
  const writeMethods = parsed?.methods.filter((m) => m.type === 'write') ?? []

  return (
    <div>
      {/* Address bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-mono text-sm text-neutral-400">{address}</p>
            <CopyButton value={address} label="Address" />
          </div>
        </div>
        <NetworkBadge networkId={networkId} pulse />
      </div>

      {!parsed ? (
        <SourceInput onLoad={handleSourceLoad} />
      ) : (
        <>
          {/* Contract name + change source */}
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-sm text-neutral-400">
              <span className="text-white">{parsed.className}</span>
              <span className="ml-2 text-neutral-600">
                {readMethods.length}r / {writeMethods.length}w
              </span>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFork}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-400 focus:outline-none"
              >
                <GitFork size={11} />
                fork
              </button>
              <button
                type="button"
                onClick={handleShareSource}
                className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-300 focus:outline-none"
              >
                <Share2 size={11} />
                share
              </button>
              <button
                type="button"
                onClick={() => setParsed(null)}
                className="text-xs font-bold text-yellow-500 hover:text-yellow-300 focus:outline-none"
              >
                change source
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 border-b border-neutral-800">
            {(['read', 'write'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-4 py-2 font-mono text-sm font-medium transition-colors focus:outline-none',
                  activeTab === tab
                    ? tab === 'read'
                      ? 'border-b-2 border-emerald-400 text-emerald-400'
                      : 'border-b-2 border-amber-400 text-amber-400'
                    : 'text-neutral-500 hover:text-neutral-300'
                )}
              >
                {tab === 'read'
                  ? `Read (${readMethods.length})`
                  : `Write (${writeMethods.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'read' && (
            <ReadMethods methods={readMethods} contractAddress={address} />
          )}
          {activeTab === 'write' && (
            <WriteMethods methods={writeMethods} contractAddress={address} />
          )}
        </>
      )}
    </div>
  )
}
