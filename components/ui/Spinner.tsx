import clsx from 'clsx'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-3.5 w-3.5 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-7 w-7 border-[3px]',
  }

  return (
    <span
      className={clsx(
        'inline-block animate-spin rounded-full border-neutral-600 border-t-emerald-400',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
