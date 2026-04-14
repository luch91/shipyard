import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export default function Card({ padding = 'md', className, children, ...rest }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={clsx(
        'rounded-lg border border-neutral-800 bg-neutral-900',
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
