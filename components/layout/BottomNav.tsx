'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import { NAV_ITEMS } from './navItems'
import { useNavNew } from '@/hooks/useNavNew'
import type { DeploymentRecord } from '@/types'

// Persistent mobile navigation. Visible below `lg`, where the desktop Sidebar
// is hidden. Gives one-tap access to the core routes without a hamburger.
export default function BottomNav() {
  const pathname          = usePathname()
  const [count, setCount] = useState(0)
  const { showNew, markSeen } = useNavNew()

  // Read deployment count from localStorage only — no database
  useEffect(() => {
    const loadCount = () => {
      try {
        const raw = localStorage.getItem('gendeploy:deployments')
        const local: DeploymentRecord[] = raw ? JSON.parse(raw) : []
        setCount(local.length)
      } catch {
        setCount(0)
      }
    }
    loadCount()
    const interval = setInterval(loadCount, 3000)
    return () => clearInterval(interval)
  }, [])

  // Hide on landing page
  if (pathname === '/') return null

  const isActive = (href: string) =>
    href === '/history' ? pathname === '/history' : pathname.startsWith(href)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-white/[0.08]
                 bg-neutral-950/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      {NAV_ITEMS.map(({ href, label, Icon, soon, isNew }) => {
        const active = isActive(href)
        const badge  = href === '/history' ? count : undefined
        const isNewShown = showNew(href, isNew)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => markSeen(href)}
            className={clsx(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2',
              'transition-colors',
              active ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <span className="relative">
              <Icon size={18} strokeWidth={2} />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-[14px] items-center
                                 justify-center rounded-full border border-emerald-500/30
                                 bg-emerald-500/20 px-0.5 font-mono text-[8px] text-emerald-400">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
              {soon && (
                <span className="absolute -right-2 -top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
              {isNewShown && !soon && (
                <span className="absolute -right-2 -top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </span>
            <span className="font-mono text-[9px] tracking-tight">{label}</span>
            {active && (
              <span className="absolute inset-x-3 top-0 h-px bg-emerald-400/60" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
