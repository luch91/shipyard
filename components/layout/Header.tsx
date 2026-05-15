'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, Anchor } from 'lucide-react'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/deploy',    label: 'Deploy',    soon: false },
  { href: '/templates', label: 'Templates', soon: false },
  { href: '/compare',   label: 'Compare',   soon: false },
  { href: '/registry',  label: 'Registry',  soon: true  },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-mono text-lg font-semibold text-white">
          <Anchor size={18} className="text-emerald-400" />
          <span>Ship<span className="text-emerald-400">yard</span></span>
        </Link>

        {/* Nav */}
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
      </div>
    </header>
  )
}
