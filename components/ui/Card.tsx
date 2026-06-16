import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none'
  variant?: 'default' | 'emerald'
}

export default function Card({
  padding  = 'md',
  variant  = 'default',
  className,
  children,
  ...rest
}: CardProps) {
  const paddings = {
    none: '',
    sm:   'p-3',
    md:   'p-4',
    lg:   'p-6',
  }

  return (
    <div
      className={clsx(
        'glass-card',
        variant === 'emerald' && 'glass-card-emerald',
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
