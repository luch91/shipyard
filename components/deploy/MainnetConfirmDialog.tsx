'use client'

import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface MainnetConfirmDialogProps {
  open: boolean
  networkName: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmation gate shown before deploying to a real-funds network (a network
 * flagged `isMainnet`). Purely presentational + controlled by props — it does
 * not deploy anything itself; the caller invokes the deploy on `onConfirm`.
 * For all current testnets this never renders (no network sets `isMainnet`).
 */
export default function MainnetConfirmDialog({
  open,
  networkName,
  onConfirm,
  onCancel,
}: MainnetConfirmDialogProps) {
  // Close on Escape while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mainnet-confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />

      {/* Card — amber ring (not border) so glass-card's :hover can't reset it */}
      <div className="glass-card relative z-10 w-full max-w-md p-5 ring-1 ring-amber-500/30">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3 text-neutral-500 transition-colors hover:text-neutral-200 focus:outline-none"
          aria-label="Cancel"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
              <AlertTriangle size={18} className="text-amber-400" />
            </span>
            <h2 id="mainnet-confirm-title" className="font-mono text-sm font-semibold text-white">
              Confirm mainnet deploy
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-neutral-400">
            You&apos;re about to deploy to{' '}
            <span className="font-mono font-semibold text-amber-400">{networkName}</span>, a live
            network that uses <span className="text-neutral-200">real GEN tokens</span>. This
            transaction costs real funds and cannot be undone.
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-white/[0.08] px-4 py-2 font-mono text-xs font-medium text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-neutral-200 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-md bg-amber-500 px-4 py-2 font-mono text-xs font-semibold text-neutral-950 transition-colors hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              Deploy to {networkName}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
