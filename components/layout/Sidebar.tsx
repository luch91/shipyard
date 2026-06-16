'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Anchor, BookOpen, ChevronLeft, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'
import { NAV_ITEMS } from './navItems'
import type { DeploymentRecord } from '@/types'

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({
  href, label, Icon, active, soon, badge, collapsed,
}: {
  href:      string
  label:     string
  Icon:      React.ElementType
  active:    boolean
  soon?:     boolean
  badge?:    number
  collapsed: boolean
}) {
  if (collapsed) {
    return (
      <Link
        href={href}
        title={label}
        className={clsx(
          'relative flex h-8 w-8 items-center justify-center rounded-lg transition-all',
          active
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'text-neutral-600 hover:bg-white/[0.04] hover:text-neutral-300'
        )}
      >
        <Icon size={14} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 font-mono text-[8px] text-emerald-400">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px]',
        'text-xs font-medium transition-all duration-150',
        active
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'text-neutral-500 border border-transparent hover:bg-white/[0.03] hover:text-neutral-300'
      )}
    >
      <Icon size={13} className="shrink-0" />
      <span className="font-mono flex-1 min-w-0">{label}</span>
      {soon && (
        <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Soon
        </span>
      )}
      {badge !== undefined && badge > 0 && !soon && (
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

  // Hide on landing page
  if (pathname === '/') return null

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
        open ? 'lg:w-52' : 'lg:w-12'
      )}
    >
      {/* Desktop collapse toggle */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="absolute -right-3 top-5 z-10 hidden lg:flex h-6 w-6 items-center
                   justify-center rounded-full border border-white/[0.08]
                   bg-neutral-900 text-neutral-500 hover:text-neutral-300
                   focus:outline-none transition-colors"
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {open ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
      </button>

      {/* ── EXPANDED ───────────────────────────────────────────────────────── */}
      {open && (
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Logo */}
          <div className="px-3 py-4 border-b border-white/[0.05]">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-sm font-semibold
                         text-white hover:text-emerald-400 transition-colors"
            >
              <Anchor size={16} className="text-emerald-400 shrink-0" />
              <span>Ship<span className="text-emerald-400">yard</span></span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 px-2 py-3 border-b border-white/[0.05]">
            <p className="px-2 mb-1 font-mono text-[9px] tracking-[0.2em]
                          uppercase text-neutral-700">
              Navigate
            </p>
            {NAV_ITEMS.map(({ href, label, Icon, soon }) => (
              <NavItem
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                active={isActive(href)}
                soon={soon}
                badge={href === '/history' ? count : undefined}
                collapsed={false}
              />
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Docs link */}
          <div className="border-t border-white/[0.05] px-2 py-3">
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px]
                         font-mono text-xs font-medium text-neutral-600
                         hover:bg-white/[0.03] hover:text-neutral-300
                         border border-transparent transition-all"
            >
              <BookOpen size={13} className="shrink-0" />
              <span className="flex-1">Docs</span>
              <span className="text-[10px] opacity-40">↗</span>
            </a>
          </div>
        </div>
      )}

      {/* ── COLLAPSED ──────────────────────────────────────────────────────── */}
      {!open && (
        <div className="flex flex-1 flex-col items-center gap-1.5 py-4">
          <Link href="/" className="mb-2">
            <Anchor size={16} className="text-emerald-400" />
          </Link>
          {NAV_ITEMS.map(({ href, label, Icon, soon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={isActive(href)}
              soon={soon}
              badge={href === '/history' ? count : undefined}
              collapsed={true}
            />
          ))}
        </div>
      )}
    </aside>
  )
}
