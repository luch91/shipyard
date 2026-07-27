'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, ChevronLeft, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'
import Logo from './Logo'
import { NAV_ITEMS } from './navItems'
import { useNavNew } from '@/hooks/useNavNew'
import type { DeploymentRecord } from '@/types'

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({
  href, label, Icon, active, soon, badge, collapsed, showNew, onSelect,
}: {
  href:      string
  label:     string
  Icon:      React.ElementType
  active:    boolean
  soon?:     boolean
  badge?:    number
  collapsed: boolean
  showNew?:  boolean
  onSelect?: () => void
}) {
  if (collapsed) {
    return (
      <Link
        href={href}
        title={label}
        onClick={onSelect}
        className={clsx(
          'relative flex h-9 w-9 items-center justify-center rounded-md transition-colors',
          active
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
        )}
      >
        <Icon size={16} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 font-mono text-[8px] text-emerald-400">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
        {showNew && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-neutral-950" />
        )}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={onSelect}
      className={clsx(
        'relative flex min-h-10 items-center gap-3 rounded-md px-3 py-2',
        'text-sm font-medium transition-colors duration-150',
        active
          ? 'bg-emerald-500/[0.09] text-emerald-300 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-emerald-400'
          : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-100'
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="min-w-0 flex-1">{label}</span>
      {soon && (
        <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Soon
        </span>
      )}
      {showNew && !soon && (
        <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          New
        </span>
      )}
      {badge !== undefined && badge > 0 && !soon && !showNew && (
        <span className="shrink-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500/15 px-1 font-mono text-[9px] text-emerald-400">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

// ── Main Sidebar (desktop only — mobile uses BottomNav) ─────────────────────────

export default function Sidebar() {
  const pathname          = usePathname()
  const [open, setOpen]   = useState(true)
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
    // Re-check every few seconds in case a deploy just completed
    const interval = setInterval(loadCount, 3000)
    return () => clearInterval(interval)
  }, [])

  // Landing has its own header, and the admin control room uses a standalone
  // shell rather than the public app navigation.
  if (pathname === '/' || pathname.startsWith('/admin') || pathname === '/blog' || pathname.startsWith('/blog/')) return null

  const isActive = (href: string) => {
    if (href === '/history') return pathname === '/history'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={clsx(
        // Desktop only — collapsible. Mobile navigation is handled by BottomNav.
        'relative hidden shrink-0 flex-col border-r border-white/[0.06] sidebar-glow',
        'lg:flex lg:transition-all lg:duration-200',
        open ? 'lg:w-60' : 'lg:w-16'
      )}
    >
      {/* ── EXPANDED ───────────────────────────────────────────────────────── */}
      {open && (
        <div className="flex flex-1 flex-col overflow-hidden">

          <div className="flex h-16 items-center border-b border-white/[0.06] px-4">
            <Logo className="text-lg" />
          </div>

          <nav className="flex flex-col gap-6 px-3 py-5">
            {(['Build', 'Explore'] as const).map((group) => (
              <div key={group}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                  {group}
                </p>
                <div className="flex flex-col gap-1">
                  {NAV_ITEMS.filter((item) => item.group === group).map(({ href, label, Icon, soon, isNew }) => (
                    <NavItem
                      key={href}
                      href={href}
                      label={label}
                      Icon={Icon}
                      active={isActive(href)}
                      soon={soon}
                      badge={href === '/history' ? count : undefined}
                      collapsed={false}
                      showNew={showNew(href, isNew)}
                      onSelect={() => markSeen(href)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="border-t border-white/[0.06] p-3">
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2
                         text-sm font-medium text-neutral-500
                         transition-colors hover:bg-white/[0.03] hover:text-neutral-200"
            >
              <BookOpen size={16} className="shrink-0" />
              <span className="flex-1">Docs</span>
              <span className="text-xs opacity-50">↗</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-1 flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-white/[0.03] hover:text-neutral-300"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </button>
          </div>
        </div>
      )}

      {/* ── COLLAPSED ──────────────────────────────────────────────────────── */}
      {!open && (
        <div className="flex flex-1 flex-col items-center gap-2 py-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mb-2 flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-neutral-200"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
          {NAV_ITEMS.map(({ href, label, Icon, soon, isNew }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={isActive(href)}
              soon={soon}
              badge={href === '/history' ? count : undefined}
              collapsed={true}
              showNew={showNew(href, isNew)}
              onSelect={() => markSeen(href)}
            />
          ))}
        </div>
      )}
    </aside>
  )
}
