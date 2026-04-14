import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-mono font-semibold transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 focus:ring-emerald-500/50 disabled:bg-neutral-800 disabled:text-neutral-600',
    ghost:
      'border border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white focus:ring-neutral-500/40 disabled:opacity-40',
    danger:
      'bg-red-500/90 text-white hover:bg-red-400 focus:ring-red-500/50 disabled:opacity-40',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
  }

  return (
    <button
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
