'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, Github } from 'lucide-react'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/deploy',    label: 'Deploy',    soon: false },
  { href: '/templates', label: 'Templates', soon: false },
  { href: '/compare',   label: 'Compare',   soon: false },
  { href: '/registry',  label: 'Registry',  soon: true  },
]

export default function Header() {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-mono text-lg font-semibold text-white">
          <div className="relative h-9 w-9 shrink-0">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-lg" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04] backdrop-blur-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="Shipyard" width={18} height={18} className="logo-pulse" />
            </div>
          </div>
          <span className="font-[Syne] font-bold">Ship<span className="text-emerald-400">yard</span></span>
        </Link>

        {/* Landing nav */}
        {isLanding && (
          <nav className="flex items-center gap-3">
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              aria-label="Open GenLayer docs in new tab"
            >
              Docs
              <ExternalLink size={12} />
            </a>
            <a
              href="https://github.com/genlayerlabs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              aria-label="Shipyard on GitHub"
            >
              <Github size={15} />
              GitHub
            </a>
            <Link
              href="/deploy"
              className="rounded-full bg-emerald-500 px-4 py-1.5 font-mono text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
            >
              Start Deploying →
            </Link>
          </nav>
        )}

        {/* App nav */}
        {!isLanding && (
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, soon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
                )}
              >
                {label}
                {soon && (
                  <span className="rounded px-1 py-0.5 font-mono text-[10px] font-semibold bg-amber-500/10 text-amber-400">
                    Soon
                  </span>
                )}
              </Link>
            ))}

            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800/60 hover:text-white"
              aria-label="Open GenLayer docs in new tab"
            >
              Docs
              <ExternalLink size={12} />
            </a>
          </nav>
        )}
      </div>
    </header>
  )
}
