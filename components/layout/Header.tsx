'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, Github } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Header() {
  const pathname = usePathname()

  // Header only renders on the landing page.
  // All app pages use the sidebar for navigation instead.
  if (pathname !== '/') return null

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-neutral-950/80 backdrop-blur-sm">
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
        <nav className="flex items-center gap-3">
          {/* Docs + GitHub hidden on small screens — CTA is the priority */}
          <a
            href="https://docs.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            aria-label="Open GenLayer docs in new tab"
          >
            Docs
            <ExternalLink size={12} />
          </a>
          <a
            href="https://github.com/genlayerlabs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            aria-label="Shipyard on GitHub"
          >
            <Github size={15} />
            GitHub
          </a>
          <ConnectButton chainStatus="none" />
          <Link
            href="/deploy"
            className="hidden sm:flex rounded-full bg-emerald-500 px-4 py-1.5 font-mono text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            Start Deploying →
          </Link>
        </nav>
      </div>
    </header>
  )
}
