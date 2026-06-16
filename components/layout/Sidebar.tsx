'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Anchor, Rocket, LayoutTemplate,
  GitCompare, Database, History,
  BookOpen, ChevronLeft, ChevronRight,
  Menu, X,
} from 'lucide-react'
import clsx from 'clsx'
import type { DeploymentRecord } from '@/types'

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/deploy',    label: 'Deploy',    Icon: Rocket,         soon: false },
  { href: '/templates', label: 'Templates', Icon: LayoutTemplate, soon: false },
  { href: '/compare',   label: 'Compare',   Icon: GitCompare,     soon: false },
  { href: '/registry',  label: 'Registry',  Icon: Database,       soon: true  },
  { href: '/history',   label: 'History',   Icon: History,        soon: false },
] as const

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

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname              = usePathname()
  const [open, setOpen]       = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [count, setCount]     = useState(0)

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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Hide on landing page
  if (pathname === '/') return null

  const isActive = (href: string) => {
    if (href === '/history') return pathname === '/history'
    return pathname.startsWith(href)
  }

  // Expanded content is shown when the desktop sidebar is open OR the mobile
  // drawer is open. Collapsed (icon-only) content shows only on a collapsed desktop.
  const showExpanded  = open || mobileOpen
  const showCollapsed = !open && !mobileOpen

  return (
    <>
      {/* Mobile trigger — only below lg, hidden while the drawer is open */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed right-3 top-3 z-30 flex h-9 w-9 items-center justify-center
                     rounded-lg border border-white/[0.08] bg-neutral-900/90 text-neutral-300
                     backdrop-blur-sm hover:text-white focus:outline-none lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={16} />
        </button>
      )}

      {/* Backdrop — mobile only, closes drawer on tap */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={clsx(
          'relative flex shrink-0 flex-col border-r border-white/[0.06] sidebar-glow',
          // Mobile: fixed off-canvas drawer
          'fixed inset-y-0 left-0 z-50 w-52',
          'transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: in-flow, collapsible
          'lg:relative lg:z-auto lg:translate-x-0 lg:transition-all lg:duration-200',
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

        {/* Mobile close button — only inside the open drawer */}
        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-2 top-3 z-10 flex h-7 w-7 items-center justify-center
                       rounded-lg text-neutral-500 hover:text-neutral-200 focus:outline-none lg:hidden"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        )}

        {/* ── EXPANDED ───────────────────────────────────────────────────────── */}
        {showExpanded && (
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
        {showCollapsed && (
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
    </>
  )
}
