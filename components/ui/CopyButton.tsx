'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

export default function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      if (label) toast.success(`${label} copied!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed.')
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ? `Copy ${label}` : 'Copy to clipboard'}
      className={clsx(
        'rounded-md p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
        copied
          ? 'text-emerald-400'
          : 'text-neutral-600 hover:bg-neutral-700 hover:text-neutral-300',
        className
      )}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}
