'use client'

import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export default function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isBlog = pathname === '/blog' || pathname.startsWith('/blog/')

  return (
    <main className={clsx('min-w-0 flex-1', !isAdmin && !isBlog && 'pb-16 lg:pb-0')}>
      {children}
    </main>
  )
}
